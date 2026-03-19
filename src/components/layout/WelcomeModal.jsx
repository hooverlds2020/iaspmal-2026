// src/components/layout/WelcomeModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'iaspm_welcome_shown';

const WelcomeModal = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-500"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#1e3a5f] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"
        >
          <X size={20} />
        </button>

        {/* Encabezado */}
        <div className="px-8 pt-8 pb-4 text-center">
          <p className="text-orange-400 font-black uppercase tracking-widest text-xs mb-1">
            XVII Congreso IASPM-AL • 2026
          </p>
          <h2 className="text-white font-black text-xl md:text-2xl uppercase italic">
            {isEs
              ? '¡Bienvenidos a San Cristóbal de Las Casas!'
              : 'Bem-vindos a San Cristóbal de Las Casas!'}
          </h2>
          <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">
            {isEs ? 'Sede del congreso' : 'Sede do congresso'}
          </p>
        </div>

        {/* Video embed YouTube */}
        <div className="mx-6 mb-6 rounded-2xl overflow-hidden aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src="https://www.youtube-nocookie.com/embed/6xqVSuuJYbE?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1"
            title="Bienvenida IASPM-AL 2026"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 flex justify-center">
          <button
            onClick={handleClose}
            className="bg-orange-400 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-xs px-8 py-3 rounded-full transition-all active:scale-95 shadow-lg"
          >
            {isEs ? 'Explorar el congreso' : 'Explorar o congresso'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
