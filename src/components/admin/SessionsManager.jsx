// src/components/admin/SessionsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, Clock, MapPin, Plus, Trash2, Save, X, FileText, CheckSquare, Square, Edit, Filter } from 'lucide-react';
import { toast } from 'sonner';

const SessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [rooms, setRooms] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Modal y Datos
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const [formData, setFormData] = useState({
    symposium_id: '',
    name: '',
    room_id: '',
    date: '',
    start_time: '',
    end_time: ''
  });

  // Estados Derivados
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedVenueName, setSelectedVenueName] = useState('');
  
  // ESTADO PARA PONENCIAS
  const [symposiumPresentations, setSymposiumPresentations] = useState([]); 
  const [selectedPresentationIds, setSelectedPresentationIds] = useState([]); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Cargar Sesiones
      const { data: sessionsData, error: sError } = await supabase
        .from('sessions')
        .select(`*, symposiums (name, venue_id), rooms (name, venue_id, venues (name))`)
        .order('date', { ascending: true });
      if (sError) throw sError;

      // Cargar Simposios
      const { data: sympData, error: symError } = await supabase
        .from('symposiums').select('*').order('id');
      if (symError) throw symError;

      // Cargar Salas
      const { data: roomData, error: rError } = await supabase
        .from('rooms').select('*, venues(name, id)');
      if (rError) throw rError;

      setSessions(sessionsData);
      setSymposiums(sympData);
      setRooms(roomData);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando datos base');
    } finally {
      setLoading(false);
    }
  };

  // Lógica: Cargar Ponencias cuando cambia el Simposio
  const handleSymposiumChange = async (symposiumId) => {
    setFormData(prev => ({ ...prev, symposium_id: symposiumId, room_id: '' }));
    
    // 1. Filtrar Salas (Sedes)
    const selectedSymp = symposiums.find(s => s.id.toString() === symposiumId);
    if (selectedSymp && selectedSymp.venue_id) {
      const filtered = rooms.filter(r => r.venue_id === selectedSymp.venue_id);
      setAvailableRooms(filtered);
      setSelectedVenueName(filtered[0]?.venues?.name || '');
    } else {
      setAvailableRooms([]);
      setSelectedVenueName('');
    }

    // 2. Cargar Ponencias
    if (symposiumId) {
      // Traemos TODAS las del simposio (incluyendo su session_id para saber si están ocupadas)
      const { data, error } = await supabase
        .from('presentations')
        .select('id, title, authors, session_id')
        .eq('symposium_id', symposiumId)
        .order('title'); 

      if (!error) {
        setSymposiumPresentations(data);
      }
    } else {
      setSymposiumPresentations([]);
    }
  };

  // Abrir Modal
  const openModal = async (session = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        symposium_id: session.symposium_id,
        name: session.name,
        room_id: session.room_id,
        date: session.date,
        start_time: session.start_time,
        end_time: session.end_time
      });
      
      await handleSymposiumChange(session.symposium_id.toString());
      setFormData(prev => ({ ...prev, room_id: session.room_id }));

      // Pre-seleccionar las de esta mesa
      const { data: currentPres } = await supabase
        .from('presentations')
        .select('id')
        .eq('session_id', session.id);
      
      if (currentPres) {
        setSelectedPresentationIds(currentPres.map(p => p.id));
      }

    } else {
      setEditingSession(null);
      setFormData({ symposium_id: '', name: '', room_id: '', date: '', start_time: '', end_time: '' });
      setSelectedPresentationIds([]);
      setSymposiumPresentations([]);
      setAvailableRooms([]);
    }
    setShowModal(true);
  };

  const togglePresentation = (id) => {
    if (selectedPresentationIds.includes(id)) {
      setSelectedPresentationIds(prev => prev.filter(pId => pId !== id));
    } else {
      setSelectedPresentationIds(prev => [...prev, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let sessionId;

      // 1. Guardar Mesa
      if (editingSession) {
        const { error } = await supabase.from('sessions').update(formData).eq('id', editingSession.id);
        if (error) throw error;
        sessionId = editingSession.id;
      } else {
        const { data, error } = await supabase.from('sessions').insert([formData]).select();
        if (error) throw error;
        sessionId = data[0].id;
      }

      // 2. Asignar Ponencias
      // A) Limpiar las que eran de esta mesa pero se desmarcaron
      await supabase
        .from('presentations')
        .update({ session_id: null })
        .eq('session_id', sessionId);

      // B) Asignar las nuevas seleccionadas
      if (selectedPresentationIds.length > 0) {
        const { error: presError } = await supabase
          .from('presentations')
          .update({ session_id: sessionId })
          .in('id', selectedPresentationIds);
        if (presError) throw presError;
      }

      toast.success(editingSession ? 'Mesa actualizada' : 'Mesa creada exitosamente');
      setShowModal(false);
      fetchData(); 
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Borrar mesa? Las ponencias quedarán libres.')) return;
    try {
      await supabase.from('presentations').update({ session_id: null }).eq('session_id', id);
      await supabase.from('sessions').delete().eq('id', id);
      toast.success('Mesa eliminada');
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error('Error al borrar');
    }
  };

  // --- FILTRO VISUAL: MAGIA AQUÍ ---
  // Solo mostramos ponencias que:
  // 1. No tienen session_id (están libres)
  // 2. O pertenecen a ESTA mesa que estamos editando (para poder verlas y quitarlas si queremos)
  const availablePresentations = symposiumPresentations.filter(p => 
    p.session_id === null || (editingSession && p.session_id === editingSession.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Mesas y Horarios</h2>
        <button onClick={() => openModal()} className="bg-iaspm-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 transition">
          <Plus className="w-4 h-4" /> Nueva Mesa
        </button>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition relative group">
            <div className="absolute top-4 right-4 flex gap-2">
               <button onClick={() => openModal(session)} className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100">
                 <Edit className="w-4 h-4" />
               </button>
               <button onClick={() => handleDelete(session.id)} className="text-red-400 bg-red-50 p-2 rounded-full hover:bg-red-100">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
            <div className="mb-3 pr-20">
              <span className="bg-blue-50 text-iaspm-blue text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {session.rooms?.venues?.name || 'Sede ?'}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-lg">{session.name}</h3>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-8">{session.symposiums?.name}</p>
            <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-iaspm-orange" /> <span className="font-medium">{session.rooms?.name}</span></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> <span>{session.date}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> <span>{session.start_time?.slice(0,5)} - {session.end_time?.slice(0,5)}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL OPTIMIZADO CON SCROLL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          
          {/* Contenedor Principal: Max Height fijo para forzar scroll interno */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                {editingSession ? <Edit className="w-5 h-5 text-iaspm-blue"/> : <Plus className="w-5 h-5 text-iaspm-blue"/>}
                {editingSession ? 'Editar Mesa y Asignar Ponencias' : 'Programar Nueva Mesa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 bg-white p-1 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Cuerpo del Modal: Flex para dividir izquierda/derecha */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* IZQUIERDA: Formulario (Fijo o con scroll independiente si es muy pequeño) */}
              <div className="p-6 md:w-[350px] border-r border-gray-100 bg-white overflow-y-auto shrink-0 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Simposio</label>
                  <select 
                    required disabled={!!editingSession}
                    className="w-full border-gray-300 rounded-lg text-sm focus:ring-iaspm-blue disabled:bg-gray-100"
                    value={formData.symposium_id} onChange={(e) => handleSymposiumChange(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {symposiums.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name.substring(0, 30)}...</option>)}
                  </select>
                </div>

                {/* Campos restantes del form... */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sala</label>
                   <select required disabled={!formData.symposium_id} className="w-full border-gray-300 rounded-lg text-sm"
                     value={formData.room_id} onChange={(e) => setFormData({...formData, room_id: e.target.value})}>
                     <option value="">-- Seleccionar --</option>
                     {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                   </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Mesa</label>
                  <input type="text" required placeholder="Mesa 1" className="w-full border-gray-300 rounded-lg text-sm"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                   <input type="date" required className="w-full border-gray-300 rounded-lg text-sm"
                    value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inicio</label>
                   <input type="time" required className="w-full border-gray-300 rounded-lg text-sm"
                    value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fin</label>
                   <input type="time" required className="w-full border-gray-300 rounded-lg text-sm"
                    value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} /></div>
                </div>
              </div>

              {/* DERECHA: Lista de Ponencias (CON SCROLL REPARADO) */}
              <div className="flex-1 bg-gray-50 flex flex-col min-h-0 overflow-hidden relative">
                
                {/* Header de la Lista */}
                <div className="px-6 py-3 border-b border-gray-200 bg-white flex justify-between items-center shrink-0 z-10 shadow-sm">
                   <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                     <Filter className="w-4 h-4 text-iaspm-blue" />
                     Ponencias Disponibles
                   </div>
                   <div className="flex gap-2">
                     <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold">
                       {availablePresentations.length} Libres
                     </span>
                     <span className="text-xs bg-iaspm-blue text-white px-2 py-1 rounded-full font-bold">
                       {selectedPresentationIds.length} Seleccionadas
                     </span>
                   </div>
                </div>
                
                {/* ÁREA DE SCROLL (Aquí es donde ocurre la magia) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {!formData.symposium_id && (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                        <p>Selecciona un Simposio primero</p>
                     </div>
                   )}
                   
                   {/* Mensaje si ya no quedan libres */}
                   {formData.symposium_id && availablePresentations.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-green-600 bg-green-50 rounded-lg border border-green-100 m-4">
                        <CheckSquare className="w-12 h-12 mb-2 opacity-50" />
                        <p className="font-bold">¡Todo asignado!</p>
                        <p className="text-sm">No quedan ponencias pendientes en este simposio.</p>
                     </div>
                   )}

                   {availablePresentations.map((pres) => {
                     const isSelected = selectedPresentationIds.includes(pres.id);
                     return (
                       <div 
                         key={pres.id}
                         onClick={() => togglePresentation(pres.id)}
                         className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 select-none transition-all
                           ${isSelected 
                             ? 'bg-white border-iaspm-blue ring-1 ring-iaspm-blue shadow-md z-10 relative' 
                             : 'bg-white border-gray-200 hover:border-blue-400'
                           }
                         `}
                       >
                         <div className={`mt-0.5 text-iaspm-blue ${isSelected ? 'scale-110' : 'opacity-30'}`}>
                           {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                         </div>
                         <div className="flex-1">
                           <p className={`text-sm font-medium leading-snug ${isSelected ? 'text-iaspm-blue' : 'text-gray-700'}`}>
                             {pres.title}
                           </p>
                           <p className="text-xs text-gray-500 mt-1">{pres.authors}</p>
                         </div>
                       </div>
                     );
                   })}
                   
                   {/* Espacio extra al final para que no se pegue al botón */}
                   <div className="h-16"></div>
                </div>

                {/* Footer Flotante (Botones) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-end gap-3 z-20">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">
                    Cancelar
                  </button>
                  <button type="submit" className="px-8 py-2 text-sm bg-iaspm-blue text-white rounded-lg hover:bg-blue-800 transition font-bold shadow-lg shadow-blue-900/20">
                    {editingSession ? 'Guardar Cambios' : 'Crear Mesa'}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
