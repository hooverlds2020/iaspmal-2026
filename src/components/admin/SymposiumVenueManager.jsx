// src/components/admin/SymposiumVenueManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, CheckCircle2, AlertCircle, Building2, Search } from 'lucide-react';
import { toast } from 'sonner';

const SymposiumVenueManager = () => {
  // --- ESTADOS ---
  const [symposiums, setSymposiums] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- CÁLCULOS DE PROGRESO ---
  const assignedCount = symposiums.filter(s => s.venue_id).length;
  const totalCount = symposiums.length;
  const progressPercent = totalCount > 0 ? (assignedCount / totalCount) * 100 : 0;

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sympRes, venueRes] = await Promise.all([
        supabase.from('symposiums').select('*').order('id', { ascending: true }),
        supabase.from('venues').select('*').order('name')
      ]);

      if (sympRes.error) throw sympRes.error;
      if (venueRes.error) throw venueRes.error;

      setSymposiums(sympRes.data || []);
      setVenues(venueRes.data || []);
    } catch (error) {
      toast.error('Error al cargar datos de sedes');
    } finally {
      setLoading(false);
    }
  };

  // --- MANEJADOR DE CAMBIO ---
  const handleVenueChange = async (symposiumId, newVenueId) => {
    try {
      const venueValue = newVenueId === "" ? null : newVenueId;
      const { error } = await supabase
        .from('symposiums')
        .update({ venue_id: venueValue })
        .eq('id', symposiumId);

      if (error) throw error;

      setSymposiums(prev => prev.map(s =>
        s.id === symposiumId ? { ...s, venue_id: venueValue } : s
      ));

      // Feedback visual inteligente
      if (venueValue) {
        const venueName = venues.find(v => v.id.toString() === venueValue)?.name;
        toast.success(`Asignado correctamente a: ${venueName}`);
      } else {
        toast.info('Asignación eliminada. Simposio sin sede.');
      }
    } catch (error) {
      toast.error('No se pudo actualizar la sede');
    }
  };

  // Filtro de búsqueda
  const filtered = symposiums.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
      {/* --- HEADER PREMIUM --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="bg-blue-50 p-3 rounded-2xl text-[#1e3a5f] shadow-sm">
              <MapPin size={28} strokeWidth={2} />
           </div>
           <div>
              <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic tracking-tight">Asignación de Sedes</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                 Control de Espacios Físicos
              </p>
           </div>
        </div>

        {/* Barra de Progreso */}
        <div className="flex-1 w-full md:mx-8">
           <div className="flex justify-between text-[10px] font-black uppercase mb-2 text-gray-400 tracking-wider">
              <span>Progreso de Asignación</span>
              <span className={progressPercent === 100 ? "text-emerald-600" : "text-[#1e3a5f]"}>
                 {assignedCount} de {totalCount} Completados
              </span>
           </div>
           <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                className={`h-full transition-all duration-700 ease-out ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#1e3a5f]'}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
           </div>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72 shrink-0">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input
             type="text"
             placeholder="Buscar simposio..."
             className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-[#1e3a5f] text-sm font-bold transition-all shadow-sm"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* --- LISTADO DE TARJETAS --- */}
      <div className="grid gap-4">
         {loading ? (
            <div className="p-20 text-center text-gray-400 italic">Cargando asignaciones...</div>
         ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed">
               No se encontraron simposios coincidentes.
            </div>
         ) : (
            filtered.map(symp => {
               const isAssigned = !!symp.venue_id;
               
               return (
                  <div key={symp.id} className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-center gap-5 group ${isAssigned ? 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                     
                     {/* ID Badge */}
                     <div className="shrink-0">
                        <span className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-sm shadow-sm transition-colors ${isAssigned ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-400'}`}>
                           {symp.id}
                        </span>
                     </div>
                     
                     {/* Info Text */}
                     <div className="flex-1 text-center md:text-left w-full">
                        <h3 className={`font-bold text-base leading-tight mb-2 ${isAssigned ? 'text-gray-800' : 'text-gray-500'}`}>
                           {symp.name}
                        </h3>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                           {isAssigned ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                 <CheckCircle2 size={12} /> Sede Asignada
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                                 <AlertCircle size={12} /> Requiere Asignación
                              </span>
                           )}
                        </div>
                     </div>

                     {/* Selector de Sede */}
                     <div className="w-full md:w-80 shrink-0">
                        <div className="relative group/select">
                           <Building2 size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isAssigned ? 'text-[#1e3a5f]' : 'text-gray-400 group-hover/select:text-gray-600'}`} />
                           <select
                              className={`w-full pl-10 pr-10 py-3.5 rounded-xl border outline-none font-bold text-sm appearance-none cursor-pointer transition-all shadow-sm ${
                                 isAssigned 
                                    ? 'border-gray-200 bg-white text-gray-800 focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-50 hover:border-blue-300' 
                                    : 'border-gray-300 bg-white text-gray-500 focus:border-[#1e3a5f] hover:border-gray-400'
                              }`}
                              value={symp.venue_id || ""}
                              onChange={(e) => handleVenueChange(symp.id, e.target.value)}
                           >
                              <option value="">-- Seleccionar Edificio --</option>
                              {venues.map(v => (
                                 <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                           </select>
                           
                           {/* Icono Chevron custom */}
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                           </div>
                        </div>
                     </div>
                  </div>
               );
            })
         )}
      </div>
    </div>
  );
};

export default SymposiumVenueManager;
