// src/components/admin/SymposiumVenueManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, CheckCircle2, AlertCircle, Building2, Search, DoorOpen, Plus, Trash2, Edit2, Save, X, Map, AlignLeft, UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SymposiumVenueManager = () => {
  // --- ESTADOS GENERALES ---
  const [activeTab, setActiveTab] = useState('assign');
  const [loading, setLoading] = useState(true);

  // --- ESTADOS TAB 1: ASIGNACIÓN ---
  const [symposiums, setSymposiums] = useState([]);
  const [venues, setVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS TAB 2: GESTIÓN (CRUD) ---
  const [rooms, setRooms] = useState([]);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeVenueIdForRoom, setActiveVenueIdForRoom] = useState(null);
  
  // Estados para Modal de Confirmación
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });

  // Estados para Subida de Imagen y Formulario Completo de Sede
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [venueForm, setVenueForm] = useState({
    name: '',
    address: '',
    description: '',
    map_url: '',
    image_url: ''
  });

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

  // --- LÓGICA DE SUBIDA DE IMAGEN A SUPABASE (BUCKET: venues) ---
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error("Por favor selecciona un archivo de imagen válido");
    }

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      // Intentar subir al bucket 'venues' (requiere que el bucket sea PUBLICO)
      const { error: uploadError } = await supabase.storage
        .from('venues')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage
        .from('venues')
        .getPublicUrl(fileName);

      setVenueForm({ ...venueForm, image_url: data.publicUrl });
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen. Verifica el bucket 'venues' en Supabase.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- LÓGICA TAB 1: ASIGNACIÓN A SIMPOSIOS ---
  const handleVenueChange = async (symposiumId, newVenueId) => {
    try {
      const venueValue = newVenueId === "" ? null : newVenueId;
      const { error } = await supabase.from('symposiums').update({ venue_id: venueValue }).eq('id', symposiumId);
      if (error) throw error;
      setSymposiums(prev => prev.map(s => s.id === symposiumId ? { ...s, venue_id: venueValue } : s));
      toast.success('Asignación actualizada correctamente');
    } catch (error) {
      toast.error('No se pudo actualizar la sede');
    }
  };

  const filtered = symposiums.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- LÓGICA TAB 2: GESTIÓN DE CATÁLOGO (CRUD) ---
  const startEditingVenue = (venue = null) => {
    if (venue) {
      setEditingVenue(venue.id);
      setVenueForm({
        name: venue.name || '',
        address: venue.address || '',
        description: venue.description || '',
        map_url: venue.map_url || '',
        image_url: venue.image_url || ''
      });
    } else {
      setEditingVenue('new');
      setVenueForm({ name: '', address: '', description: '', map_url: '', image_url: '' });
    }
  };

  const cancelEditingVenue = () => {
    setEditingVenue(null);
    setVenueForm({ name: '', address: '', description: '', map_url: '', image_url: '' });
  };

  const saveVenue = async (id = null) => {
    if (!venueForm.name.trim()) return toast.error("El nombre de la sede es obligatorio");
    try {
      if (id && id !== 'new') {
        const { error } = await supabase.from('venues').update(venueForm).eq('id', id);
        if (error) throw error;
        toast.success("Sede actualizada correctamente");
      } else {
        const { error } = await supabase.from('venues').insert([venueForm]);
        if (error) throw error;
        toast.success("Sede creada correctamente");
      }
      cancelEditingVenue();
      fetchData();
    } catch (error) { toast.error("Error al guardar la sede en la base de datos"); }
  };

  const saveRoom = async (id = null, venue_id) => {
    if (!newRoomName.trim()) return toast.error("El nombre de la sala no puede estar vacío");
    try {
      if (id) {
        const { error } = await supabase.from('rooms').update({ name: newRoomName }).eq('id', id);
        if (error) throw error;
        toast.success("Sala actualizada");
      } else {
        const { error } = await supabase.from('rooms').insert([{ name: newRoomName, venue_id }]);
        if (error) throw error;
        toast.success("Sala creada");
      }
      setEditingRoom(null);
      setNewRoomName('');
      setActiveVenueIdForRoom(null);
      fetchData();
    } catch (error) { toast.error("Error al guardar sala"); }
  };

  // --- LÓGICA DEL MODAL DE CONFIRMACIÓN CUSTOM TAILWIND ---
  const handleDeleteClick = (type, id) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const confirmDeleteAction = async () => {
    if (!deleteModal.id) return;
    try {
      if (deleteModal.type === 'venue') {
        const { error } = await supabase.from('venues').delete().eq('id', deleteModal.id);
        if (error) throw error;
        toast.success("Sede eliminada permanentemente");
      } else if (deleteModal.type === 'room') {
        const { error } = await supabase.from('rooms').delete().eq('id', deleteModal.id);
        if (error) throw error;
        toast.success("Sala eliminada");
      }
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar. Puede que tenga salas o simposios asociados.");
    } finally {
      setDeleteModal({ isOpen: false, type: null, id: null });
    }
  };

  // ==========================================
  // --- COMPONENTE DEL FORMULARIO (FIXED) ---
  // ==========================================
  // Esta vista reemplaza el amontonamiento de image_11.png. 
  // Da ancho completo a los inputs para que se puedan editar bien.
  const renderVenueForm = (id) => (
    <div className="bg-white p-6 border-b border-gray-100 space-y-6 animate-in slide-in-from-top-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subida de Imagen (Col Izquierda) */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-2">Fotografía (Opcional)</label>
          <div 
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            className={`relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer group
              ${venueForm.image_url ? 'border-transparent bg-gray-50' : 'border-blue-200 hover:border-[#1e3a5f] bg-blue-50/30'}
              ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            {uploadingImage ? (
              <div className="flex flex-col items-center text-[#1e3a5f]">
                <Loader2 className="animate-spin mb-2" size={28} />
                <span className="text-xs font-bold uppercase tracking-widest">Subiendo...</span>
              </div>
            ) : venueForm.image_url ? (
              <><img src={venueForm.image_url} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-[#1e3a5f]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center"><Edit2 size={24} className="text-white mb-2" /><span className="text-white text-xs font-bold uppercase">Cambiar Foto</span></div></>
            ) : (
              <div className="flex flex-col items-center text-blue-400 group-hover:text-[#1e3a5f] transition-colors p-6 text-center"><UploadCloud size={36} className="mb-3" /><span className="text-xs font-bold uppercase tracking-widest mb-1">Subir Imagen</span></div>
            )}
          </div>
        </div>

        {/* Datos de la sede (Col Derecha) - FIXED:inputs anchos */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-1">Nombre Completo *</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border outline-none border-gray-200 focus:border-[#1e3a5f] text-sm font-bold bg-gray-50 focus:bg-white" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} placeholder="Ej. Centro Cultural El Carmen..." />
          </div>
          
          <div>
            {/* Mejorado: Label claro y espacio amplio para editar */}
            <label className="block text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-1">Dirección Corta / Zona (📍)</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3.5 text-teal-600" />
              <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none border-gray-200 focus:border-[#1e3a5f] text-sm font-bold bg-gray-50 focus:bg-white transition-all" value={venueForm.address} onChange={e => setVenueForm({...venueForm, address: e.target.value})} placeholder="Ej. Zona Centro o Campus III" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-1">Descripción</label>
            <div className="relative">
              <AlignLeft size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <textarea className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none border-gray-200 focus:border-[#1e3a5f] text-sm font-bold h-24 resize-none bg-gray-50 focus:bg-white" value={venueForm.description} onChange={e => setVenueForm({...venueForm, description: e.target.value})} placeholder="Breve descripción del lugar..."></textarea>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-1">Enlace Google Maps</label>
            <div className="relative"><Map size={18} className="absolute left-3 top-3.5 text-gray-400" /><input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none border-gray-200 focus:border-[#1e3a5f] text-sm font-bold bg-gray-50 focus:bg-white" value={venueForm.map_url} onChange={e => setVenueForm({...venueForm, map_url: e.target.value})} placeholder="URL..." /></div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <button onClick={() => setEditingVenue(null)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs uppercase rounded-xl transition-colors">Cancelar</button>
        <button onClick={() => saveVenue(id)} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-2 transition-colors shadow-sm"><Save size={16}/> Guardar Sede</button>
      </div>
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="space-y-6 animate-in fade-in pb-10 relative">
      
      {/* HEADER PREMIUM Y TABS */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto"><div className="bg-blue-50 p-3 rounded-2xl text-[#1e3a5f] shadow-sm"><MapPin size={28} strokeWidth={2} /></div><div><h2 className="text-xl font-black text-[#1e3a5f] uppercase italic tracking-tight">Sedes y Espacios</h2></div></div>
        <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
            <button onClick={() => setActiveTab('assign')} className={`flex-1 md:px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'assign' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Asignar a Simposios</button>
            <button onClick={() => setActiveTab('manage')} className={`flex-1 md:px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'manage' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Gestionar Catálogo</button>
        </div>
      </div>

      {loading ? (
         <div className="p-20 text-center flex flex-col items-center justify-center text-[#1e3a5f]"><Loader2 className="animate-spin mb-4" size={32} /></div>
      ) : (
        <>
          {/* TAB 1: ASIGNACIÓN */}
          {activeTab === 'assign' && (
              <div className="grid gap-4">
                 {symposiums.map(symp => (
                    <div key={symp.id} className="p-5 bg-white rounded-2xl border shadow-sm flex items-center gap-5">
                       <h3 className="flex-1 font-bold">{symp.name}</h3>
                       <select className="w-full md:w-80 px-4 py-3 rounded-xl border outline-none font-bold" value={symp.venue_id || ""} onChange={(e) => handleVenueChange(symp.id, e.target.value)}>
                          <option value="">-- Seleccionar --</option>
                          {venues.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
                       </select>
                    </div>
                 ))}
              </div>
          )}

          {/* TAB 2: CATÁLOGO */}
          {activeTab === 'manage' && (
             <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
                   <h3 className="font-black text-[#1e3a5f] uppercase flex items-center gap-2"><Building2 size={18}/> Catálogo</h3>
                   {editingVenue !== 'new' && <button onClick={() => startEditingVenue()} className="bg-[#1e3a5f] hover:bg-black text-white px-6 py-2.5 rounded-xl font-black uppercase text-sm flex gap-2"><Plus size={16}/> Nueva Sede</button>}
                </div>

                {editingVenue === 'new' && <div className="bg-white rounded-2xl border-2 border-[#1e3a5f] shadow-xl overflow-hidden animate-in slide-in-from-top-4">{renderVenueForm('new')}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {venues.map(venue => {
                      const venueRooms = rooms.filter(r => r.venue_id === venue.id);
                      return (
                         <div key={venue.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300">
                            {editingVenue === venue.id ? renderVenueForm(venue.id) : (
                               <>
                                 <div className="relative overflow-hidden bg-[#1e3a5f] h-32">
                                    {venue.image_url && <img src={venue.image_url} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute bottom-5 left-6">
                                      <h3 className="font-black text-white text-xl leading-tight">{venue.name}</h3>
                                      {venue.address && <p className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> {venue.address}</p>}
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => startEditingVenue(venue)} className="p-2 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-lg backdrop-blur-sm"><Edit2 size={16}/></button>
                                       {/* FIXED: Llamada al modal de confirmación custome */}
                                       <button onClick={() => handleDeleteClick('venue', venue.id)} className="p-2 bg-white/20 hover:bg-white text-white hover:text-red-600 rounded-lg backdrop-blur-sm"><Trash2 size={16}/></button>
                                    </div>
                                 </div>

                                 <div className="p-6 flex-1 bg-white">
                                    <div className="space-y-2 mb-4">
                                       {venueRooms.map(room => (
                                          <div key={room.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 group/room hover:border-blue-100 transition-colors">
                                             {editingRoom === room.id ? (
                                                <div className="flex flex-1 items-center gap-2"><input type="text" autoFocus className="flex-1 px-3 py-1.5 border border-blue-200 rounded-lg font-bold" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveRoom(room.id, venue.id)} /><button onClick={() => saveRoom(room.id, venue.id)} className="text-emerald-600"><Save size={16}/></button><button onClick={() => {setEditingRoom(null); setNewRoomName('');}} className="text-gray-400"><X size={16}/></button></div>
                                             ) : (
                                                <><span className="font-bold text-sm text-gray-700 flex items-center gap-2"><DoorOpen size={16} className="text-gray-400"/> {room.name}</span>
                                                <div className="flex gap-2 opacity-0 group-hover/room:opacity-100 transition-opacity">
                                                   <button onClick={() => {setEditingRoom(room.id); setNewRoomName(room.name);}} className="text-blue-500 hover:text-blue-700"><Edit2 size={16}/></button>
                                                   {/* FIXED: Llamada al modal custome */}
                                                   <button onClick={() => handleDeleteClick('room', room.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                                </div></>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                    {activeVenueIdForRoom === venue.id ? (
                                       <div className="flex gap-2 items-center mt-4 bg-blue-50 p-2 rounded-xl border border-blue-200"><input type="text" autoFocus placeholder="Nombre sala..." className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveRoom(null, venue.id)} /><button onClick={() => saveRoom(null, venue.id)} className="p-2.5 bg-[#1e3a5f] text-white rounded-lg"><Save size={16}/></button></div>
                                    ) : (
                                       <button onClick={() => {setActiveVenueIdForRoom(venue.id); setNewRoomName('');}} className="w-full py-3 mt-2 text-xs font-black text-[#1e3a5f] uppercase border-2 border-dashed border-gray-200 rounded-xl hover:bg-blue-50 flex justify-center items-center gap-2 transition-colors"><Plus size={14}/> Añadir Sala</button>
                                    )}
                                 </div>
                               </>
                            )}
                         </div>
                      );
                   })}
                </div>
             </div>
          )}
        </>
      )}

      {/* ========================================== */}
      {/* --- MODAL DE CONFIRMACIÓN CUSTOME TAILWIND --- */}
      {/* ========================================== */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <AlertCircle size={44} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-[#1e3a5f] mb-3 leading-tight">
                ¿Eliminar {deleteModal.type === 'venue' ? 'Sede?' : 'Sala?'}
              </h3>
              <p className="text-gray-500 text-sm mb-9 font-medium leading-relaxed">
                {deleteModal.type === 'venue' 
                  ? 'Esta acción es irreversible y podría afectar simposios y salas asociadas. ¿Estás absolutamente seguro?'
                  : 'Esta sala será borrada permanentemente de la base de datos.'}
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={confirmDeleteAction}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sí, eliminar para siempre
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })}
                  className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm uppercase rounded-xl transition-colors"
                >
                  No, cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SymposiumVenueManager;
