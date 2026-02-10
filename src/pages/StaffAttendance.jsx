// src/pages/StaffAttendance.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, UserCheck, Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, X, LogOut } from 'lucide-react';

const STAFF_PIN = "2026"; 

const StaffAttendance = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate(); // Para redirigir al salir
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

  // --- FUNCIÓN DE SALIDA PROFESIONAL ---
  const handleLogout = () => {
    // 1. Limpiar estados sensibles
    setIsAuthenticated(false);
    setPin('');
    setCode('');
    setLastScan(null);
    setSearchParams({}); // Limpiar URL
    
    // 2. Redirigir al inicio para seguridad extra
    // (Opcional: Si prefieres que se quede en la pantalla de PIN, comenta la línea de abajo)
    navigate('/'); 
    toast.info('Sesión finalizada');
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
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Staff</h2>
          <p className="text-gray-500 text-sm mb-6">Ingresa el PIN de seguridad</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              inputMode="numeric" 
              className="w-full text-center text-4xl font-bold tracking-widest border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none py-3 transition-all" 
              placeholder="••••" 
              maxLength={4} 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              autoFocus 
            />
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-teal-600/20">
              ENTRAR AL SISTEMA
            </button>
          </form>
          <button onClick={() => navigate('/')} className="mt-4 text-xs text-gray-400 font-medium hover:text-gray-600">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">
      
      {/* --- POPUP GIGANTE (MODAL) --- */}
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
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner">
                    <p className="text-gray-900 text-xl font-bold leading-tight break-words">
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

      {/* --- BARRA SUPERIOR (HEADER) --- */}
      <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center z-10 border-b border-gray-200">
        <div className="flex items-center gap-2">
            <div className="bg-teal-100 p-2 rounded-lg">
                <UserCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
                <h1 className="font-bold text-gray-800 text-base leading-tight">Control de Acceso</h1>
                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Modo Staff</p>
            </div>
        </div>
        
        {/* BOTÓN SALIR MEJORADO */}
        <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100 group"
        >
            <span className="text-xs font-bold hidden sm:block">SALIR</span>
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 relative overflow-hidden">
            {/* Adorno de fondo */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-0 opacity-50"></div>
            
            <div className="relative z-10">
                <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Ingreso Manual (6 dígitos)</p>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="D487B5" 
                        className="w-full text-center text-5xl font-mono uppercase font-black text-gray-800 border-2 border-gray-100 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none py-6 bg-gray-50 placeholder-gray-300 transition-all shadow-inner"
                        autoComplete="off"
                        autoCorrect="off"
                        maxLength={6}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={processing || !code}
                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold px-4 py-5 rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
                    >
                        {processing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                        <span className="text-lg tracking-wide">VERIFICAR</span>
                    </button>
                </form>

                <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="w-12 h-1 bg-gray-100 rounded-full"></div>
                    <p className="text-center text-[10px] text-gray-400 font-medium">
                        SISTEMA LISTO PARA ESCANEO QR
                    </p>
                </div>
            </div>
        </div>
      </div>

      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

export default StaffAttendance;
