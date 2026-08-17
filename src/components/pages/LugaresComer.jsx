// src/components/pages/LugaresComer.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Coffee, ExternalLink, Loader2 } from 'lucide-react';

const LugaresComer = ({ lang }) => {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('restaurantes').select('*').order('orden', { ascending: true }).order('created_at', { ascending: false });
      setLugares(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest">Cargando...</p>
      </div>
    );
  }

  if (lugares.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Coffee size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">{lang === 'es' ? 'Información próximamente.' : 'Informação em breve.'}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {lang === 'es'
          ? 'San Cristóbal cuenta con una oferta gastronómica muy amplia y variada. Les compartimos algunas recomendaciones de cafés, restaurantes y bares que pueden considerar durante su estancia:'
          : 'San Cristóbal conta com uma oferta gastronômica muito ampla e variada. Compartilhamos algumas recomendações de cafés, restaurantes e bares que podem considerar durante sua estadia:'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lugares.map(item => {
          const Card = (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
              <div className="h-36 bg-gray-50 overflow-hidden flex items-center justify-center">
                {item.imagen_url
                  ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                  : <Coffee size={28} className="text-gray-300" />
                }
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-black text-[#1e3a5f] leading-tight flex items-center gap-1.5">
                  {item.nombre}
                  {item.url && <ExternalLink size={13} className="text-gray-300" />}
                </h3>
                {item.recomendacion && (
                  <p className="text-xs text-gray-600 mt-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5 leading-relaxed">
                    {item.recomendacion}
                  </p>
                )}
              </div>
            </div>
          );
          return item.url
            ? <a key={item.id} href={item.url} target="_blank" rel="noreferrer">{Card}</a>
            : <div key={item.id}>{Card}</div>;
        })}
      </div>
    </div>
  );
};

export default LugaresComer;
