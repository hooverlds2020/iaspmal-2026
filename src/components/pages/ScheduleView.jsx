// src/components/pages/ScheduleView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Clock, MapPin, Users, ChevronLeft, ChevronRight, 
  X, FileText, CalendarDays, ArrowLeft, Building2, User
} from 'lucide-react';

const ScheduleView = ({ embedded = false, lang: propLang }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null); 
  const [lang, setLang] = useState(propLang || 'es');
  
  const daysContainerRef = useRef(null);

  // --- CONFIGURACIÓN GRILLA ---
  const START_HOUR = 9; 
  const END_HOUR = 20;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const PIXELS_PER_HOUR = 120; 

  useEffect(() => { if (propLang) setLang(propLang); }, [propLang]);

  useEffect(() => {
    if (daysContainerRef.current) {
      const activeButton = daysContainerRef.current.children[currentDayIndex];
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentDayIndex]);

  const days = [
    { date: '2026-09-28', label_es: 'Lun 28', label_pt: 'Seg 28' },
    { date: '2026-09-29', label_es: 'Mar 29', label_pt: 'Ter 29' },
    { date: '2026-09-30', label_es: 'Mié 30', label_pt: 'Qua 30' },
    { date: '2026-10-01', label_es: 'Jue 01', label_pt: 'Qui 01' },
    { date: '2026-10-02', label_es: 'Vie 02', label_pt: 'Sex 02' }
  ];

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('sessions').select(`*, rooms(id, name, venues(name)), symposiums(id, name), presentations(id, title, authors, author_affiliation, abstract_text, pdf_url, start_time, end_time)`).order('start_time', { ascending: true });
      if (error) throw error;
      setSessions(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const currentDay = days[currentDayIndex];
  const daySessions = sessions.filter(s => s.date === currentDay.date);

  // --- UTILS GRILLA ---
  const activeRoomIds = [...new Set(daySessions.map(s => s.room_id))];
  const activeRooms = activeRoomIds
    .map(id => {
        const session = daySessions.find(s => s.room_id === id);
        return session.rooms;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const getGridPosition = (start, end) => {
    if (!start || !end) return { top: 0, height: 0 };
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    const effectiveStartH = Math.max(startH, START_HOUR); 
    const startMinutes = (effectiveStartH - START_HOUR) * 60 + startM;
    const durationMinutes = ((endH * 60 + endM) - (startH * 60 + startM));
    
    return {
      top: `${(startMinutes / 60) * PIXELS_PER_HOUR}px`,
      height: `${(durationMinutes / 60) * PIXELS_PER_HOUR}px`
    };
  };

  const getSessionStyle = (id) => {
    const styles = [
      'bg-purple-50 border-l-4 border-purple-600 text-purple-900',
      'bg-blue-50 border-l-4 border-blue-600 text-blue-900',
      'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900',
      'bg-amber-50 border-l-4 border-amber-600 text-amber-900',
      'bg-rose-50 border-l-4 border-rose-600 text-rose-900',
      'bg-cyan-50 border-l-4 border-cyan-600 text-cyan-900',
    ];
    return styles[id % styles.length];
  };

  return (
    <div className="space-y-0 animate-in fade-in duration-500 pb-20">
      
      {/* 1. NAVEGACIÓN DÍAS (Sticky Top 0) */}
      {/* Ajuste: py-3 para dar un poco de aire arriba pero mantenerlo compacto */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 py-3 shadow-sm">
        <div className="flex items-center gap-2 px-2 md:px-0 max-w-[100vw] overflow-hidden">
            <button onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))} disabled={currentDayIndex === 0} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-20 text-[#1e3a5f]"><ChevronLeft size={24} /></button>
            
            <div ref={daysContainerRef} className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar items-center scroll-smooth">
            {days.map((day, index) => (
                <button 
                key={day.date} 
                onClick={() => setCurrentDayIndex(index)} 
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 border ${index === currentDayIndex ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'}`}
                >
                {lang === 'es' ? day.label_es : day.label_pt}
                </button>
            ))}
            </div>

            <button onClick={() => setCurrentDayIndex(Math.min(days.length - 1, currentDayIndex + 1))} disabled={currentDayIndex === days.length - 1} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-20 text-[#1e3a5f]"><ChevronRight size={24} /></button>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1e3a5f]"></div></div>
      ) : daySessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 text-center mx-4 mt-8">
            <div className="bg-white p-5 rounded-full shadow-sm mb-4"><CalendarDays size={48} className="text-[#f4a261]" /></div>
            <h4 className="text-[#1e3a5f] font-bold text-xl mb-1">Día sin actividades</h4>
            <p className="text-gray-400 font-medium italic">No hay sesiones programadas.</p>
        </div>
      ) : (
        /* VISTA DE GRILLA UNIFICADA */
        <div className="relative bg-white">
            
            {/* Contenedor Scrollable */}
            <div className="overflow-x-auto custom-scrollbar touch-pan-x">
                <div className="min-w-[800px] relative"> 
                    
                    {/* 2. HEADER DE SALAS (Sticky Nivel 2) */}
                    {/* Ajuste: 'top-[68px]' (Altura aprox del nav de días). 
                        Eliminé 'rounded' y 'shadow' para que se vea plano y conectado a la grilla */}
                    <div className="flex sticky top-[68px] z-40 bg-gray-50 border-b border-gray-300">
                        <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-gray-50"></div> {/* Espacio Hora */}
                        {activeRooms.map(room => (
                            <div key={room.id} className="flex-1 min-w-[180px] p-2 text-center border-r border-gray-200 last:border-r-0 flex flex-col justify-center h-14">
                                <span className="block text-[8px] font-black uppercase text-gray-400 tracking-widest mb-0.5 truncate">{room.venues?.name}</span>
                                <h4 className="font-bold text-[#1e3a5f] text-xs leading-tight uppercase line-clamp-2">{room.name}</h4>
                            </div>
                        ))}
                    </div>

                    {/* CUERPO DE LA GRILLA */}
                    {/* Ajuste: Agregué 'pt-4' aquí para dar espacio a la hora 9:00 AM */}
                    <div className="flex relative pt-4" style={{ height: `${(TOTAL_HOURS * PIXELS_PER_HOUR) + 40}px` }}>
                        
                        {/* Columna Horas (Sticky Left) */}
                        <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-white sticky left-0 z-30 text-center pt-2">
                            {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                                <div key={i} className="absolute w-full text-[10px] font-bold text-gray-400 -mt-2 bg-white px-1" style={{ top: `${(i * PIXELS_PER_HOUR) + 16}px` }}> {/* +16px para alinear con el pt-4 del padre */}
                                    {START_HOUR + i}:00
                                </div>
                            ))}
                        </div>

                        {/* Líneas Horizontales */}
                        <div className="absolute inset-0 z-0 pointer-events-none pl-14 pt-4">
                            {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                                <div key={i} className="border-b border-dashed border-gray-100 w-full absolute" style={{ top: `${i * PIXELS_PER_HOUR}px` }}></div>
                            ))}
                        </div>

                        {/* Columnas de Salas */}
                        {activeRooms.map(room => (
                            <div key={room.id} className="flex-1 min-w-[180px] border-r border-gray-200 relative pt-4 hover:bg-gray-50/30 transition-colors">
                                {daySessions.filter(s => s.room_id === room.id).map(session => {
                                    const pos = getGridPosition(session.start_time, session.end_time);
                                    const styleClass = getSessionStyle(session.symposium_id || 0);
                                    
                                    return (
                                        <div 
                                            key={session.id}
                                            onClick={() => setSelectedSession(session)}
                                            // Se agregó '+ 16px' al top para respetar el padding inicial
                                            className={`absolute inset-x-1 rounded shadow-sm cursor-pointer transition-all hover:z-20 hover:scale-[1.02] hover:shadow-md overflow-hidden flex flex-col justify-between p-2 ${styleClass}`}
                                            style={{ top: `calc(${pos.top} + 16px)`, height: pos.height }}
                                        >
                                            <div>
                                                {/* Header Evento */}
                                                <div className="flex justify-between items-start mb-1 opacity-80 border-b border-black/5 pb-1">
                                                    <span className="text-[9px] font-black uppercase tracking-wider line-clamp-1">{session.symposiums?.name ? "Simposio" : "Mesa"}</span>
                                                    <div className="flex items-center gap-1 bg-white/40 px-1 rounded text-[9px] font-bold whitespace-nowrap">
                                                        <Clock size={8} /> {session.start_time?.substring(0,5)}
                                                    </div>
                                                </div>

                                                {/* Título Simposio */}
                                                <h5 className="font-extrabold text-[10px] leading-tight uppercase mb-1 line-clamp-3 opacity-90">
                                                    {session.symposiums?.name || "Actividad General"}
                                                </h5>

                                                {/* Título Mesa */}
                                                <p className="text-[10px] font-medium leading-tight line-clamp-2">
                                                    {session.name}
                                                </p>
                                            </div>
                                            
                                            {/* Footer Evento */}
                                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/5">
                                                <div className="flex -space-x-1">
                                                    {session.presentations?.slice(0,3).map((_,i) => (
                                                        <div key={i} className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center shadow-sm ring-1 ring-white/50">
                                                            <User size={8} className="opacity-70"/>
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[8px] font-bold bg-white/40 px-1.5 rounded-full">
                                                    {session.presentations?.length || 0} Ponencias
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL DETALLE (Sin Cambios, ya funcionaba bien) */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-6" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[85vh] md:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b bg-[#1e3a5f] text-white flex items-center gap-4 flex-shrink-0">
              {selectedPresentation && <button onClick={() => setSelectedPresentation(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><ArrowLeft size={20} /></button>}
              <div className="flex-1 overflow-hidden">
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg block w-fit mb-1">{selectedPresentation ? "Detalle Ponencia" : (selectedSession.symposiums?.name ? "Simposio" : "Sesión")}</span>
                <h2 className="text-base md:text-lg font-bold truncate leading-tight">{selectedPresentation ? selectedPresentation.title : selectedSession.name}</h2>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 bg-gray-50/50">
              {!selectedPresentation ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1e3a5f]"><Clock size={20} /></div>
                      <div><p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Horario</p><p className="font-bold text-sm text-[#1e3a5f]">{selectedSession.start_time?.substring(0,5)} - {selectedSession.end_time?.substring(0,5)}</p></div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-[#f4a261]"><MapPin size={20} /></div>
                      <div><p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">{selectedSession.rooms?.venues?.name}</p><p className="font-bold text-sm text-[#1e3a5f]">{selectedSession.rooms?.name}</p></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-black text-gray-400 text-[10px] uppercase tracking-widest ml-1"><FileText size={14} className="text-[#f4a261]" /> Ponencias Asignadas</h4>
                    {selectedSession.presentations?.sort((a,b) => (a.start_time > b.start_time ? 1 : -1)).map(p => (
                      <div key={p.id} onClick={() => setSelectedPresentation(p)} className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#f4a261] hover:shadow-md transition-all cursor-pointer flex justify-between items-center group">
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{p.start_time.substring(0,5)} - {p.end_time?.substring(0,5)}</span>
                          </div>
                          <h5 className="font-bold text-gray-800 text-xs leading-snug mb-1 group-hover:text-[#1e3a5f]">{p.title}</h5>
                          <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><Users size={10}/> {p.authors}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                            <ChevronRight size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-200">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Autor(es)</p>
                        <div className="flex items-start gap-3">
                            <div className="mt-1"><Users size={20} className="text-[#f4a261]" /></div>
                            <h4 className="text-lg font-black text-[#1e3a5f] leading-tight">{selectedPresentation.authors}</h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                        <p className="text-xs font-bold italic">{selectedPresentation.author_affiliation || 'Sin filiación registrada'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1"><FileText size={14} className="text-[#1e3a5f]" /> Resumen</h5>
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 text-sm text-gray-600 leading-relaxed text-justify">
                      {selectedPresentation.abstract_text || 'No hay resumen disponible.'}
                    </div>
                  </div>
                  {selectedPresentation.pdf_url && (
                      <a href={selectedPresentation.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-[#1e3a5f] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg">
                          <FileText size={18} /> Descargar PDF Completo
                      </a>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex justify-center flex-shrink-0">
                <button onClick={() => {if(selectedPresentation)setSelectedPresentation(null);else setSelectedSession(null);}} className="w-full md:w-auto px-10 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors uppercase text-xs tracking-widest">
                    {selectedPresentation ? "Volver a la Mesa" : "Cerrar Ventana"}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos Scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default ScheduleView;
