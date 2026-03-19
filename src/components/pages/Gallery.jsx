// src/components/pages/Gallery.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, X, ZoomIn, Image as ImageIcon, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// ✅ Los id deben coincidir EXACTAMENTE con los valores de fecha_tag en Supabase
const dates = [
  { id: '28 de Septiembre', es: '28 de Septiembre', pt: '28 de Setembro' },
  { id: '29 de Septiembre', es: '29 de Septiembre', pt: '29 de Setembro' },
  { id: '30 de Septiembre', es: '30 de Septiembre', pt: '30 de Setembro' },
  { id: '1 de Octubre',     es: '1 de Octubre',     pt: '1 de Outubro'   },
  { id: '2 de Octubre',     es: '2 de Octubre',     pt: '2 de Outubro'   },
];

const Gallery = ({ lang }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeDate, setActiveDate] = useState(dates[0].id);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('galeria')
          .select('*')
          .eq('activo', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // ✅ Filtra por fecha_tag (no orden_categoria)
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      if (!img.fecha_tag) return activeDate === '28 de Septiembre';
      return img.fecha_tag === activeDate;
    });
  }, [images, activeDate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-[#1e3a5f] mb-4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* TÍTULO Y DESCRIPCIÓN */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-blue-50 text-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-[#1e3a5f] uppercase tracking-tight mb-4 italic">
          {lang === 'es' ? 'Memoria Gráfica del Congreso' : 'Memória Gráfica do Congresso'}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {lang === 'es' 
            ? 'Explora los momentos más destacados del XVII Congreso de la IASPM-AL.' 
            : 'Explore os momentos mais marcantes do XVII Congresso da IASPM-AL.'}
        </p>
      </div>

      {/* PESTAÑAS DE FECHAS */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-30">
        {dates.map((date) => (
          <button
            key={date.id}
            onClick={() => setActiveDate(date.id)}
            className={`px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeDate === date.id 
                ? 'bg-[#1e3a5f] text-white shadow-md scale-105' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <CalendarDays size={16} className={activeDate === date.id ? 'text-orange-400' : ''} />
            <span>{lang === 'es' ? date.es : date.pt}</span>
          </button>
        ))}
      </div>

      {/* GRID MASONRY */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filteredImages.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic">
            {lang === 'es' ? 'No hay fotos para este día aún.' : 'Não há fotos para este dia ainda.'}
          </div>
        ) : (
          filteredImages.map((img) => (
            <div 
              key={img.id} 
              className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm border border-gray-200 bg-gray-100"
              onClick={() => setSelectedImage(img)}
            >
              <img 
                src={img.image_url} 
                alt={img.titulo} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#1e3a5f]/0 group-hover:bg-[#1e3a5f]/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn size={28} className="text-white" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* LIGHTBOX */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-8 right-8 text-white"><X size={32} /></button>
          <img src={selectedImage.image_url} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
          {selectedImage.titulo && (
            <p className="absolute bottom-10 text-white font-bold bg-black/50 px-6 py-2 rounded-full uppercase tracking-widest text-xs">
              {selectedImage.titulo}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;
