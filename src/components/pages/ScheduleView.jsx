// src/components/pages/ScheduleView.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Clock, MapPin, Users, ChevronLeft, ChevronRight, X, Printer, Download } from 'lucide-react';

const ScheduleView = ({ embedded = false, lang: propLang }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [lang, setLang] = useState(propLang || 'es');

  // Actualizar idioma si cambia desde props
  useEffect(() => {
    if (propLang) {
      setLang(propLang);
    }
  }, [propLang]);

  const days = [
    { 
      date: '2026-09-28', 
      label_es: 'Lun. 28', 
      label_pt: 'Seg. 28', 
      fullLabel_es: 'lunes, 28 de septiembre de 2026', 
      fullLabel_pt: 'segunda-feira, 28 de setembro de 2026' 
    },
    { 
      date: '2026-09-29', 
      label_es: 'Mar. 29', 
      label_pt: 'Ter. 29', 
      fullLabel_es: 'martes, 29 de septiembre de 2026', 
      fullLabel_pt: 'terça-feira, 29 de setembro de 2026' 
    },
    { 
      date: '2026-09-30', 
      label_es: 'Mié. 30', 
      label_pt: 'Qua. 30', 
      fullLabel_es: 'miércoles, 30 de septiembre de 2026', 
      fullLabel_pt: 'quarta-feira, 30 de setembro de 2026' 
    },
    { 
      date: '2026-10-01', 
      label_es: 'Jue. 01', 
      label_pt: 'Qui. 01', 
      fullLabel_es: 'jueves, 1 de octubre de 2026', 
      fullLabel_pt: 'quinta-feira, 1 de outubro de 2026' 
    },
    { 
      date: '2026-10-02', 
      label_es: 'Vie. 02', 
      label_pt: 'Sex. 02', 
      fullLabel_es: 'viernes, 2 de octubre de 2026', 
      fullLabel_pt: 'sexta-feira, 2 de outubro de 2026' 
    }
  ];

  // Función para imprimir solo el día actual
  const handlePrint = () => {
    window.print();
  };

  // Función para exportar a PDF del día actual
  const handleExportPDF = () => {
    document.body.classList.add('printing');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
    }, 100);
  };

  // Colores para diferentes tipos de eventos
  const eventColors = {
    'symposium': 'bg-purple-400 border-purple-500 text-white',
    'panel': 'bg-pink-400 border-pink-500 text-white',
    'plenary': 'bg-blue-400 border-blue-500 text-white',
    'welcome': 'bg-cyan-400 border-cyan-500 text-white',
    'break': 'bg-gray-300 border-gray-400 text-gray-800',
    'workshop': 'bg-green-400 border-green-500 text-white',
    'default': 'bg-purple-400 border-purple-500 text-white'
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Agregar estilos de impresión
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Ocultar scrollbar pero mantener funcionalidad */
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      
      .hide-scrollbar::-webkit-scrollbar {
        display: none;  /* Chrome, Safari and Opera */
      }

      @media print {
        /* Ocultar elementos no necesarios */
        .print\\:hidden {
          display: none !important;
        }
        
        /* Ocultar navegación y header cuando no está embedded */
        header, .top-bar, nav, .sidebar {
          display: none !important;
        }
        
        /* Ajustar página */
        @page {
          size: A4 landscape;
          margin: 1.5cm;
        }
        
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
          margin: 0;
          padding: 0;
        }
        
        /* Evitar saltos de página dentro de sesiones */
        .session-card {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Ajustar colores para impresión */
        .bg-purple-400 { background-color: #c084fc !important; }
        .bg-blue-400 { background-color: #60a5fa !important; }
        .bg-cyan-400 { background-color: #22d3ee !important; }
        .bg-pink-400 { background-color: #f472b6 !important; }
        .bg-green-400 { background-color: #4ade80 !important; }
        .bg-gray-300 { background-color: #d1d5db !important; }
        
        .border-purple-500 { border-color: #a855f7 !important; }
        .border-blue-500 { border-color: #3b82f6 !important; }
        .border-cyan-500 { border-color: #06b6d4 !important; }
        .border-pink-500 { border-color: #ec4899 !important; }
        .border-green-500 { border-color: #22c55e !important; }
        .border-gray-400 { border-color: #9ca3af !important; }
        
        /* Ajustar márgenes para impresión */
        .p-4, .p-6 {
          padding: 0.5rem !important;
        }
        
        .px-4, .px-6 {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
        
        /* Reducir espacio entre sesiones */
        .space-y-4 > * + * {
          margin-top: 0.5rem !important;
        }
        
        /* Asegurar que todo el contenido sea visible */
        body, html {
          height: auto !important;
          overflow: visible !important;
        }
        
        /* Título del congreso para impresión */
        .print-header {
          display: block !important;
          text-align: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #0d9488;
        }
        
        /* Ocultar otros días en impresión */
        .schedule-day-content {
          display: block !important;
        }
        
        /* Ajustar leyenda */
        .legend-print {
          page-break-before: avoid;
          margin-top: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid #ccc;
        }
        
        /* Hacer grid más compacto */
        .grid {
          gap: 0.25rem !important;
        }
        
        /* Reducir tamaño de fuente si es necesario */
        .text-sm {
          font-size: 0.75rem !important;
        }
        
        .text-xs {
          font-size: 0.65rem !important;
        }
      }
      
      /* Ocultar el header de impresión por defecto (solo visible al imprimir) */
      .print-header {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          symposiums (
            number,
            title_es,
            title_en,
            coordinators
          ),
          rooms (
            name
          )
        `)
        .order('day', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('day', { ascending: true })
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        setSessions(data || []);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener sesiones del día actual
  const currentDay = days[currentDayIndex];
  const daySessions = sessions.filter(s => s.day === currentDay.date);

  // Agrupar sesiones por hora de inicio
  const sessionsByTime = {};
  daySessions.forEach(session => {
    const timeKey = session.start_time;
    if (!sessionsByTime[timeKey]) {
      sessionsByTime[timeKey] = [];
    }
    sessionsByTime[timeKey].push(session);
  });

  const timeSlots = Object.keys(sessionsByTime).sort();

  const getSessionTitle = (session) => {
    if (session.title) {
      return lang === 'pt' ? (session.title_pt || session.title) : session.title;
    }
    if (session.symposiums) {
      return lang === 'es' 
        ? lang === 'pt' ? (session.symposiums?.title_pt || session.symposiums?.title_es) : session.symposiums?.title_es 
        : session.symposiums.title_en || lang === 'pt' ? (session.symposiums?.title_pt || session.symposiums?.title_es) : session.symposiums?.title_es;
    }
    return lang === 'es' ? (lang === 'pt' ? (session.notes_pt || session.notes_es) : session.notes_es) : session.notes_en || (lang === 'pt' ? (session.notes_pt || session.notes_es) : session.notes_es);
  };

  const getEventType = (session) => {
    if (session.type) {
      return session.type;
    }

    const notes = ((lang === 'pt' ? (session.notes_pt || session.notes_es) : session.notes_es) || '').toLowerCase();
    
    if (notes.includes('pausa') || notes.includes('café') || notes.includes('comida') || notes.includes('almoco')) {
      return 'break';
    }
    if (notes.includes('bienvenida') || notes.includes('recepção')) {
      return 'welcome';
    }
    if (notes.includes('asamblea') || notes.includes('assembleia') || notes.includes('cena')) {
      return 'panel';
    }
    if (notes.includes('keynote') || notes.includes('memorial lecture')) {
      return 'plenary';
    }
    if (notes.includes('taller') || notes.includes('workshop')) {
      return 'workshop';
    }
    
    return 'symposium';
  };

  const getBlockHeight = (startTime, endTime) => {
    if (!startTime || !endTime) return 80;
    
    const start = startTime.split(':');
    const end = endTime.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    const durationMinutes = endMinutes - startMinutes;
    return Math.max(60, durationMinutes * 1.5);
  };

  const formatTime = (time) => {
    return time?.substring(0, 5) || '';
  };

  const getDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = startTime.split(':');
    const end = endTime.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    return endMinutes - startMinutes;
  };

  const getRoomName = (session) => {
    if (session.room) return session.room;
    if (session.rooms) return session.rooms.name;
    return null;
  };

  const getSpeakers = (session) => {
    if (session.speakers) return session.speakers;
    if (session.symposiums?.coordinators) return session.symposiums.coordinators;
    return null;
  };

  if (loading) {
    return (
      <div className={embedded ? "py-12" : "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4"}>
        <div className={embedded ? "w-full" : "max-w-7xl mx-auto"}>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4"}>
      <div className={embedded ? "w-full" : "max-w-7xl mx-auto"}>
        {/* Header - Solo mostrar si NO está embedded */}
        {!embedded && (
          <div className="text-center mb-8 print:hidden">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {lang === 'es' ? 'Programa del Congreso' : 'Conference Program'}
            </h1>
            <p className="text-gray-600">
              XVIII IASPMAL 2026 - Tuxtla Gutiérrez, Chiapas
            </p>
            
            <div className="mt-4">
              <button
                onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                className="px-4 py-2 bg-white border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition font-semibold"
              >
                {lang === 'es' ? 'English' : 'Español'}
              </button>
            </div>
          </div>
        )}

        {/* Header para impresión - Solo visible al imprimir */}
        <div className="print-header">
          <h1 className="text-2xl font-bold text-gray-900">
            XVIII Congreso de la IASPM-AL 2026
          </h1>
          <p className="text-gray-700 text-sm">
            Ética, Política y Música Popular
          </p>
          <p className="text-gray-600 text-sm">
            28 de Septiembre al 2 Octubre de 2026, San Cristóbal de Las Casas, Chiapas, México
          </p>
          <p className="text-teal-700 font-semibold mt-2">
            {lang === 'es' ? currentDay.fullLabel_es : currentDay.fullLabel_en}
          </p>
        </div>

        {/* Contenedor principal */}
        <div className={`schedule-day-content ${embedded ? "bg-white" : "bg-white rounded-xl shadow-lg border border-gray-200"}`}>
          {/* Navegación de días */}
          <div className={`border-b border-gray-200 bg-gray-50 ${embedded ? '' : 'rounded-t-xl'} print:hidden`}>
            <div className="flex items-center justify-center gap-2 p-4 overflow-x-auto">
              <button
                onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
                disabled={currentDayIndex === 0}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>

              <div className="flex gap-2 overflow-x-auto flex-nowrap hide-scrollbar">
                {days.map((day, index) => (
                  <button
                    key={day.date}
                    onClick={() => setCurrentDayIndex(index)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                      index === currentDayIndex
                        ? 'bg-teal-600 text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-teal-400'
                    }`}
                  >
                    {lang === 'es' ? day.label_es : day.label_pt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentDayIndex(Math.min(days.length - 1, currentDayIndex + 1))}
                disabled={currentDayIndex === days.length - 1}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>
            </div>

            {/* Título del día y botones de acción */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 px-4 gap-3">
              <h3 className="text-lg md:text-xl font-semibold text-gray-700">
                {lang === 'es' ? currentDay.fullLabel_es : currentDay.fullLabel_en}
              </h3>
              
              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  title={lang === 'es' ? 'Imprimir día actual' : 'Print current day'}
                >
                  <Printer size={18} />
                  <span className="hidden sm:inline">
                    {lang === 'es' ? 'Imprimir' : lang === 'es' ? 'Imprimir' : 'Imprimir'}
                  </span>
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                  title={lang === 'es' ? 'Exportar día actual a PDF' : 'Export current day to PDF'}
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">
                    PDF
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Vista de calendario */}
          <div className="p-4 md:p-6">
            {timeSlots.length === 0 ? (
              <p className="text-center text-gray-500 py-12 text-lg">
                {lang === 'es' 
                  ? 'No hay sesiones programadas para este día'
                  : 'No sessions scheduled for this day'}
              </p>
            ) : (
              <div className="space-y-4">
                {timeSlots.map((timeSlot) => {
                  const parallelSessions = sessionsByTime[timeSlot];
                  const firstSession = parallelSessions[0];
                  const eventType = getEventType(firstSession);
                  const isFullWidth = eventType === 'break' || eventType === 'welcome' || parallelSessions.length === 1;

                  if (isFullWidth) {
                    const height = getBlockHeight(firstSession.start_time, firstSession.end_time);
                    const duration = getDurationMinutes(firstSession.start_time, firstSession.end_time);

                    return (
                      <div
                        key={timeSlot}
                        className={`session-card rounded-lg border-2 p-4 cursor-pointer hover:opacity-90 hover:shadow-lg transition-all ${eventColors[eventType] || eventColors.default}`}
                        style={{ minHeight: `${height}px` }}
                        onClick={() => setSelectedSession(firstSession)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold opacity-90">
                            {formatTime(firstSession.start_time)} ({duration} min)
                          </span>
                        </div>
                        <h4 className="font-bold text-base md:text-lg text-center">
                          {getSessionTitle(firstSession)}
                        </h4>
                        {getSpeakers(firstSession) && (
                          <p className="text-sm text-center mt-2 opacity-90">
                            {getSpeakers(firstSession)}
                          </p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={timeSlot}>
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <Clock size={18} className="text-teal-600 flex-shrink-0" />
                        <span className="font-bold text-gray-700">
                          {formatTime(firstSession.start_time)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {parallelSessions.map((session) => {
                          const sessionEventType = getEventType(session);
                          const height = getBlockHeight(session.start_time, session.end_time);
                          const duration = getDurationMinutes(session.start_time, session.end_time);

                          return (
                            <div
                              key={session.id}
                              className={`session-card rounded-lg border-2 p-3 md:p-4 cursor-pointer hover:opacity-90 hover:shadow-lg transition-all overflow-hidden ${eventColors[sessionEventType] || eventColors.default}`}
                              style={{ minHeight: `${Math.max(100, height)}px` }}
                              onClick={() => setSelectedSession(session)}
                            >
                              <div className="text-xs font-semibold opacity-90 mb-2">
                                ({duration} min)
                              </div>
                              <h4 className="font-bold text-sm line-clamp-3 mb-2">
                                {getSessionTitle(session)}
                              </h4>
                              {getSpeakers(session) && (
                                <p className="text-xs opacity-90 line-clamp-2 mb-2">
                                  {getSpeakers(session)}
                                </p>
                              )}
                              {getRoomName(session) && (
                                <div className="flex items-center gap-1 mt-auto text-xs font-semibold">
                                  <MapPin size={12} />
                                  <span className="truncate">{getRoomName(session)}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Leyenda */}
            <div className="legend-print mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-center font-semibold text-gray-700 mb-4">
                {lang === 'es' ? 'Tipos de eventos' : lang === 'es' ? 'Tipos de eventos' : 'Tipos de eventos'}
              </h4>
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-purple-400 border-2 border-purple-500 rounded flex-shrink-0"></div>
                  <span>{lang === 'es' ? 'Simposio' : lang === 'es' ? 'Simposio' : 'Simpósio'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-blue-400 border-2 border-blue-500 rounded flex-shrink-0"></div>
                  <span>{lang === 'es' ? 'Plenaria' : lang === 'es' ? 'Plenaria' : 'Plenária'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-cyan-400 border-2 border-cyan-500 rounded flex-shrink-0"></div>
                  <span>{lang === 'es' ? 'Bienvenida' : lang === 'es' ? 'Bienvenida' : 'Boas-vindas'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-pink-400 border-2 border-pink-500 rounded flex-shrink-0"></div>
                  <span>{lang === 'es' ? lang === 'es' ? 'Panel' : 'Painel' : lang === 'es' ? 'Panel' : 'Painel'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-300 border-2 border-gray-400 rounded flex-shrink-0"></div>
                  <span>{lang === 'es' ? 'Pausa' : lang === 'es' ? 'Pausa' : 'Pausa'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-green-400 border-2 border-green-500 rounded flex-shrink-0"></div>
                  <span>{lang === 'es' ? 'Taller' : lang === 'es' ? 'Taller' : 'Oficina'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de detalles */}
        {selectedSession && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden"
            onClick={() => setSelectedSession(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {lang === 'es' ? 'Detalles de la sesión' : lang === 'es' ? 'Detalles de la sesión' : 'Detalhes da sessão'}
                </h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  {getSessionTitle(selectedSession)}
                </h3>

                <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-purple-100 text-purple-800">
                  {getEventType(selectedSession)}
                </div>

                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-teal-600 flex-shrink-0" />
                    <span className="font-medium">
                      {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                      {' '}({getDurationMinutes(selectedSession.start_time, selectedSession.end_time)} min)
                    </span>
                  </div>

                  {getRoomName(selectedSession) && (
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-teal-600 flex-shrink-0" />
                      <span>{getRoomName(selectedSession)}</span>
                    </div>
                  )}

                  {getSpeakers(selectedSession) && (
                    <div className="flex items-start gap-3">
                      <Users size={20} className="text-teal-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm mb-1">
                          {lang === 'es' ? 'Coordinadores/Ponentes:' : lang === 'es' ? 'Coordinadores/Ponentes:' : 'Coordenadores/Palestrantes:'}
                        </p>
                        <p>{getSpeakers(selectedSession)}</p>
                      </div>
                    </div>
                  )}

                  {selectedSession.description && (
                    <div className="pt-4 border-t mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {lang === 'es' ? 'Descripción' : lang === 'es' ? 'Descripción' : 'Descrição'}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedSession.description}
                      </p>
                    </div>
                  )}

                  {(selectedSession.notes_es || selectedSession.notes_en) && (
                    <div className="pt-4 border-t mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {lang === 'es' ? 'Notas' : lang === 'es' ? 'Notas' : 'Notas'}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {lang === 'es' ? selectedSession.notes_es : selectedSession.notes_en || selectedSession.notes_es}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedSession(null)}
                  className="mt-6 w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                >
		{lang === 'es' ? 'Cerrar' : lang === 'es' ? 'Cerrar' : 'Fechar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
