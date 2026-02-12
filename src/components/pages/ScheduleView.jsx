// src/components/pages/ScheduleView.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Clock, MapPin, Users, ChevronLeft, ChevronRight, 
  X, FileText, CalendarDays 
} from 'lucide-react';

const ScheduleView = ({ embedded = false, lang: propLang }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);
  const [lang, setLang] = useState(propLang || 'es');

  useEffect(() => { if (propLang) setLang(propLang); }, [propLang]);

  const days = [
    { date: '2026-09-28', label_es: 'Lun. 28', label_pt: 'Seg. 28', fullLabel_es: 'lunes, 28 de septiembre' },
    { date: '2026-09-29', label_es: 'Mar. 29', label_pt: 'Ter. 29', fullLabel_es: 'martes, 29 de septiembre' },
    { date: '2026-09-30', label_es: 'Mié. 30', label_pt: 'Qua. 30', fullLabel_es: 'miércoles, 30 de septiembre' },
    { date: '2026-10-01', label_es: 'Jue. 01', label_pt: 'Qui. 01', fullLabel_es: 'jueves, 1 de octubre' },
    { date: '2026-10-02', label_es: 'Vie. 02', label_pt: 'Sex. 02', fullLabel_es: 'viernes, 2 de octubre' }
  ];

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          symposiums ( id, name ),
          rooms ( id, name, venues ( name ) ),
          presentations ( id, title, authors )
        `)
        .order('start_time', { ascending: true });
      if (error) throw error;
      setSessions(data || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const currentDay = days[currentDayIndex];
  const daySessions = sessions.filter(s => s.date === currentDay.date);
  const sessionsByTime = {};
  daySessions.forEach(s => {
    const key = s.start_time?.substring(0, 5) || '00:00';
    if (!sessionsByTime[key]) sessionsByTime[key] = [];
    sessionsByTime[key].push(s);
  });
  const timeSlots = Object.keys(sessionsByTime).sort();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-1">
      
      {/* --- NAVEGACIÓN XVII CONGRESO (HORIZONTAL PURA) --- */}
      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm print:hidden overflow-hidden">
        <button 
          onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
          disabled={currentDayIndex === 0}
          className="p-3 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-20 text-[#1e3a5f] flex-shrink-0"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar justify-center items-center py-1">
          {days.map((day, index) => (
            <button
              key={day.date}
              onClick={() => setCurrentDayIndex(index)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                index === currentDayIndex 
                ? 'bg-[#1e3a5f] text-white shadow-md scale-105' 
                : 'text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50'
              }`}
            >
              {lang === 'es' ? day.label_es : day.label_pt}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setCurrentDayIndex(Math.min(days.length - 1, currentDayIndex + 1))}
          disabled={currentDayIndex === days.length - 1}
          className="p-3 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-20 text-[#1e3a5f] flex-shrink-0"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* --- TÍTULO DE FECHA --- */}
      <div className="border-l-4 border-[#1e3a5f] pl-4">
        <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">
          {currentDay.fullLabel_es}
        </h3>
      </div>

      {/* --- CONTENIDO DINÁMICO --- */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center py-20 text-[#1e3a5f]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
          </div>
        ) : timeSlots.length === 0 ? (
          /* ESTADO VACÍO PROFESIONAL */
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 animate-in zoom-in-95 duration-500 text-center px-4">
            <div className="bg-white p-5 rounded-full shadow-sm mb-4">
              <CalendarDays size={48} className="text-[#f4a261]" />
            </div>
            <h4 className="text-[#1e3a5f] font-bold text-xl mb-1">
              Aún no hay registro de actividades
            </h4>
            <p className="text-gray-400 font-medium italic">
              Próximamente estaremos publicando la agenda detallada.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {timeSlots.map(time => (
              <div key={time} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 font-black text-[#1e3a5f] bg-blue-50 px-4 py-1.5 rounded-full text-sm">
                    <Clock size={16} className="text-[#f4a261]"/> {time}
                  </span>
                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sessionsByTime[time].map(session => (
                    <div 
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-[#f4a261]/30 transition-all cursor-pointer relative overflow-hidden active:scale-95"
                    >
                      {/* BARRA LATERAL CON COLORES DEL LOGO */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#1e3a5f] to-[#f4a261]"></div>
                      
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] bg-blue-50/50 px-2 py-1 rounded-lg mb-3 inline-block">
                        {session.rooms?.venues?.name || 'SEDE'}
                      </span>
                      
                      <h4 className="font-bold text-gray-900 group-hover:text-[#1e3a5f] leading-tight mb-4 text-base line-clamp-2">
                        {session.name}
                      </h4>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                          <MapPin size={14} className="text-[#f4a261]" />
                          {session.rooms?.name}
                        </div>
                        {session.presentations?.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] bg-orange-50 text-[#f4a261] px-2 py-1 rounded-lg font-black">
                            <FileText size={12} /> {session.presentations.length}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE DETALLES */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b bg-[#1e3a5f] text-white flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">
                  {selectedSession.rooms?.venues?.name}
                </span>
                <h2 className="text-xl font-bold mt-2 leading-tight">{selectedSession.name}</h2>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <Clock className="text-[#1e3a5f]" size={24} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Horario</p>
                    <p className="font-bold text-sm">{selectedSession.start_time?.substring(0,5)} - {selectedSession.end_time?.substring(0,5)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <MapPin className="text-[#f4a261]" size={24} />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Lugar</p>
                    <p className="font-bold text-sm">{selectedSession.rooms?.name}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-black text-gray-400 text-[10px] uppercase tracking-widest mb-4">
                  <FileText size={16} className="text-[#f4a261]" /> Ponencias Vinculadas
                </h4>
                <div className="space-y-4">
                  {selectedSession.presentations?.length > 0 ? (
                    selectedSession.presentations.map(p => (
                      <div key={p.id} className="p-5 bg-orange-50/30 border border-orange-100 rounded-3xl">
                        <h5 className="font-bold text-gray-800 text-sm leading-snug mb-2">{p.title}</h5>
                        <p className="text-xs text-[#1e3a5f] font-bold flex items-center gap-2 uppercase tracking-tighter">
                          <Users size={14} /> {p.authors}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No hay trabajos registrados para esta sesión.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-center">
              <button onClick={() => setSelectedSession(null)} className="w-full sm:w-auto px-12 py-4 bg-[#1e3a5f] text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-lg">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS DE LIMPIEZA FINAL */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
          overflow-y: hidden !important; 
        }
      `}} />
    </div>
  );
};

export default ScheduleView;
