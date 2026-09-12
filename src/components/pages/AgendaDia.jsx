// src/components/pages/AgendaDia.jsx
// Vista pública de la agenda de un solo día, pensada para abrirse desde un QR
// pegado en la puerta de las salas. Lee el día desde la URL (/agenda/:dia) y
// siempre muestra el estado ACTUAL en Supabase (nada de PDF congelado).
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, Clock, User, RefreshCw } from 'lucide-react';

// Mismo mapeo de fechas que usa Program.jsx — si cambian las fechas del
// congreso, actualizar en ambos lugares.
const DIA_A_FECHA = {
  lunes: '2026-09-28',
  martes: '2026-09-29',
  miercoles: '2026-09-30',
  jueves: '2026-10-01',
  viernes: '2026-10-02',
};

const DIA_LABEL = {
  lunes: 'Lunes 28 de Septiembre',
  martes: 'Martes 29 de Septiembre',
  miercoles: 'Miércoles 30 de Septiembre',
  jueves: 'Jueves 1 de Octubre',
  viernes: 'Viernes 2 de Octubre',
};

const BADGE_POR_TIPO = {
  libro: { label: 'Presentación de Publicaciones', className: 'bg-emerald-600' },
  plenaria: { label: 'Conferencia Plenaria', className: 'bg-amber-600' },
  conversatorio: { label: 'Conversatorio', className: 'bg-orange-600' },
  musica: { label: 'Concierto', className: 'bg-indigo-600' },
  concierto_estelar: { label: 'Concierto', className: 'bg-indigo-600' },
  inauguracion: { label: 'Inauguración', className: 'bg-indigo-600' },
};

const getBadge = (ev) => {
  if (ev.symposiums) {
    return { label: `Simposio ${ev.symposiums.id}`, className: 'bg-[#1e3a5f]' };
  }
  return BADGE_POR_TIPO[ev.event_type] || { label: 'General', className: 'bg-gray-400' };
};

const AgendaDia = () => {
  const { dia } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fecha = DIA_A_FECHA[dia];

  const fetchDia = async () => {
    if (!fecha) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select(`*, date, start_time, end_time, rooms(name, venues(name)), symposiums(id, name), presentations(*)`)
      .eq('date', fecha)
      .order('start_time');
    if (!error) {
      setSessions(data || []);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia]);

  if (!fecha) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800 mb-2">Día no reconocido</h1>
          <p className="text-gray-500 text-sm">
            Usa una URL como <code>/agenda/lunes</code>, <code>/agenda/martes</code>, etc.
          </p>
          <Link to="/" className="inline-block mt-4 text-[#1e3a5f] font-bold underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#1e3a5f] text-white px-4 py-6 text-center sticky top-0 z-10 shadow-md">
        <h1 className="text-lg font-black uppercase tracking-wide">XVIII Congreso IASPM-AL 2026</h1>
        <p className="text-sm font-bold opacity-90 mt-1">{DIA_LABEL[dia]}</p>
        <button
          onClick={fetchDia}
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
        {lastUpdated && (
          <p className="text-[10px] opacity-60 mt-1">
            Última actualización: {lastUpdated.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-3 pt-4 space-y-3">
        {loading && sessions.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">Cargando agenda...</p>
        )}

        {!loading && sessions.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">No hay actividades programadas para este día.</p>
        )}

        {sessions.map((ev) => {
          const badge = getBadge(ev);
          return (
            <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
              <div className="w-20 shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-center p-2">
                <span className="text-sm font-black text-[#1e3a5f]">{ev.start_time?.slice(0, 5)}</span>
                <div className="h-0.5 w-6 my-1 bg-gray-300"></div>
                <span className="text-xs font-bold text-gray-400">{ev.end_time?.slice(0, 5)}</span>
              </div>

              <div className="p-3 flex-1 min-w-0">
                <span className={`inline-block text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide mb-1.5 ${badge.className}`}>
                  {badge.label}
                </span>
                <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
                  {ev.symposiums?.name || ev.name}
                </h3>

                {ev.event_type === 'plenaria' && ev.plenaria_ponentes && (
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">
                    <User size={10} /> {ev.plenaria_ponentes}
                  </p>
                )}
                {ev.event_type === 'conversatorio' && ev.conversatorio_participantes && (
                  <p className="text-[10px] font-bold text-orange-600 uppercase mb-1 flex items-center gap-1">
                    <User size={10} /> {ev.conversatorio_participantes}
                  </p>
                )}
                {ev.event_type === 'libro' && ev.book_presenter && (
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                    <User size={10} /> Presenta: {ev.book_presenter}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                  <MapPin size={11} className="text-orange-500" />
                  <span className="text-[10px] font-bold uppercase truncate">
                    {ev.rooms?.venues?.name}{ev.rooms?.name ? ` · ${ev.rooms.name}` : ''}
                  </span>
                </div>

                {ev.presentations?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                    {ev.presentations
                      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                      .map((p) => (
                        <div key={p.id} className="text-[11px]">
                          {p.start_time && (
                            <span className="font-mono text-[9px] bg-gray-100 border border-gray-200 rounded px-1 mr-1.5">
                              {p.start_time.slice(0, 5)}
                            </span>
                          )}
                          <span className="font-bold">{p.title}</span>
                          {p.authors && (
                            <span className="block text-gray-500 uppercase text-[9.5px] pl-1">
                              {p.authors}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaDia;
