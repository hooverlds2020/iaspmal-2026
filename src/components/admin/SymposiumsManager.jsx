// src/components/admin/SymposiumsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BookOpen, Users, MapPin, Loader2 } from 'lucide-react';

const SymposiumsManager = () => {
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSymposiums();
  }, []);

  const fetchSymposiums = async () => {
    try {
      setLoading(true);
      // Seleccionamos ID, Nombre, Coordinador y Sede (con el nombre de la sede)
      const { data, error } = await supabase
        .from('symposiums')
        .select(`
          *,
          venues ( name )
        `)
        .order('id', { ascending: true }); // Ordenamos por ID

      if (error) throw error;
      setSymposiums(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los simposios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-iaspm-blue" /></div>;
  
  if (error) return (
    <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
      {error}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-iaspm-blue" />
          Listado de Simposios ({symposiums.length})
        </h2>
        {/* Botón desactivado por ahora ya que cargamos los 18 fijos */}
        {/* <button className="bg-iaspm-blue text-white px-4 py-2 rounded-lg text-sm">Nuevo Simposio</button> */}
      </div>

      <div className="grid gap-4">
        {symposiums.map((symposium) => (
          <div key={symposium.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-iaspm-blue text-xs font-bold px-2 py-0.5 rounded-full">
                    ID: {symposium.id}
                  </span>
                  {symposium.venues ? (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {symposium.venues.name}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                      Sin Sede Asignada
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                  {symposium.name}
                </h3>
                
                {symposium.coordinator && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Coordinador:</span> {symposium.coordinator}
                  </p>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SymposiumsManager;
