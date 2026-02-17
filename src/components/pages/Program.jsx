// src/components/pages/Program.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Users, ChevronDown, Download, Calendar, List, MapPin, Clock, X, FileText, User } from 'lucide-react';

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
  
  const [simposios, setSimposios] = useState([]);
  const [filteredSimposios, setFilteredSimposios] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchData();
    fetchScheduleData();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedSession ? 'hidden' : 'unset';
  }, [selectedSession]);

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
      // Nos aseguramos de traer todos los campos posibles de fecha/hora
      const { data } = await supabase
        .from('sessions')
        .select(`*, date, start_time, end_time, rooms(name, venues(name)), symposiums(id, name), presentations(*)`)
        .order('start_time');
      
      console.log("Datos Agenda Cargados:", data); // Para depuración en consola
      setScheduleData(data || []);
  };

  // Filtrado de Simposios
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = simposios.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.presentations.some(p => p.title.toLowerCase().includes(term) || p.authors.toLowerCase().includes(term))
    );
    setFilteredSimposios(filtered);
  }, [searchTerm, simposios]);

  // --- FILTRADO DE AGENDA (LÓGICA CORREGIDA) ---
  useEffect(() => {
    if (scheduleData.length > 0) {
       const dayEvents = scheduleData.filter(ev => {
         // 1. Verificar si existe campo 'date' exacto (ej: '2026-09-28')
         if (ev.date && ev.date === selectedDate) return true;
         // 2. Verificar si 'start_time' es ISO y empieza con la fecha
         if (ev.start_time && ev.start_time.startsWith(selectedDate)) return true;
         return false;
       });
       setFilteredSchedule(dayEvents);
    }
  }, [selectedDate, scheduleData]);

  const toggleAccordion = (id) => {
    if (openId === id) setOpenId(null);
    else {
      setOpenId(id);
      setTimeout(() => {
        const el = document.getElementById(`symp-${id}`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // --- IMPRESIÓN (VENTANA NUEVA) ---
  const handlePrint = () => {
    const isSymposium = activeTab === 'simposios';
    const dataToPrint = isSymposium ? filteredSimposios : filteredSchedule; 
    const title = isSymposium ? "RELACIÓN DE SIMPOSIOS Y PONENCIAS" : `AGENDA - ${CONGRESS_DATES.find(d=>d.value===selectedDate)?.label}`;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) { alert("Permite ventanas emergentes."); return; }

    let htmlContent = `
      <html><head><title>Reporte IASPM-AL 2026</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 30px; color: #000; font-size: 10pt; }
        h1 { font-size: 14pt; text-align: center; margin: 0; text-transform: uppercase; }
        .meta { text-align: center; font-size: 9pt; margin-bottom: 20px; border-bottom: 2px solid #000; pb: 10px; text-transform: uppercase; }
        .badge { background: #eee; color: #000; padding: 2px 6px; font-weight: bold; font-size: 8pt; text-transform: uppercase; border: 1px solid #999; display: inline-block; }
        
        /* Tabla Agenda */
        table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 5px; vertical-align: top; }
        th { background: #eee; font-weight: bold; text-align: left; }
        .tc { text-align: center; font-weight: bold; width: 85px; }
        .p-time { font-family: monospace; font-size: 8pt; background: #f0f0f0; padding: 0 4px; border: 1px solid #ddd; margin-right: 5px; font-weight: bold; }
        
        /* Lista Simposios */
        .symp { margin-bottom: 20px; page-break-inside: avoid; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
        .symp-name { font-weight: bold; font-size: 12pt; margin-left: 5px; }
      </style>
      </head><body>
        <h1>XVIII Congreso IASPM-AL 2026</h1>
        <div class="meta">San Cristóbal de las Casas • 28 Sep - 2 Oct 2026<br><b>${title}</b></div>`;

    if (isSymposium) {
      dataToPrint.forEach(s => {
        htmlContent += `
        <div class="symp">
          <div><span class="badge">Simposio ${s.id}</span><span class="symp-name">${s.name}</span></div>
          <div style="font-size:9pt; font-style:italic; margin:4px 0;">Coord: ${s.coordinators || 'N/A'}</div>
          ${s.presentations?.map((p,i)=>`
            <div style="margin-left:15px; margin-top:4px;">
              <strong>${i+1}. ${p.title}</strong><br>
              ${p.start_time ? `<span class="p-time">${p.start_time.slice(0,5)} - ${p.end_time?.slice(0,5)}</span>` : ''}
              <span style="font-size:9pt; text-transform:uppercase;">${p.authors}</span>
            </div>`).join('') || '<i style="margin-left:15px">Sin ponencias</i>'}
        </div>`;
      });
    } else {
      if(dataToPrint.length === 0) htmlContent += `<p style="text-align:center">No hay actividades para este día.</p>`;
      else {
        htmlContent += `<table><thead><tr><th>HORA</th><th>ACTIVIDAD</th><th>SEDE</th></tr></thead><tbody>`;
        dataToPrint.sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||'')).forEach(ev => {
          htmlContent += `<tr>
            <td class="tc">${ev.start_time?.slice(0,5)}<br>-<br>${ev.end_time?.slice(0,5)}</td>
            <td>
              ${ev.symposiums ? `<span class="badge">Simposio ${ev.symposiums.id}</span>` : ''}
              <div style="font-weight:bold; font-size:10pt; margin-top:3px;">${ev.name}</div>
              <div style="font-style:italic; font-size:9pt; margin-bottom:6px;">${ev.symposiums?.name||''}</div>
              ${ev.presentations?.length > 0 ? `<ul style="margin:0; padding-left:15px;">
                ${ev.presentations.sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||'')).map(p=>`
                  <li style="margin-bottom:3px;">
                    ${p.start_time ? `<span class="p-time">${p.start_time.slice(0,5)}-${p.end_time?.slice(0,5)}</span>` : ''}
                    <b>"${p.title}"</b> - ${p.authors}
                  </li>`).join('')}
              </ul>`:''}
            </td>
            <td><b>${ev.rooms?.venues?.name||''}</b><br>${ev.rooms?.name||''}</td>
          </tr>`;
        });
        htmlContent += `</tbody></table>`;
      }
    }
    htmlContent += `<script>window.onload=function(){window.print();}</script></body></html>`;
    printWindow.document.write(htmlContent); printWindow.document.close();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 animate-in fade-in duration-300">
      
      {/* CABECERA (SIN TÍTULO GIGANTE) */}
      <div className="mb-2 flex flex-col md:flex-row justify-end items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
         <div className="mr-auto pl-2 hidden md:block text-xs font-bold text-gray-400 tracking-widest uppercase">
            {activeTab === 'simposios' ? 'Listado General' : 'Agenda Diaria'}
         </div>

        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto">
          <button onClick={() => setActiveTab('simposios')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-[10px] font-black border whitespace-nowrap transition-all ${activeTab === 'simposios' ? 'bg-gray-100 text-[#1e3a5f] border-gray-300' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}>
            <List size={12} className="inline mr-2"/> SIMPOSIOS
          </button>
          <button onClick={() => setActiveTab('agenda')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-[10px] font-black border whitespace-nowrap transition-all ${activeTab === 'agenda' ? 'bg-gray-100 text-[#1e3a5f] border-gray-300' : 'bg-white text-gray-400 border-transparent hover:bg-gray-50'}`}>
            <Calendar size={12} className="inline mr-2"/> AGENDA
          </button>
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          <button onClick={handlePrint} className="px-4 py-2 bg-[#1e3a5f] text-white rounded-md text-[10px] font-black hover:bg-black shadow-sm flex items-center gap-2 whitespace-nowrap transition-all">
            <Download size={12}/> IMPRIMIR
          </button>
        </div>
      </div>

      {/* --- VISTA: SIMPOSIOS --- */}
      {activeTab === 'simposios' && (
        <>
          <div className="mb-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Buscar simposio o autor..." className="w-full pl-9 pr-20 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:border-[#1e3a5f] text-xs font-bold shadow-sm transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filteredSimposios.map((symp) => (
              <div key={symp.id} id={`symp-${symp.id}`} className={`bg-white rounded-lg border transition-all duration-200 ${openId === symp.id ? 'border-[#1e3a5f] ring-1 ring-blue-50 shadow-md' : 'border-gray-100 shadow-sm'}`}>
                <button onClick={() => toggleAccordion(symp.id)} className="w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#1e3a5f] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">Simposio {symp.id}</span>
                      <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">{symp.presentations?.length || 0} PONENCIAS</span>
                    </div>
                    <h3 className={`text-xs md:text-sm font-bold leading-tight ${openId === symp.id ? 'text-[#1e3a5f]' : 'text-gray-800'}`}>{symp.name}</h3>
                    {symp.coordinators && <p className="text-[9px] font-medium text-gray-400 uppercase mt-1 truncate">COORD: {symp.coordinators}</p>}
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${openId === symp.id ? 'rotate-180 text-[#1e3a5f]' : 'text-gray-300'}`} />
                </button>
                {openId === symp.id && (
                  <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1">
                    <div className="h-px bg-gray-100 mb-2" />
                    <div className="grid grid-cols-1 gap-1.5">
                      {symp.presentations.map((pres) => (
                        <div key={pres.id} className="p-2.5 rounded border border-gray-100 bg-gray-50/30 hover:bg-white transition-all">
                          <h4 className="font-bold text-gray-800 text-[11px] leading-snug mb-1">{pres.title}</h4>
                          <p className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-1"><Users size={10} className="text-[#1e3a5f]" /> {pres.authors}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- VISTA: AGENDA --- */}
      {activeTab === 'agenda' && (
        <>
            {/* TABS DE FECHA */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-1 no-scrollbar">
                {CONGRESS_DATES.map((date) => (
                    <button
                        key={date.value}
                        onClick={() => setSelectedDate(date.value)}
                        className={`
                            shrink-0 px-4 py-2 rounded-lg text-xs font-black transition-all border
                            ${selectedDate === date.value 
                                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        {date.label}
                    </button>
                ))}
            </div>

            <div className="space-y-3 min-h-[200px]">
            {filteredSchedule.length > 0 ? filteredSchedule.map(ev => (
                <div 
                    key={ev.id} 
                    onClick={() => setSelectedSession(ev)}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1e3a5f] transition-all cursor-pointer flex overflow-hidden group"
                >
                <div className="bg-gray-50 p-3 w-20 flex flex-col items-center justify-center border-r border-gray-100 group-hover:bg-blue-50/30 transition-colors shrink-0">
                    <span className="text-sm font-black text-[#1e3a5f]">{ev.start_time?.slice(0,5)}</span>
                    <div className="h-0.5 w-6 bg-gray-200 my-1"></div>
                    <span className="text-xs font-bold text-gray-400">{ev.end_time?.slice(0,5)}</span>
                </div>
                
                <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {ev.symposiums ? (
                        <span className="bg-[#1e3a5f] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Simposio {ev.symposiums.id}</span>
                        ) : (
                        <span className="bg-gray-200 text-gray-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">GENERAL</span>
                        )}
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">{ev.name}</span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                        {ev.symposiums?.name || ev.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <MapPin size={10} className="text-orange-500"/>
                        <span className="text-[9px] font-bold uppercase truncate max-w-[150px]">{ev.rooms?.venues?.name}</span>
                        </div>
                        {ev.presentations?.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-500 ml-2">
                            <FileText size={10} />
                            <span className="text-[9px] font-bold">{ev.presentations.length} Ponencias</span>
                        </div>
                        )}
                    </div>
                </div>
                </div>
            )) : (
                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                    <Calendar size={32} className="mb-2 opacity-20"/>
                    <p className="text-sm font-bold">No hay actividades programadas para este día.</p>
                    <p className="text-xs">Intenta seleccionar otra fecha en las pestañas de arriba.</p>
                </div>
            )}
            </div>
        </>
      )}

      {/* --- MODAL (FICHA TÉCNICA) --- */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-[#1e3a5f]/60 backdrop-blur-sm animate-in fade-in duration-200">
          
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
            
            {/* Cabecera */}
            <div className="bg-white p-4 border-b border-gray-100 shrink-0 relative flex justify-between items-start">
               <div className="pr-10">
                  {selectedSession.symposiums && (
                    <span className="inline-block bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded mb-2 uppercase">
                       Simposio {selectedSession.symposiums.id}
                    </span>
                  )}
                  <h2 className="text-lg font-black text-[#1e3a5f] leading-tight mb-1 line-clamp-2">
                     {selectedSession.symposiums?.name || selectedSession.name}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{selectedSession.name}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                     <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <Clock size={12} className="text-[#1e3a5f]"/>
                        {selectedSession.start_time?.slice(0,5)} - {selectedSession.end_time?.slice(0,5)}
                     </div>
                     <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <MapPin size={12} className="text-[#1e3a5f]"/>
                        {selectedSession.rooms?.venues?.name}
                     </div>
                  </div>
               </div>

               <button onClick={() => setSelectedSession(null)} className="p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors active:scale-90">
                  <X size={24} />
               </button>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 pb-20 md:pb-4">
               {selectedSession.presentations?.length > 0 ? (
                 <div className="space-y-3">
                    {selectedSession.presentations.sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||'')).map((pres, idx) => (
                       <details key={pres.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden open:ring-2 open:ring-blue-100 transition-all">
                          <summary className="p-4 cursor-pointer list-none flex gap-3 items-start hover:bg-gray-50 transition-colors select-none">
                             <div className="bg-blue-50 text-blue-700 font-mono text-[10px] font-bold px-2 py-1 rounded border border-blue-100 shrink-0 mt-0.5">
                                {pres.start_time ? pres.start_time.slice(0,5) : `#${idx+1}`}
                             </div>
                             <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-900 leading-snug group-open:text-[#1e3a5f] transition-colors">{pres.title}</h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                   <User size={12} className="text-gray-400"/>
                                   <span className="text-xs font-bold text-gray-600 uppercase">{pres.authors}</span>
                                </div>
                             </div>
                             <div className="text-gray-400 group-open:rotate-180 transition-transform mt-1">
                                <ChevronDown size={20}/>
                             </div>
                          </summary>
                          
                          <div className="px-4 pb-4 pt-0">
                             <div className="h-px w-full bg-gray-100 mb-4"></div>
                             {pres.author_affiliation && (
                                <div className="mb-3 flex items-start gap-2">
                                   <div className="mt-1.5 w-1 h-1 bg-[#1e3a5f] rounded-full shrink-0"></div>
                                   <p className="text-xs text-gray-500 italic"><span className="font-bold text-gray-700 not-italic">Filiación: </span>{pres.author_affiliation}</p>
                                </div>
                             )}
                             {pres.abstract_text ? (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-700 leading-relaxed text-justify">
                                   <p className="font-black text-[10px] text-gray-400 uppercase mb-1">Resumen</p>
                                   {pres.abstract_text}
                                </div>
                             ) : <p className="text-xs text-gray-400 italic">Sin resumen disponible.</p>}
                          </div>
                       </details>
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <FileText size={40} className="mb-2 opacity-20"/>
                    <p className="text-sm italic">No hay ponencias registradas.</p>
                 </div>
               )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white md:hidden absolute bottom-0 left-0 right-0">
              <button onClick={() => setSelectedSession(null)} className="w-full py-3 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 active:scale-95 transition-all text-sm uppercase">
                CERRAR VENTANA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Program;
