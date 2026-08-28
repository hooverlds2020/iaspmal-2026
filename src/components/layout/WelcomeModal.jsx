// src/components/layout/WelcomeModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'iaspm_welcome_shown';

// 28 de septiembre 2026, 9:00 am hora de Chiapas (UTC-6)
const TARGET_DATE = new Date('2026-09-28T09:00:00-06:00').getTime();

function getRemaining() {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function useCountdown() {
  const [time, setTime] = useState(getRemaining());
  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function FlipUnit({ value, label }) {
  const padded = String(value).padStart(2, '0');
  const [display, setDisplay] = useState(padded);
  const [prev, setPrev] = useState(padded);
  const [flipping, setFlipping] = useState(false);
  const prevValRef = useRef(padded);

  useEffect(() => {
    if (padded !== prevValRef.current) {
      setPrev(prevValRef.current);
      setDisplay(padded);
      setFlipping(true);
      prevValRef.current = padded;
      const t = setTimeout(() => setFlipping(false), 550);
      return () => clearTimeout(t);
    }
  }, [padded]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[52px] h-[68px] sm:w-[68px] sm:h-[88px]" style={{ perspective: '300px' }}>
        {/* base con el valor actual */}
        <div className="absolute inset-0 rounded-md overflow-hidden bg-white/10 border border-white/15">
          <div className="absolute inset-0 flex items-center justify-center font-black text-2xl sm:text-3xl text-white tabular-nums">
            {display}
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-black/30" />
        </div>

        {/* tarjeta que voltea mostrando el valor anterior */}
        {flipping && (
          <div
            className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-md bg-white/15 border border-white/15 border-b-0 origin-bottom"
            style={{ animation: 'flipDown 550ms cubic-bezier(.4,0,.2,1) forwards' }}
          >
            <div className="absolute inset-x-0 bottom-0 h-[152%] flex items-start justify-center font-black text-2xl sm:text-3xl text-white tabular-nums">
              {prev}
            </div>
          </div>
        )}
      </div>
      <span className="text-[9px] sm:text-[11px] tracking-[0.2em] uppercase text-white/50 font-bold">
        {label}
      </span>
      <style>{`
        @keyframes flipDown {
          0% { transform: rotateX(0deg); opacity: 1; }
          100% { transform: rotateX(-90deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

const WelcomeModal = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { days, hours, minutes, seconds } = useCountdown();

  useEffect(() => {
    // Si ya se mostró en esta sesión, no volver a mostrar
    const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyShown) return;

    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'home') {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true'); // marca como visto
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const isEs = lang !== 'pt';

  const t = isEs
    ? {
        eyebrow: 'XVII Congreso IASPM-AL • 2026',
        title: '¡Bienvenidos a San Cristóbal de Las Casas!',
        subtitle: 'Sede del congreso',
        countTitle: 'Faltan',
        countSubtitle: 'para el inicio del congreso',
        days: 'Días',
        hours: 'Horas',
        min: 'Min',
        sec: 'Seg',
        cta: 'Explorar el congreso',
      }
    : {
        eyebrow: 'XVII Congresso IASPM-AL • 2026',
        title: 'Bem-vindos a San Cristóbal de Las Casas!',
        subtitle: 'Sede do congresso',
        countTitle: 'Faltam',
        countSubtitle: 'para o início do congresso',
        days: 'Dias',
        hours: 'Horas',
        min: 'Min',
        sec: 'Seg',
        cta: 'Explorar o congresso',
      };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-500"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#1e3a5f] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500"
        onClick={e => e.stopPropagation()}
      >
        {/* textura sutil de fondo */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(251,146,60,0.35) 0, transparent 45%), radial-gradient(circle at 85% 85%, rgba(255,255,255,0.15) 0, transparent 45%)',
          }}
        />

        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"
        >
          <X size={20} />
        </button>

        {/* Encabezado */}
        <div className="relative px-8 pt-8 pb-2 text-center">
          <p className="text-orange-400 font-black uppercase tracking-widest text-xs mb-1">
            {t.eyebrow}
          </p>
          <h2 className="text-white font-black text-xl md:text-2xl uppercase italic">
            {t.title}
          </h2>
          <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">
            {t.subtitle}
          </p>
        </div>

        {/* Contador */}
        <div className="relative px-8 pt-4 pb-2 flex flex-col items-center">
          <p className="text-white font-black text-lg uppercase italic">
            {t.countTitle}
          </p>
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-5">
            {t.countSubtitle}
          </p>

          <div className="flex items-start gap-2 sm:gap-3">
            <FlipUnit value={days} label={t.days} />
            <span className="text-white/25 text-xl sm:text-2xl pt-3 sm:pt-4">:</span>
            <FlipUnit value={hours} label={t.hours} />
            <span className="text-white/25 text-xl sm:text-2xl pt-3 sm:pt-4">:</span>
            <FlipUnit value={minutes} label={t.min} />
            <span className="text-white/25 text-xl sm:text-2xl pt-3 sm:pt-4">:</span>
            <FlipUnit value={seconds} label={t.sec} />
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-8 pt-6 pb-8 flex justify-center">
          <button
            onClick={handleClose}
            className="bg-orange-400 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-xs px-8 py-3 rounded-full transition-all active:scale-95 shadow-lg"
          >
            {t.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
