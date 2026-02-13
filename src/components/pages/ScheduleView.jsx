// src/components/pages/ScheduleView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Clock, MapPin, Users, ChevronLeft, ChevronRight, X, FileText, CalendarDays, ArrowLeft, Building2 } from 'lucide-react';

const ScheduleView = ({ embedded = false, lang: propLang }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null); 
  const [lang, setLang] = useState(propLang || 'es');
  const daysContainerRef = useRef(null);

  const START_HOUR = 9; const END_HOUR = 20; const TOTAL_HOURS = END_HOUR - START_HOUR; const PIXELS_PER_HOUR = 120; 

  useEffect(() => { if (propLang) setLang(propLang); }, [propLang]);
  useEffect(() => { daysContainerRef.current?.children[currentDayIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }, [currentDayIndex]);

  const days = [
    { date: '2026-09-28', label_es: 'Lun 28', label_pt: 'Seg 28' },
    { date: '2026-09-29', label_es: 'Mar 29', label_pt: 'Ter 29' },
    { date: '2026-09-30', label_es: 'Mié 30', label_pt: 'Qua 30' },
    { date: '2026-10-01', label_es: 'Jue 01', label_pt: 'Qui 01' },
    { date: '2026-10-02', label_es: 'Vie 02', label_pt: 'Sex 02' }
  ];

  useEffect(() => {
    setLoading(true);
    supabase.from('sessions').select(`*, rooms(id, name, venues(name)), symposiums(id, name), presentations(*)`).order('start_time')
      .then(({data}) => { setSessions(data || []); setLoading(false); });
  }, []);

  const currentDay = days[currentDayIndex];
  const daySessions = sessions.filter(s => s.date === currentDay.date);
  const activeRoomIds = [...new Set(daySessions.map(s => s.room_id))];
  const activeRooms = activeRoomIds.map(id => daySessions.find(s => s.room_id === id).rooms).sort((a,b) => a.name.localeCompare(b.name));

  const getGridPosition = (start, end) => {
    if (!start || !end) return { top: 0, height: 0 };
    const [sH, sM] = start.split(':').map(Number); const [eH, eM] = end.split(':').map(Number);
    const startMin = (Math.max(sH, START_HOUR) - START_HOUR) * 60 + sM;
    const durMin = ((eH * 60 + eM) - (sH * 60 + sM));
    return { top: `${(startMin / 60) * PIXELS_PER_HOUR}px`, height: `${(durMin / 60) * PIXELS_PER_HOUR}px` };
  };

  const getSessionStyle = (id) => {
    const styles = ['bg-purple-50 border-purple-600 text-purple-900', 'bg-blue-50 border-blue-600 text-blue-900', 'bg-emerald-50 border-emerald-600 text-emerald-900', 'bg-amber-50 border-amber-600 text-amber-900'];
    return `border-l-4 ${styles[id % styles.length]}`;
  };

  return (
    <div className="bg-white">
      {/* 1. NAV DÍAS: Sticky justo debajo del header principal (aprox 50px) */}
      <div className="bg-white border-b border-gray-200 sticky top-[50px] z-40 py-1 shadow-sm">
        <div className="flex items-center gap-1 px-1">
            <button onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))} disabled={currentDayIndex === 0} className="p-2 text-[#1e3a5f] disabled:opacity-20"><ChevronLeft size={20}/></button>
            <div ref={daysContainerRef} className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar items-center scroll-smooth">
              {days.map((day, i) => (
                <button key={day.date} onClick={() => setCurrentDayIndex(i)} className={`px-3 py-1.5 rounded-md font-bold text-xs whitespace-nowrap border ${i === currentDayIndex ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{lang === 'es' ? day.label_es : day.label_pt}</button>
              ))}
            </div>
            <button onClick={() => setCurrentDayIndex(Math.min(days.length - 1, currentDayIndex + 1))} disabled={currentDayIndex === days.length - 1} className="p-2 text-[#1e3a5f] disabled:opacity-20"><ChevronRight size={20}/></button>
        </div>
      </div>

      {loading ? <div className="py-40 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div></div> : 
       daySessions.length === 0 ? <div className="py-20 text-center text-gray-400 text-sm">Sin actividad.</div> : (
        
        <div className="relative">
            <div className="overflow-x-auto custom-scrollbar touch-pan-x">
                <div className="min-w-[800px] relative"> 
                    
                    {/* 2. HEADER SALAS: Sticky debajo de Nav Días (aprox 90px total) */}
                    <div className="flex sticky top-[92px] z-30 bg-gray-50 border-b border-gray-300">
                        <div className="w-10 flex-shrink-0 border-r border-gray-200 bg-white"></div>
                        {activeRooms.map(r => (
                            <div key={r.id} className="flex-1 min-w-[160px] p-1 text-center border-r border-gray-200 flex flex-col justify-center h-10">
                                <span className="block text-[7px] font-black uppercase text-gray-400 truncate">{r.venues?.name}</span>
                                <h4 className="font-bold text-[#1e3a5f] text-[10px] leading-tight uppercase truncate">{r.name}</h4>
                            </div>
                        ))}
                    </div>

                    {/* CUERPO GRILLA: pt-8 asegura que 9:00 AM no quede tapada */}
                    <div className="flex relative pt-8" style={{ height: `${(TOTAL_HOURS * PIXELS_PER_HOUR) + 50}px` }}>
                        <div className="w-10 flex-shrink-0 border-r border-gray-200 bg-white sticky left-0 z-20 text-center">
                            {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                                <div key={i} className="absolute w-full text-[9px] font-bold text-gray-400 -mt-1.5 bg-white" style={{ top: `${(i * PIXELS_PER_HOUR) + 32}px` }}>{START_HOUR + i}:00</div>
                            ))}
                        </div>
                        <div className="absolute inset-0 z-0 pointer-events-none pl-10 pt-8">
                            {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                                <div key={i} className="border-b border-dashed border-gray-100 w-full absolute" style={{ top: `${i * PIXELS_PER_HOUR}px` }}></div>
                            ))}
                        </div>
                        {activeRooms.map(room => (
                            <div key={room.id} className="flex-1 min-w-[160px] border-r border-gray-200 relative pt-8">
                                {daySessions.filter(s => s.room_id === room.id).map(s => {
                                    const pos = getGridPosition(s.start_time, s.end_time);
                                    return (
                                        <div key={s.id} onClick={() => setSelectedSession(s)} className={`absolute inset-x-0.5 rounded-sm shadow-sm cursor-pointer hover:brightness-95 flex flex-col justify-between p-1.5 overflow-hidden ${getSessionStyle(s.symposium_id || 0)}`} style={{ top: `calc(${pos.top} + 32px)`, height: pos.height }}>
                                            <div>
                                                <div className="flex justify-between items-start mb-0.5 opacity-80 border-b border-black/5 pb-0.5"><span className="text-[7px] font-black uppercase tracking-wider truncate">{s.symposiums?.name ? "Simposio" : "Mesa"}</span><div className="bg-white/40 px-1 rounded text-[7px] font-bold">{s.start_time?.substring(0,5)}</div></div>
                                                <h5 className="font-extrabold text-[9px] leading-tight uppercase mb-0.5 line-clamp-2 opacity-90">{s.symposiums?.name || "General"}</h5>
                                                <p className="text-[8px] font-medium leading-tight line-clamp-2">{s.name}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5 pt-0.5 border-t border-black/5"><span className="text-[7px] font-bold bg-white/40 px-1 rounded-full">{s.presentations?.length || 0} P</span></div>
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

      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
            <div className="p-4 border-b bg-[#1e3a5f] text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                 {selectedPresentation && <button onClick={()=>setSelectedPresentation(null)}><ArrowLeft/></button>}
                 <h2 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md">{selectedPresentation ? selectedPresentation.title : selectedSession.name}</h2>
               </div>
               <button onClick={()=>setSelectedSession(null)}><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
               {!selectedPresentation ? (
                 selectedSession.presentations?.map(p => (
                   <div key={p.id} onClick={()=>setSelectedPresentation(p)} className="p-3 bg-white border rounded-xl hover:border-[#1e3a5f] cursor-pointer">
                     <h5 className="font-bold text-xs text-[#1e3a5f]">{p.title}</h5>
                     <p className="text-[10px] text-gray-500">{p.authors}</p>
                   </div>
                 ))
               ) : (
                 <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border"><h4 className="font-bold text-[#1e3a5f] text-sm">{selectedPresentation.authors}</h4><p className="text-xs italic">{selectedPresentation.author_affiliation}</p></div>
                    <div className="bg-white p-4 rounded-xl border text-xs leading-relaxed text-justify">{selectedPresentation.abstract_text}</div>
                    {selectedPresentation.pdf_url && <a href={selectedPresentation.pdf_url} target="_blank" className="block w-full py-3 bg-[#1e3a5f] text-white text-center rounded-xl font-bold text-xs">Descargar PDF</a>}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { height: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; } .hide-scrollbar::-webkit-scrollbar { display: none; }`}} />
    </div>
  );
};

export default ScheduleView;
