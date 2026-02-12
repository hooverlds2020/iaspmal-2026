// src/components/admin/SessionsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Edit2, Trash2, X, 
  Clock, MapPin, AlertCircle, AlertTriangle, 
  BookOpen, Building, ArrowRight, User, Loader2, Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [allPresentations, setAllPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Estados Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [hasTimeConflict, setHasTimeConflict] = useState(false);

  const [formData, setFormData] = useState({
    name: '', date: '', start_time: '', end_time: '',
    room_id: '', symposium_id: '', selected_presentation_ids: []
  });

  const [presentationTimes, setPresentationTimes] = useState({});

  useEffect(() => { fetchData(); }, []);

  // Validar conflictos en tiempo real
  useEffect(() => { validateConflicts(); }, [presentationTimes, formData.selected_presentation_ids]);

  const fetchData = async () => {
    try {
      const [sessionsRes, roomsRes, sympRes, presRes] = await Promise.all([
        supabase.from('sessions').select('*, rooms(id, name, venue_id, venues(name)), symposiums(id, name, venue_id, venues(name)), presentations(*)').order('date'),
        supabase.from('rooms').select('id, name, venue_id, venues(name)'),
        supabase.from('symposiums').select('id, name, venue_id, venues(name)'),
        supabase.from('presentations').select('*')
      ]);
      setSessions(sessionsRes.data || []);
      setRooms(roomsRes.data || []);
      setSymposiums(sympRes.data || []);
      setAllPresentations(presRes.data || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  // --- UTILS ---
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateTotalMinutes = (start, end) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    if (startMin === null || endMin === null) return 0;
    return endMin - startMin;
  };

  const validateConflicts = () => {
    const activeTimes = formData.selected_presentation_ids
      .map(id => presentationTimes[id])
      .filter(t => t && t.start_time && t.end_time)
      .map(t => ({ start: timeToMinutes(t.start_time), end: timeToMinutes(t.end_time) }));

    let conflictFound = false;
    for (let i = 0; i < activeTimes.length; i++) {
      for (let j = i + 1; j < activeTimes.length; j++) {
        const slotA = activeTimes[i];
        const slotB = activeTimes[j];
        if (slotA.start < slotA.end && slotB.start < slotB.end) {
            if (slotA.start < slotB.end && slotA.end > slotB.start) {
                conflictFound = true;
                break;
            }
        }
      }
      if (conflictFound) break;
    }
    setHasTimeConflict(conflictFound);
  };

  // --- FILTROS ---
  const selectedSymposiumData = symposiums.find(s => s.id == formData.symposium_id);
  const detectedVenueName = selectedSymposiumData?.venues?.name || "Sin Sede Asignada";
  const detectedVenueId = selectedSymposiumData?.venue_id;

  const availableRooms = rooms.filter(r => {
    if (!formData.symposium_id) return false;
    if (!detectedVenueId) return true; 
    return r.venue_id === detectedVenueId;
  });

  const filteredPresentations = allPresentations.filter(p => {
    if (!formData.symposium_id) return false;
    const matchesSymposium = p.symposium_id == formData.symposium_id;
    const isFreeOrMine = !p.session_id || p.session_id === editingId;
    return matchesSymposium && isFreeOrMine;
  });

  const totalCapacity = calculateTotalMinutes(formData.start_time, formData.end_time);
  const occupiedMinutes = Object.values(presentationTimes).reduce((acc, curr) => {
    return acc + calculateTotalMinutes(curr.start_time, curr.end_time);
  }, 0);

  // --- HANDLERS ---
  const triggerDelete = (id) => { setIdToDelete(id); setShowDeleteModal(true); };
  
  const confirmDelete = async () => {
    try {
      await supabase.from('sessions').delete().eq('id', idToDelete);
      await fetchData(); 
    } catch (error) { alert('Error al eliminar'); }
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setFormData({
      name: session.name, date: session.date, start_time: session.start_time,
      end_time: session.end_time, room_id: session.room_id,
      symposium_id: session.symposium_id,
      selected_presentation_ids: session.presentations?.map(p => p.id) || []
    });
    const times = {};
    session.presentations?.forEach(p => {
      times[p.id] = { start_time: p.start_time || '', end_time: p.end_time || '' };
    });
    setPresentationTimes(times);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasTimeConflict) return alert("Corrige los conflictos de horario.");
    setIsSaving(true);
    try {
      const sessionData = {
        name: formData.name, date: formData.date, start_time: formData.start_time,
        end_time: formData.end_time, room_id: formData.room_id, symposium_id: formData.symposium_id
      };
      
      let sessionId = editingId;
      if (editingId) {
        await supabase.from('sessions').update(sessionData).eq('id', editingId);
        await supabase.from('presentations').update({ session_id: null, start_time: null, end_time: null }).eq('session_id', editingId);
      } else {
        const { data } = await supabase.from('sessions').insert([sessionData]).select();
        sessionId = data[0].id;
      }

      if (formData.selected_presentation_ids.length > 0) {
        const updates = formData.selected_presentation_ids.map(id => 
          supabase.from('presentations').update({
            session_id: sessionId, 
            start_time: presentationTimes[id]?.start_time, 
            end_time: presentationTimes[id]?.end_time
          }).eq('id', id)
        );
        await Promise.all(updates);
      }
      await fetchData(); 
      setIsModalOpen(false); setEditingId(null); 
    } catch (error) { alert(error.message); } finally { setIsSaving(false); }
  };

  const resetForm = () => {
    setEditingId(null); 
    setFormData({name:'', date:'', start_time:'', end_time:'', room_id:'', symposium_id:'', selected_presentation_ids:[]}); 
    setPresentationTimes({}); 
    setHasTimeConflict(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">Gestión de Mesas</h2>
        <button onClick={resetForm} className="bg-[#1e3a5f] text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-md"><Plus size={20} /> Nueva Mesa</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(session => (
          <div key={session.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all animate-in fade-in duration-500">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#f4a261]"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{session.symposiums?.name}</span>
                <h3 className="font-bold text-[#1e3a5f] text-lg leading-tight">{session.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(session)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                <button onClick={() => triggerDelete(session.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-4">
              <span className="flex items-center gap-1"><MapPin size={14} className="text-[#f4a261]"/> {session.rooms?.name}</span>
              <span className="flex items-center gap-1"><Clock size={14}/> {session.start_time?.substring(0,5)} - {session.end_time?.substring(0,5)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden pl-1">
                {session.presentations?.length > 0 ? (
                  <>
                    {session.presentations.slice(0, 5).map((_, i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center relative shadow-sm"><span className="text-[10px] font-black text-[#1e3a5f]"><User size={14}/></span></div>
                    ))}
                    {session.presentations.length > 5 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center relative shadow-sm"><span className="text-[10px] font-bold text-gray-500">+{session.presentations.length - 5}</span></div>
                    )}
                  </>
                ) : <span className="text-[10px] text-gray-300 italic pl-1">Sin ponencias</span>}
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${session.presentations?.length > 0 ? 'bg-blue-50 text-[#1e3a5f]' : 'bg-gray-50 text-gray-400'}`}>{session.presentations?.length || 0} Ponencias</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL DE GESTIÓN (Paneles Independientes) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b bg-[#1e3a5f] text-white flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-xl">{editingId ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            
            {/* FORMULARIO CON SCROLL INDEPENDIENTE (GRID DE 2 PANELES) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              
              {/* PANEL IZQUIERDO: CONFIGURACIÓN (FIJO O SCROLL PROPIO) */}
              <div className="lg:col-span-4 p-8 border-r border-gray-100 bg-gray-50/50 overflow-y-auto custom-scrollbar h-full flex flex-col gap-6">
                
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-2">1. Seleccionar Simposio</label>
                    <select className="w-full px-5 py-4 rounded-2xl border-2 border-blue-100 outline-none focus:border-[#1e3a5f] font-bold text-[#1e3a5f] text-sm appearance-none bg-white" value={formData.symposium_id} onChange={e => { setFormData({...formData, symposium_id: e.target.value, room_id: '', selected_presentation_ids: []}); setPresentationTimes({}); }} required>
                      <option value="">-- Seleccionar --</option>
                      {symposiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <BookOpen size={18} className="absolute right-4 top-9 text-[#f4a261] pointer-events-none"/>
                  </div>

                  {formData.symposium_id && (
                    <div className="bg-blue-100/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <Building className="text-[#1e3a5f]" size={20}/>
                      <div><p className="text-[9px] font-black uppercase text-blue-400">Sede Asignada</p><p className="font-bold text-[#1e3a5f] text-sm leading-tight">{detectedVenueName}</p></div>
                    </div>
                  )}

                  <div className={`relative transition-all ${!formData.symposium_id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 ml-2">2. Seleccionar Sala</label>
                    <select className="w-full px-5 py-3 rounded-2xl border outline-none appearance-none bg-white" value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})} required>
                      <option value="">{availableRooms.length > 0 ? 'Seleccionar Sala...' : (detectedVenueId ? 'No hay salas en esta sede' : 'Seleccionar (Sede no detectada)')}</option>
                      {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <MapPin size={18} className="absolute right-4 top-8 text-gray-400 pointer-events-none"/>
                  </div>

                  <hr className="border-gray-200"/>
                  <input placeholder="Nombre de la Mesa (Ej: Mesa 1)" className="w-full px-5 py-3 rounded-2xl border outline-none font-bold text-[#1e3a5f]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <input type="date" className="w-full px-5 py-3 rounded-2xl border" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[9px] font-bold ml-2">INICIO</label><input type="time" className="w-full px-4 py-3 rounded-2xl border" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required /></div>
                    <div><label className="text-[9px] font-bold ml-2">FIN</label><input type="time" className="w-full px-4 py-3 rounded-2xl border" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} required /></div>
                  </div>
                  
                  {/* ALERTA STICKY (Siempre visible porque está en este panel independiente) */}
                  <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-colors ${hasTimeConflict ? 'bg-red-100 border-red-300 text-red-800 animate-pulse' : (occupiedMinutes > totalCapacity ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-green-50 border-green-200 text-green-700')}`}>
                    <div className="flex items-center gap-2">
                        {hasTimeConflict ? <Ban size={20} className="text-red-600"/> : <AlertCircle size={20} />}
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest">{hasTimeConflict ? '¡CONFLICTO DE HORARIOS!' : 'Tiempo Ocupado'}</p>
                            {hasTimeConflict ? <p className="font-bold text-xs leading-tight mt-1">Hay horas superpuestas.</p> : <p className="font-bold text-sm">{occupiedMinutes} / {totalCapacity} min</p>}
                        </div>
                    </div>
                  </div>
              </div>

              {/* PANEL DERECHO: PONENCIAS (SCROLL INDEPENDIENTE) */}
              <div className="lg:col-span-8 p-8 flex flex-col h-full bg-white relative overflow-hidden">
                {!formData.symposium_id ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                    <ArrowRight size={48} className="mb-4 text-[#1e3a5f]"/>
                    <h3 className="text-xl font-bold text-[#1e3a5f]">Selecciona un Simposio</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                      <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={16}/> Ponencias del Simposio</h4>
                      <span className="text-xs bg-[#f4a261] text-white px-3 py-1 rounded-full font-bold">{filteredPresentations.length} disponibles</span>
                    </div>

                    {/* LISTA SCROLLABLE */}
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-24">
                      {filteredPresentations.length === 0 ? <p className="text-center text-gray-400 py-10 italic">No hay ponencias libres.</p> : (
                        filteredPresentations.map(p => (
                          <div key={p.id} className={`p-4 rounded-2xl border transition-all ${formData.selected_presentation_ids.includes(p.id) ? 'border-[#f4a261] bg-orange-50/30 ring-1 ring-[#f4a261]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                            <label className="flex items-start gap-4 cursor-pointer select-none">
                              <div className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.selected_presentation_ids.includes(p.id) ? 'bg-[#f4a261] border-[#f4a261]' : 'border-gray-300'}`}>
                                <input type="checkbox" className="hidden" checked={formData.selected_presentation_ids.includes(p.id)} onChange={() => {
                                  const isSelected = formData.selected_presentation_ids.includes(p.id);
                                  if (isSelected) {
                                    setFormData({...formData, selected_presentation_ids: formData.selected_presentation_ids.filter(id => id !== p.id)});
                                    const nt = {...presentationTimes}; delete nt[p.id]; setPresentationTimes(nt);
                                  } else {
                                    setFormData({...formData, selected_presentation_ids: [...formData.selected_presentation_ids, p.id]});
                                    setPresentationTimes({...presentationTimes, [p.id]: {start_time:'', end_time:''}});
                                  }
                                }} />
                                {formData.selected_presentation_ids.includes(p.id) && <Plus size={14} className="text-white rotate-45"/>}
                              </div>
                              <div className="flex-1"><p className="font-bold text-sm text-[#1e3a5f] leading-snug mb-1">{p.title}</p><p className="text-xs text-gray-500 font-bold italic">{p.authors}</p></div>
                            </label>

                            <AnimatePresence>
                              {formData.selected_presentation_ids.includes(p.id) && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="mt-3 grid grid-cols-2 gap-4 pt-3 border-t border-orange-100/50 pl-9">
                                    <div><p className="text-[9px] font-black text-orange-400 uppercase mb-1">Inicia</p><input type="time" className="w-full px-3 py-2 rounded-xl border border-orange-200 text-xs bg-white focus:ring-2 focus:ring-[#f4a261]" value={presentationTimes[p.id]?.start_time} onChange={e => setPresentationTimes({...presentationTimes, [p.id]: {...presentationTimes[p.id], start_time: e.target.value}})} /></div>
                                    <div><p className="text-[9px] font-black text-orange-400 uppercase mb-1">Termina</p><input type="time" className="w-full px-3 py-2 rounded-xl border border-orange-200 text-xs bg-white focus:ring-2 focus:ring-[#f4a261]" value={presentationTimes[p.id]?.end_time} onChange={e => setPresentationTimes({...presentationTimes, [p.id]: {...presentationTimes[p.id], end_time: e.target.value}})} /></div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>

                    {/* BOTÓN FLOTANTE SOBRE EL PANEL DERECHO */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                      <button type="submit" disabled={occupiedMinutes > totalCapacity || isSaving || hasTimeConflict} className="w-full bg-[#1e3a5f] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : (hasTimeConflict ? "Corregir Horarios" : "Guardar Mesa y Cronograma")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal Borrar */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 text-center relative z-10 shadow-2xl">
               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} className="text-red-500" /></div>
               <h3 className="text-2xl font-black text-[#1e3a5f] mb-3">¿Eliminar Mesa?</h3>
               <div className="flex gap-3"><button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-200">Cancelar</button><button onClick={() => { confirmDelete(); setShowDeleteModal(false); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Sí, borrar</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionsManager;
