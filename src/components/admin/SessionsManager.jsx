// src/components/admin/SessionsManager.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Plus, Edit2, Trash2, X, Clock, MapPin,
  CheckCircle2, AlertCircle, Timer,
  LayoutGrid, ArrowRight, Ban, Lock, AlertTriangle, Save, FileText, User
} from 'lucide-react';
import { toast } from 'sonner';

// --- CONFIGURACIÓN VISUAL DE COLORES POR SEDE ---
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMesas: 0, assigned: 0, pending: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [availablePresentations, setAvailablePresentations] = useState([]);
  const [selectedWithTimes, setSelectedWithTimes] = useState([]);

  const [formData, setFormData] = useState({
    name: '', symposium_id: '', room_id: '', date: '', start_time: '', end_time: ''
  });

  const [occupiedSlots, setOccupiedSlots] = useState([]); 
  const [suggestedStartTime, setSuggestedStartTime] = useState(''); 

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, roomsRes, sympRes, allPresRes] = await Promise.all([
        supabase.from('sessions').select('*, rooms(name, venues(name)), symposiums(id, name), presentations(count)').order('date'),
        // Traemos las salas con el nombre de su sede para poder agruparlas
        supabase.from('rooms').select('*, venues(name)').order('venue_id'), 
        supabase.from('symposiums').select('*, venues(name)').order('id', { ascending: true }),
        supabase.from('presentations').select('id, session_id')
      ]);

      setSessions(sessionsRes.data || []);
      setRooms(roomsRes.data || []);
      setSymposiums(sympRes.data || []);

      const assigned = allPresRes.data?.filter(p => p.session_id !== null).length || 0;
      const pending = allPresRes.data?.filter(p => p.session_id === null).length || 0;
      setStats({ totalMesas: sessionsRes.data?.length || 0, assigned, pending });
    } catch (error) {
      toast.error("Error de conexión al cargar datos");
    } finally { setLoading(false); }
  };

  // --- AGRUPACIÓN INTELIGENTE DE SALAS (SOLUCIÓN A NOMBRES DUPLICADOS) ---
  // Esto crea un objeto donde las claves son las Sedes y los valores son las listas de salas.
  const roomsByVenue = useMemo(() => {
    const grouped = {};
    rooms.forEach(room => {
      const venueName = room.venues?.name || 'Otras Sedes'; // Si no tiene sede, va a "Otras"
      if (!grouped[venueName]) {
        grouped[venueName] = [];
      }
      grouped[venueName].push(room);
    });
    return grouped;
  }, [rooms]);

  useEffect(() => {
    const loadPresentations = async () => {
      if (!formData.symposium_id) {
        setAvailablePresentations([]);
        return;
      }
      const { data } = await supabase
        .from('presentations')
        .select('id, title, authors, session_id, start_time, end_time')
        .eq('symposium_id', formData.symposium_id)
        .or(`session_id.is.null,session_id.eq.${editingId || 0}`);
      setAvailablePresentations(data || []);
    };
    loadPresentations();
  }, [formData.symposium_id, editingId]);

  // --- LÓGICA DE CONFLICTOS Y SUGERENCIAS DE TIEMPO ---
  // Esta parte asegura que NO puedas encimar horarios en la misma sala física
  useEffect(() => {
    const calculateAvailability = async () => {
      // Solo calculamos si ya eligió fecha y sala
      if (!formData.date || !formData.room_id) {
        setOccupiedSlots([]);
        setSuggestedStartTime('');
        return;
      }

      // Buscamos TODAS las sesiones en ESA sala y ESE día (sin importar el simposio)
      const { data: existingSessions } = await supabase
        .from('sessions')
        .select('id, name, start_time, end_time')
        .eq('room_id', formData.room_id) // Candado por Sala Física
        .eq('date', formData.date)       // Candado por Fecha
        .order('end_time', { ascending: true });

      if (existingSessions) {
        // Filtramos para no chocar con la propia mesa que estamos editando
        const others = existingSessions.filter(s => s.id !== editingId);
        setOccupiedSlots(others);

        if (others.length > 0) {
          // Si hay ocupación, sugerimos empezar cuando termine la última
          const lastSession = others[others.length - 1];
          const nextFree = lastSession.end_time.slice(0, 5);
          
          setSuggestedStartTime(nextFree);

          // Si el horario actual del formulario choca, lo empujamos
          if (!formData.start_time || formData.start_time < nextFree) {
             if (!editingId || formData.start_time < nextFree) {
                // Solo auto-corregimos si es nueva mesa o si hay conflicto obvio
                setFormData(prev => ({ ...prev, start_time: nextFree }));
             }
          }
        } else {
          // Si la sala está libre ese día, sugerimos 09:00
          setSuggestedStartTime('09:00');
          if (!formData.start_time && !editingId) {
             setFormData(prev => ({ ...prev, start_time: '09:00' }));
          }
        }
      }
    };
    calculateAvailability();
  }, [formData.date, formData.room_id, editingId]); // Se recalcula al cambiar Sala o Fecha

  const totalMinutesUsed = useMemo(() => {
    return selectedWithTimes.reduce((acc, pres) => {
      if (!pres.start_time || !pres.end_time) return acc;
      const start = new Date(`2026-01-01T${pres.start_time}`);
      const end = new Date(`2026-01-01T${pres.end_time}`);
      return acc + Math.max(0, (end - start) / (1000 * 60));
    }, 0);
  }, [selectedWithTimes]);

  const internalTimeConflicts = useMemo(() => {
    const sorted = [...selectedWithTimes].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    const conflicts = [];
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].start_time >= sorted[i].end_time) conflicts.push(sorted[i].id);
      if (i < sorted.length - 1) {
        if (sorted[i].end_time > sorted[i + 1].start_time) {
          conflicts.push(sorted[i].id, sorted[i+1].id);
        }
      }
    }
    return [...new Set(conflicts)];
  }, [selectedWithTimes]);

  const isTimeConflicting = (timeToCheck) => {
    if (!timeToCheck) return false;
    return occupiedSlots.some(slot => {
        const busyStart = slot.start_time.slice(0,5);
        const busyEnd = slot.end_time.slice(0,5);
        return timeToCheck >= busyStart && timeToCheck < busyEnd;
    });
  };

  const handleSymposiumChange = (id) => {
    setFormData(prev => ({ ...prev, symposium_id: id }));
    // NOTA: No reseteamos room_id para permitir libertad total, 
    // pero el usuario deberá cambiar la sala manualmente si quiere otra.
  };

  const togglePresentation = (pres) => {
    const exists = selectedWithTimes.find(p => p.id === pres.id);
    if (exists) {
      setSelectedWithTimes(prev => prev.filter(p => p.id !== pres.id));
    } else {
      const sortedCurrent = [...selectedWithTimes].sort((a, b) => (a.end_time || '').localeCompare(b.end_time || ''));
      const lastPres = sortedCurrent[sortedCurrent.length - 1];
      const suggestedStart = lastPres ? lastPres.end_time : (formData.start_time || suggestedStartTime || '09:00');
      let [h, m] = suggestedStart.split(':').map(Number);
      let endM = m + 20;
      let endH = h;
      if (endM >= 60) { endM -= 60; endH += 1; }
      const suggestedEnd = `${endH.toString().padStart(2,'0')}:${endM.toString().padStart(2,'0')}`;
      setSelectedWithTimes(prev => [...prev, {
        id: pres.id, title: pres.title, authors: pres.authors,
        start_time: suggestedStart, end_time: suggestedEnd
      }]);
    }
  };

  const updatePresTime = (id, field, value) => {
    setSelectedWithTimes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleEdit = async (session) => {
    setEditingId(session.id);
    setFormData({
      name: session.name, symposium_id: session.symposium_id, room_id: session.room_id,
      date: session.date, start_time: session.start_time, end_time: session.end_time
    });
    const { data } = await supabase.from('presentations').select('id, title, authors, start_time, end_time').eq('session_id', session.id);
    setSelectedWithTimes(data || []);
    setIsModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('presentations').update({ session_id: null, start_time: null, end_time: null }).eq('session_id', deleteId); 
      await supabase.from('sessions').delete().eq('id', deleteId);
      toast.success('Mesa eliminada correctamente');
      fetchData();
    } catch (error) { toast.error('Error al eliminar la mesa'); }
    finally { setDeleteId(null); }
  };

  // --- VALIDACIÓN FINAL DE CONFLICTOS AL GUARDAR ---
  const checkRoomConflict = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('name, start_time, end_time')
      .eq('room_id', formData.room_id) // Verifica la SALA específica
      .eq('date', formData.date)       // Verifica la FECHA específica
      .neq('id', editingId || -1)
      // Lógica de traslape:
      .lt('start_time', formData.end_time) // Empieza antes de que la nueva termine
      .gt('end_time', formData.start_time) // Termina después de que la nueva empiece
      .maybeSingle();
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (internalTimeConflicts.length > 0) return toast.error("Corrige los conflictos de tiempo internos entre ponencias.");
    if (!formData.room_id || !formData.date || !formData.start_time || !formData.end_time) return toast.error("Por favor completa todos los campos.");  

    // Validar cada ponencia contra los slots ocupados visualmente
    for (const pres of selectedWithTimes) {
        if (isTimeConflicting(pres.start_time)) {
            const conflicto = occupiedSlots.find(slot => pres.start_time >= slot.start_time.slice(0,5) && pres.start_time < slot.end_time.slice(0,5));
            toast.error(`Conflicto de horario: La ponencia de las ${pres.start_time} choca con la mesa "${conflicto?.name}"`, { duration: 6000 });
            return;
        }
    }

    setLoading(true);
    // Validar la MESA completa contra la base de datos
    const conflictSession = await checkRoomConflict();
    
    if (conflictSession) {
      toast.error(`SALA OCUPADA: Ya existe la mesa "${conflictSession.name}" en este horario (${conflictSession.start_time.slice(0,5)} hrs).`, { duration: 6000 });
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      let sessionId = editingId;
      const { data, error } = editingId
        ? await supabase.from('sessions').update(payload).eq('id', editingId).select()
        : await supabase.from('sessions').insert([payload]).select();

      if (error) throw error;
      sessionId = data[0].id;

      await supabase.from('presentations').update({ session_id: null, start_time: null, end_time: null }).eq('session_id', sessionId);
      for (const pres of selectedWithTimes) {
        await supabase.from('presentations').update({
          session_id: sessionId, start_time: pres.start_time, end_time: pres.end_time
        }).eq('id', pres.id);
      }
      toast.success('Agenda guardada y ponencias asignadas');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { toast.error('Error al guardar: ' + err.message); }
    finally { setLoading(false); }
  };

  const Label = ({ children }) => (
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1">{children}</label>
  );
  const InputClasses = "w-full p-3 rounded-xl border border-gray-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-gray-700 transition-all";

  // --- VARIABLES PARA LA CABECERA DEL MODAL ---
  const selectedRoom = rooms.find(r => r.id.toString() === formData.room_id);
  const currentVenueName = selectedRoom?.venues?.name;
  const modalVenueStyle = getVenueStyle(currentVenueName);

  return (
    <div className="space-y-4 p-4 animate-in fade-in pb-20 md:pb-4">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: "Mesas Creadas", val: stats.totalMesas, icon: LayoutGrid, color: "text-[#1e3a5f]", bg: "bg-blue-50" },
          { title: "Asignadas", val: stats.assigned, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Pendientes", val: stats.pending, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div><p className="text-[10px] font-black text-gray-400 uppercase italic">{item.title}</p><p className={`text-2xl font-black ${item.color}`}>{item.val}</p></div>
            <div className={`p-2.5 rounded-xl ${item.bg}`}><item.icon className={item.color} size={22} /></div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">      
        <h2 className="text-lg font-black text-[#1e3a5f] uppercase italic pl-2">Gestión de Agenda</h2>
        <button onClick={() => { 
            setEditingId(null); 
            setFormData({name:'', symposium_id:'', room_id:'', date:'', start_time:'', end_time:''}); 
            setOccupiedSlots([]); setSuggestedStartTime(''); setSelectedWithTimes([]); setIsModalOpen(true); 
          }} className="bg-[#1e3a5f] text-white px-4 py-2.5 rounded-lg font-black text-[10px] uppercase italic tracking-widest hover:bg-black transition-all flex gap-2 items-center shadow-md active:scale-95">
          <Plus size={14} /> Nueva Mesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sessions.map(s => {
          const venueStyle = getVenueStyle(s.rooms?.venues?.name);
          const paperCount = s.presentations?.[0]?.count || 0;
          return (
            <div key={s.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-all flex flex-col justify-between">
              <div className="mb-3">
                <div className="flex justify-between items-start mb-1 pr-14">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                        {s.symposiums?.id ? `Simposio ${s.symposiums.id}` : 'Mesa General'}
                      </span>
                      {s.symposiums?.name && (
                        <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight line-clamp-1 mb-1" title={s.symposiums.name}>
                           {s.symposiums.name}
                        </span>
                      )}
                   </div>
                </div>
                <h3 className="font-bold text-[#1e3a5f] text-base leading-tight line-clamp-2">{s.name}</h3>
              </div>
              <div className="absolute top-3 right-3 flex gap-1 z-10">
                <button onClick={() => handleEdit(s)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"><Edit2 size={14}/></button>
                <button onClick={() => setDeleteId(s.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/></button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-50 text-[10px] font-bold uppercase mt-auto">
                <div className="flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                   <Clock size={12}/> {s.start_time?.slice(0,5)}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded border max-w-[140px] ${venueStyle.bg} ${venueStyle.text} ${venueStyle.border}`}>
                   <MapPin size={12} className={venueStyle.icon}/> 
                   <span className="truncate">{s.rooms?.venues?.name || 'Sin sede'}</span>
                </div>
                <div className="flex -space-x-1.5 ml-auto items-center">
                   {paperCount > 0 ? (
                     [...Array(Math.min(paperCount, 4))].map((_, i) => (
                       <div key={i} className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[7px] text-blue-800 font-black shadow-sm" title={`${paperCount} Ponencias`}>
                          <User size={8} />
                       </div>
                     ))
                   ) : (
                     <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center"><div className="w-1 h-1 bg-gray-300 rounded-full"></div></div>
                   )}
                   {paperCount > 4 && <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[7px] text-gray-600 font-bold z-10 shadow-sm">+{paperCount - 4}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">        
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-[95%] h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 sm:zoom-in-95 border border-blue-900/20">
            <div className="p-6 border-b border-blue-900/10 bg-[#1e3a5f] text-white shrink-0 flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase italic tracking-widest text-xl">Programador de Mesa</h3>
                 <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wide mt-1 flex items-center gap-2">
                    {editingId ? `Editando Mesa ID: ${editingId}` : 'Creando Nueva Mesa'}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic flex items-center gap-1 ml-2 text-white ${totalMinutesUsed > 120 ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      <Timer size={10} /> {totalMinutesUsed} / 120 min
                    </span>
                 </p>
              </div>
              {currentVenueName && (
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${modalVenueStyle.bg} ${modalVenueStyle.border} ${modalVenueStyle.text} ml-auto mr-4 animate-in fade-in`}>
                   <MapPin size={14} className={modalVenueStyle.icon} />
                   <span className="text-xs font-black uppercase tracking-wide">{currentVenueName}</span>
                </div>
              )}
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 rounded-full p-2 transition-colors"><X size={24} /></button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              <div className="p-6 lg:w-[320px] border-r border-gray-100 bg-gray-50/80 space-y-5 overflow-y-auto shrink-0">
                <h4 className="text-[10px] font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2 flex items-center gap-2 tracking-widest"><MapPin size={14}/> Ubicación y Horario</h4>
                {occupiedSlots.length > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r text-[10px] text-amber-800 shadow-sm">
                    <p className="font-bold flex items-center gap-1 mb-1 uppercase"><Lock size={10}/> Horarios Ocupados:</p>
                    <ul className="list-disc ml-3 space-y-0.5 mb-2">
                      {occupiedSlots.map(s => <li key={s.id}><strong>{s.start_time.slice(0,5)}</strong> ({s.name})</li>)}
                    </ul>
                    <p className="font-black text-[#1e3a5f] bg-white/50 p-1 rounded text-center">Sugerido: {suggestedStartTime}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div><Label>Nombre de la Mesa</Label><input className={InputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Mesa 1 - Título descriptivo" /></div>
                  <div><Label>Simposio</Label><select className={InputClasses + " bg-white"} value={formData.symposium_id} onChange={e => handleSymposiumChange(e.target.value)}><option value="">-- Seleccionar Simposio --</option>{symposiums.map(s => (<option key={s.id} value={s.id}>{s.id}. {s.name.substring(0,40)}...</option>))}</select></div>
                  
                  {/* --- AQUÍ ESTÁ EL CAMBIO CLAVE: SELECTOR AGRUPADO POR SEDE --- */}
                  <div>
                    <Label>Sala Asignada</Label>
                    <select 
                        className={InputClasses + " bg-white"} 
                        value={formData.room_id} 
                        onChange={e => setFormData({...formData, room_id: e.target.value})}
                    >
                      <option value="">-- Seleccionar Sala --</option>
                      {/* Renderizamos grupos por Sede */}
                      {Object.entries(roomsByVenue).map(([venueName, venueRooms]) => (
                        <optgroup key={venueName} label={venueName}>
                          {venueRooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm space-y-3"><Label><Clock size={12}/> Fecha y Bloque</Label><input type="date" className={InputClasses} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /><div className="grid grid-cols-2 gap-3"><div><Label>Inicio</Label><input type="time" className={`${InputClasses} text-center ${formData.start_time < suggestedStartTime ? 'border-red-500 bg-red-50 text-red-600' : ''}`} value={formData.start_time} min={suggestedStartTime} onChange={e => setFormData({...formData, start_time: e.target.value})} />{formData.start_time < suggestedStartTime && (<p className="text-[8px] font-black text-red-500 mt-1 text-center">Mínimo: {suggestedStartTime}</p>)}</div><div><Label>Fin</Label><input type="time" className={InputClasses + " text-center"} value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} /></div></div></div>
                </div>
              </div>

              <div className="flex-1 border-r border-gray-100 flex flex-col bg-white z-10 relative">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/50"><h4 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2"><LayoutGrid size={14}/> Ponencias Disponibles</h4></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100/30">
                  {availablePresentations.map(pres => {
                    if (selectedWithTimes.find(p => p.id === pres.id)) return null;
                    return (
                      <div key={pres.id} onClick={() => togglePresentation(pres)} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#1e3a5f] hover:shadow-md cursor-pointer flex justify-between items-center transition-all group">
                        <div className="flex-1 pr-2"><p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-[#1e3a5f] transition-colors">{pres.title}</p><p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wide">{pres.authors}</p></div>
                        <div className="bg-[#1e3a5f] text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform"><Plus size={16}/></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-gray-50/80">
                <div className="p-4 border-b bg-white flex items-center gap-2"><LayoutGrid size={14} className="text-[#1e3a5f]"/><h4 className="text-xs font-black text-[#1e3a5f] uppercase italic tracking-widest">Orden de Exposición</h4></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedWithTimes.map((pres, index) => {
                    const isConflicting = isTimeConflicting(pres.start_time);
                    return (
                      <div key={pres.id} className={`bg-white p-4 rounded-xl border-l-[6px] shadow-sm hover:shadow-md transition-all relative ${isConflicting ? 'border-l-red-500 ring-2 ring-red-100' : 'border-l-[#1e3a5f]'}`}>
                        <button onClick={() => togglePresentation(pres)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-full p-1"><X size={14}/></button>
                        <span className="text-[9px] font-black text-blue-500 mb-1 block uppercase tracking-widest">Turno #{index + 1}</span>
                        <p className="text-xs font-bold text-gray-800 uppercase mb-3 line-clamp-2">{pres.title}</p>
                        {isConflicting && <div className="mb-2 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1 uppercase"><Ban size={10}/> ¡Conflicto de Horario!</div>}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <input type="time" className={`flex-1 rounded-lg p-1.5 text-xs font-bold text-center outline-none focus:ring-2 ${isConflicting ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-200' : 'bg-white border-gray-200 focus:ring-blue-100'}`} value={pres.start_time} onChange={e => updatePresTime(pres.id, 'start_time', e.target.value)} />
                          <ArrowRight size={12} className="text-gray-300"/>
                          <input type="time" className="flex-1 bg-white rounded-lg p-1.5 text-xs font-bold text-center border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100" value={pres.end_time} onChange={e => updatePresTime(pres.id, 'end_time', e.target.value)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-20 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl font-bold text-xs text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-colors uppercase tracking-wide">Cancelar</button>
              <button onClick={handleSubmit} disabled={loading} className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1e3a5f] hover:bg-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Agenda'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 border border-red-100">
            <div className="bg-red-50 p-4 rounded-full inline-block mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase italic mb-2 tracking-tight">¿Eliminar Mesa?</h3>
            <p className="text-sm font-medium text-gray-600 mb-8 leading-relaxed">Las ponencias volverán a estar "Pendientes".</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wide text-xs">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-md hover:bg-red-600 hover:shadow-lg transition-all uppercase tracking-widest text-xs">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
