// src/components/admin/SymposiumVenueManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SymposiumVenueManager = () => {
  const [symposiums, setSymposiums] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos al iniciar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Pedimos los simposios ordenados por nombre
      const { data: sympData, error: sympError } = await supabase
        .from('symposiums')
        .select('*')
        .order('id', { ascending: true }); // Ordenar por ID para que salgan 1, 2, 3...

      if (sympError) throw sympError;

      // Pedimos las sedes
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (venueError) throw venueError;

      setSymposiums(sympData);
      setVenues(venueData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar simposios o sedes');
    } finally {
      setLoading(false);
    }
  };

  // 2. Función para guardar el cambio de sede
  const handleVenueChange = async (symposiumId, newVenueId) => {
    try {
      // Si el valor es "", lo convertimos a null para limpiar la sede
      const venueValue = newVenueId === "" ? null : newVenueId;

      const { error } = await supabase
        .from('symposiums')
        .update({ venue_id: venueValue })
        .eq('id', symposiumId);

      if (error) throw error;

      // Actualizamos el estado local para que se refleje visualmente rápido
      setSymposiums(prev => prev.map(s => 
        s.id === symposiumId ? { ...s, venue_id: venueValue } : s
      ));

      toast.success('Sede asignada correctamente');
    } catch (error) {
      console.error('Error actualizando sede:', error);
      toast.error('No se pudo guardar la sede');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando Gestor de Sedes...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-iaspm-blue" />
            Asignación de Sedes
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define en qué edificio se llevará a cabo cada Simposio.
          </p>
        </div>
        <div className="bg-blue-100 text-iaspm-blue px-3 py-1 rounded-full text-xs font-bold">
          {symposiums.filter(s => s.venue_id).length} / {symposiums.length} Asignados
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {symposiums.map((symposium) => {
          // Buscamos si ya tiene sede para pintar el borde verde
          const hasVenue = !!symposium.venue_id;
          
          return (
            <div 
              key={symposium.id} 
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors ${hasVenue ? 'bg-green-50/30' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 min-w-[24px] h-6 flex items-center justify-center rounded-full text-xs font-bold ${hasVenue ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {symposium.id}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">
                      {symposium.name}
                    </h3>
                    {hasVenue ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 mt-1 font-medium">
                        <CheckCircle className="w-3 h-3" /> Sede Asignada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-orange-500 mt-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> Sin Sede
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:w-1/3">
                <select
                  value={symposium.venue_id || ""}
                  onChange={(e) => handleVenueChange(symposium.id, e.target.value)}
                  className={`w-full text-sm rounded-lg border focus:ring-2 focus:ring-iaspm-blue focus:border-transparent p-2.5 transition-all
                    ${hasVenue ? 'border-green-200 bg-white text-gray-900 font-medium shadow-sm' : 'border-gray-300 text-gray-500 bg-gray-50'}
                  `}
                >
                  <option value="">-- Seleccionar Sede --</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SymposiumVenueManager;
