import React from 'react';

// Función auxiliar para limpiar nombres de coordinadores
const cleanCoordinators = (data) => {
  if (!data) return '';
  if (Array.isArray(data)) return data.join(', ');
  if (typeof data === 'string') {
    return data.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  }
  return data;
};

const PrintableProgram = ({ events, type }) => {

  // Lógica de ordenamiento específica para impresión
  const sortedEvents = React.useMemo(() => {
    if (!events) return [];

    if (type === 'schedule') {
      // Ordenar Agenda: Fecha -> Hora
      return [...events].sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.start_time || '').localeCompare(b.start_time || '');
      });
    }

    // Ordenar Simposios: Estrictamente 1 al 18
    return [...events].sort((a, b) => a.id - b.id);
  }, [events, type]);

  return (
    <div className="print-container font-serif text-black bg-white p-8 w-full max-w-none">

      {/* --- ENCABEZADO FORMAL (SOLO SALE AL IMPRIMIR) --- */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide">XVIII Congreso IASPM-AL 2026</h1>
        <p className="text-lg italic mt-1">"Ética, política y música popular"</p>
        <p className="text-sm mt-1 uppercase tracking-widest text-gray-600">
          San Cristóbal de las Casas, Chiapas • 28 Sep - 2 Oct 2026
        </p>
        <div className="mt-4 py-2 bg-gray-100 border-y border-gray-300">
          <h2 className="text-md font-black uppercase tracking-widest">
            {type === 'schedule' ? 'PROGRAMA GENERAL DE ACTIVIDADES' : 'RELACIÓN DE SIMPOSIOS Y PONENCIAS'}
          </h2>
        </div>
      </div>

      {/* --- VISTA A: SIMPOSIOS (LISTADO LIMPIO) --- */}
      {type === 'symposiums' && (
        <div className="space-y-8">
          {sortedEvents.map((s) => (
            <div key={s.id} className="avoid-break border-b border-gray-300 pb-6 last:border-0">
              
              {/* Encabezado del Simposio */}
              <div className="mb-3">
                <span className="inline-block bg-black text-white text-xs font-bold px-2 py-1 mb-1 rounded-sm uppercase">
                  Simposio {s.id}
                </span>
                <h3 className="text-xl font-bold leading-tight inline-block ml-2">{s.name}</h3>
              </div>

              {/* Coordinación */}
              <div className="mb-4 text-sm text-gray-700 bg-gray-50 p-2 border-l-2 border-gray-400">
                <span className="font-bold uppercase text-xs mr-2 text-black">Coordinación:</span>
                {cleanCoordinators(s.coordinators || s.coordinator)}
              </div>

              {/* Lista de Ponencias */}
              {s.presentations && s.presentations.length > 0 ? (
                <div className="ml-4">
                   <h4 className="text-xs font-bold uppercase border-b border-gray-400 pb-1 mb-2 inline-block">
                     Ponencias ({s.presentations.length})
                   </h4>
                   <div className="grid grid-cols-1 gap-3">
                     {s.presentations.sort((a,b) => (a.authors||'').localeCompare(b.authors||'')).map((p, idx) => (
                       <div key={p.id} className="text-sm pl-3 border-l border-gray-300">
                         {/* AJUSTE: HORA EN LA LISTA DE SIMPOSIOS */}
                         <div className="mb-0.5">
                            <span className="font-bold text-black leading-snug">
                              {idx + 1}. {p.title}
                            </span>
                            {p.start_time && (
                              <span className="ml-2 font-mono text-xs font-bold bg-gray-100 px-1 border border-gray-300 rounded text-gray-700">
                                {p.start_time.slice(0,5)} - {p.end_time?.slice(0,5)}
                              </span>
                            )}
                         </div>
                         <p className="text-xs text-gray-600 uppercase mt-0.5">
                           {p.authors} 
                           {p.author_affiliation && <span className="normal-case italic text-gray-500"> — {p.author_affiliation}</span>}
                         </p>
                       </div>
                     ))}
                   </div>
                </div>
              ) : (
                <p className="text-xs italic text-gray-400 ml-4">Sin ponencias registradas.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- VISTA B: AGENDA (TABLA COMPACTA) --- */}
      {type === 'schedule' && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="p-2 text-left w-24 uppercase text-xs font-black">Horario</th>
              <th className="p-2 text-left uppercase text-xs font-black">Actividad</th>
              <th className="p-2 text-left w-40 uppercase text-xs font-black">Sede</th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((ev) => (
              <tr key={ev.id} className="avoid-break border-b border-gray-200">
                <td className="p-2 align-top font-bold text-xs whitespace-nowrap bg-gray-50 text-center">
                  {ev.start_time?.substring(0,5)} <br/> a <br/> {ev.end_time?.substring(0,5)}
                </td>
                <td className="p-2 align-top">
                  {ev.symposiums && (
                    <span className="inline-block bg-gray-200 text-[9px] font-bold px-1 rounded mb-1 uppercase border border-gray-300">
                      Simposio {ev.symposiums.id}
                    </span>
                  )}
                  <div className="font-bold uppercase text-sm leading-tight mt-1">{ev.name}</div>
                  <div className="text-xs italic text-gray-600 mb-2">
                    {ev.symposiums?.name || 'Evento General'}
                  </div>

                  {/* Ponencias dentro de la mesa */}
                  {ev.presentations && ev.presentations.length > 0 && (
                    <ul className="ml-2 space-y-1 mt-2 border-l-2 border-gray-300 pl-2">
                      {ev.presentations
                        .sort((a,b) => (a.start_time || '').localeCompare(b.start_time || ''))
                        .map(p => (
                        <li key={p.id} className="text-[11px] leading-tight mb-1.5">
                          {/* AJUSTE: HORA EN LA AGENDA */}
                          {p.start_time && (
                            <span className="font-mono text-[10px] font-bold text-gray-700 bg-gray-100 px-1 rounded border border-gray-200 mr-1.5">
                              {p.start_time.slice(0,5)}
                            </span>
                          )}
                          <span className="font-bold">"{p.title}"</span> 
                          <span className="text-gray-500 italic uppercase text-[9px]"> - {p.authors}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="p-2 align-top bg-gray-50 text-xs">
                  <div className="font-bold uppercase">{ev.rooms?.venues?.name}</div>
                  <div className="text-gray-600 italic">{ev.rooms?.name}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ESTILOS ESPECÍFICOS PARA EL PDF */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: letter; margin: 1.5cm; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          h1, h2, h3, h4 { color: black !important; }
          a { text-decoration: none; color: black; }
        }
      `}} />
    </div>
  );
};

export default PrintableProgram;
