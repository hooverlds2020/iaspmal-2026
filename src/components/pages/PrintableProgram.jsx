// src/components/pages/PrintableProgram.jsx
import React from 'react';

const cleanCoordinators = (data) => {
  if (!data) return '';
  if (Array.isArray(data)) return data.join(', ');
  if (typeof data === 'string') {
    return data.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  }
  return data;
};

const PrintableProgram = ({ events, type, lang }) => {
  // Ordenar eventos por hora para la agenda
  const sortedEvents = type === 'schedule' 
    ? [...events].sort((a, b) => a.start_time.localeCompare(b.start_time))
    : events;

  return (
    <div className="p-8 bg-white text-black font-serif print-content">
      {/* Encabezado Institucional */}
      <div className="text-center border-b-2 border-black pb-4 mb-8">
        <h1 className="text-2xl font-bold uppercase text-black">XVIII Congreso de la IASPM-AL 2026</h1>
        <p className="text-lg italic text-black">Ética, política y música popular</p>
        <p className="text-sm mt-1 text-black">28 de septiembre al 2 de octubre de 2026</p>
        <div className="mt-4 bg-gray-100 py-2 border-y border-black">
          <h2 className="text-md font-bold uppercase tracking-widest text-black">
            {type === 'schedule' ? 'PROGRAMA GENERAL DE ACTIVIDADES (AGENDA)' : 'LISTADO DETALLADO DE SIMPOSIOS Y PONENCIAS'}
          </h2>
        </div>
      </div>

      {/* --- VISTA A: LISTADO DE SIMPOSIOS --- */}
      {type === 'symposiums' && (
        <div className="space-y-8">
          {events.map((s) => (
            <div key={s.id} className="avoid-break border-b border-gray-300 pb-6">
              <h2 className="text-xl font-bold leading-tight">
                Simposio {s.id}: {s.name}
              </h2>
              <div className="mt-2 mb-3 text-sm">
                <span className="font-bold uppercase text-xs">Coordinación: </span>
                {cleanCoordinators(s.coordinator)}
              </div>
              <div className="text-sm text-justify mb-4 italic leading-relaxed">
                {s.description || "Sin descripción disponible."}
              </div>
              {s.presentations && s.presentations.length > 0 && (
                <div className="ml-6 border-l border-black pl-4">
                  <h3 className="text-xs font-bold uppercase mb-2">Trabajos Aceptados:</h3>
                  <div className="space-y-3">
                    {s.presentations.map((p) => (
                      <div key={p.id} className="text-sm">
                        {/* AJUSTE: Hora en la vista de simposios */}
                        {p.start_time && (
                          <p className="text-[10px] font-bold text-gray-600 mb-0.5">
                            {p.start_time.substring(0, 5)} - {p.end_time.substring(0, 5)} 
                            {p.duration_minutes ? ` (${p.duration_minutes} min)` : ''}
                          </p>
                        )}
                        <p className="font-bold leading-tight">" {p.title} "</p>
                        <p className="text-xs uppercase mt-1 italic">{p.authors}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- VISTA B: AGENDA DE ACTIVIDADES (TABLA) --- */}
      {type === 'schedule' && (
        <div className="w-full">
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 w-24 uppercase text-xs">Horario</th>
                <th className="border border-black p-2 uppercase text-xs">Actividad / Mesa / Ponencias</th>
                <th className="border border-black p-2 w-48 uppercase text-xs">Sede / Sala</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((session) => (
                <tr key={session.id} className="avoid-break">
                  <td className="border border-black p-3 text-center align-top font-bold">
                    {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                  </td>
                  
                  <td className="border border-black p-3 align-top">
                    <div className="font-black text-base uppercase mb-1">{session.name}</div>
                    <div className="text-xs italic text-gray-700 mb-3 border-b border-gray-100 pb-1">
                      {session.symposiums?.name}
                    </div>
                    
                    {session.presentations && session.presentations.length > 0 ? (
                      <ul className="space-y-2 ml-2">
                        {session.presentations.sort((a,b) => (a.start_time || '').localeCompare(b.start_time || '')).map(p => (
                          <li key={p.id} className="text-[11px] leading-tight mb-2">
                            {/* AJUSTE: Bloque de hora solicitado */}
                            <div className="text-[9px] font-bold text-gray-500 uppercase mb-0.5">
                              Hora: {p.start_time?.substring(0, 5)} - {p.end_time?.substring(0, 5)} 
                              {p.duration_minutes ? ` (${p.duration_minutes} min)` : ''}
                            </div>
                            <span className="font-bold uppercase tracking-tighter">• {p.authors}:</span>
                            <span className="ml-1 italic">"{p.title}"</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[10px] text-gray-400">Sin ponencias asignadas</span>
                    )}
                  </td>

                  <td className="border border-black p-3 align-top">
                    <div className="font-bold text-xs uppercase text-teal-800">
                      {session.rooms?.venues?.name}
                    </div>
                    <div className="text-sm font-medium mt-1">
                      {session.rooms?.name}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Estilos CSS para el PDF */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: letter; margin: 1.5cm; }
          body { 
            -webkit-print-color-adjust: exact; 
            background-color: white !important;
            color: black !important;
          }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          .print-content { width: 100%; }
          table { width: 100%; border-spacing: 0; }
          th { background-color: #f3f4f6 !important; color: black !important; }
        }
      `}} />
    </div>
  );
};

export default PrintableProgram;
