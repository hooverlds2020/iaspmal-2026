import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Camera, User, Search } from 'lucide-react';

const StaffAttendance = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paidParticipants, setPaidParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPaidParticipants();
  }, []);

  const fetchPaidParticipants = async () => {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('status', 'paid')
      .order('full_name');
    
    setPaidParticipants(data || []);
  };

  const confirmAttendance = async (code) => {
    setLoading(true);
    setResult(null);

    try {
      const { data: registration, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('attendance_code', code.toUpperCase().trim())
        .single();

      if (error || !registration) {
        setResult({
          success: false,
          message: 'Código no encontrado'
        });
        return;
      }

      if (registration.status !== 'paid') {
        setResult({
          success: false,
          message: 'Pago no confirmado. Favor de pasar a caja.'
        });
        return;
      }

      if (registration.attendance_confirmed) {
        setResult({
          success: true,
          alreadyRegistered: true,
          message: `${registration.full_name} ya registró asistencia`,
          data: registration
        });
        return;
      }

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
        message: `¡Bienvenido/a!`,
        data: registration
      });

      fetchPaidParticipants();
      setManualCode('');
    } catch (error) {
      setResult({
        success: false,
        message: 'Error al confirmar asistencia'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (data) => {
    if (data) {
      const code = data.text || data;
      // Extraer código del URL si viene del QR
      const match = code.match(/code=([A-Z0-9-]+)/i);
      const attendanceCode = match ? match[1] : code;
      
      confirmAttendance(attendanceCode);
      setScanning(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      confirmAttendance(manualCode);
    }
  };

  const filteredParticipants = paidParticipants.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !p.attendance_confirmed
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Control de Asistencia - Staff
          </h1>
          <p className="text-center text-gray-600 mt-2">
            XVII Congreso IASPMAL 2026
          </p>
        </div>

        {/* Scanner/Manual Input */}
        <div className="bg-white p-6 shadow-xl">
          <div className="space-y-4">
            {/* Botón Escanear QR */}
            {!scanning && (
              <button
                onClick={() => setScanning(true)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-3 text-lg shadow-lg"
              >
                <Camera className="w-6 h-6" />
                Escanear Código QR
              </button>
            )}

            {/* QR Scanner */}
            {scanning && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border-4 border-teal-500">
                  <QrReader
                    constraints={{ facingMode: 'environment' }}
                    onResult={handleScan}
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  onClick={() => setScanning(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Manual Input */}
            {!scanning && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">
                  O ingresa el código manualmente:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="IASP-XXXXXXXX"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg font-mono"
                  />
                  <button
                    type="submit"
                    disabled={loading || !manualCode}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold px-6 rounded-xl transition"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-6 rounded-xl ${
              result.success 
                ? 'bg-green-50 border-4 border-green-500' 
                : 'bg-red-50 border-4 border-red-500'
            }`}>
              <div className="flex items-start gap-4">
                {result.success ? (
                  <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-2xl font-bold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                  {result.data && (
                    <div className="mt-4 space-y-2 text-lg">
                      <p className="font-bold text-gray-800">{result.data.full_name}</p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Categoría:</span> {result.data.category}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">País:</span> {result.data.country}
                      </p>
                      {result.alreadyRegistered && (
                        <p className="text-sm text-gray-600 mt-2">
                          Asistencia registrada: {new Date(result.data.attendance_date).toLocaleString('es-MX')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Pendientes */}
        <div className="bg-white rounded-b-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Pendientes de Registro ({filteredParticipants.length})
          </h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredParticipants.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">{p.full_name}</p>
                  <p className="text-sm text-gray-600">{p.category} • {p.country}</p>
                </div>
                <button
                  onClick={() => confirmAttendance(p.attendance_code)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                  Confirmar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendance;
