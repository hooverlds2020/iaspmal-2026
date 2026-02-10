// src/components/pages/PrintableProgram.jsx
import React from 'react';
import { MapPin, Calendar, Clock, User } from 'lucide-react';

const PrintableProgram = ({ events, lang, type = 'symposiums' }) => {
  
  const cleanCoordinators = (data) => {
    if (!data) return '';
    if (Array.isArray(data)) return data.join(', ');
    return typeof data === 'string' ? data.replace(/[{}"]/g, '') : data;
  };

  const formatDateHeader = (dateString) => {
    if (!dateString || dateString === 'Sin Fecha') return lang === 'es' ? 'Fecha por confirmar' : 'Date TBD';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0); 
    return date.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { 
        weekday: 'long', day: 'numeric', month: 'long'
    });
  };

  // --- LÓGICA DE ORDENAMIENTO AUTOMÁTICA (DESDE BD) ---
  const getGroupedSchedule = () => {
    if (!events || !Array.isArray(events)) return {};

    const sorted = [...events].sort((a, b) => {
        // 1. ORDENAR POR HORA (Lo más temprano primero)
        const timeA = a.start_time || '9999';
        const timeB = b.start_time || '9999';
        if (timeA !== timeB) {
            return timeA.localeCompare(timeB);
        }

        // 2. ORDENAR POR SALA (Usando la columna 'room_sort_order' de la BD)
        // Si no tiene orden asignado, usamos 999 para enviarlo al final.
        const pA = a.room_sort_order ?? 999;
        const pB = b.room_sort_order ?? 999;

        if (pA !== pB) {
            return pA - pB;
        }

        // 3. Desempate final por número de simposio
        return (a.number || 0) - (b.number || 0);
    });

    // Agrupar por fecha
    return sorted.reduce((groups, event) => {
        const dateKey = event.start_time ? event.start_time.split('T')[0] : 'Sin Fecha';
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(event);
        return groups;
    }, {});
  };

  // VISTA DE LISTA
  const renderSymposiums = () => (
    <div className="grid grid-cols-1 gap-5">
        <h2 className="text-2xl font-bold uppercase border-b-4 border-purple-600 pb-2 mb-4 text-purple-900">
            {lang === 'es' ? 'Listado de Simposios' : 'Symposiums List'}
        </h2>
        {events.map((item, idx) => (
            <div key={idx} className="break-inside-avoid bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-purple-600 text-white px-4 py-2 flex justify-between items-center print-color-adjust">
                    <span className="font-bold text-lg">Simposio {item.number}</span>
                    {item.room && <span className="text-xs bg-purple-800 px-2 py-1 rounded">{item.room}</span>}
                </div>
                <div className="p-4 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                         {lang === 'es' ? item.title_es : (item.title_pt || item.title_es)}
                    </h3>
                    {item.coordinators && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded print-color-adjust">
                            <User size={16} className="mt-0.5 text-purple-600 flex-shrink-0" />
                            <span className="italic">{cleanCoordinators(item.coordinators)}</span>
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
  );

  // VISTA DE HORARIO
  const renderSchedule = () => {
    const grouped = getGroupedSchedule();
    const dates = Object.keys(grouped).sort();

    if (dates.length === 0) return <p className="p-10 text-center">No hay horarios definidos.</p>;

    return (
        <div className="space-y-8">
            <div className="text-center pb-4 border-b-2 border-gray-100 mb-6">
                <h2 className="text-3xl font-black uppercase text-indigo-900 tracking-tight">
                    {lang === 'es' ? 'Agenda General' : 'General Schedule'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Ordenado por día y hora</p>
            </div>

            {dates.map((dateKey) => (
                <div key={dateKey} className="break-inside-avoid mb-8"> 
                    {/* Encabezado del Día */}
                    <div className="flex items-center gap-3 bg-gray-800 text-white p-4 rounded-lg shadow-sm mb-4 print-color-adjust">
                        <Calendar size={24} className="text-teal-400" />
                        <h3 className="text-xl font-bold capitalize tracking-wide">
                            {formatDateHeader(dateKey)}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {grouped[dateKey].map((ev, idx) => {
                            const timeStr = ev.start_time ? ev.start_time.split('T')[1].substring(0, 5) : '--:--';
                            
                            return (
                                <div key={idx} className="flex gap-4 border-l-4 border-indigo-500 bg-white p-3 rounded shadow-sm break-inside-avoid items-start">
                                    {/* Columna Hora */}
                                    <div className="w-24 pt-1 flex-shrink-0">
                                        <div className="bg-gray-100 text-gray-800 font-bold px-3 py-1.5 rounded text-sm inline-flex items-center justify-center w-full print-color-adjust border border-gray-200">
                                           <Clock size={14} className="mr-1.5 text-indigo-600"/> {timeStr}
                                        </div>
                                    </div>
                                    
                                    {/* Columna Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                            {/* BADGE SALA */}
                                            {ev.room && (
                                                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded flex items-center gap-1 print-color-adjust uppercase tracking-wider border border-indigo-200">
                                                    <MapPin size={10}/> {ev.room}
                                                </span>
                                            )}
                                            {/* Badge Número */}
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 print-color-adjust">
                                                S{ev.number}
                                            </span>
                                        </div>
                                        
                                        <h4 className="font-bold text-gray-900 text-base leading-snug">
                                            {lang === 'es' ? ev.title_es : (ev.title_pt || ev.title)}
                                        </h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
  };

  if (!events || events.length === 0) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="p-8 bg-white text-black font-sans w-full print-container">
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
        <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">XVII Congreso IASPM-AL 2026</h1>
            <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mt-1">Programa Académico</p>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-gray-600 uppercase">San Cristóbal de Las Casas</p>
            <p className="text-[10px] text-gray-400">Chiapas, México</p>
        </div>
      </div>

      {type === 'schedule' ? renderSchedule() : renderSymposiums()}
      
      <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-[9px] text-gray-400">
         <span>iaspm-al-2026.org</span>
         <span>Generado el {new Date().toLocaleDateString()}</span>
      </div>

      <style>{`
        @media print {
            @page { margin: 0.8cm; size: letter; }
            body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-color-adjust { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .break-inside-avoid { page-break-inside: avoid; }
            .print-container { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintableProgram;
