// src/components/admin/SymposiumVenueManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, CheckCircle2, AlertCircle, Building2, Search, DoorOpen, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const SymposiumVenueManager = () => {
  // --- ESTADOS GENERALES ---
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' o 'manage'
  const [loading, setLoading] = useState(true);

  // --- ESTADOS TAB 1: ASIGNACIÓN ---
  const [symposiums, setSymposiums] = useState([]);
  const [venues, setVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS TAB 2: GESTIÓN (CRUD) ---
  const [rooms, setRooms] = useState([]);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newVenueName, setNewVenueName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [activeVenueIdForRoom, setActiveVenueIdForRoom] = useState(null);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sympRes, venueRes, roomRes] = await Promise.all([
        supabase.from('symposiums').select('*').order('id', { ascending: true }),
        supabase.from('venues').select('*').order('name'),
        supabase.from('rooms').select('*').order('name')
      ]);

      if (sympRes.error) throw sympRes.error;
      if (venueRes.error) throw venueRes.error;
      if (roomRes.error) throw roomRes.error;

      setSymposiums(sympRes.data || []);
      setVenues(venueRes.data || []);
      setRooms(roomRes.data || []);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LÓGICA TAB 1: ASIGNACIÓN
  // ==========================================
  const assignedCount = symposiums.filter(s => s.venue_id).length;
  const totalCount = symposiums.length;
  const progressPercent = totalCount > 0 ? (assignedCount / totalCount) * 100 : 0;

  const handleVenueChange = async (symposiumId, newVenueId) => {
    try {
      const venueValue = newVenueId === "" ? null : newVenueId;
      const { error } = await supabase.from('symposiums').update({ venue_id: venueValue }).eq('id', symposiumId);
      if (error) throw error;
      setSymposiums(prev => prev.map(s => s.id === symposiumId ? { ...s, venue_id: venueValue } : s));
      
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

  const filtered = symposiums.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ==========================================
  // LÓGICA TAB 2: GESTIÓN DE SEDES Y SALAS
  // ==========================================
  const saveVenue = async (id = null) => {
    if (!newVenueName.trim()) return toast.error("El nombre de la sede no puede estar vacío");
    try {
      if (id) {
        // Actualizar
        const { error } = await supabase.from('venues').update({ name: newVenueName }).eq('id', id);
        if (error) throw error;
        toast.success("Sede actualizada");
      } else {
        // Crear
        const { error } = await supabase.from('venues').insert([{ name: newVenueName }]);
        if (error) throw error;
        toast.success("Sede creada");
      }
      setEditingVenue(null);
      setNewVenueName('');
      fetchData();
    } catch (error) { toast.error(error.message); }
  };

  const deleteVenue = async (id) => {
    if (!window.confirm("¿Estás seguro? Esto podría afectar las salas y simposios asignados.")) return;
    try {
      const { error } = await supabase.from('venues').delete().eq('id', id);
      if (error) throw error;
      toast.success("Sede eliminada");
      fetchData();
    } catch (error) { toast.error("Error al eliminar (Verifica que no tenga salas asignadas)"); }
  };

  const saveRoom = async (id = null, venue_id) => {
    if (!newRoomName.trim()) return toast.error("El nombre de la sala no puede estar vacío");
    try {
      if (id) {
        // Actualizar
        const { error } = await supabase.from('rooms').update({ name: newRoomName }).eq('id', id);
        if (error) throw error;
        toast.success("Sala actualizada");
      } else {
        // Crear
        const { error } = await supabase.from('rooms').insert([{ name: newRoomName, venue_id }]);
        if (error) throw error;
        toast.success("Sala creada");
      }
      setEditingRoom(null);
      setNewRoomName('');
      setActiveVenueIdForRoom(null);
      fetchData();
    } catch (error) { toast.error(error.message); }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("¿Eliminar esta sala?")) return;
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      toast.success("Sala eliminada");
      fetchData();
    } catch (error) { toast.error("Error al eliminar"); }
  };


  // --- RENDERIZADO ---
  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
      {/* --- HEADER PREMIUM Y TABS --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="bg-blue-50 p-3 rounded-2xl text-[#1e3a5f] shadow-sm">
                  <MapPin size={28} strokeWidth={2} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic tracking-tight">Sedes y Espacios</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                     Control integral de recintos
                  </p>
               </div>
            </div>

            {/* TABS DE NAVEGACIÓN */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('assign')}
                  className={`flex-1 md:px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'assign' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Asignar a Simposios
                </button>
                <button 
                  onClick={() => setActiveTab('manage')}
                  className={`flex-1 md:px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'manage' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Gestionar Catálogo
                </button>
            </div>
        </div>

        {/* Barra de Progreso (Solo visible en tab de asignación) */}
        {activeTab === 'assign' && (
            <div className="flex flex-col md:flex-row items-center gap-6 border-t border-gray-100 pt-6">
                <div className="flex-1 w-full">
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

                <div className="relative w-full md:w-72 shrink-0">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input type="text" placeholder="Buscar simposio..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-[#1e3a5f] text-sm font-bold transition-all shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
        )}
      </div>

      {loading ? (
         <div className="p-20 text-center text-gray-400 font-bold tracking-widest uppercase">Cargando datos...</div>
      ) : (
        <>
          {/* ========================================== */}
          {/* VISTA 1: ASIGNACIÓN (EL CÓDIGO ORIGINAL)   */}
          {/* ========================================== */}
          {activeTab === 'assign' && (
              <div className="grid gap-4 animate-in fade-in">
                 {filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed">No se encontraron simposios coincidentes.</div>
                 ) : (
                    filtered.map(symp => {
                       const isAssigned = !!symp.venue_id;
                       return (
                          <div key={symp.id} className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-center gap-5 group ${isAssigned ? 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                             <div className="shrink-0">
                                <span className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-sm shadow-sm transition-colors ${isAssigned ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-400'}`}>{symp.id}</span>
                             </div>
                             <div className="flex-1 text-center md:text-left w-full">
                                <h3 className={`font-bold text-base leading-tight mb-2 ${isAssigned ? 'text-gray-800' : 'text-gray-500'}`}>{symp.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                   {isAssigned ? (
                                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"><CheckCircle2 size={12} /> Sede Asignada</span>
                                   ) : (
                                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100"><AlertCircle size={12} /> Requiere Asignación</span>
                                   )}
                                </div>
                             </div>
                             <div className="w-full md:w-80 shrink-0">
                                <div className="relative group/select">
                                   <Building2 size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isAssigned ? 'text-[#1e3a5f]' : 'text-gray-400 group-hover/select:text-gray-600'}`} />
                                   <select
                                      className={`w-full pl-10 pr-10 py-3.5 rounded-xl border outline-none font-bold text-sm appearance-none cursor-pointer transition-all shadow-sm ${isAssigned ? 'border-gray-200 bg-white text-gray-800 focus:border-[#1e3a5f] hover:border-blue-300' : 'border-gray-300 bg-white text-gray-500 focus:border-[#1e3a5f] hover:border-gray-400'}`}
                                      value={symp.venue_id || ""}
                                      onChange={(e) => handleVenueChange(symp.id, e.target.value)}
                                   >
                                      <option value="">-- Seleccionar Edificio --</option>
                                      {venues.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
                                   </select>
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
          )}

          {/* ========================================== */}
          {/* VISTA 2: GESTIÓN DE CATÁLOGO (CRUD)        */}
          {/* ========================================== */}
          {activeTab === 'manage' && (
             <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                
                {/* Crear Nueva Sede */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                   <div>
                      <h3 className="font-black text-[#1e3a5f] uppercase tracking-wide flex items-center gap-2"><Building2 size={18}/> Agregar Nueva Sede</h3>
                      <p className="text-xs text-gray-500 mt-1">Registra un nuevo edificio o facultad para el congreso.</p>
                   </div>
                   {editingVenue === 'new' ? (
                      <div className="flex w-full md:w-auto items-center gap-2">
                         <input type="text" autoFocus placeholder="Nombre de la sede..." className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-bold w-full md:w-64 outline-none focus:border-[#1e3a5f]" value={newVenueName} onChange={e => setNewVenueName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveVenue()} />
                         <button onClick={() => saveVenue()} className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Save size={18}/></button>
                         <button onClick={() => {setEditingVenue(null); setNewVenueName('');}} className="p-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"><X size={18}/></button>
                      </div>
                   ) : (
                      <button onClick={() => {setEditingVenue('new'); setNewVenueName('');}} className="w-full md:w-auto bg-[#1e3a5f] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                         <Plus size={16}/> Nueva Sede
                      </button>
                   )}
                </div>

                {/* Listado de Sedes y sus Salas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {venues.map(venue => {
                      const venueRooms = rooms.filter(r => r.venue_id === venue.id);
                      return (
                         <div key={venue.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            
                            {/* Cabecera de la Sede */}
                            <div className="bg-gray-50 border-b border-gray-200 p-5 flex justify-between items-center group">
                               {editingVenue === venue.id ? (
                                  <div className="flex flex-1 items-center gap-2 mr-4">
                                     <input type="text" autoFocus className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold outline-none" value={newVenueName} onChange={e => setNewVenueName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveVenue(venue.id)} />
                                     <button onClick={() => saveVenue(venue.id)} className="p-2 bg-emerald-500 text-white rounded-lg"><Save size={16}/></button>
                                     <button onClick={() => {setEditingVenue(null); setNewVenueName('');}} className="p-2 bg-gray-200 text-gray-600 rounded-lg"><X size={16}/></button>
                                  </div>
                               ) : (
                                  <h3 className="font-black text-[#1e3a5f] text-lg flex items-center gap-2"><Building2 size={20} className="text-gray-400"/> {venue.name}</h3>
                               )}
                               
                               {editingVenue !== venue.id && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => {setEditingVenue(venue.id); setNewVenueName(venue.name);}} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 size={16}/></button>
                                     <button onClick={() => deleteVenue(venue.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                                  </div>
                               )}
                            </div>

                            {/* Listado de Salas */}
                            <div className="p-5 flex-1 bg-white">
                               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Salas / Aulas asignadas</h4>
                               
                               <div className="space-y-2 mb-4">
                                  {venueRooms.length === 0 && <p className="text-xs text-gray-400 italic">No hay salas registradas.</p>}
                                  {venueRooms.map(room => (
                                     <div key={room.id} className="flex justify-between items-center bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-100 group/room">
                                        {editingRoom === room.id ? (
                                           <div className="flex flex-1 items-center gap-2">
                                              <input type="text" autoFocus className="flex-1 px-2 py-1 rounded border text-xs font-bold" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveRoom(room.id, venue.id)} />
                                              <button onClick={() => saveRoom(room.id, venue.id)} className="text-emerald-600"><Save size={14}/></button>
                                              <button onClick={() => {setEditingRoom(null); setNewRoomName('');}} className="text-gray-400"><X size={14}/></button>
                                           </div>
                                        ) : (
                                           <>
                                              <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><DoorOpen size={14} className="text-gray-400"/> {room.name}</span>
                                              <div className="flex gap-2 opacity-0 group-hover/room:opacity-100 transition-opacity">
                                                 <button onClick={() => {setEditingRoom(room.id); setNewRoomName(room.name);}} className="text-blue-500 hover:text-blue-700"><Edit2 size={14}/></button>
                                                 <button onClick={() => deleteRoom(room.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                              </div>
                                           </>
                                        )}
                                     </div>
                                  ))}
                               </div>

                               {/* Agregar Sala */}
                               {activeVenueIdForRoom === venue.id ? (
                                  <div className="flex items-center gap-2 mt-2">
                                     <input type="text" autoFocus placeholder="Nombre de sala..." className="flex-1 px-3 py-2 rounded-lg border text-xs font-bold outline-none border-blue-200 focus:border-[#1e3a5f]" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveRoom(null, venue.id)} />
                                     <button onClick={() => saveRoom(null, venue.id)} className="p-2 bg-emerald-500 text-white rounded-lg"><Save size={14}/></button>
                                     <button onClick={() => {setActiveVenueIdForRoom(null); setNewRoomName('');}} className="p-2 bg-gray-100 text-gray-500 rounded-lg"><X size={14}/></button>
                                  </div>
                               ) : (
                                  <button onClick={() => {setActiveVenueIdForRoom(venue.id); setNewRoomName('');}} className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:text-[#1e3a5f] mt-2">
                                     <Plus size={14}/> Añadir Sala
                                  </button>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default SymposiumVenueManager;
