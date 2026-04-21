// src/pages/CertificateDownload.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { jsPDF } from 'jspdf';
import { Search, Download, AlertCircle, CheckCircle, QrCode, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CertificateDownload = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  // Función para reiniciar la búsqueda (limpiar pantalla)
  const handleReset = () => {
    setUserData(null);
    setCode('');
    setError('');
    setDebugInfo('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');
    setUserData(null);

    // --- LÓGICA DE LIMPIEZA CORREGIDA ---
    // 1. Quitamos espacios y pasamos a mayúsculas
    let rawInput = code.toUpperCase().trim().replace(/\s/g, '');
    
    // 2. Si el usuario escribe "IASP-XXXXXX", se lo quitamos para quedarnos con el código limpio
    let cleanHex = rawInput.replace(/^IASP[-]?/, '');
    
    // 3. Buscamos EXACTAMENTE el código limpio (ej: AEA584)
    const searchCode = cleanHex; 

    if (!cleanHex) {
        setError('Por favor ingresa un código válido.');
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .ilike('attendance_code', searchCode) // Buscamos coincidencia exacta (case-insensitive)
        .maybeSingle(); 

      if (error) throw error;

      if (!data) {
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

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [5, 150, 105]; 
    const darkColor = [31, 41, 55]; 

    // --- MARCO Y FONDO ---
    doc.setLineWidth(2);
    doc.setDrawColor(...primaryColor);
    doc.rect(10, 10, 277, 190);

    // --- ENCABEZADO ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.text('CONSTANCIA DE PARTICIPACIÓN', 148.5, 40, { align: 'center' });

    // --- TEXTO INTRO ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('El Comité Organizador del XVII Congreso de la IASPM-AL otorga la presente a:', 148.5, 60, { align: 'center' });

    // --- NOMBRE DEL PARTICIPANTE ---
    doc.setFont('times', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(userData.full_name, 148.5, 85, { align: 'center' });

    // --- LÍNEA DECORATIVA ---
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(70, 90, 227, 90);

    // --- DETALLES DE PARTICIPACIÓN ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    const categoryText = getCategoryLabel(userData.category).toUpperCase();
    
    doc.text(`Por su valiosa participación en calidad de ${categoryText}`, 148.5, 105, { align: 'center' });
    doc.text('en el XVII Congreso de la Asociación Internacional para el Estudio', 148.5, 120, { align: 'center' });
    doc.text('de la Música Popular - Rama Latinoamericana (IASPM-AL).', 148.5, 130, { align: 'center' });

    // --- FECHA Y LUGAR ---
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Celebrado en San Cristóbal de Las Casas, Chiapas, México', 148.5, 150, { align: 'center' });
    doc.text('del 28 de septiembre al 2 de octubre de 2026.', 148.5, 160, { align: 'center' });

    // --- FIRMAS ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('_________________________', 90, 180, { align: 'center' });
    doc.text('_________________________', 207, 180, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Comité Organizador', 90, 185, { align: 'center' });
    doc.text('Presidencia IASPM-AL', 207, 185, { align: 'center' });

    // --- NUEVO: PIE DE PÁGINA DE VALIDACIÓN (SEGURIDAD) ---
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    // Usamos tu dominio real para que sea válido
    const validationUrl = `iaspmal2026.com/constancias`;
    const validationText = `Autenticidad verificable en: ${validationUrl} | Código: ${userData.attendance_code}`;
    doc.text(validationText, 148.5, 196, { align: 'center' });

    doc.save(`Constancia_${userData.full_name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      
      {/* Botón flotante para volver al inicio */}
      <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-teal-600 flex items-center gap-2 transition">
        <ArrowLeft className="w-5 h-5" /> Volver al inicio
      </Link>

      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden relative">
        
        <div className="bg-teal-600 p-6 text-center">
          <QrCode className="w-12 h-12 text-white mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">Descarga tu Constancia</h2>
          <p className="text-teal-100 text-sm mt-1">Ingresa el código que aparece en tu Gafete</p>
        </div>

        <div className="p-8">
          {/* Si NO hay usuario encontrado, mostramos el buscador */}
          {!userData ? (
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
            // Si YA encontramos al usuario, mostramos el resultado
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Participante encontrado:</p>
                <h3 className="text-xl font-bold text-gray-900">{userData.full_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{getCategoryLabel(userData.category)}</p>
              </div>

              {userData.status === 'paid' && userData.attendance_confirmed ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h4 className="text-green-800 font-bold mb-1">¡Constancia Disponible!</h4>
                    <p className="text-green-700 text-sm mb-4">
                      Requisitos cumplidos correctamente.
                    </p>
                    <button
                      onClick={generateCertificate}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Descargar PDF Oficial
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-amber-800 font-bold mb-1">Aún no disponible</h4>
                      <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside mt-2 text-left">
                        <li>{userData.status === 'paid' ? '✅ Pago confirmado' : '⏳ Falta confirmar Pago'}</li>
                        <li>{userData.attendance_confirmed ? '✅ Asistencia registrada' : '⏳ Falta registrar Asistencia en sede'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTÓN PARA REINICIAR (BUSCAR OTRO) */}
              <button
                onClick={handleReset}
                className="w-full mt-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Buscar otra constancia
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateDownload;
