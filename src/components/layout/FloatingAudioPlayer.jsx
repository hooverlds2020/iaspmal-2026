// src/components/layout/FloatingAudioPlayer.jsx
import React, { useState, useRef } from 'react';
import { Music, Pause } from 'lucide-react';

const FloatingAudioPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/tortuga-arenal.mp3" loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? 'Pausar música' : 'Reproducir música'}
        className={`fixed bottom-5 right-5 z-[150] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 ${
          playing ? 'bg-orange-500 text-white' : 'bg-[#1e3a5f] text-white'
        }`}
      >
        {playing ? (
          <Pause size={22} />
        ) : (
          <Music size={22} className="animate-pulse" />
        )}
      </button>
      {playing && (
        <span className="fixed bottom-8 right-24 z-[150] bg-[#1e3a5f] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg hidden sm:block">
          🎵 La tortuga del arenal
        </span>
      )}
    </>
  );
};

export default FloatingAudioPlayer;
