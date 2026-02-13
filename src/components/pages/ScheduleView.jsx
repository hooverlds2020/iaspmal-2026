import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, Clock, MapPin, Users, X, FileText, ChevronRight, ArrowLeft, User, Timer } from 'lucide-react';

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
            id, 
            title, 
            authors, 
            abstract_text, 
            start_time, 
            end_time, 
            duration_minutes
          ) 
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSessions(data);
        const dates = [...new Set(data.map(s => s.date))];
        setUniqueDates(dates);
        if (dates.length > 0) setSelectedDate(dates[0]);
        // Enviar datos al componente padre para el PDF
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
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const closeModals = () => {
    setSelectedSession(null);
    setSelectedPaper(null);
  };

  const filteredSessions = sessions.filter(s => s.date === selectedDate);
  const sessionsByTime = filteredSessions.reduce((acc, session) => {
    const timeKey = session.start_time;
    if (!acc[timeKey]) acc[timeKey] = [];
    acc[timeKey].push(session);
    return acc;
  }, {});
  const sortedTimeKeys = Object.keys(sessionsByTime).sort();

  if (loading) return <div className="p-8 text-center text-xs text-gray-400 italic">Cargando agenda...</div>;

  return (
    <div className="relative min-h-[60vh]">
      
      {/* 1. MENÚ DE DÍAS (STICKY) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 py-2 -mx-2 sm:-mx-6 px-2 sm:px-6 mb-2 overflow-x-auto hide-scrollbar flex gap-2 shadow-sm">
        {uniqueDates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black transition-all border ${selectedDate === date ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md transform scale-105' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      {/* 2. LISTA DE TARJETAS */}
      <div className="space-y-6 pb-12">
        {sortedTimeKeys.map((timeKey) => (
          <div key={timeKey}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                {formatTime(timeKey)} HRS
              </div>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessionsByTime[timeKey].map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => setSelectedSession(session)}
                  className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-2 group hover:border-blue-300"
                >
                  <div className="flex justify-between items-start">
                    <span className="bg-blue-50 text-[#1e3a5f] text-[9px] font-bold px-2 py-0.5 rounded border border-blue-100 uppercase truncate max-w-[75%]">
                      {session.rooms?.name || 'Sala TBD'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">
                      Fin: {formatTime(session.end_time)}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#1e3a5f]">
                    {session.symposiums?.name || session.name}
                  </h4>

                  <div className="flex items-center justify-between mt-auto border-t border-gray-50 pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 group-hover:text-blue-600">
                      <FileText size={10} />
                      {session.presentations?.length || 0} Ponencias
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. MODAL DE DETALLES */}
      {selectedSession && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            
            {!selectedPaper ? (
              <>
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start shrink-0">
                  <div className="pr-6">
                    <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1.5 inline-block">Mesa / Sesión</span>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{selectedSession.symposiums?.name || selectedSession.name}</h3>
                    {selectedSession.symposiums?.coordinators && <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed font-medium">Coord: {selectedSession.symposiums.coordinators}</p>}
                  </div>
                  <button onClick={() => setSelectedSession(null)} className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 transition-colors"><X size={16}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                  <div className="space-y-3">
                    {selectedSession.presentations?.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).map((paper) => (
                      <button 
                        key={paper.id} 
                        onClick={() => setSelectedPaper(paper)} 
                        className="w-full text-left bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-orange-300 transition-all group relative"
                      >
                         {/* ETIQUETA NARANJA DE TIEMPO */}
                         {paper.start_time && (
                           <div className="inline-flex items-center gap-1.5 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-md mb-2 shadow-sm">
                             <Clock size={12} strokeWidth={3} />
                             {formatTime(paper.start_time)} - {formatTime(paper.end_time)}
                           </div>
                         )}

                         <p className="font-bold text-gray-800 text-xs mb-2 leading-tight">{paper.title}</p>
                         <div className="flex items-center gap-1.5 text-gray-500">
                            <User size={10} />
                            <p className="text-[10px] uppercase truncate font-bold tracking-tight">{paper.authors}</p>
                         </div>
                         <div className="absolute right-3 bottom-4 text-gray-300 group-hover:text-orange-500"><ChevronRight size={16} /></div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 border-t bg-white shrink-0"><button onClick={() => setSelectedSession(null)} className="w-full py-3 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl">Cerrar</button></div>
              </>
            ) : (
              /* FICHA TÉCNICA */
              <>
                <div className="p-4 border-b border-gray-100 bg-orange-50 flex items-center gap-3 shrink-0">
                  <button onClick={() => setSelectedPaper(null)} className="p-1.5 bg-white border border-orange-200 rounded-lg text-orange-600 shadow-sm"><ArrowLeft size={16} /></button>
                  <h3 className="text-xs font-black text-orange-700 uppercase tracking-wider">Ficha Técnica</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <h2 className="text-lg font-bold text-[#1e3a5f] leading-tight mb-6">{selectedPaper.title}</h2>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="bg-orange-500 text-white px-3 py-2 rounded-xl flex items-center gap-2 shadow-md">
                      <Clock size={16} strokeWidth={3} />
                      <div className="leading-none">
                        <p className="text-[8px] font-black uppercase opacity-80">Horario</p>
                        <p className="text-xs font-black">{formatTime(selectedPaper.start_time)} - {formatTime(selectedPaper.end_time)}</p>
                      </div>
                    </div>
                    {selectedPaper.duration_minutes && (
                      <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl flex items-center gap-2">
                        <Timer size={16} />
                        <div className="leading-none">
                          <p className="text-[8px] font-black uppercase opacity-60">Duración</p>
                          <p className="text-xs font-black">{selectedPaper.duration_minutes} min</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={14}/> Autor(es)</p>
                    <p className="text-sm font-bold text-gray-800 leading-snug">{selectedPaper.authors}</p>
                  </div>

                  {selectedPaper.abstract_text && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> Resumen</p>
                      <p className="text-sm text-gray-600 leading-relaxed text-justify">{selectedPaper.abstract_text}</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t bg-white shrink-0"><button onClick={() => setSelectedPaper(null)} className="w-full py-3 bg-[#1e3a5f] text-white text-xs font-bold rounded-xl shadow-lg">Volver a la lista</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
