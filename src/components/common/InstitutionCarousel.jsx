import React, { useState, useEffect } from 'react';

const InstitutionCarousel = ({ lang }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    '/images/carrusel_instituciones_1.png',
    '/images/carrusel_instituciones_2.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="border-t border-gray-200 pt-10 pb-4">
      <p className="text-center text-xs text-gray-400 font-bold mb-8 uppercase tracking-[0.2em]">
        {lang === 'es' ? 'Instituciones Convocantes' : 'Instituições Convocantes'}
      </p>
      
      {/* Contenedor con altura fija para evitar saltos de layout */}
      <div className="relative h-48 md:h-64 w-full flex justify-center items-center overflow-hidden">
        {slides.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex justify-center items-center ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={src}
              alt="Instituciones Convocantes"
              className="max-h-full max-w-full object-contain px-4"
              // Agregamos un error handler por si la imagen no carga
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutionCarousel;
