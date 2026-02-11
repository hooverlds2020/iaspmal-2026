// src/components/pages/HeroSlider.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Calendar } from 'lucide-react';

const HeroSlider = ({ lang, setCurrentPage }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/images/musac.jpg", 
      title: { es: "Convocatoria Abierta", pt: "Chamada Aberta" },
      subtitle: { es: "19 Simposios Temáticos Aprobados", pt: "19 Simpósios Temáticos Aprovados" },
      desc: { 
        es: "Desde Inteligencia Artificial en la música hasta políticas sonoras y disidencias. Participa con tu ponencia.", 
        pt: "Da Inteligência Artificial na música às políticas sonoras e dissidências. Participe com sua apresentação." 
      },
      primaryBtn: { label: { es: "Inscribirse", pt: "Inscrever-se" }, action: "cuotas" },
      secondaryBtn: { label: { es: "Ver Programa", pt: "Ver Programa" }, action: "programa" }
    },
    {
      id: 2,
      image: "/images/teatro.jpg", 
      title: { es: "XVII Congreso IASPM-AL", pt: "XVII Congresso IASPM-AL" },
      subtitle: { es: "San Cristóbal de Las Casas 2026", pt: "San Cristóbal de Las Casas 2026" },
      desc: { 
        es: "Un encuentro para debatir sobre ética, política y música popular en el corazón de Chiapas.", 
        pt: "Um encontro para debater ética, política e música popular no coração de Chiapas." 
      },
      primaryBtn: { label: { es: "Ver Sedes", pt: "Ver Locais" }, action: "sedes" },
      secondaryBtn: { label: { es: "Más Información", pt: "Mais Informações" }, action: "llamada" }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[600px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-xl group bg-gray-900">
      
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear transform scale-105"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-iaspm-blue via-iaspm-blue/80 to-transparent md:bg-gradient-to-r md:from-iaspm-blue md:via-iaspm-blue/70 md:to-transparent"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center md:justify-start">
            
            {/* CORRECCIÓN VISUAL: pb-20 en móvil (padding-bottom 80px) */}
            {/* Esto sube el contenido lo suficiente para que no lo tapen los puntos */}
            <div className="max-w-3xl px-6 md:px-12 text-white w-full pt-10 md:pt-0 pb-20 md:pb-0">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs md:text-sm font-medium mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-iaspm-orange" />
                <span>28 Sept - 02 Oct, 2026</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                {lang === 'es' ? slide.title.es : slide.title.pt}
              </h2>

              <p className="text-lg md:text-2xl font-medium text-iaspm-orange mb-3 md:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                {lang === 'es' ? slide.subtitle.es : slide.subtitle.pt}
              </p>

              <p className="text-base md:text-lg text-gray-200 mb-6 md:mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 leading-relaxed">
                {lang === 'es' ? slide.desc.es : slide.desc.pt}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 z-30 relative">
                
                <button 
                  onClick={() => setCurrentPage(slide.primaryBtn.action)}
                  className="bg-iaspm-orange hover:bg-orange-600 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-bold transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
                >
                  {lang === 'es' ? slide.primaryBtn.label.es : slide.primaryBtn.label.pt}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button 
                  onClick={() => setCurrentPage(slide.secondaryBtn.action)}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-3.5 rounded-lg font-semibold transition-all hover:border-white text-sm md:text-base cursor-pointer"
                >
                  {lang === 'es' ? slide.secondaryBtn.label.es : slide.secondaryBtn.label.pt}
                </button>
              </div>

            </div>
          </div>
        </div>
      ))}

      <button onClick={prevSlide} className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-iaspm-orange text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-30">
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button onClick={nextSlide} className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-iaspm-orange text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-30">
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Puntos de navegación */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide 
                ? 'w-6 md:w-8 bg-iaspm-orange' 
                : 'w-1.5 md:w-2 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>

    </div>
  );
};

export default HeroSlider;
