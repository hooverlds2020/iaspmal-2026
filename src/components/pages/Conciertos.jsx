import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Facebook, Instagram, Youtube, ChevronLeft, ChevronRight, Music } from 'lucide-react';

// Estructura de datos de conciertos. Las imágenes van en /public/images/conciertos/
// Reemplazar los placeholders por los archivos reales que envíe la coordinación.
const CONCIERTOS = [
  {
    id: 'inauguracion',
    nombre: 'Gala de marimbas — Concierto inaugural',
    fecha: 'Lunes 28 de septiembre',
    hora: '',
    sede: '',
    fotos: [],
    redes: {},
  },
  {
    id: 'zak-tzebul',
    nombre: 'Zak Tzebul',
    fecha: 'Martes 29 de septiembre',
    hora: '',
    sede: '',
    fotos: [],
    redes: {},
  },
  {
    id: 'zeiba-kuicani',
    nombre: 'Zeiba Kuicani',
    fecha: 'Miércoles 30 de septiembre',
    hora: '7:00 PM',
    sede: 'Teatro Zebadúa',
    fotos: [
      '/images/conciertos/zeiba-kuicani/foto-1.jpg',
      '/images/conciertos/zeiba-kuicani/foto-2.jpg',
      '/images/conciertos/zeiba-kuicani/foto-3.jpg',
      '/images/conciertos/zeiba-kuicani/foto-4.jpg',
      '/images/conciertos/zeiba-kuicani/foto-5.jpg',
      '/images/conciertos/zeiba-kuicani/foto-6.jpg',
    ],
    redes: {
      facebook: 'Zeiba Kuicani -Tejedora de rimas-',
      instagram: '@zeiba_kuicani',
      instagram2: '@trío_zanate',
      youtube: 'Zeiba Kuicani',
    },
  },
  {
    id: 'canon-sonidero',
    nombre: 'Cañón del Sonidero — Concierto de cierre',
    fecha: 'Viernes 2 de octubre',
    hora: '',
    sede: '',
    fotos: [],
    redes: {},
  },
];

const Carrusel = ({ fotos, nombre }) => {
  const [idx, setIdx] = useState(0);
  if (!fotos || fotos.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200">
        <Music size={40} className="mb-2 opacity-40" />
        <span className="text-xs font-bold uppercase tracking-wide">Fotos próximamente</span>
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 group">
      <img src={fotos[idx]} alt={nombre} className="w-full h-full object-cover" />
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

const RedSocial = ({ Icon, label }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
    <Icon size={13} /> {label}
  </span>
);

const ConciertoCard = ({ c }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4">
      <Carrusel fotos={c.fotos} nombre={c.nombre} />
    </div>
    <div className="px-5 pb-5">
      <h3 className="text-lg font-black text-[#1e3a5f] leading-tight mb-2">{c.nombre}</h3>
      <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-orange-500" /> {c.fecha}</span>
        {c.hora && <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500" /> {c.hora}</span>}
        {c.sede && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500" /> {c.sede}</span>}
      </div>
      {(c.redes.facebook || c.redes.instagram || c.redes.youtube) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {c.redes.facebook && <RedSocial Icon={Facebook} label={c.redes.facebook} />}
          {c.redes.instagram && <RedSocial Icon={Instagram} label={c.redes.instagram} />}
          {c.redes.instagram2 && <RedSocial Icon={Instagram} label={c.redes.instagram2} />}
          {c.redes.youtube && <RedSocial Icon={Youtube} label={c.redes.youtube} />}
        </div>
      )}
    </div>
  </div>
);

const Conciertos = ({ lang }) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {CONCIERTOS.map(c => <ConciertoCard key={c.id} c={c} />)}
      </div>
    </div>
  );
};

export default Conciertos;
