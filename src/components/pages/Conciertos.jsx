import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const formatFecha = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dia = DIAS[date.getDay()];
  const diaCap = dia.charAt(0).toUpperCase() + dia.slice(1);
  return `${diaCap} ${date.getDate()} de ${MESES[date.getMonth()]}`;
};

const formatHora = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

const Carrusel = ({ fotos, nombre }) => {
  const [idx, setIdx] = useState(0);
  const [pausado, setPausado] = useState(false);

  React.useEffect(() => {
    if (!fotos || fotos.length <= 1 || pausado) return;
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % fotos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [fotos, pausado]);

  if (!fotos || fotos.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200">
        <Music size={40} className="mb-2 opacity-40" />
        <span className="text-xs font-bold uppercase tracking-wide">Fotos próximamente</span>
      </div>
    );
  }
  return (
    <div
      className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 group"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <img src={fotos[idx]} alt={nombre} className="w-full h-full object-cover transition-opacity duration-500" />
      {fotos.length > 1 && (
        <>
          <button
            onClick={() => setIdx((idx - 1 + fotos.length) % fotos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setIdx((idx + 1) % fotos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {fotos.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ConciertoCard = ({ c }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4">
      <Carrusel fotos={c.fotos} nombre={c.nombre} />
    </div>
    <div className="px-5 pb-5">
      {c.estelar && (
        <span className="inline-block bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-2">
          Concierto Estelar
        </span>
      )}
      <h3 className="text-lg font-black text-[#1e3a5f] leading-tight mb-1">{c.nombre}</h3>
      {c.repertorio && (
        <p className="text-sm text-gray-500 italic mb-2">{c.repertorio}</p>
      )}
      <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-orange-500" /> {c.fecha}</span>
        {c.hora && <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500" /> {c.hora}</span>}
        {c.sede && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> {c.sede}</span>}
      </div>
    </div>
  </div>
);

const Conciertos = ({ lang }) => {
  const [conciertos, setConciertos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConciertos = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, date, start_time, event_type, concierto_grupo, concierto_titulo, concierto_fotos, rooms(name, venues(name))')
          .in('event_type', ['musica', 'concierto_estelar', 'inauguracion'])
          .not('concierto_grupo', 'is', null)
          .order('date');

        if (error) throw error;

        const mapped = (data || []).map(s => ({
          id: s.id,
          nombre: s.concierto_grupo,
          repertorio: s.concierto_titulo && s.concierto_titulo !== s.concierto_grupo ? s.concierto_titulo : '',
          estelar: s.event_type === 'concierto_estelar',
          fecha: formatFecha(s.date),
          hora: formatHora(s.start_time),
          sede: s.rooms?.venues?.name ? `${s.rooms.venues.name}${s.rooms.name ? ' · ' + s.rooms.name : ''}` : '',
          fotos: s.concierto_fotos || [],
        }));

        setConciertos(mapped);
      } catch (err) {
        console.error('Error cargando conciertos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConciertos();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="w-full aspect-[4/5] bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (conciertos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Music size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-bold">Próximamente anunciaremos los conciertos del congreso.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {conciertos.map(c => <ConciertoCard key={c.id} c={c} />)}
      </div>
    </div>
  );
};

export default Conciertos;
