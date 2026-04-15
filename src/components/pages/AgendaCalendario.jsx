import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import { Maximize, Minimize, X, MapPin, Clock, Info, Users, BookOpen } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 1. CONFIGURACIÓN DE IDIOMA
const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// 2. PALETA DE 20 COLORES (Para evitar colisiones entre simposios)
const THEME_COLORS = [
  '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', 
  '#06b6d4', '#eab308', '#ef4444', '#14b8a6', '#6366f1', 
  '#f43f5e', '#84cc16', '#0ea5e9', '#d946ef', '#1e3a8a', 
  '#b45309', '#047857', '#7e22ce', '#be123c', '#4338ca'
];
const DEFAULT_COLOR = '#64748b';

// Helper para asignar color único por ID de Simposio
const getColorForSymposium = (sympString) => {
  if (sympString && sympString.startsWith('simposio-')) {
    const sympId = parseInt(sympString.split('-')[1]);
    if (!isNaN(sympId)) return THEME_COLORS[(sympId - 1) % THEME_COLORS.length];
  }
  return DEFAULT_COLOR;
};

export default function AgendaCalendario({ sessions = [], rooms = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); 
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [isFullscreen, setIsFullscreen] = useState(false);  
  const containerRef = useRef(null); 

  // --- LÓGICA DE PANTALLA COMPLETA ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // --- PREPARACIÓN DE DATOS ---
  const resourceMap = useMemo(() => {
    return rooms.map(r => ({
      resourceId: r.id,
      resourceTitle: `${r.name} (${r.venues?.name || 'Sede'})`
    }));
  }, [rooms]);

  const myEvents = useMemo(() => {
    return sessions.map(s => {
      if (!s.date || !s.start_time || !s.end_time) return null;
      const [year, month, day] = s.date.split('-');
      const [startH, startM] = s.start_time.split(':');
      const [endH, endM] = s.end_time.split(':');
      
      return {
        id: s.id,
        title: s.name || 'Evento',
        start: new Date(year, month - 1, day, startH, startM),
        end: new Date(year, month - 1, day, endH, endM),
        resourceId: s.room_id,
        simposio: s.symposium_id ? `simposio-${s.symposium_id}` : 'general',
        presentations: s.presentations || [] 
      };
    }).filter(Boolean);
  }, [sessions]);

  const uniqueSymposiums = useMemo(() => {
    const symps = new Set();
    sessions.forEach(s => { if (s.symposium_id) symps.add(s.symposium_id); });
    return Array.from(symps).sort((a, b) => a - b);
  }, [sessions]);

  // --- COMPONENTES PERSONALIZADOS DEL CALENDARIO ---
  
  // Diseño de la tarjeta (el cuadrito de color)
  const CustomEvent = ({ event }) => (
    <div className="flex flex-col h-full overflow-hidden leading-tight">
      <span className="text-[8px] font-black uppercase opacity-80 tracking-tighter truncate">
        {event.simposio !== 'general' ? event.simposio.replace('-', ' ') : 'General'}
      </span>
      <span className="text-[10px] font-bold mt-0.5 line-clamp-2">
        {event.title}
      </span>
    </div>
  );

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: getColorForSymposium(event.simposio),
      borderRadius: '6px',
      opacity: 0.95,
      color: 'white',
      border: '0px',
      display: 'block',
      cursor: 'pointer' 
    }
  });

  return (
    <div 
      ref={containerRef} 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col relative transition-all ${isFullscreen ? 'p-4 w-screen h-screen overflow-hidden z-[100] bg-gray-50' : 'p-4 md:p-6'}`}
    >
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3 className="text-lg font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2">
           <MapPin size={18} /> Mapa de Aulas
        </h3>
        <button 
          onClick={toggleFullscreen}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#1e3a5f] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
        >
          {isFullscreen ? <><Minimize size={14} /> Salir</> : <><Maximize size={14} /> Pantalla Completa</>}
        </button>
      </div>

      {/* SIMBOLOGÍA */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 p-3 bg-gray-50/80 rounded-xl border border-gray-100 shrink-0">
         <span className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-1 border-r border-gray-200 pr-3">
           <BookOpen size={12}/> Leyenda:
         </span>
         {uniqueSymposiums.map(sympId => (
           <div key={sympId} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColorForSymposium(`simposio-${sympId}`) }}></div>
              <span className="text-[9px] font-bold text-gray-500 uppercase italic">Simp. {sympId}</span>
           </div>
         ))}
      </div>

      {/* CALENDARIO */}
      <div className="flex-1 overflow-x-auto custom-scrollbar bg-white rounded-xl border border-gray-100 shadow-inner">
        <div className={`min-w-[1000px] p-2 ${isFullscreen ? 'h-[calc(100vh-160px)]' : 'h-[700px]'}`}>
          <Calendar
            localizer={localizer}
            events={myEvents}
            defaultView={Views.DAY}
            views={[Views.DAY]}
            step={30}
            timeslots={2}
            defaultDate={currentDate}
            onNavigate={(date) => setCurrentDate(date)} 
            resources={resourceMap}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            min={new Date(2026, 9, 1, 8, 0)} 
            max={new Date(2026, 9, 1, 20, 0)} 
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event)} 
            components={{ event: CustomEvent }}
            culture='es'
            messages={{
              next: "Sig. Día",
              previous: "Día Ant.",
              today: "Hoy",
            }}
          />
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      {selectedEvent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1e3a5f]/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1e3a5f] p-4 flex justify-between items-center text-white shrink-0">
              <h4 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Info size={16} /> Información de Mesa
              </h4>
              <button onClick={() => setSelectedEvent(null)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Actividad</p>
                <p className="text-lg font-black text-gray-800 leading-tight uppercase italic">{selectedEvent.title}</p>
              </div>
              
              <div className="flex gap-4 border-t border-gray-100 pt-4">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={12}/> Horario</p>
                  <p className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 inline-block">
                    {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')} hrs
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={12}/> Ubicación</p>
                  <p className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 inline-block">
                    {(() => {
                      const room = rooms.find(r => r.id === selectedEvent.resourceId);
                      return room ? `${room.name} (${room.venues?.name || 'Sede'})` : 'No asignada';
                    })()}
                  </p>
                </div>
              </div>

              {selectedEvent.presentations && selectedEvent.presentations.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Users size={12}/> Ponencias ({selectedEvent.presentations.length})</p>
                  <div className="space-y-2">
                    {selectedEvent.presentations.map((p, idx) => (
                      <div key={p.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-[#1e3a5f] leading-tight">{idx + 1}. {p.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-black italic">{p.authors}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
               <button onClick={() => setSelectedEvent(null)} className="px-6 py-2.5 bg-[#1e3a5f] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
