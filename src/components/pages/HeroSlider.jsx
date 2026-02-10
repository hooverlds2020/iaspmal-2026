// src/components/pages/HeroSlider.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Music } from 'lucide-react';

// AHORA ACEPTAMOS DOS FUNCIONES DE NAVEGACIÓN
const HeroSlider = ({ lang, onNavigateToProgram, onNavigateToRegistration }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 1,
      type: 'welcome',
      title_es: "XVII Congreso IASPM-AL 2026",
      title_pt: "XVII Congresso IASPM-AL 2026",
      subtitle_es: "Ética, Política y Música Popular",
      subtitle_pt: "Ética, Política e Música Popular",
      desc_es: "Bienvenidos a San Cristóbal de Las Casas, Chiapas. Un espacio para repensar las intersecciones sonoras en América Latina.",
      desc_pt: "Bem-vindos a San Cristóbal de Las Casas, Chiapas. Um espaço para repensar as interseções sonoras na América Latina.",
      image: "/images/teatro.jpg", 
      colorClass: "bg-teal-900", 
      date: "28 Sep - 02 Oct, 2026"
    },
    {
      id: 2,
      type: 'symposium',
      title_es: "Simposio 3: Los corridos en el siglo XXI",
      title_pt: "Simpósio 3: Os corridos no século XXI",
      subtitle_es: "Nuevas tendencias: Tumbados y Bélicos",
      subtitle_pt: "Novas tendências: Tumbados e Bélicos",
      desc_es: "Análisis del impacto cultural, la industria y las narrativas de los corridos contemporáneos.",
      desc_pt: "Análise do impacto cultural, a indústria e as narrativas dos corridos contemporâneos.",
      image: "/images/el-carmen.jpg",
      colorClass: "bg-purple-900", 
      date: "Ver Programa"
    },
    {
      id: 3,
      type: 'plenary',
      title_es: "Convocatoria Abierta",
      title_pt: "Chamada Aberta",
      subtitle_es: "19 Simposios Temáticos Aprobados",
      subtitle_pt: "19 Simpósios Temáticos Aprovados",
      desc_es: "Desde Inteligencia Artificial en la música hasta políticas sonoras y disidencias. Participa con tu ponencia.",
      desc_pt: "Da Inteligência Artificial na música às políticas sonoras e dissidências. Participe com sua apresentação.",
      image: "/images/musac.jpg",
      colorClass: "bg-blue-900", 
      date: "Inscripciones Abiertas"
    }
  ];

  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 6000); 
    }
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[currentIndex];
  const isEs = lang === 'es';

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl h-[500px] transition-all duration-500 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`absolute inset-0 ${slide.colorClass}`}></div>
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 transition-transform duration-[6000ms] ease-linear"
            style={{ 
              backgroundImage: `url('${slide.image}')`,
              transform: index === currentIndex ? 'scale(1.1)' : 'scale(1)' 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
        </div>
      ))}

      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 text-white max-w-5xl">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium w-fit mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
          {currentSlide.type === 'symposium' ? <Music size={16} /> : <Calendar size={16} />}
          <span>{currentSlide.date}</span>
        </div>

        <h2 key={`title-${currentIndex}`} className="text-3xl md:text-5xl font-bold mb-2 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
          {isEs ? currentSlide.title_es : currentSlide.title_pt}
        </h2>

        <h3 key={`sub-${currentIndex}`} className="text-xl md:text-2xl text-teal-300 font-semibold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          {isEs ? currentSlide.subtitle_es : currentSlide.subtitle_pt}
        </h3>

        <p key={`desc-${currentIndex}`} className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          {isEs ? currentSlide.desc_es : currentSlide.desc_pt}
        </p>

        <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          {/* BOTÓN INSCRIBIRSE ARREGLADO */}
          <button 
            onClick={onNavigateToRegistration} 
            className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg hover:shadow-teal-500/30 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            {isEs ? 'Inscribirse' : 'Inscrever-se'}
            <ArrowRight size={18} />
          </button>
          
          {/* BOTÓN VER PROGRAMA ARREGLADO */}
          <button 
            onClick={onNavigateToProgram}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-xl font-bold transition flex items-center gap-2"
          >
            {isEs ? 'Ver Programa' : 'Ver Programa'}
          </button>
        </div>
      </div>

      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition opacity-0 group-hover:opacity-100">
        <ChevronLeft size={24} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition opacity-0 group-hover:opacity-100">
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-500 ${index === currentIndex ? 'bg-teal-400 w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
