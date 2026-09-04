// src/components/pages/Program.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Users, ChevronDown, Download, Calendar, List, MapPin, Clock, X, FileText, User, ChevronRight, ArrowLeft, LayoutList } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// FECHAS DEL CONGRESO
const CONGRESS_DATES = [
  { label: 'LUN 28', value: '2026-09-28' },
  { label: 'MAR 29', value: '2026-09-29' },
  { label: 'MIÉ 30', value: '2026-09-30' },
  { label: 'JUE 01', value: '2026-10-01' },
  { label: 'VIE 02', value: '2026-10-02' },
];

const Program = () => {
  const [activeTab, setActiveTab] = useState('simposios');
  const [selectedDate, setSelectedDate] = useState('2026-09-28');

  // Datos
  const [simposios, setSimposios] = useState([]);
  const [filteredSimposios, setFilteredSimposios] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);

  // Estados de Vista
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [agendaSearchTerm, setAgendaSearchTerm] = useState('');
  const [openId, setOpenId] = useState(null);

  // Reloj en tiempo real para la función "En Vivo"
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Esquema General deshabilitado temporalmente: si el estado quedara en 'esquema', regresa a Simposios
    if (activeTab === 'esquema') setActiveTab('simposios');
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    fetchScheduleData();
    fetchEventTypes();
    
    // Actualizamos el reloj interno cada 60 segundos
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSession, selectedPaper, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('symposiums')
        .select(`*, venues (name), presentations (id, title, authors, author_affiliation, abstract_text, start_time, end_time)`);      
      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => a.id - b.id);
      const finalData = sortedData.map(symp => ({
        ...symp,
        presentations: (symp.presentations || []).sort((a, b) => 
          (a.authors || "").localeCompare(b.authors || "", 'es', { sensitivity: 'base' })
        )
      }));

      setSimposios(finalData);
      setFilteredSimposios(finalData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchScheduleData = async () => {
      const { data } = await supabase
        .from('sessions')
        .select(`*, date, start_time, end_time, rooms(name, venues(name)), symposiums(id, name), presentations(*)`)
        .order('start_time');
      setScheduleData(data || []);
  };

  const fetchEventTypes = async () => {
      const { data } = await supabase.from('event_types').select('*');
      setEventTypes(data || []);
  };

  const getEventStyle = (typeId) => {
    const fallback = { id: 'mesa', label: 'Mesa de Simposio', icon_name: 'Users', color_text: 'text-blue-500', color_bg: 'bg-blue-50', color_border: 'border-blue-200' };
    const evt = eventTypes.find(e => e.id === typeId) || fallback;
    const IconComponent = LucideIcons[evt.icon_name] || LucideIcons.Calendar;
    return { ...evt, IconComponent };
  };

  // --- ESQUEMA GENERAL: agrupa TODAS las sesiones (cualquier event_type) en una
  // matriz día x franja horaria, calculada dinámicamente a partir de los datos reales.
  // No hay franjas fijas: si se captura un evento en un horario nuevo, aparece solo.
  const scheduleMatrix = React.useMemo(() => {
    if (!scheduleData.length) return { bands: [], cellsByDayBand: {} };

    // 1. Bandas = todos los pares únicos (start_time, end_time) ordenados
    const bandSet = new Map();
    scheduleData.forEach(ev => {
      if (!ev.start_time || !ev.end_time) return;
      const key = `${ev.start_time}-${ev.end_time}`;
      if (!bandSet.has(key)) bandSet.set(key, { start: ev.start_time, end: ev.end_time });
    });

    // 2. Fusiona bandas que se solapan fuertemente (mismo bloque de trabajo) para no duplicar filas casi iguales
    const rawBands = Array.from(bandSet.values()).sort((a, b) => a.start.localeCompare(b.start));
    const bands = [];
    rawBands.forEach(b => {
      const last = bands[bands.length - 1];
      if (last && b.start < last.end && b.start >= last.start) {
        // se solapa con la banda anterior: extiende el fin si hace falta
        if (b.end > last.end) last.end = b.end;
      } else {
        bands.push({ ...b });
      }
    });

    // 3. Coloca cada sesión en su día + banda correspondiente
    const cellsByDayBand = {};
    scheduleData.forEach(ev => {
      if (!ev.date || !ev.start_time) return;
      const band = bands.find(b => ev.start_time >= b.start && ev.start_time < b.end) || bands.find(b => ev.start_time === b.start);
      if (!band) return;
      const key = `${ev.date}__${band.start}-${band.end}`;
      if (!cellsByDayBand[key]) cellsByDayBand[key] = [];
      cellsByDayBand[key].push(ev);
    });

    return { bands, cellsByDayBand };
  }, [scheduleData]);

  const renderCellContent = (day, band) => {
    const key = `${day.value}__${band.start}-${band.end}`;
    const events = scheduleMatrix.cellsByDayBand[key] || [];
    if (events.length === 0) return null;

    // Agrupa mesas de simposio en una sola línea "Mesas de simposios 1, 4, 9"
    const mesas = events.filter(e => (e.event_type || 'mesa') === 'mesa');
    const otros = events.filter(e => (e.event_type || 'mesa') !== 'mesa');
    const sympIds = [...new Set(mesas.map(m => m.symposiums?.id).filter(Boolean))].sort((a, b) => a - b);

    return (
      <div className="flex flex-col gap-1.5">
        {sympIds.length > 0 && (
          <div className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
            Mesas de simposios {sympIds.join(', ')}
          </div>
        )}
        {otros.map(ev => {
          const evt = getEventStyle(ev.event_type);
          const EventIcon = evt.IconComponent;
          return (
            <div key={ev.id} className={`text-[10px] font-black rounded-md px-2 py-1 flex items-center gap-1 ${evt.color_text} ${evt.color_bg} border ${evt.color_border}`}>
              <EventIcon size={11} className="shrink-0" />
              <span className="truncate">{ev.name || evt.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Filtrado
  useEffect(() => {
    const term = normalize(searchTerm.trim());
    const filtered = simposios.filter(s =>
      normalize(s.name).includes(term) ||
      s.presentations.some(p => normalize(p.title).includes(term) || normalize(p.authors).includes(term))
    );
    setFilteredSimposios(filtered);
  }, [searchTerm, simposios]);

  useEffect(() => {
    if (scheduleData.length > 0) {
       const dayEvents = scheduleData.filter(ev => {
         if (ev.date && ev.date === selectedDate) return true;
         if (ev.start_time && ev.start_time.startsWith(selectedDate)) return true;
         return false;
       });
       setFilteredSchedule(dayEvents);
    }
  }, [selectedDate, scheduleData]);

  // --- Normaliza texto (sin acentos, minúsculas) para una búsqueda más precisa ---
  const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const eventMatchesTerm = (ev, normTerm) => {
    if (!normTerm) return true;
    return (
      normalize(ev.name).includes(normTerm) ||
      normalize(ev.symposiums?.name).includes(normTerm) ||
      normalize(ev.rooms?.name).includes(normTerm) ||
      normalize(ev.rooms?.venues?.name).includes(normTerm) ||
      (ev.presentations || []).some(p =>
        normalize(p.title).includes(normTerm) || normalize(p.authors).includes(normTerm)
      )
    );
  };

  const getEventDateValue = (ev) => {
    const match = CONGRESS_DATES.find(d => (ev.date && ev.date === d.value) || (ev.start_time && ev.start_time.startsWith(d.value)));
    return match?.value || null;
  };

  // Filtro de búsqueda dentro de la pestaña Agenda (por título, simposio, sala o ponencia)
  const visibleSchedule = React.useMemo(() => {
    const term = normalize(agendaSearchTerm.trim());
    if (!term) return filteredSchedule;
    return filteredSchedule.filter(ev => eventMatchesTerm(ev, term));
  }, [filteredSchedule, agendaSearchTerm]);

  // Conteo de coincidencias por día (para las insignias en los tabs de fecha y la alerta de sugerencia)
  const matchCountsByDate = React.useMemo(() => {
    const term = normalize(agendaSearchTerm.trim());
    if (!term) return {};
    const counts = {};
    scheduleData.forEach(ev => {
      if (!eventMatchesTerm(ev, term)) return;
      const dateVal = getEventDateValue(ev);
      if (!dateVal) return;
      counts[dateVal] = (counts[dateVal] || 0) + 1;
    });
    return counts;
  }, [scheduleData, agendaSearchTerm]);

  // Resalta la porción del texto que coincide con el término buscado
  const highlightMatch = (text, term) => {
    if (!text) return text;
    const normTerm = normalize(term.trim());
    if (!normTerm) return text;
    const normText = normalize(text);
    const idx = normText.indexOf(normTerm);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-orange-100 text-[#1e3a5f] rounded px-0.5">{text.slice(idx, idx + normTerm.length)}</mark>
        {text.slice(idx + normTerm.length)}
      </>
    );
  };

  const toggleAccordion = (id) => {    if (openId === id) setOpenId(null);
    else {
      setOpenId(id);
      setTimeout(() => {
        const el = document.getElementById(`symp-${id}`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Extraer fechas dinámicamente y ORDENADAS
  const getSymposiumDates = (sympId) => {
    const sympSessions = scheduleData.filter(ev => ev.symposiums?.id === sympId && ev.date);
    if (sympSessions.length === 0) return null;
    let uniqueDates = [...new Set(sympSessions.map(ev => ev.date))];
    uniqueDates.sort();
    const labels = uniqueDates.map(dateVal => {
       const match = CONGRESS_DATES.find(d => d.value === dateVal);
       return match ? match.label : dateVal;
    });
    if (labels.length > 1) {
        const lastDate = labels.pop();
        return labels.join(', ') + ' Y ' + lastDate;
    }
    return labels[0];
  };

  // Evaluador de Eventos "En Vivo"
  const isEventLive = (evDate, startTime, endTime) => {
    if (!evDate || !startTime || !endTime) return false;
    
    // Obtenemos la fecha actual en formato local YYYY-MM-DD
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Obtenemos la hora actual en formato HH:MM
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    // Evaluamos si es hoy y estamos dentro del rango horario
    return evDate === todayStr && timeStr >= startTime.slice(0,5) && timeStr <= endTime.slice(0,5);
  };

  const handlePrintEsquema = () => {
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) { alert("Permite ventanas emergentes."); return; }

    let html = `
      <html><head><title>Programa. Esquema general - IASPM-AL 2026</title>
      <style>
        @page { size: landscape; margin: 12mm; }
        body { font-family: 'Helvetica','Arial',sans-serif; padding: 30px; color:#1a1a1a; font-size: 8pt; }
        h1 { font-size: 15pt; text-align:center; margin:0 0 4px; text-transform:uppercase; color:#1e3a5f; }
        .meta { text-align:center; font-size:9pt; margin-bottom:20px; border-bottom:2px solid #1e3a5f; padding-bottom:12px; text-transform:uppercase; font-weight:bold; color:#555; }
        table { width:100%; border-collapse:collapse; }
        th, td { border:1px solid #dde2e5; padding:6px; vertical-align:top; }
        th { background:#f0f4f8; color:#1e3a5f; text-transform:uppercase; font-size:7.5pt; }
        .time { font-weight:bold; color:#1e3a5f; text-align:center; white-space:nowrap; background:#f7f9fb; }
        .item { display:block; margin-bottom:3px; padding:2px 4px; border-radius:3px; font-size:7.5pt; font-weight:bold; }
        .mesa { background:#eef4fc; color:#1e3a5f; }
        .otro { background:#fdf3ea; color:#9a5b16; }
      </style></head><body>
      <h1>XVIII Congreso IASPM-AL 2026</h1>
      <div class="meta">San Cristóbal de las Casas • 28 Sep - 2 Oct 2026<br>Programa. Esquema general</div>
      <table><thead><tr><th>Horario</th>${CONGRESS_DATES.map(d=>`<th>${d.label}</th>`).join('')}</tr></thead><tbody>`;

    scheduleMatrix.bands.forEach(band => {
      html += `<tr><td class="time">${band.start.slice(0,5)} - ${band.end.slice(0,5)}</td>`;
      CONGRESS_DATES.forEach(day => {
        const key = `${day.value}__${band.start}-${band.end}`;
        const events = scheduleMatrix.cellsByDayBand[key] || [];
        const mesas = events.filter(e => (e.event_type || 'mesa') === 'mesa');
        const otros = events.filter(e => (e.event_type || 'mesa') !== 'mesa');
        const sympIds = [...new Set(mesas.map(m => m.symposiums?.id).filter(Boolean))].sort((a,b)=>a-b);
        let cell = '';
        if (sympIds.length) cell += `<span class="item mesa">Mesas de simposios ${sympIds.join(', ')}</span>`;
        otros.forEach(ev => {
          const evt = getEventStyle(ev.event_type);
          cell += `<span class="item otro">${ev.name || evt.label}</span>`;
        });
        html += `<td>${cell || ''}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
    printWindow.document.write(html); printWindow.document.close();
  };

  const handlePrint = () => {
    if (activeTab === 'esquema') { handlePrintEsquema(); return; }
    // ... (El código de impresión se mantiene intacto) ...
    const isSymposium = activeTab === 'simposios';
    const dataToPrint = isSymposium ? filteredSimposios : filteredSchedule;
    const title = isSymposium ? "RELACIÓN DE SIMPOSIOS Y PONENCIAS" : `AGENDA - ${CONGRESS_DATES.find(d=>d.value===selectedDate)?.label}`;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) { alert("Permite ventanas emergentes."); return; }

    let htmlContent = `
      <html><head><title>Reporte IASPM-AL 2026</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1a1a1a; font-size: 10pt; line-height: 1.4; }
        h1 { font-size: 16pt; text-align: center; margin: 0 0 5px 0; text-transform: uppercase; color: #1e3a5f; }
        .meta { text-align: center; font-size: 10pt; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 15px; text-transform: uppercase; font-weight: bold; color: #555; }
        .badge { background: #1e3a5f; color: #fff; padding: 2px 6px; font-weight: bold; font-size: 8pt; text-transform: uppercase; border-radius: 4px; display: inline-block; }
        .badge-gray { background: #eee; color: #555; padding: 2px 6px; font-weight: bold; font-size: 8pt; text-transform: uppercase; border-radius: 4px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 10px; }
        th { background: #f0f4f8; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #dde2e5; color: #1e3a5f; text-transform: uppercase; font-size: 8pt; }
        td { border: 1px solid #dde2e5; padding: 8px; vertical-align: top; }
        .col-time { text-align: center; font-weight: bold; width: 70px; color: #1e3a5f; }
        .col-loc { width: 200px; font-size: 8.5pt; color: #444; }
        .mesa-info { font-weight: bold; color: #e65100; font-size: 8.5pt; text-transform: uppercase; margin: 4px 0; display: block; border-top: 1px solid #eee; padding-top: 2px; }
        .p-time { font-family: monospace; font-size: 7.5pt; background: #f0f0f0; padding: 0 4px; border: 1px solid #ddd; margin-right: 5px; font-weight: bold; border-radius: 3px; }
        .symp { margin-bottom: 25px; page-break-inside: avoid; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        .symp-name { font-weight: bold; font-size: 11pt; color: #000; margin-left: 10px; }
        .symp-meta { font-size: 9pt; color: #666; margin-top: 5px; margin-bottom: 8px; }
        .symp-venue-box { font-weight: bold; color: #1e3a5f; font-size: 8.5pt; text-transform: uppercase; margin-top: 4px; display: block; }
      </style>
      </head><body>
        <h1>XVIII Congreso IASPM-AL 2026</h1>
        <div class="meta">San Cristóbal de las Casas • 28 Sep - 2 Oct 2026<br><span style="color:#e65100">${title}</span></div>`;

    if (isSymposium) {
      dataToPrint.forEach(s => {
        htmlContent += `
        <div class="symp">
          <div><span class="badge">Simposio ${s.id}</span><span class="symp-name">${s.name}</span></div>
          <div class="symp-meta">
            Coord: ${s.coordinators || 'N/A'} <br>
            ${s.venues?.name ? `<span class="symp-venue-box">SEDE: ${s.venues.name}</span>` : ''}
          </div>
          ${s.presentations?.map((p,i)=>`
            <div style="margin-left:15px; margin-top:6px; padding-left:10px; border-left: 2px solid #f0f0f0;">
              <strong>${i+1}. ${p.title}</strong><br>
              <span style="font-size:9pt; text-transform:uppercase; color: #555;">${p.authors}</span>
            </div>`).join('') || '<div style="margin-left:15px; color:#999;">Sin ponencias registradas</div>'}
        </div>`;
      });
    } else {
      if(dataToPrint.length === 0) htmlContent += `<p style="text-align:center; color:#666; padding: 40px;">No hay actividades programadas.</p>`;
      else {
        htmlContent += `<table><thead><tr><th>HORARIO</th><th>ACTIVIDAD / MESA</th><th>UBICACIÓN</th></tr></thead><tbody>`;
        dataToPrint.sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||'')).forEach(ev => {
          htmlContent += `<tr>
            <td class="col-time">${ev.start_time?.slice(0,5)}<br>a<br>${ev.end_time?.slice(0,5)}</td>
            <td>
              ${ev.symposiums ? `<span class="badge">Simposio ${ev.symposiums.id}</span>` : '<span class="badge-gray">GENERAL</span>'}
              <div style="font-size:10pt; font-weight:bold; margin-top:4px;">${ev.symposiums?.name || ev.name}</div>
              <span class="mesa-info">MESA: ${ev.name}</span>
              ${ev.presentations?.length > 0 ? `<div style="margin-top:8px;">
                ${ev.presentations.sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||'')).map(p=>`
                  <div style="margin-bottom:6px; font-size:8.5pt;">
                    ${p.start_time ? `<span class="p-time">${p.start_time.slice(0,5)}</span>` : ''}
                    <b>${p.title}</b><br>
                    <span style="color:#666; text-transform:uppercase; font-size:8pt; padding-left:20px; display:block;">${p.authors}</span>
                  </div>`).join('')}
              </div>`:''}
            </td>
            <td class="col-loc">
               <div style="margin-bottom:8px;">
                 <b style="color:#1e3a5f;">SEDE:</b><br>
                 ${ev.rooms?.venues?.name || 'Por definir'}
               </div>
               <div>
                 <b style="color:#e65100;">SALA:</b><br>
                 ${ev.rooms?.name || 'Por definir'}
               </div>
            </td>
          </tr>`;
        });
        htmlContent += `</tbody></table>`;
      }
    }
    htmlContent += `<script>window.onload=function(){window.print();}</script></body></html>`;
    printWindow.document.write(htmlContent); printWindow.document.close();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.slice(0, 5);
  };

  // VISTA 3: FICHA DE PONENCIA 
  if (selectedPaper && selectedSession) {
    return (
      <div className="w-full min-h-[600px] animate-in slide-in-from-right duration-300 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-4 flex items-center gap-3 rounded-t-2xl">
          <button 
            onClick={() => setSelectedPaper(null)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-slate-700 transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Detalle Ponencia</p>
            <p className="text-xs text-gray-400 font-medium">Volver a la Mesa</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6 pb-20">
          <h1 className="text-xl md:text-2xl font-black text-[#1e3a5f] mb-6 leading-tight">
            {selectedPaper.title}
          </h1>

          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Autoría</span>
              </div>
              <p className="font-bold text-slate-800 text-lg mb-2">{selectedPaper.authors}</p>
              {selectedPaper.author_affiliation && (
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded border border-slate-200 text-slate-500 text-sm italic">
                  <MapPin className="w-3 h-3" />
                  {selectedPaper.author_affiliation}
                </div>
              )}
              {selectedPaper.presenter && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-1">Presenta</p>
                  <p className="font-bold text-emerald-800 text-base">{selectedPaper.presenter}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 bg-[#1e3a5f] text-white p-4 rounded-xl shadow-lg shadow-blue-900/20">
               <Clock className="w-6 h-6 opacity-80" />
               <div>
                  <p className="text-[10px] font-black uppercase opacity-60">Horario</p>
                  <p className="text-base font-bold">
                    {formatTime(selectedPaper.start_time)} - {formatTime(selectedPaper.end_time)}
                  </p>
               </div>
            </div>

            {selectedPaper.abstract_text && (
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Resumen</span>
                </div>
                <div className="text-slate-700 leading-relaxed text-justify text-sm md:text-base">
                  {selectedPaper.abstract_text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: DETALLE DE MESA 
  if (selectedSession) {
    return (
      <div className="w-full min-h-[600px] animate-in slide-in-from-right duration-300 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-4 shadow-sm rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => setSelectedSession(null)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-slate-700 transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs text-gray-500 font-medium">Volver al Programa General</span>
               </div>
            </div>
          </div>
          <h2 className="text-lg font-bold text-[#1e3a5f] leading-tight pl-1">
            {selectedSession.symposiums?.name || selectedSession.name || 'Evento Especial'}
          </h2>
          {selectedSession.symposiums && selectedSession.name !== selectedSession.symposiums.name && (
             <p className="text-xs text-gray-500 pl-1 mt-1">{selectedSession.name}</p>
          )}
        </div>

        <div className="max-w-3xl mx-auto p-4">
            <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                    <Clock size={14} className="text-[#1e3a5f]"/>
                    {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                    <MapPin size={14} className="text-[#1e3a5f]"/>
                    {selectedSession.rooms?.venues?.name} - {selectedSession.rooms?.name}
                </div>
            </div>

            {selectedSession.event_type === 'libro' && (selectedSession.book_authors || selectedSession.book_presenter) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 space-y-2">
                {selectedSession.book_authors && (
                  <div>
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">Autor(es) del Libro</p>
                    <p className="text-sm font-bold text-gray-800">{selectedSession.book_authors}</p>
                  </div>
                )}
                {selectedSession.book_presenter && (
                  <div>
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      <User size={11}/> Presentado por
                    </p>
                    <p className="text-sm font-bold text-gray-800">{selectedSession.book_presenter}</p>
                  </div>
                )}
              </div>
            )}

            {(selectedSession.event_type === 'musica' || selectedSession.event_type === 'concierto_estelar' || selectedSession.event_type === 'inauguracion') && (selectedSession.concierto_grupo || selectedSession.concierto_titulo || selectedSession.concierto_descripcion) && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 space-y-2">
                {selectedSession.concierto_grupo && (
                  <div>
                    <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-0.5">Grupo / Equipo</p>
                    <p className="text-sm font-bold text-gray-800">{selectedSession.concierto_grupo}</p>
                  </div>
                )}
                {selectedSession.concierto_titulo && (
                  <div>
                    <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-0.5">Concierto</p>
                    <p className="text-sm font-bold text-gray-800">{selectedSession.concierto_titulo}</p>
                  </div>
                )}
                {selectedSession.concierto_descripcion && (
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedSession.concierto_descripcion}</p>
                )}
              </div>
            )}

            {selectedSession.event_type === 'conversatorio' && (selectedSession.conversatorio_participantes || selectedSession.conversatorio_descripcion) && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 space-y-2">
                {selectedSession.conversatorio_participantes && (
                  <div>
                    <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      <User size={11}/> Participantes
                    </p>
                    <p className="text-sm font-bold text-gray-800">{selectedSession.conversatorio_participantes}</p>
                  </div>
                )}
                {selectedSession.conversatorio_descripcion && (
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedSession.conversatorio_descripcion}</p>
                )}
              </div>
            )}

            {selectedSession.event_type === 'plenaria' && (selectedSession.plenaria_ponentes || selectedSession.plenaria_descripcion) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 space-y-2">
                {selectedSession.plenaria_ponentes && (
                  <div>
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      <User size={11}/> Ponentes
                    </p>
                    <p className="text-sm font-bold text-gray-800">{selectedSession.plenaria_ponentes}</p>
                  </div>
                )}
                {selectedSession.plenaria_descripcion && (
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedSession.plenaria_descripcion}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-4 mt-2 px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {selectedSession.event_type === 'libro' ? 'Agenda de Publicaciones' : 'Agenda de Ponencias'}
              </h3>
            </div>

            <div className="space-y-3">
              {selectedSession.presentations?.sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||'')).map((paper, idx) => (
                <button
                  key={paper.id || idx}
                  onClick={() => setSelectedPaper(paper)}
                  className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-[#1e3a5f] hover:shadow-md transition-all text-left group relative"
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 w-12 h-8 flex items-center justify-center bg-slate-100 text-slate-600 text-[10px] font-black rounded group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                      {paper.start_time ? paper.start_time.slice(0,5) : `#${idx+1}`}
                    </span>
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-[#1e3a5f]">
                         {paper.title}
                       </h4>
                       <p className="text-xs text-slate-500 font-medium uppercase">
                         {paper.authors}
                       </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1e3a5f] self-center" />
                  </div>
                </button>
              ))}
              
              {(!selectedSession.presentations || selectedSession.presentations.length === 0) && (
                 <div className="text-center py-10 opacity-60">
                    <LayoutList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No hay ponencias registradas.</p>
                 </div>
              )}
            </div>
            <div className="h-20"></div>
        </div>
      </div>
    );
  }

  // VISTA 1: PROGRAMA GENERAL
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 animate-in fade-in duration-300">

      {/* CABECERA DE CONTROL */}
      <div className="mb-6 flex flex-col md:flex-row justify-end items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm sticky top-0 z-30">
         <div className="mr-auto pl-2 hidden md:block text-xs font-bold text-gray-400 tracking-widest uppercase">
            {activeTab === 'simposios' ? 'Listado de Simposios' : activeTab === 'agenda' ? 'Agenda Diaria' : 'Esquema General del Congreso'}
         </div>

        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto">
          <button onClick={() => setActiveTab('simposios')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-[10px] font-black border whitespace-nowrap transition-all ${activeTab === 'simposios' ? 'bg-gray-100 text-[#1e3a5f] border-gray-300' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}>
            <List size={12} className="inline mr-2"/> SIMPOSIOS
          </button>
          <button onClick={() => setActiveTab('agenda')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-[10px] font-black border whitespace-nowrap transition-all ${activeTab === 'agenda' ? 'bg-gray-100 text-[#1e3a5f] border-gray-300' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}>
            <Calendar size={12} className="inline mr-2"/> AGENDA
          </button>
          {/* Esquema General: visible pero deshabilitado (sin acción al click) hasta terminar de cargar los eventos no-mesa */}
          <button
            onClick={() => {}}
            disabled
            title="Disponible próximamente"
            className="flex-1 md:flex-none px-4 py-2 rounded-md text-[10px] font-black border whitespace-nowrap bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"
          >
            <LayoutList size={12} className="inline mr-2"/> ESQUEMA GENERAL
          </button>
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          <button onClick={handlePrint} className="px-4 py-2 bg-[#1e3a5f] text-white rounded-md text-[10px] font-black hover:bg-black shadow-sm flex items-center gap-2 whitespace-nowrap transition-all">
            <Download size={12}/> IMPRIMIR
          </button>
        </div>
      </div>

      {/* --- CONTENIDO: PESTAÑA SIMPOSIOS --- */}
      {activeTab === 'simposios' && (
        <>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Buscar simposio o autor..." className="w-full pl-9 pr-20 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#1e3a5f] text-sm font-bold shadow-sm transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-3">
            {filteredSimposios.map((symp) => (
              <div key={symp.id} id={`symp-${symp.id}`} className={`bg-white rounded-xl border transition-all duration-200 ${openId === symp.id ? 'border-[#1e3a5f] ring-1 ring-blue-50 shadow-md' : 'border-gray-100 shadow-sm'}`}>
                <button onClick={() => toggleAccordion(symp.id)} className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 rounded-xl transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-[#1e3a5f] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Simposio {symp.id}</span>
                      <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">{symp.presentations?.length || 0} PONENCIAS</span>
                      
                      {(() => {
                        const dateText = symp.fecha || getSymposiumDates(symp.id);
                        const venueText = symp.venues?.name;
                        
                        if (!dateText && !venueText) return null;

                        return (
                          <div className="flex items-center gap-3 border-l-2 border-gray-200 pl-3 ml-1">
                            {dateText && (
                              <span className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar size={12} className="opacity-60" /> {dateText}
                              </span>
                            )}
                            {venueText && (
                              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin size={12} className="opacity-70" /> SEDE: {venueText}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <h3 className={`text-sm md:text-base font-bold leading-tight ${openId === symp.id ? 'text-[#1e3a5f]' : 'text-gray-800'}`}>{symp.name}</h3>
                    {symp.coordinators && <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 truncate">COORD: {symp.coordinators}</p>}
                  </div>
                  <ChevronDown size={20} className={`transition-transform duration-200 ${openId === symp.id ? 'rotate-180 text-[#1e3a5f]' : 'text-gray-300'}`} />
                </button>
                {openId === symp.id && (
                  <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1">
                    <div className="h-px bg-gray-100 mb-3" />
                    
                    <div className="grid grid-cols-1 gap-2">
                      {symp.presentations.map((pres) => {
                        const term = normalize(searchTerm.trim());
                        const isMatch = term.length > 2 && (
                          normalize(pres.title).includes(term) ||
                          normalize(pres.authors).includes(term)
                        );

                        return (
                          <div 
                            key={pres.id} 
                            className={`p-3 rounded-lg border transition-all duration-500 ${
                              isMatch 
                                ? 'border-orange-300 bg-orange-50/80 shadow-md transform scale-[1.01] ring-1 ring-orange-200' 
                                : 'border-gray-100 bg-gray-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className={`font-bold text-xs leading-snug mb-1 ${isMatch ? 'text-orange-900' : 'text-gray-800'}`}>
                                  {pres.title}
                                </h4>
                                <p className={`text-[10px] font-black uppercase flex items-center gap-1 ${isMatch ? 'text-orange-700' : 'text-gray-500'}`}>
                                  <Users size={10} className={isMatch ? 'text-orange-500' : 'text-[#1e3a5f]'} /> {pres.authors}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- CONTENIDO: PESTAÑA AGENDA (CON EVENTOS EN VIVO) --- */}
      {activeTab === 'agenda' && (
        <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por título, ponente, simposio o sala..."
                className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#1e3a5f] text-sm font-bold shadow-sm transition-all"
                value={agendaSearchTerm}
                onChange={(e) => setAgendaSearchTerm(e.target.value)}
              />
              {agendaSearchTerm && (
                <button
                  type="button"
                  onClick={() => setAgendaSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pt-2.5 pb-4 mb-2 no-scrollbar">
                {CONGRESS_DATES.map((date) => {
                    const count = matchCountsByDate[date.value];
                    return (
                    <button
                        key={date.value}
                        onClick={() => setSelectedDate(date.value)}
                        className={`
                            relative shrink-0 px-5 py-2.5 rounded-xl text-xs font-black transition-all border
                            ${selectedDate === date.value
                                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-lg transform scale-105'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        {date.label}
                        {agendaSearchTerm.trim() && (
                          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center border-2 ${
                            count > 0
                              ? (selectedDate === date.value ? 'bg-orange-400 text-white border-white' : 'bg-orange-400 text-white border-white')
                              : 'bg-gray-200 text-gray-400 border-white'
                          }`}>
                            {count || 0}
                          </span>
                        )}
                    </button>
                    );
                })}
            </div>

            {/* Alerta suave: sin resultados hoy, pero sí en otros días */}
            {agendaSearchTerm.trim() && visibleSchedule.length === 0 && Object.values(matchCountsByDate).some(c => c > 0) && (
              <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <Search size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">
                    No hay resultados para "{agendaSearchTerm}" el {CONGRESS_DATES.find(d => d.value === selectedDate)?.label}.
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5 mb-2">Sí encontramos coincidencias en otros días:</p>
                  <div className="flex flex-wrap gap-2">
                    {CONGRESS_DATES.filter(d => matchCountsByDate[d.value] > 0).map(d => (
                      <button
                        key={d.value}
                        onClick={() => setSelectedDate(d.value)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        {d.label} · {matchCountsByDate[d.value]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 min-h-[300px]">
            {visibleSchedule.length > 0 ? visibleSchedule.map(ev => {
                // Evaluamos si esta sesión está ocurriendo AHORA MISMO
                const isLive = isEventLive(ev.date, ev.start_time, ev.end_time);

                return (
                <div
                    key={ev.id}
                    onClick={() => setSelectedSession(ev)} 
                    // Si está "En Vivo", le ponemos borde naranja, resplandor e impedimos que se vea apagado
                    className={`bg-white rounded-xl border shadow-sm transition-all cursor-pointer flex overflow-hidden group ${
                        isLive 
                        ? 'border-orange-400 ring-2 ring-orange-200 transform scale-[1.01] hover:shadow-lg' 
                        : 'border-gray-200 hover:border-[#1e3a5f] hover:-translate-y-0.5 hover:shadow-lg'
                    }`}
                >
                
                {/* Panel de hora izquierdo - Cambia a Naranja si está en vivo */}
                <div className={`p-4 w-24 flex flex-col items-center justify-center border-r shrink-0 transition-colors ${
                    isLive ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100 group-hover:bg-blue-50'
                }`}>
                    {/* Alerta parpadeante de EN VIVO */}
                    {isLive && (
                        <span className="text-[9px] font-black text-orange-600 mb-1 animate-pulse flex items-center gap-1 tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>EN VIVO
                        </span>
                    )}
                    <span className={`text-sm font-black ${isLive ? 'text-orange-900' : 'text-[#1e3a5f]'}`}>{ev.start_time?.slice(0,5)}</span>
                    <div className={`h-0.5 w-8 my-1 ${isLive ? 'bg-orange-300' : 'bg-gray-300 group-hover:bg-[#1e3a5f]'}`}></div>
                    <span className={`text-xs font-bold ${isLive ? 'text-orange-700' : 'text-gray-400'}`}>{ev.end_time?.slice(0,5)}</span>
                </div>

                <div className="p-4 flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1.5">
                        {ev.symposiums ? (
                        <span className="bg-[#1e3a5f] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">Simposio {ev.symposiums.id}</span>
                        ) : ev.event_type === 'libro' ? (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">📖 Presentación de Publicaciones</span>
                        ) : (
                        <span className="bg-gray-200 text-gray-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">GENERAL</span>
                        )}
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{ev.name}</span>      
                    </div>

                    <h3 className={`text-base font-bold leading-tight mb-1 line-clamp-2 transition-colors ${
                        isLive ? 'text-orange-900' : 'text-gray-900 group-hover:text-[#1e3a5f]'
                    }`}>
                        {highlightMatch(ev.symposiums?.name || ev.name, agendaSearchTerm)}
                    </h3>
                    {ev.event_type === 'libro' && ev.book_presenter && (
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                        <User size={10}/> Presenta: {ev.book_presenter}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">   
                        <MapPin size={12} className="text-orange-500"/>
                        <span className="text-[10px] font-bold uppercase truncate max-w-[150px]">{ev.rooms?.venues?.name}</span>        
                        </div>
                        {ev.presentations?.length > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-500 ml-2">
                            <FileText size={12} />
                            <span className="text-[10px] font-bold">{ev.presentations.length} Ponencias</span>
                        </div>
                        )}
                    </div>
                </div>
                <div className={`flex items-center px-3 ${isLive ? 'text-orange-400' : 'text-gray-300 group-hover:text-[#1e3a5f]'}`}>
                    <ChevronRight size={24} />
                </div>
                </div>
            )}) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                    <Calendar size={48} className="mb-4 opacity-20"/>
                    {agendaSearchTerm.trim() ? (
                      <>
                        <p className="text-base font-bold">Sin resultados para "{agendaSearchTerm}".</p>
                        <p className="text-xs mt-1">Prueba con otro término o revisa otro día.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-bold">No hay actividades para este día.</p>
                        <p className="text-xs mt-1">Selecciona otra fecha en la parte superior.</p>
                      </>
                    )}
                </div>
            )}
            </div>
        </>
      )}

      {/* --- CONTENIDO: PESTAÑA ESQUEMA GENERAL (matriz día x horario, todos los tipos) --- */}
      {activeTab === 'esquema' && (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
          {scheduleMatrix.bands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <LayoutList size={48} className="mb-4 opacity-20"/>
              <p className="text-base font-bold">Aún no hay actividades cargadas.</p>
              <p className="text-xs mt-1">El esquema se completa automáticamente conforme se capturen sesiones.</p>
            </div>
          ) : (
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th className="text-[10px] font-black text-gray-400 uppercase p-3 border-b border-r border-gray-100 w-24 text-left bg-gray-50">Horario</th>
                  {CONGRESS_DATES.map(day => (
                    <th key={day.value} className="text-[10px] font-black text-[#1e3a5f] uppercase p-3 border-b border-gray-100 bg-gray-50 text-left">{day.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleMatrix.bands.map((band, i) => (
                  <tr key={i} className="align-top">
                    <td className="text-[10px] font-black text-[#1e3a5f] p-3 border-r border-b border-gray-100 whitespace-nowrap bg-gray-50/50">
                      {band.start.slice(0,5)}<br/>-<br/>{band.end.slice(0,5)}
                    </td>
                    {CONGRESS_DATES.map(day => (
                      <td key={day.value} className="p-2 border-b border-gray-100 min-w-[160px]">
                        {renderCellContent(day, band)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Program;
