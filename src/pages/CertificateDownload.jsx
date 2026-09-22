// src/pages/CertificateDownload.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Download, AlertCircle, CheckCircle, QrCode, Loader2, ArrowLeft, Lock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  certTypeLabel,
  generateOfficialCertificatePDF,
  isCertificateUnlocked,
  getUnlockDateLabel,
} from '../lib/certificateTemplates';

const CertificateDownload = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [certs, setCerts] = useState(null); // null = aún no se ha buscado

  const handleReset = () => {
    setCerts(null);
    setCode('');
    setError('');
    setParticipantName('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCerts(null);

    let rawInput = code.toUpperCase().trim().replace(/\s/g, '');
    let cleanHex = rawInput.replace(/^IASP[-]?/, '');
    const searchCode = cleanHex;

    if (!cleanHex) {
      setError('Por favor ingresa un código válido.');
      setLoading(false);
      return;
    }

    try {
      // 1. Buscar la inscripción por su código de asistencia (gafete/QR)
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .select('id, full_name, status, attendance_confirmed')
        .ilike('attendance_code', searchCode)
        .maybeSingle();

      if (regError) throw regError;

      if (!reg) {
        setError(`No encontramos la inscripción con el código "${searchCode}". Verifica que sea idéntico al de tu gafete.`);
        setLoading(false);
        return;
      }

      // 2. Traer TODAS las constancias asociadas a esa persona
      const { data: certificates, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('registration_id', reg.id)
        .order('created_at', { ascending: true });

      if (certError) throw certError;

      setParticipantName(reg.full_name);

      if (!certificates || certificates.length === 0) {
        setCerts([]);
      } else {
        setCerts(certificates);
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un problema al consultar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert) => {
    generateOfficialCertificatePDF(cert, 'download');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">

      <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-teal-600 flex items-center gap-2 transition">
        <ArrowLeft className="w-5 h-5" /> Volver al inicio
      </Link>

      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg overflow-hidden relative">

        <div className="bg-teal-600 p-6 text-center">
          <QrCode className="w-12 h-12 text-white mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">Descarga tu Constancia</h2>
          <p className="text-teal-100 text-sm mt-1">Ingresa el código que aparece en tu Gafete</p>
        </div>

        <div className="p-8">
          {certs === null ? (
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Asistencia (QR)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="code"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition font-mono uppercase tracking-widest text-center text-lg placeholder-gray-300"
                    placeholder="Ej: AEA584"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Ingresa los 6 caracteres de tu código (letras y números)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verificando...
                  </>
                ) : (
                  'Buscar Constancia'
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex flex-col gap-2 border border-red-200 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-bold text-sm">No se encontró</p>
                  </div>
                  <p className="text-xs">{error}</p>
                </div>
              )}
            </form>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Participante encontrado:</p>
                <h3 className="text-xl font-bold text-gray-900">{participantName}</h3>
              </div>

              {certs.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                  <p className="text-amber-800 font-bold mb-1">Aún no hay constancias registradas</p>
                  <p className="text-amber-700 text-sm">
                    Si ya participaste, contacta al Comité Organizador para que registren tu constancia.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certs.map((cert) => {
                    const unlocked = isCertificateUnlocked(cert);
                    return (
                      <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 text-[#1e3a5f] p-2 rounded-lg shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                              {certTypeLabel(cert.certificate_type)}
                            </p>
                            {(cert.presentation_title || cert.symposium_title) && (
                              <p className="text-sm text-gray-600 mt-0.5 truncate">
                                {cert.presentation_title || cert.symposium_title}
                              </p>
                            )}
                          </div>
                        </div>

                        {unlocked ? (
                          <button
                            onClick={() => handleDownload(cert)}
                            className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Descargar PDF
                          </button>
                        ) : (
                          <div className="w-full mt-3 bg-gray-100 text-gray-500 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm">
                            <Lock className="w-4 h-4" />
                            Disponible a partir del {getUnlockDateLabel(cert)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full mt-6 text-sm text-gray-400 hover:text-gray-600 font-medium transition"
              >
                Buscar otro código
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateDownload;
