import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const AttendanceCheck = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Buscar participante por código
      const { data: registration, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('attendance_code', code.toUpperCase().trim())
        .single();

      if (error || !registration) {
        setResult({
          success: false,
          message: 'Código no encontrado. Verifica e intenta de nuevo.'
        });
        return;
      }

      // Verificar que el pago esté confirmado
      if (registration.status !== 'paid') {
        setResult({
          success: false,
          message: 'El pago aún no ha sido confirmado. Contacta con el registro.'
        });
        return;
      }

      // Verificar si ya registró asistencia
      if (registration.attendance_confirmed) {
        setResult({
          success: true,
          alreadyRegistered: true,
          message: `Bienvenido/a de nuevo, ${registration.full_name}!`,
          date: new Date(registration.attendance_date).toLocaleString('es-MX')
        });
        return;
      }

      // Registrar asistencia
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
        message: `¡Bienvenido/a, ${registration.full_name}!`,
        details: `Categoría: ${registration.category}`
      });

      setCode('');
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        message: 'Error al registrar asistencia. Intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700 mb-2">
            Registro de Asistencia
          </h1>
          <p className="text-gray-600">
            XVII Congreso IASPMAL 2026
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Asistencia
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="IASP-XXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg uppercase"
              required
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Ingresa tu código de 12 caracteres
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              'Registrar Asistencia'
            )}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border-2 border-green-500' 
              : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                {result.details && (
                  <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                )}
                {result.alreadyRegistered && (
                  <p className="text-sm text-gray-600 mt-1">
                    Asistencia registrada el: {result.date}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCheck;
