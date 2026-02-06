// src/pages/CertificateDownload.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { jsPDF } from 'jspdf';
import { Search, Download, AlertCircle, CheckCircle, QrCode, Loader2 } from 'lucide-react';

const CertificateDownload = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');
    setUserData(null);

    // --- CORRECCIÓN CLAVE ---
    // 1. Limpiamos espacios y mayúsculas
    let rawInput = code.toUpperCase().trim().replace(/\s/g, '');
    
    // 2. Si el usuario escribió "IASP-" al inicio, se lo quitamos temporalmente para tener solo el código base
    let cleanHex = rawInput.replace(/^IASP[-]?/, '');

    // 3. Reconstruimos el código SIEMPRE con el formato "IASP-" al principio
    // Esto asegura que coincida con lo que tienes guardado en la Base de Datos (ej: IASP-D487B55B)
    const searchCode = `IASP-${cleanHex}`;

    console.log("🔍 Buscando en BD:", searchCode); 

    if (!cleanHex) {
        setError('Por favor ingresa un código.');
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .ilike('attendance_code', searchCode) // Buscamos el código completo con IASP-
        .maybeSingle(); 

      if (error) {
        console.error("❌ Error Supabase:", error);
        throw error;
      }

      if (!data) {
        // Mensaje de error amigable
        setError(`No encontramos la inscripción con el código "${searchCode}".`);
        setDebugInfo("Verifica que el código de tu gafete sea idéntico.");
      } else {
        setUserData(data);
      }
    } catch (err) {
      setError('Ocurrió un problema al consultar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'sur_global': 'Sur Global',
      'norte_global': 'Norte Global',
      'institucion_convocante': 'Institución Convocante',
      'estudiante': 'Estudiante',
      'asistente': 'Asistente'
    };
    return labels[category] || category;
  };

  const generateCertificate = () => {
    if (!userData) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const primaryColor = [5, 150, 105]; 
    const darkColor = [31, 41, 55]; 
    
    doc.setLineWidth(2);
    doc.setDrawColor(...primaryColor);
    doc.rect(10, 10, 277, 190);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.text('CONSTANCIA DE PARTICIPACIÓN', 148.5, 40, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('El Comité Organizador del XVII Congreso de la IASPM-AL otorga la presente a:', 148.5, 60, { align: 'center' });
    
    doc.setFont('times', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(userData.full_name, 148.5, 85, { align: 'center' });
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(70, 90, 227, 90);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    const categoryText = getCategoryLabel(userData.category).toUpperCase();
    doc.text(`Por su valiosa participación en calidad de ${categoryText}`, 148.5, 105, { align: 'center' });
    doc.text('en el XVII Congreso de la Asociación Internacional para el Estudio', 148.5, 120, { align: 'center' });
    doc.text('de la Música Popular - Rama Latinoamericana (IASPM-AL).', 148.5, 130, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Celebrado en San Cristóbal de Las Casas, Chiapas, México', 148.5, 150, { align: 'center' });
    doc.text('del 28 de septiembre al 2 de octubre de 2026.', 148.5, 160, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('_________________________', 90, 180, { align: 'center' });
    doc.text('_________________________', 207, 180, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Comité Organizador', 90, 185, { align: 'center' });
    doc.text('Presidencia IASPM-AL', 207, 185, { align: 'center' });
    
    doc.save(`Constancia_${userData.full_name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        
        <div className="bg-teal-600 p-6 text-center">
          <QrCode className="w-12 h-12 text-white mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">Descarga tu Constancia</h2>
          <p className="text-teal-100 text-sm mt-1">Ingresa el código de tu Gafete</p>
        </div>

        <div className="p-8">
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
                  placeholder="Ej: IASP-D487B5" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Puedes escribir los últimos caracteres o el código completo (IASP-XXXXXX).
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
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex flex-col gap-2 border border-red-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold">No se encontró</p>
              </div>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {userData && (
            <div className="mt-8 animate-in fade-in">
              <div className="border-t pt-6">
                <p className="text-sm text-gray-500 mb-1 text-center">Participante encontrado:</p>
                <h3 className="text-lg font-bold text-gray-900 text-center">{userData.full_name}</h3>
                <p className="text-sm text-gray-600 capitalize mb-4 text-center">{getCategoryLabel(userData.category)}</p>

                {userData.status === 'paid' && userData.attendance_confirmed ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
                    <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                    <h4 className="text-green-800 font-bold mb-1">¡Constancia Disponible!</h4>
                    <p className="text-green-700 text-sm mb-4">
                      Requisitos cumplidos.
                    </p>
                    <button
                      onClick={generateCertificate}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Descargar PDF
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <h4 className="text-amber-800 font-bold mb-1">Aún no disponible</h4>
                        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside mt-2">
                          <li>{userData.status === 'paid' ? '✅ Pago' : '⏳ Falta Pago'}</li>
                          <li>{userData.attendance_confirmed ? '✅ Asistencia' : '⏳ Falta Check-in'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateDownload;
