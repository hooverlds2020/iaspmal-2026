// src/components/pages/ScheduleView.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, Clock, MapPin, Users, X, FileText, ChevronRight, ArrowLeft, User } from 'lucide-react';

const ScheduleView = ({ onDataLoaded }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [uniqueDates, setUniqueDates] = useState([]);

  // Estados del Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          rooms (name),
          symposiums (name, coordinators),
          presentations (
            id, title, authors, author_affiliation, abstract_text, start_time, end_time
          )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      if (data) {
        setSessions(data);
        const dates = [...new Set(data.filter(s => s.date).map(s => s.date))].sort();
        setUniqueDates(dates);
        if (dates.length > 0 && !selectedDate) setSelectedDate(dates[0]);
        if (onDataLoaded) onDataLoaded(data);
      }
    } catch (error) {
      console.error('Error cargando agenda:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric' }).format(date).toUpperCase();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.slice(0, 5);
  };

  const filteredSessions = sessions.filter(s => s.date === selectedDate);
  const sessionsByTime = filteredSessions.reduce((acc, session) => {
    const timeKey = session.start_time || '00:00:00';
    if (!acc[timeKey]) acc[timeKey] = [];
    acc[timeKey].push(session);
    return acc;
  }, {});
  const sortedTimeKeys = Object.keys(sessionsByTime).sort();

  if (loading) return <div className="p-8 text-center text-xs text-gray-400 italic">Cargando agenda...</div>;

  return (
    <div className="relative min-h-[60vh] animate-in fade-in duration-500">

      {/* 1. SELECTOR DE DÍAS */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 py-3 -mx-4 px-4 mb-6 overflow-x-auto hide-scrollbar flex gap-2 shadow-sm">
        {uniqueDates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`flex-shrink-0 px-6 py-2 rounded-xl text-xs font-black transition-all border ${
              selectedDate === date
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-lg scale-105'
                : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
            }`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      {/* 2. LISTA DE SESIONES */}
      <div className="space-y-10 pb-20">
        {sortedTimeKeys.length === 0 ? (
          <div className="text-center py-20 opacity-50">
             <Calendar className="mx-auto mb-2 text-gray-300" size={40} />
             <p className="text-sm font-medium text-gray-400">No hay sesiones programadas.</p>
          </div>
        ) : (
          sortedTimeKeys.map((timeKey) => (
            <div key={timeKey}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                  {formatTime(timeKey)} HRS
                </div>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessionsByTime[timeKey].map((session) => (
                  <div
                    key={session.id}
                    onClick={() => { setSelectedSession(session); setSelectedPaper(null); }}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-[#1e3a5f] transition-all cursor-pointer group flex flex-col gap-3 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <span className="bg-blue-50 text-[#1e3a5f] text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-tight">
                        {session.name}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase truncate max-w-[60%]">      
                        <MapPin size={12} className="text-orange-500 shrink-0" />
                        <span className="truncate">{session.rooms?.name || 'Sala TBD'}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#1e3a5f]">
                      {session.symposiums?.name || 'Evento Especial'}
                    </h4>
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                        <Users size={12} />
                        {session.presentations?.length || 0} Ponencias
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black text-gray-300 uppercase">
                        Fin: {formatTime(session.end_time)}
                        <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. MODAL DE DETALLES (FULL SCREEN MOBILE FIX) */}
      {selectedSession && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-white sm:bg-black/70 sm:backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
          
          {/* CONTENEDOR PRINCIPAL BLINDADO:
             - h-[100dvh]: Ocupa toda la altura dinámica del viewport en móvil.
             - sm:h-auto sm:max-h-[85vh]: En tablet/PC se comporta como modal normal.
             - rounded-none sm:rounded-3xl: Cuadrado en móvil, redondo en PC.
          */}
          <div className="bg-white w-full sm:max-w-xl h-[100dvh] sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 relative">

            {!selectedPaper ? (
              <>
                {/* HEAD (FIJO - NO SE MUEVE) */}
                <div className="shrink-0 p-4 sm:p-6 border-b border-gray-100 bg-white z-10 flex justify-between items-start safe-top">
                  <div className="pr-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                            {selectedSession.name}
                        </span>
                        <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <MapPin size={10} /> {selectedSession.rooms?.name}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight mb-1 line-clamp-2">
                      {selectedSession.symposiums?.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                        {selectedSession.presentations?.length || 0} Trabajos presentados
                    </p>
                  </div>
                  {/* Botón Cerrar Grande y Seguro */}
                  <button onClick={() => setSelectedSession(null)} className="p-3 bg-gray-50 border border-gray-200 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 shadow-sm">
                      <X size={24}/>
                  </button>
                </div>

                {/* BODY (SCROLLABLE - ESTE ES EL ÚNICO QUE SE MUEVE) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gray-50/30 relative z-0">
                  {selectedSession.presentations?.map((paper, idx) => (
                    <button
                      key={paper.id || idx}
                      onClick={() => setSelectedPaper(paper)}
                      className="w-full text-left bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-500 transition-all group relative active:scale-[0.99]"
                    >
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-900">{paper.title}</p>      
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 ml-9">
                          <User size={12} className="shrink-0" />
                          <p className="text-[10px] uppercase font-bold tracking-tight truncate max-w-[200px]">{paper.authors}</p>
                        </div>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-200 group-hover:text-orange-500" size={18} />
                    </button>
                  ))}
                  {(!selectedSession.presentations || selectedSession.presentations.length === 0) && (
                      <div className="text-center py-10 text-gray-400 text-sm">No hay ponencias registradas en esta mesa.</div>
                  )}
                </div>

                {/* FOOTER (FIJO) */}
                <div className="shrink-0 p-4 border-t bg-white z-10 safe-bottom">
                    <button onClick={() => setSelectedSession(null)} className="w-full py-3.5 bg-gray-900 text-white text-xs font-black uppercase rounded-xl hover:bg-black transition-colors shadow-lg active:scale-95">Cerrar Ventana</button>
                </div>
              </>
            ) : (
              
              /* VISTA FICHA TÉCNICA */
              <>
                {/* HEAD (FIJO) */}
                <div className="shrink-0 p-4 border-b border-gray-100 bg-orange-50/50 flex items-center gap-4 z-10 safe-top">
                  <button 
                    onClick={() => setSelectedPaper(null)} 
                    className="p-2 bg-white border border-orange-200 rounded-xl text-orange-600 shadow-sm hover:bg-orange-100 transition-colors active:scale-95"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex-1">
                      <h3 className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Ficha Técnica</h3>
                      <p className="text-[10px] text-orange-400 font-bold truncate">Volver a la lista</p>
                  </div>
                  <button onClick={() => setSelectedSession(null)} className="p-2 text-gray-400 hover:text-red-500"><X size={20}/></button>
                </div>

                {/* BODY (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white relative z-0">
                  <h2 className="text-lg sm:text-xl font-black text-[#1e3a5f] leading-tight mb-6 border-l-4 border-orange-500 pl-4 italic">      
                    {selectedPaper.title}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={14} className="text-orange-500"/> Autor(es)</p>
                      <p className="text-sm sm:text-base font-bold text-gray-800 mb-2">{selectedPaper.authors}</p>
                      {selectedPaper.author_affiliation && (
                        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg w-full sm:w-auto">      
                          <MapPin size={12} className="text-gray-400 shrink-0"/>
                          <p className="text-[11px] font-medium text-gray-500 italic truncate">{selectedPaper.author_affiliation}</p>
                        </div>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-3 bg-orange-500 text-white px-4 py-3 rounded-2xl shadow-md w-full sm:w-auto">        
                      <Clock size={20} strokeWidth={2.5} />
                      <div className="leading-none">
                        <p className="text-[9px] font-black uppercase opacity-80 mb-0.5">Horario Estimado</p>
                        <p className="text-sm font-black">{formatTime(selectedPaper.start_time)} - {formatTime(selectedPaper.end_time)}</p>
                      </div>
                    </div>

                    {selectedPaper.abstract_text && (
                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} className="text-orange-500"/> Resumen</p>
                        <div className="text-sm text-gray-600 leading-relaxed text-justify bg-gray-50/50 p-4 rounded-2xl border border-gray-50 h-auto">
                          {selectedPaper.abstract_text}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Espacio extra al final para que no choque con el botón flotante si hubiera */}
                  <div className="h-10"></div>
                </div>

                {/* FOOTER (FIJO) */}
                <div className="shrink-0 p-4 border-t bg-white z-10 safe-bottom">
                  <button 
                    onClick={() => setSelectedPaper(null)} 
                    className="w-full py-3.5 bg-[#1e3a5f] text-white text-xs font-black uppercase rounded-xl shadow-lg hover:bg-blue-900 transition-colors active:scale-95"
                  >
                    Volver a la Mesa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
