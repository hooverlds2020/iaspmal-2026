import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ActividadesExtra({ lang, tipo }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('actividades_extra')
      .select('*')
      .eq('tipo', tipo)
      .order('orden', { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) console.error('Error cargando actividades_extra:', error);
        setItems(data || []);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [tipo]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">{lang === 'es' ? 'Cargando...' : 'Carregando...'}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        {lang === 'es' ? 'Contenido en preparación.' : 'Conteúdo em preparação.'}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {items.map((a) => (
        <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          {a.cartel_url && (
            <img
              src={a.cartel_url}
              alt={a.titulo}
              className="w-full h-auto max-w-md mx-auto rounded-lg mb-4 border border-gray-200"
            />
          )}
          <div className="text-sm text-orange-500 font-black uppercase tracking-wide">
            {a.fecha}{a.hora ? ` · ${a.hora}` : ''}
          </div>
          <h3 className="text-lg font-black text-blue-900 mt-1">{a.titulo}</h3>
          {a.ubicacion && (
            <p className="text-sm text-gray-600 mt-1">
              {a.link_mapa ? (
                <a href={a.link_mapa} target="_blank" rel="noreferrer" className="underline hover:text-orange-500">
                  {a.ubicacion}
                </a>
              ) : a.ubicacion}
            </p>
          )}
          {a.descripcion && (
            <p className="mt-3 whitespace-pre-line text-gray-800 text-sm leading-relaxed">
              {a.descripcion}
            </p>
          )}
          {a.contacto && (
            <p className="mt-3 text-sm italic text-gray-500">
              {lang === 'es' ? 'Contacto: ' : 'Contato: '}{a.contacto}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
