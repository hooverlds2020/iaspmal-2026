// src/components/pages/Gallery.jsx
import React, { useState, useMemo } from 'react';
import { CalendarDays, X, ZoomIn, Image as ImageIcon } from 'lucide-react';

const Gallery = ({ lang }) => {
  // 1. Definimos las fechas del congreso
  const dates = [
    { id: '28-sep', es: '28 de Septiembre', pt: '28 de Setembro' },
    { id: '29-sep', es: '29 de Septiembre', pt: '29 de Setembro' },
    { id: '30-sep', es: '30 de Septiembre', pt: '30 de Setembro' },
    { id: '01-oct', es: '1 de Octubre', pt: '1 de Outubro' },
    { id: '02-oct', es: '2 de Octubre', pt: '2 de Outubro' }
  ];

  const [activeDate, setActiveDate] = useState(dates[0].id);
  const [selectedImage, setSelectedImage] = useState(null);

  // 2. Generador de imágenes simuladas tipo Masonry (Alturas variadas)
  const imagesByDate = useMemo(() => {
    const generated = {};
    // Alturas aleatorias para romper la simetría cuadrada
    const heights = [500, 700, 900, 1100, 600, 800]; 
    
    dates.forEach(date => {
      // Generamos 8 imágenes por cada fecha
      generated[date.id] = Array.from({ length: 8 }).map((_, index) => {
        const randomHeight = heights[Math.floor(Math.random() * heights.length)];
        // Usamos una "semilla" (seed) para que la imagen sea aleatoria pero no cambie si recargas
        const seed = `iaspm-${date.id}-${index + 1}`; 
        return {
          id: `${date.id}-${index}`,
          url: `https://picsum.photos/seed/${seed}/800/${randomHeight}`,
          title: lang === 'es' ? `Actividad del ${date.es} - Foto ${index + 1}` : `Atividade de ${date.pt} - Foto ${index + 1}`
        };
      });
    });
    return generated;
  }, [lang]);

  const currentImages = imagesByDate[activeDate] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* TÍTULO Y DESCRIPCIÓN */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 text-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-[#1e3a5f] uppercase tracking-tight mb-4">
          {lang === 'es' ? 'Memoria Gráfica del Congreso' : 'Memória Gráfica do Congresso'}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {lang === 'es' 
            ? 'Explora los momentos más destacados del XVII Congreso de la IASPM-AL, organizados por día de actividad.' 
            : 'Explore os momentos mais marcantes do XVII Congresso da IASPM-AL, organizados por dia de atividade.'}
        </p>
      </div>

      {/* PESTAÑAS DE FECHAS (TABS) */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 sticky top-[80px] z-30">
        {dates.map((date) => (
          <button
            key={date.id}
            onClick={() => setActiveDate(date.id)}
            className={`px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeDate === date.id 
                ? 'bg-[#1e3a5f] text-white shadow-md scale-105' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <CalendarDays size={16} className={activeDate === date.id ? 'text-iaspm-orange' : ''} />
            <span className="hidden sm:inline">{lang === 'es' ? date.es : date.pt}</span>
            <span className="sm:hidden">{date.id.replace('-', ' ')}</span>
          </button>
        ))}
      </div>

      {/* GALERÍA MASONRY (El truco está en: columns-X y break-inside-avoid) */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {currentImages.map((img) => (
          <div 
            key={img.id} 
            className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-gray-100"
            onClick={() => setSelectedImage(img)}
          >
            {/* Imagen principal */}
            <img 
              src={img.url} 
              alt={img.title} 
              loading="lazy"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* Capa oscura que aparece al pasar el mouse */}
            <div className="absolute inset-0 bg-[#1e3a5f]/0 group-hover:bg-[#1e3a5f]/50 transition-colors duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg border border-white/30">
                <ZoomIn size={28} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VISOR DE IMÁGENES AMPLIADAS (LIGHTBOX) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title} 
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white mt-6 font-bold tracking-widest uppercase text-sm bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">
              {selectedImage.title}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;
