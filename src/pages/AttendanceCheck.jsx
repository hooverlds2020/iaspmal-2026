// src/pages/AttendanceCheck.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Loader, X } from 'lucide-react';

const AttendanceCheck = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Autorrelleno mágico si vienes del QR
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
      // handleSubmit(null, codeFromUrl); // Descomentar si quieres envío automático
    }
  }, [searchParams]);

  // Función para reiniciar todo y estar listo para el siguiente
  const resetForm = () => {
    setCode('');
    setResult(null);
    if (inputRef.current) inputRef.current.focus();
    // Limpiamos params de URL para que no se vuelva a disparar
    setSearchParams({});
  };

  const handleSubmit = async (e, codeOverride = null) => {
    if (e) e.preventDefault();
    const codeToUse = codeOverride || code;

    if (!codeToUse) return;

    // Limpiamos cualquier temporizador anterior
    if (timerRef.current) clearTimeout(timerRef.current);

    setLoading(true);
    setResult(null);

    try {
      const cleanCode = codeToUse.toUpperCase().trim();

      // 1. Buscamos el registro
      const { data: registration, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('attendance_code', cleanCode)
        .single();

      if (error || !registration) {
        setResult({
          success: false,
          type: 'error',
          message: 'Código no encontrado. Verifica e intenta de nuevo.'
        });
        return;
      }

      // 2. Validación de Pago (Status)
      if (registration.status !== 'paid') {
        setResult({
          success: false,
          type: 'error',
          message: `El pago aún no ha sido confirmado.`,
          details: `Estado actual: ${registration.status === 'pending' ? 'Pendiente' : 'Rechazado'}`
        });
        return;
      }

      // 3. Validación de Asistencia Previa
      if (registration.attendance_confirmed) {
        setResult({
          success: true,
          type: 'warning',
          message: `¡Hola de nuevo, ${registration.full_name}!`,
          details: 'Tu asistencia ya estaba registrada previamente.',
          date: new Date(registration.attendance_date).toLocaleString('es-MX', {
            dateStyle: 'long', timeStyle: 'short'
          })
        });
        // AUTO-LIMPIEZA EN 5 SEGUNDOS
        timerRef.current = setTimeout(resetForm, 5000);
        return;
      }

      // 4. Registro Nuevo
      const { error: updateError } = await supabase
        .from('registrations')
        .update({
          attendance_confirmed: true,
          attendance_date: new Date().toISOString()
        })
        .eq('id', registration.id);

      if (updateError) throw updateError;

      setResult({
        success: true,
        type: 'success',
        message: `¡Bienvenido/a al Congreso!`,
        subMessage: registration.full_name,
        details: `Categoría: ${registration.category}`,
        timestamp: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
      });

      // AUTO-LIMPIEZA EN 5 SEGUNDOS
      timerRef.current = setTimeout(resetForm, 5000);

    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        type: 'error',
        message: 'Error de conexión. Intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-400 text-green-900';
      case 'warning': return 'bg-blue-50 border-blue-400 text-blue-900';
      case 'error': return 'bg-red-50 border-red-400 text-red-900';
      default: return 'bg-gray-50 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              Registro de Asistencia
            </h1>
            <p className="text-gray-600">XVII Congreso IASPMAL 2026</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Código de Asistencia
              </label>
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="IASP-XXXXXXXX"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-lg uppercase font-mono text-center focus:border-teal-500 focus:ring-teal-500"
                required
                maxLength="13"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                '✓ Registrar Asistencia'
              )}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-5 rounded-xl border-l-4 ${getResultStyles(result.type)} shadow-md relative animate-in fade-in slide-in-from-bottom-4`}>
              {/* Botón de cierre manual por si no quieren esperar */}
              <button 
                onClick={resetForm}
                className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full transition"
                title="Cerrar ahora"
              >
                <X className="w-4 h-4 opacity-50" />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  {result.type === 'success' && <CheckCircle className="w-8 h-8 text-green-600" />}
                  {result.type === 'warning' && <CheckCircle className="w-8 h-8 text-blue-600" />}
                  {result.type === 'error' && <XCircle className="w-8 h-8 text-red-600" />}
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">{result.message}</p>
                  {result.subMessage && <p className="font-semibold text-lg">{result.subMessage}</p>}
                  
                  {result.details && <p className="text-sm opacity-80 mt-1">{result.details}</p>}
                  
                  {result.date && (
                    <div className="mt-2 text-sm font-mono bg-white/50 px-2 py-1 rounded inline-block">
                      {result.date}
                    </div>
                  )}
                  
                  {/* Barra de progreso visual del tiempo (Opcional, pero se ve pro) */}
                  {(result.type === 'success' || result.type === 'warning') && (
                    <div className="mt-3 h-1 w-full bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full bg-current opacity-50 w-full animate-[shrink_5s_linear_forwards]" style={{ transformOrigin: 'left' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Estilo para la animación de la barra de tiempo */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default AttendanceCheck;
