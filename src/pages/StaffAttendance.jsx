// src/pages/StaffAttendance.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { Lock, UserCheck, Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';

const STAFF_PIN = "2026"; 

const StaffAttendance = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-foco constante
  useEffect(() => {
    if (isAuthenticated && inputRef.current && !processing && !lastScan) {
        inputRef.current.focus();
    }
  }, [isAuthenticated, processing, lastScan]);

  // Detección URL
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (isAuthenticated && urlCode && !processing && !lastScan) {
        processCode(urlCode);
    }
  }, [isAuthenticated, searchParams]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      setIsAuthenticated(true);
      toast.success('Staff Activo');
    } else {
      toast.error('PIN incorrecto');
      setPin('');
    }
  };

  const resetScanner = () => {
    setLastScan(null);
    setCode('');
    setSearchParams({}); // Limpiar URL
    if (inputRef.current) inputRef.current.focus();
  };

  const processCode = async (inputCode) => {
    if (!inputCode) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    setProcessing(true);
    setLastScan(null);

    let cleanCode = inputCode.toUpperCase().trim().replace(/\s/g, '');
    cleanCode = cleanCode.replace(/^IASP[-]?/, '');
    const finalCode = `IASP-${cleanCode}`;

    try {
      const { data, error } = await supabase.rpc('mark_attendance_secure', { qr_code: finalCode });

      if (error) throw error;

      let resultData = null;
      if (data.success) {
        if (data.message.includes('Ya registrado')) {
            resultData = { type: 'warning', msg: 'YA INGRESÓ', sub: 'Registro duplicado', name: data.participant };
        } else {
            resultData = { type: 'success', msg: 'ACCESO OK', sub: 'Bienvenido/a', name: data.participant };
        }
      } else {
        resultData = { type: 'error', msg: 'DENEGADO', sub: data.message, name: 'Revisar Status' };
      }
      setLastScan(resultData);

    } catch (err) {
      console.error(err);
      setLastScan({ type: 'error', msg: 'ERROR RED', sub: 'Fallo conexión', name: 'Reintentar' });
    } finally {
      setProcessing(false);
      setCode('');
      // Auto-cierre: 4 segundos para leer bien el popup
      timerRef.current = setTimeout(() => { resetScanner(); }, 4000);
    }
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      if (!code || processing) return;
      processCode(code);
  };

  // 1. PANTALLA DE BLOQUEO (PIN)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
          <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Staff Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" inputMode="numeric" className="w-full text-center text-3xl font-bold border-b-2 border-gray-300 focus:border-teal-500 outline-none py-2" placeholder="PIN" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
            <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg">ENTRAR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">
      
      {/* --- POPUP GIGANTE (MODAL) --- */}
      {/* Se muestra SOLO si hay un resultado (lastScan) */}
      {lastScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                onClick={resetScanner} // Tocar cualquier parte cierra
                className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl transform transition-all scale-100 relative"
            >
                {/* Botón Cerrar */}
                <button onClick={resetScanner} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                    <X className="w-6 h-6" />
                </button>

                {/* Ícono Gigante */}
                <div className="flex justify-center mb-6">
                    {lastScan.type === 'success' && <CheckCircle className="w-24 h-24 text-green-500 animate-bounce" />}
                    {lastScan.type === 'warning' && <AlertTriangle className="w-24 h-24 text-amber-500 animate-pulse" />}
                    {lastScan.type === 'error' && <XCircle className="w-24 h-24 text-red-500 animate-pulse" />}
                </div>

                {/* Título Masivo */}
                <h2 className={`text-4xl font-black uppercase mb-2 ${
                    lastScan.type === 'success' ? 'text-green-600' : 
                    lastScan.type === 'warning' ? 'text-amber-500' : 'text-red-600'
                }`}>
                    {lastScan.msg}
                </h2>

                {/* Subtítulo */}
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-6">
                    {lastScan.sub}
                </p>

                {/* Nombre del Participante (Destacado) */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-900 text-xl font-bold leading-tight">
                        {lastScan.name}
                    </p>
                </div>

                {/* Barra de tiempo automática */}
                <div className="mt-6 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full animate-[shrink_4s_linear_forwards]" 
                        style={{ 
                            backgroundColor: lastScan.type === 'success' ? '#22c55e' : lastScan.type === 'warning' ? '#f59e0b' : '#ef4444',
                            width: '100%' 
                        }}
                    ></div>
                </div>
            </div>
        </div>
      )}

      {/* --- PANTALLA DE FONDO (INPUT) --- */}
      <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h1 className="font-bold text-gray-800 text-base">Control</h1>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1 rounded">SALIR</button>
      </div>

      <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col justify-center">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <p className="text-center text-xs text-gray-400 font-bold uppercase mb-4">Ingreso Manual (6 dígitos)</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="D487B5" 
                    className="w-full text-center text-4xl font-mono uppercase font-bold text-gray-800 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none py-4 bg-transparent placeholder-gray-200"
                    autoComplete="off"
                    autoCorrect="off"
                />
                <button 
                    type="submit" 
                    disabled={processing || !code}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold px-4 py-4 rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {processing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    <span>REGISTRAR</span>
                </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-6">
                Listo para recibir escaneos automáticos
            </p>
        </div>
      </div>

      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

export default StaffAttendance;
