// src/components/admin/SessionsManager.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as LucideIcons from 'lucide-react'; 
import { toast } from 'sonner';

const { Plus, Edit2, Trash2, X, Clock, MapPin, CheckCircle2, AlertCircle, Timer, LayoutGrid, ArrowRight, Ban, Lock, AlertTriangle, Save, User, ArrowLeft } = LucideIcons;

const getVenueStyle = (venueName) => {
  if (!venueName) return { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200', icon: 'text-gray-300' };
  const name = venueName.toLowerCase();
  if (name.includes('carmen')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: 'text-blue-500' };
  if (name.includes('mazariegos')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', icon: 'text-orange-500' };
  if (name.includes('teatro') || name.includes('zebadúa')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: 'text-purple-500' };
  if (name.includes('derecho') || name.includes('facultad')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'text-emerald-500' };
  return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: 'text-slate-400' };
};

const SessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [eventTypes, setEventTypes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMesas: 0, assigned: 0, pending: 0 });

  const [isEditorOpen, setIsEditorOpen] = useState(false); 
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [availablePresentations, setAvailablePresentations] = useState([]);
  const [selectedWithTimes, setSelectedWithTimes] = useState([]);
  const [totalSymposiumPapers, setTotalSymposiumPapers] = useState(0);

  const [formData, setFormData] = useState({
    name: '', symposium_id: '', room_id: '', date: '', start_time: '', end_time: '', event_type: 'mesa'
  });

  const [occupiedSlots, setOccupiedSlots] = useState([]); 
  const [availableGaps, setAvailableGaps] = useState([]); 

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, roomsRes, sympRes, allPresRes, eventTypesRes] = await Promise.all([
        supabase.from('sessions').select('*, rooms(name, venues(name)), symposiums(id, name), presentations(count)')
          .order('date')
          .order('start_time'), 
        supabase.from('rooms').select('*, venues(name)').order('venue_id'), 
        supabase.from('symposiums').select('*, venues(name)').not('venue_id', 'is', null).order('id', { ascending: true }),
        supabase.from('presentations').select('id, session_id'),
        supabase.from('event_types').select('*') 
      ]);

      setSessions(sessionsRes.data || []);
      setRooms(roomsRes.data || []);
      setSymposiums(sympRes.data || []);
      setEventTypes(eventTypesRes.data || []); 

      const assigned = allPresRes.data?.filter(p => p.session_id !== null).length || 0;
      const pending = allPresRes.data?.filter(p => p.session_id === null).length || 0;
      setStats({ totalMesas: sessionsRes.data?.length || 0, assigned, pending });
    } catch (error) {
      toast.error("Error de conexión al cargar datos");
    } finally { setLoading(false); }
  };

  const roomsByVenue = useMemo(() => {
    const grouped = {};
    rooms.forEach(room => {
      const venueName = room.venues?.name || 'Otras Sedes';
      if (!grouped[venueName]) { grouped[venueName] = []; }
      grouped[venueName].push(room);
    });
    return grouped;
  }, [rooms]);

  useEffect(() => {
    const loadPresentations = async () => {
      if (formData.event_type !== 'mesa' || !formData.symposium_id) {
        setAvailablePresentations([]);
        setTotalSymposiumPapers(0);
        return;
      }
      
      const { data } = await supabase
        .from('presentations')
        .select('id, title, authors, session_id, start_time, end_time')
        .eq('symposium_id', formData.symposium_id)
        .or(`session_id.is.null,session_id.eq.${editingId || 0}`);
      
      setAvailablePresentations(data || []);

      const { count } = await supabase
        .from('presentations')
        .select('*', { count: 'exact', head: true })
        .eq('symposium_id', formData.symposium_id);
        
      setTotalSymposiumPapers(count || 0);
    };
    loadPresentations();
  }, [formData.symposium_id, editingId, formData.event_type]);

  useEffect(() => {
    const calculateAvailability = async () => {
      if (!formData.date || !formData.room_id) {
        setOccupiedSlots([]); setAvailableGaps([]); return;
      }
      const { data: existingSessions } = await supabase
        .from('sessions')
        .select('id, name, start_time, end_time, event_type')
        .eq('room_id', formData.room_id)
        .eq('date', formData.date)       
        .order('start_time', { ascending: true }); 

      if (existingSessions) {
        const others = existingSessions.filter(s => s.id !== editingId);
        setOccupiedSlots(others);
        
        const gaps = [];
        let currentStart = "09:00"; 
        const dayEnd = "20:00"; 

        others.forEach(session => {
          const sessionStart = session.start_time.slice(0, 5);
          const sessionEnd = session.end_time.slice(0, 5);

          if (currentStart < sessionStart) {
            gaps.push({ start: currentStart, end: sessionStart });
          }
          if (sessionEnd > currentStart) {
            currentStart = sessionEnd;
          }
        });

        if (currentStart < dayEnd) {
          gaps.push({ start: currentStart, end: dayEnd });
        }

        setAvailableGaps(gaps);

        if (!editingId && !formData.start_time && gaps.length > 0) {
            setFormData(prev => ({ ...prev, start_time: gaps[0].start, end_time: gaps[0].end }));
        }
      }
    };
    calculateAvailability();
  }, [formData.date, formData.room_id, editingId]);

  const totalMinutesUsed = useMemo(() => {
    return selectedWithTimes.reduce((acc, pres) => {
      if (!pres.start_time || !pres.end_time) return acc;
      const start = new Date(`2026-01-01T${pres.start_time}`);
      const end = new Date(`2026-01-01T${pres.end_time}`);
      return acc + Math.max(0, (end - start) / (1000 * 60));
    }, 0);
  }, [selectedWithTimes]);

  const internalTimeConflicts = useMemo(() => {
    if (formData.event_type !== 'mesa') return [];
    const sorted = [...selectedWithTimes].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    const conflicts = [];
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].start_time >= sorted[i].end_time) conflicts.push(sorted[i].id);
      if (i < sorted.length - 1) {
        if (sorted[i].end_time > sorted[i + 1].start_time) conflicts.push(sorted[i].id, sorted[i+1].id);
      }
    }
    return [...new Set(conflicts)];
  }, [selectedWithTimes, formData.event_type]);

  // CORREGIDO: Evita choque falso por segundos
  const isTimeConflicting = (timeToCheck) => {
    if (!timeToCheck) return false;
    const checkStart = timeToCheck.slice(0,5);
    return occupiedSlots.some(slot => {
        const busyStart = slot.start_time.slice(0,5);
        const busyEnd = slot.end_time.slice(0,5);
        return checkStart >= busyStart && checkStart < busyEnd;
    });
  };

  // CORREGIDO: Evita que "12:00:00" choque con "12:00" quitando los segundos
  const mainTimeConflict = useMemo(() => {
    if (!formData.start_time || !formData.end_time || occupiedSlots.length === 0) return null;
    
    return occupiedSlots.find(slot => {
      const busyStart = slot.start_time.slice(0, 5);
      const busyEnd = slot.end_time.slice(0, 5);
      const myStart = formData.start_time.slice(0, 5);
      const myEnd = formData.end_time.slice(0, 5);
      
      return myStart < busyEnd && myEnd > busyStart;
    });
  }, [formData.start_time, formData.end_time, occupiedSlots]);

  const handleSymposiumChange = (id) => setFormData(prev => ({ ...prev, symposium_id: id }));

  const togglePresentation = (pres) => {
    const exists = selectedWithTimes.find(p => p.id === pres.id);
    if (exists) {
      setSelectedWithTimes(prev => prev.filter(p => p.id !== pres.id));
    } else {
      const sortedCurrent = [...selectedWithTimes].sort((a, b) => (a.end_time || '').localeCompare(b.end_time || ''));
      const lastPres = sortedCurrent[sortedCurrent.length - 1];
      const suggestedStart = lastPres ? lastPres.end_time : (formData.start_time || '09:00');
      let [h, m] = suggestedStart.split(':').map(Number);
      let endM = m + 20; let endH = h;
      if (endM >= 60) { endM -= 60; endH += 1; }
      const suggestedEnd = `${endH.toString().padStart(2,'0')}:${endM.toString().padStart(2,'0')}`;
      setSelectedWithTimes(prev => [...prev, { id: pres.id, title: pres.title, authors: pres.authors, start_time: suggestedStart, end_time: suggestedEnd }]);
    }
  };

  const updatePresTime = (id, field, value) => setSelectedWithTimes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  const handleEdit = async (session) => {
    setEditingId(session.id);
    setFormData({
      name: session.name || '', symposium_id: session.symposium_id || '', room_id: session.room_id || '',
      date: session.date || '', start_time: session.start_time || '', end_time: session.end_time || '',
      event_type: session.event_type || 'mesa'
    });
    
    if (session.event_type === 'mesa' || !session.event_type) {
      const { data } = await supabase.from('presentations').select('id, title, authors, start_time, end_time').eq('session_id', session.id);
      setSelectedWithTimes(data || []);
    } else {
      setSelectedWithTimes([]);
    }
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('presentations').update({ session_id: null, start_time: null, end_time: null }).eq('session_id', deleteId); 
      await supabase.from('sessions').delete().eq('id', deleteId);
      toast.success('Evento eliminado correctamente');
      fetchData();
    } catch (error) { toast.error('Error al eliminar'); }
    finally { setDeleteId(null); }
  };

  // CORREGIDO: Comprobación segura en el backend
  const checkRoomConflict = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('id, name, start_time, end_time')
      .eq('room_id', formData.room_id)
      .eq('date', formData.date)
      .neq('id', editingId || -1);

    if (!data || data.length === 0) return null;

    const myStart = formData.start_time.slice(0, 5);
    const myEnd = formData.end_time.slice(0, 5);

    const conflict = data.find(s => {
      const sStart = s.start_time.slice(0, 5);
      const sEnd = s.end_time.slice(0, 5);
      return (myStart < sEnd) && (myEnd > sStart);
    });

    return conflict || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.event_type === 'mesa' && internalTimeConflicts.length > 0) return toast.error("Corrige los conflictos de tiempo internos.");
    if (!formData.room_id || !formData.date || !formData.start_time || !formData.end_time) return toast.error("Por favor completa todos los campos de horario y sala.");  
    if (formData.event_type !== 'mesa' && !formData.name) return toast.error("Por favor ingresa un título para la actividad.");

    if (formData.start_time >= formData.end_time) {
      return toast.error("La hora de inicio debe ser menor a la hora de fin.");
    }

    if (formData.event_type === 'mesa') {
      for (const pres of selectedWithTimes) {
          if (isTimeConflicting(pres.start_time)) {
              const checkS = pres.start_time.slice(0,5);
              const conflicto = occupiedSlots.find(slot => checkS >= slot.start_time.slice(0,5) && checkS < slot.end_time.slice(0,5));
              toast.error(`Conflicto de horario: La ponencia de las ${pres.start_time} choca con "${conflicto?.name || 'otra actividad'}"`, { duration: 6000 });
              return;
          }
      }
    }

    setLoading(true);
    const conflictSession = await checkRoomConflict();
    if (conflictSession) {
      toast.error(`SALA OCUPADA: Ya existe "${conflictSession.name || 'un evento'}" en este horario (${conflictSession.start_time.slice(0,5)} hrs).`, { duration: 6000 });
      setLoading(false); return;
    }

    try {
      const payload = { ...formData, symposium_id: formData.event_type === 'mesa' ? formData.symposium_id : null };
      let sessionId = editingId;
      const { data, error } = editingId
        ? await supabase.from('sessions').update(payload).eq('id', editingId).select()
        : await supabase.from('sessions').insert([payload]).select();

      if (error) throw error;
      sessionId = data[0].id;

      if (formData.event_type === 'mesa') {
        await supabase.from('presentations').update({ session_id: null, start_time: null, end_time: null }).eq('session_id', sessionId);
        for (const pres of selectedWithTimes) {
          await supabase.from('presentations').update({ session_id: sessionId, start_time: pres.start_time, end_time: pres.end_time }).eq('id', pres.id);
        }
      }
      
      toast.success('Agenda guardada exitosamente');
      setIsEditorOpen(false); 
      fetchData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { toast.error('Error al guardar: ' + err.message); }
    finally { setLoading(false); }
  };

  const Label = ({ children }) => <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">{children}</label>;
  const InputClasses = "w-full p-3 rounded-xl border border-gray-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-gray-700 transition-all bg-white";

  const getEventData = (typeId) => {
    const defaultData = { label: 'Evento', icon_name: 'Calendar', color_text: 'text-gray-500', color_bg: 'bg-gray-50', color_border: 'border-gray-200' };
    const evt = eventTypes.find(e => e.id === typeId) || defaultData;
    const IconComponent = LucideIcons[evt.icon_name] || LucideIcons.Calendar;
    return { ...evt, IconComponent };
  };

  // --- VISTA 2: EDITOR DE AGENDA INLINE ---
  if (isEditorOpen) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto pb-10">
        <button 
          onClick={() => setIsEditorOpen(false)} 
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm transition-colors group bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a la lista de eventos
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
          
          <div className="bg-gray-50 p-2 flex gap-2 w-full border-b border-gray-200 shrink-0">
            <button 
              onClick={() => setFormData({...formData, event_type: 'mesa'})} 
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${formData.event_type === 'mesa' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:bg-gray-200'}`}
            >
              <LucideIcons.Users size={16}/> Mesa de Simposio
            </button>
            <button 
              onClick={() => setFormData({...formData, event_type: 'inauguracion'})} 
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${formData.event_type !== 'mesa' ? 'bg-white shadow-md text-amber-600' : 'text-gray-400 hover:bg-gray-200'}`}
            >
              <LucideIcons.Star size={16}/> Actividad Especial
            </button>
          </div>

          <div className="p-5 sm:p-6 border-b border-blue-900/10 bg-[#1e3a5f] text-white shrink-0 flex justify-between items-center">
            <div>
              <h3 className="font-black uppercase italic tracking-widest text-xl sm:text-2xl">
                {formData.event_type === 'mesa' ? 'Programador de Mesa' : 'Programador de Evento'}
              </h3>
               <p className="text-xs font-medium text-blue-200 uppercase tracking-wide flex items-center gap-2 mt-1">
                  {editingId ? `Editando ID: ${editingId}` : 'Creando Nuevo Registro'}
                  {formData.event_type === 'mesa' && (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase italic flex items-center gap-1 ml-2 text-white ${totalMinutesUsed > 120 ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      <Timer size={12} /> {totalMinutesUsed} / 120 min
                    </span>
                  )}
               </p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 border-b border-gray-200 shrink-0">
            <h4 className="text-xs font-black text-[#1e3a5f] uppercase mb-4 flex items-center gap-2 tracking-widest"><MapPin size={16}/> Detalles y Ubicación</h4>
            
            {(occupiedSlots.length > 0 || availableGaps.length > 0) && formData.date && formData.room_id && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-5">
                {occupiedSlots.length > 0 && (
                  <div className="mb-3">
                    <p className="font-bold flex items-center gap-1.5 mb-2 text-[10px] text-red-600 uppercase tracking-widest"><Lock size={12}/> Horarios Ocupados:</p>
                    <div className="flex flex-wrap gap-2">
                      {occupiedSlots.map(s => {
                        const eventNameFallback = eventTypes.find(e => e.id === s.event_type)?.label || 'Evento';
                        return (
                          <div key={s.id} className="flex items-center gap-2 bg-red-50 text-red-800 text-xs px-3 py-1.5 rounded-lg border border-red-100">
                            <span className="font-black">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                            <span className="truncate max-w-[150px]" title={s.name || eventNameFallback}>({s.name || eventNameFallback})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {availableGaps.length > 0 && (
                  <div className={occupiedSlots.length > 0 ? "pt-3 border-t border-gray-100" : ""}>
                    <p className="font-bold flex items-center gap-1.5 mb-2 text-[10px] text-emerald-600 uppercase tracking-widest"><CheckCircle2 size={12}/> Tramos Libres (Clic para usar):</p>
                    <div className="flex flex-wrap gap-2">
                      {availableGaps.map((gap, i) => (
                        <button key={i} type="button" onClick={() => setFormData(prev => ({...prev, start_time: gap.start, end_time: gap.end}))} className="bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95 shadow-sm">
                          {gap.start} a {gap.end}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.event_type !== 'mesa' && (
                  <div>
                    <Label>Tipo de Actividad</Label>
                    <select className={`${InputClasses} border-amber-300 bg-amber-50 text-amber-900 focus:border-amber-500`} value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}>
                      {eventTypes.filter((t) => t.id !== 'mesa').map((type) => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <Label>{formData.event_type === 'mesa' ? 'Nombre de la Mesa' : 'Título del Evento'}</Label>
                  <input className={InputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={formData.event_type === 'mesa' ? "Ej: Mesa 1 - Título" : "Ej: Concierto..."} />
                </div>
                
                {formData.event_type === 'mesa' && (
                  <div>
                    <Label>Simposio</Label>
                    <select className={InputClasses} value={formData.symposium_id} onChange={e => handleSymposiumChange(e.target.value)}>
                      <option value="">-- Seleccionar Simposio --</option>
                      {symposiums.map(s => (<option key={s.id} value={s.id}>{s.id}. {s.name.substring(0,35)}...</option>))}
                    </select>
                  </div>
                )}
                
                <div>
                  <Label>Sede y Sala Asignada</Label>
                  <select className={InputClasses} value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})}>
                    <option value="">-- Seleccionar Sede y Sala --</option>
                    {Object.entries(roomsByVenue).map(([venueName, venueRooms]) => (
                      <optgroup key={venueName} label={venueName}>
                        {venueRooms.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border shadow-sm transition-all ${mainTimeConflict ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
                <div>
                  <Label><Clock size={12}/> Fecha del Evento</Label>
                  <input type="date" className={`${InputClasses} ${mainTimeConflict ? 'border-red-300 bg-red-50/50' : ''}`} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <Label>Hora de Inicio</Label>
                  <input type="time" className={`${InputClasses} ${mainTimeConflict ? 'border-red-500 bg-red-100 text-red-800 focus:ring-red-200 focus:border-red-500' : ''}`} value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div>
                  <Label>Hora de Fin</Label>
                  <input type="time" className={`${InputClasses} ${mainTimeConflict ? 'border-red-500 bg-red-100 text-red-800 focus:ring-red-200 focus:border-red-500' : ''}`} value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>

            </div>
          </div>

          {formData.event_type === 'mesa' && (
            <div className="flex flex-col md:flex-row flex-1 bg-white min-h-[500px]">
              
              {mainTimeConflict ? (
                <div className="flex-1 p-10 flex flex-col items-center justify-center bg-red-50/50 border-t border-red-100 min-h-[400px]">
                  <div className="bg-white p-4 rounded-full shadow-sm border border-red-100 mb-4 animate-bounce">
                    <AlertTriangle size={48} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-red-600 uppercase tracking-widest mb-2 text-center">¡Choque de Horario Detectado!</h3>
                  <p className="text-sm font-bold text-red-800 text-center max-w-md bg-white p-4 rounded-xl border border-red-200 shadow-sm leading-relaxed">
                    El horario que elegiste ({formData.start_time.slice(0,5)} a {formData.end_time.slice(0,5)}) interfiere con <br/>
                    <span className="font-black text-red-600 uppercase text-lg inline-block mt-2">"{mainTimeConflict.name || 'Otro Evento'}"</span> <br/>
                    <span className="text-xs text-red-500 mt-1 block tracking-wider">({mainTimeConflict.start_time.slice(0,5)} - {mainTimeConflict.end_time.slice(0,5)})</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-6 font-bold uppercase tracking-widest text-center flex items-center gap-2">
                    <Clock size={14} className="text-red-400" />
                    Corrige el horario arriba para continuar.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0 border-r border-gray-100 flex flex-col bg-white">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/80 sticky top-0">
                      <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid size={16}/> Disponibles
                        {formData.symposium_id && totalSymposiumPapers > 0 && (
                          <span className="bg-blue-100 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-md text-[10px] font-black shadow-sm ml-2">
                            {availablePresentations.length - selectedWithTimes.length} de {totalSymposiumPapers} libres
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="flex-1 p-4 space-y-3 bg-gray-100/30 overflow-y-auto max-h-[60vh] custom-scrollbar">
                      {(!formData.symposium_id) && <div className="p-10 text-center text-gray-400 text-sm italic border-2 border-dashed rounded-2xl">Elige un simposio para ver trabajos.</div>}
                      {availablePresentations.map(pres => {
                        if (selectedWithTimes.find(p => p.id === pres.id)) return null;
                        return (
                          <div key={pres.id} onClick={() => togglePresentation(pres)} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#1e3a5f] cursor-pointer flex justify-between items-center transition-all group shadow-sm">
                            <div className="flex-1 pr-3 min-w-0"><p className="text-sm font-bold text-gray-800 leading-snug truncate">{pres.title}</p><p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wide truncate">{pres.authors}</p></div>
                            <div className="bg-[#1e3a5f] text-white p-2 rounded-lg shrink-0 group-hover:scale-110 shadow-sm"><Plus size={16}/></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col bg-gray-50">
                    <div className="p-4 border-b bg-white flex justify-between items-center sticky top-0 shadow-sm">
                      <div className="flex items-center gap-2">
                        <LayoutGrid size={16} className="text-[#1e3a5f]"/>
                        <h4 className="text-sm font-black text-[#1e3a5f] uppercase italic tracking-widest">Cronograma</h4>
                      </div>
                      {selectedWithTimes.length > 0 && (
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">
                          {selectedWithTimes.length} asignadas aquí
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[60vh] custom-scrollbar">
                      {selectedWithTimes.length === 0 && <div className="p-10 text-center text-gray-400 text-sm italic">Haz clic en panel izquierdo para agregar.</div>}
                      {selectedWithTimes.map((pres, index) => {
                        const isConflicting = isTimeConflicting(pres.start_time);
                        return (
                          <div key={pres.id} className={`bg-white p-4 rounded-xl border-l-[6px] shadow-sm relative ${isConflicting ? 'border-l-red-500 ring-2 ring-red-100' : 'border-l-[#1e3a5f]'}`}>
                            <button onClick={() => togglePresentation(pres)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full p-1.5 transition-colors"><X size={14}/></button>
                            <span className="text-[10px] font-black text-blue-500 mb-1.5 block uppercase tracking-widest">Turno #{index + 1}</span>
                            <p className="text-sm font-bold text-gray-800 uppercase mb-3 line-clamp-2 pr-6">{pres.title}</p>
                            {isConflicting && <div className="mb-3 text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded flex items-center gap-1.5 uppercase"><Ban size={12}/> ¡Conflicto de Horario!</div>}
                            
                            <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                              <input 
                                type="time" 
                                className={`flex-1 min-w-[130px] rounded-lg p-2.5 text-sm font-black text-center outline-none transition-colors ${isConflicting ? 'bg-red-100 text-red-800' : 'bg-white focus:ring-2 focus:ring-blue-100'}`} 
                                value={pres.start_time} 
                                onChange={e => updatePresTime(pres.id, 'start_time', e.target.value)} 
                              />
                              <ArrowRight size={14} className="text-gray-400 shrink-0 hidden 2xl:block"/>
                              <input 
                                type="time" 
                                className="flex-1 min-w-[130px] bg-white rounded-lg p-2.5 text-sm font-black text-center outline-none focus:ring-2 focus:ring-blue-100 transition-colors" 
                                value={pres.end_time} 
                                onChange={e => updatePresTime(pres.id, 'end_time', e.target.value)} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-5 sm:p-6 border-t border-gray-200 bg-white flex justify-end gap-4 shrink-0">
            <button onClick={() => setIsEditorOpen(false)} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 uppercase tracking-wide transition-colors">Cancelar</button>
            <button 
              onClick={handleSubmit} 
              disabled={loading || mainTimeConflict} 
              className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-lg transition-all flex items-center gap-2 ${loading || mainTimeConflict ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'active:scale-95 hover:bg-black ' + (formData.event_type !== 'mesa' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#1e3a5f]')}`}
            >
              <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Agenda'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 1: GRID PRINCIPAL (VISTA POR DEFECTO) ---
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in pb-20 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Eventos Creados", val: stats.totalMesas, icon: LayoutGrid, color: "text-[#1e3a5f]", bg: "bg-blue-50" },
          { title: "Ponencias Asignadas", val: stats.assigned, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Ponencias Pendientes", val: stats.pending, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-black text-gray-400 uppercase italic tracking-wider">{item.title}</p><p className={`text-3xl font-black mt-1 ${item.color}`}>{item.val}</p></div>
            <div className={`p-3 rounded-xl ${item.bg}`}><item.icon className={item.color} size={28} /></div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">     
        <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic pl-2">Gestión de Agenda</h2>
        <button onClick={() => { 
            setEditingId(null); 
            setFormData({name:'', symposium_id:'', room_id:'', date:'', start_time:'', end_time:'', event_type: 'mesa'}); 
            setOccupiedSlots([]); setAvailableGaps([]); setSelectedWithTimes([]); 
            setIsEditorOpen(true); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex gap-2 items-center shadow-lg active:scale-95">
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map(s => {
          const venueStyle = getVenueStyle(s.rooms?.venues?.name);
          const paperCount = s.presentations?.[0]?.count || 0;
          const evt = getEventData(s.event_type || 'mesa');
          const EventIcon = evt.IconComponent;

          return (
            <div key={s.id} className={`bg-white p-5 rounded-3xl border-t-[5px] ${evt.color_border} border-x border-b border-x-gray-100 border-b-gray-100 shadow-sm relative group hover:shadow-xl transition-all flex flex-col justify-between`}>
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2 pr-14">
                   <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5 ${evt.color_text}`}>
                        <div className={`p-1.5 rounded-lg ${evt.color_bg}`}><EventIcon size={12}/></div>
                        {s.event_type === 'mesa' ? (s.symposiums?.id ? `Simposio ${s.symposiums.id}` : 'Mesa General') : evt.label}
                      </span>
                      {s.symposiums?.name && s.event_type === 'mesa' && (
                        <span className="text-[11px] font-bold text-gray-500 uppercase leading-tight line-clamp-1 mb-1" title={s.symposiums.name}>
                           {s.symposiums.name}
                        </span>
                      )}
                   </div>
                </div>
                <h3 className="font-black text-[#1e3a5f] text-lg leading-tight line-clamp-2">{s.name || evt.label}</h3>
              </div>
              
              <div className="absolute top-4 right-4 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(s)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Edit2 size={16}/></button>
                <button onClick={() => setDeleteId(s.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 size={16}/></button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 text-[11px] font-bold uppercase mt-auto">
                <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg border border-gray-200">
                   <Clock size={14}/> {s.start_time?.slice(0,5)} - {s.end_time?.slice(0,5)}
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border max-w-[150px] ${venueStyle.bg} ${venueStyle.text} ${venueStyle.border}`}>
                   <MapPin size={14} className={venueStyle.icon}/> 
                   <span className="truncate">{s.rooms?.venues?.name || 'Sin sede'}</span>
                </div>
                {s.event_type === 'mesa' && (
                  <div className="flex -space-x-2 ml-auto items-center">
                     {paperCount > 0 ? (
                       [...Array(Math.min(paperCount, 4))].map((_, i) => (
                         <div key={i} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] text-blue-800 font-black shadow-sm" title={`${paperCount} Ponencias`}>
                            <User size={10} />
                         </div>
                       ))
                     ) : (
                       <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div></div>
                     )}
                     {paperCount > 4 && <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] text-gray-600 font-bold z-10 shadow-sm">+{paperCount - 4}</div>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 border border-red-100">
            <div className="bg-red-50 p-4 rounded-full inline-block mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase italic mb-2 tracking-tight">¿Eliminar Registro?</h3>
            <p className="text-sm font-medium text-gray-600 mb-8 leading-relaxed">Esta acción es irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 uppercase tracking-wide text-xs">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-md hover:bg-red-600 uppercase tracking-widest text-xs">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
