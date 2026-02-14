import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Edit2, Trash2, X, Clock, MapPin, 
  Users, CheckCircle2, AlertCircle, Timer, 
  LayoutGrid, Filter, ArrowRight, ShieldAlert, AlertTriangle, Ban
} from 'lucide-react';
import { toast } from 'sonner';

const SessionsManager = () => {
  // --- 1. ESTADOS ---
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMesas: 0, assigned: 0, pending: 0 });

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null); 
  const [conflictData, setConflictData] = useState(null); // Nuevo estado para el Modal de Conflicto

  const [editingId, setEditingId] = useState(null);
  const [availablePresentations, setAvailablePresentations] = useState([]);
  const [selectedWithTimes, setSelectedWithTimes] = useState([]);

  const [formData, setFormData] = useState({
    name: '', symposium_id: '', room_id: '', date: '', start_time: '', end_time: ''
  });

  // --- 2. CARGA DE DATOS ---
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, roomsRes, sympRes, allPresRes] = await Promise.all([
        supabase.from('sessions').select('*, rooms(name), symposiums(name, venue_id), presentations(count)').order('date'),
        supabase.from('rooms').select('*').order('name'),
        supabase.from('symposiums').select('*, venues(name)').order('name'),
        supabase.from('presentations').select('id, session_id')
      ]);

      setSessions(sessionsRes.data || []);
      setRooms(roomsRes.data || []);
      setSymposiums(sympRes.data || []);

      const assigned = allPresRes.data?.filter(p => p.session_id !== null).length || 0;
      const pending = allPresRes.data?.filter(p => p.session_id === null).length || 0;
      setStats({ totalMesas: sessionsRes.data?.length || 0, assigned, pending });
    } catch (error) {
      toast.error("Error de conexión");
    } finally { setLoading(false); }
  };

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

  // --- 3. CÁLCULOS (MEMOS) ---
  const totalMinutesUsed = useMemo(() => {
    return selectedWithTimes.reduce((acc, pres) => {
      if (!pres.start_time || !pres.end_time) return acc;
      const start = new Date(`2026-01-01T${pres.start_time}`);
      const end = new Date(`2026-01-01T${pres.end_time}`);
      return acc + Math.max(0, (end - start) / (1000 * 60));
    }, 0);
  }, [selectedWithTimes]);

  const filteredRooms = useMemo(() => {
    const selectedSymp = symposiums.find(s => s.id.toString() === formData.symposium_id);
    if (!selectedSymp || !selectedSymp.venue_id) return rooms;
    return rooms.filter(r => r.venue_id === selectedSymp.venue_id);
  }, [formData.symposium_id, symposiums, rooms]);

  const internalTimeConflicts = useMemo(() => {
    const sorted = [...selectedWithTimes].sort((a, b) => a.start_time.localeCompare(b.start_time));
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

  // --- 4. MANEJADORES ---
  const handleSymposiumChange = (id) => {
    setFormData(prev => ({ ...prev, symposium_id: id, room_id: '' }));
    const symp = symposiums.find(s => s.id.toString() === id);
    if (symp?.venues?.name) toast.info(`Sede: ${symp.venues.name}`);
  };

  const togglePresentation = (pres) => {
    const exists = selectedWithTimes.find(p => p.id === pres.id);
    if (exists) {
      setSelectedWithTimes(prev => prev.filter(p => p.id !== pres.id));
    } else {
      const sortedCurrent = [...selectedWithTimes].sort((a, b) => a.end_time.localeCompare(b.end_time));
      const lastPres = sortedCurrent[sortedCurrent.length - 1];
      const suggestedStart = lastPres ? lastPres.end_time : (formData.start_time || '09:00');
      
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
      toast.success('Mesa eliminada');
      fetchData();
    } catch (error) { toast.error('Error al eliminar'); }
    finally { setDeleteId(null); }
  };

  // --- LÓGICA DE VALIDACIÓN Y GUARDADO SENIOR ---
  const checkRoomConflict = async () => {
    // Consulta a DB: Buscar solapamientos en la misma sala y día, excluyendo la mesa actual
    const { data, error } = await supabase
      .from('sessions')
      .select('name, start_time, end_time')
      .eq('room_id', formData.room_id)
      .eq('date', formData.date)
      .neq('id', editingId || -1) // Excluirse a sí mismo
      // Lógica de solapamiento: (StartA < EndB) y (EndA > StartB)
      .lt('start_time', formData.end_time)
      .gt('end_time', formData.start_time)
      .maybeSingle(); // Solo necesitamos saber si existe una

    if (data) {
      setConflictData(data); // Guardamos datos del conflicto para el modal
      return true; // Hay conflicto
    }
    return false; // Todo limpio
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (internalTimeConflicts.length > 0) return toast.error("Corrige los conflictos internos de las ponencias.");
    if (!formData.room_id || !formData.date || !formData.start_time || !formData.end_time) return toast.error("Completa los datos de la sala.");

    setLoading(true);
    
    // 1. VALIDACIÓN PREVIA (Evita el error de DB)
    const hasConflict = await checkRoomConflict();
    if (hasConflict) {
      setLoading(false);
      return; // Detenemos aquí y mostramos el modal
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
      toast.success('Agenda guardada');
      setIsModalOpen(false);
      fetchData(); 
    } catch (err) { 
      // Si por alguna razón pasa la validación pero falla la DB, capturamos aquí
      if (err.message.includes('overlap')) {
        setConflictData({ name: 'Mesa desconocida (Error de concurrencia)', start_time: '??', end_time: '??' });
      } else {
        toast.error('Error al guardar: ' + err.message); 
      }
    } 
    finally { setLoading(false); }
  };

  // --- RENDERIZADO ---
  return (
    <div className="space-y-6 p-4 animate-in fade-in pb-20 md:pb-4">
      
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Mesas Creadas", val: stats.totalMesas, icon: LayoutGrid, color: "text-[#1e3a5f]", bg: "bg-blue-50" },
          { title: "Asignadas", val: stats.assigned, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Pendientes", val: stats.pending, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div><p className="text-[10px] font-black text-gray-400 uppercase italic">{item.title}</p><p className={`text-2xl font-black ${item.color}`}>{item.val}</p></div>
            <div className={`p-3 rounded-xl ${item.bg}`}><item.icon className={item.color} size={24} /></div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
        <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic">Gestión de Agenda</h2>
        <button onClick={() => { setEditingId(null); setFormData({name:'', symposium_id:'', room_id:'', date:'', start_time:'', end_time:''}); setSelectedWithTimes([]); setIsModalOpen(true); }} className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase italic tracking-widest hover:bg-black transition-all flex gap-2 items-center shadow-lg active:scale-95">
          <Plus size={16} /> Nueva Mesa
        </button>
      </div>

      {/* GRID MESAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
            <div className="absolute top-4 right-4 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => handleEdit(s)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white"><Edit2 size={16}/></button>
              <button onClick={() => setDeleteId(s.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white"><Trash2 size={16}/></button>
            </div>
            <span className="text-[9px] font-black text-blue-400 uppercase mb-1 block pr-16">{s.symposiums?.name || 'Mesa General'}</span>
            <h3 className="font-bold text-[#1e3a5f] mb-4 text-lg leading-tight line-clamp-2 min-h-[3.5rem]">{s.name || 'Mesa sin nombre'}</h3>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-500 uppercase">
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Clock size={12}/> {s.start_time?.slice(0,5)}</div>
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded max-w-[120px]"><MapPin size={12}/> <span className="truncate">{s.rooms?.name}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL CONFIRMACIÓN BORRADO --- */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase italic mb-3">¿Eliminar Mesa?</h3>
            <p className="text-xs text-gray-500 mb-8">Las ponencias serán liberadas. Irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFLICTO DE SALA (EL NUEVO, EL PRO) --- */}
      {conflictData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border-t-8 border-red-500 relative">
            <button onClick={() => setConflictData(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <Ban size={48} className="text-red-500" />
              </div>
              
              <h3 className="text-xl font-black text-[#1e3a5f] uppercase italic mb-2">Sala Ocupada</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                No se puede guardar. La sala seleccionada ya está reservada en ese horario por otra actividad.
              </p>

              {/* DETALLES DEL CONFLICTO */}
              <div className="w-full bg-red-50 rounded-xl p-4 mb-6 border border-red-100 text-left">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Detalles del Conflicto:</p>
                <div className="flex items-center gap-3 mb-2">
                  <LayoutGrid size={16} className="text-red-600"/>
                  <span className="text-sm font-bold text-gray-800">{conflictData.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-red-600"/>
                  <span className="text-sm font-bold text-gray-800">
                    {conflictData.start_time.slice(0,5)} - {conflictData.end_time.slice(0,5)} hrs
                  </span>
                </div>
              </div>

              <button onClick={() => setConflictData(null)} className="w-full py-4 bg-[#1e3a5f] text-white font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg">
                Entendido, cambiaré el horario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PROGRAMADOR PRINCIPAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-[95%] h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            
            {internalTimeConflicts.length > 0 && (
              <div className="absolute top-0 left-0 right-0 z-[60] bg-orange-500 text-white px-6 py-2 flex items-center justify-between shadow-lg">
                <span className="text-xs font-black uppercase italic tracking-widest flex gap-2"><ShieldAlert size={16}/> Cuidado: Ponencias internas encimadas</span>
              </div>
            )}

            <div className="px-6 py-4 border-b bg-[#1e3a5f] text-white shrink-0 pt-14">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black uppercase italic tracking-widest text-lg sm:text-xl">Programador</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase italic flex items-center gap-2 ${totalMinutesUsed > 120 ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      <Timer size={12} /> {totalMinutesUsed} / 120 min
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* CONFIGURACIÓN */}
              <div className="p-6 lg:w-[320px] border-r border-gray-100 bg-gray-50 space-y-5 overflow-y-auto shrink-0">
                <h4 className="text-[10px] font-black text-[#1e3a5f] uppercase border-b pb-2 flex items-center gap-2"><MapPin size={14}/> Configuración</h4>
                <div className="space-y-4">
                  <input className="w-full p-3 rounded-xl border font-bold text-sm focus:border-[#1e3a5f] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nombre Mesa" />
                  <select className="w-full p-3 rounded-xl border text-sm font-bold bg-white" value={formData.symposium_id} onChange={e => handleSymposiumChange(e.target.value)}>
                    <option value="">-- Simposio --</option>
                    {symposiums.map(s => <option key={s.id} value={s.id}>{s.name.substring(0,40)}...</option>)}
                  </select>
                  <select className="w-full p-3 rounded-xl border text-sm font-bold bg-white" value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})} disabled={!formData.symposium_id}>
                    <option value="">{formData.symposium_id ? 'Seleccionar Sala' : '← Elige Simposio'}</option>
                    {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <div className="grid grid-cols-1 gap-3">
                    <input type="date" className="w-full p-3 rounded-xl border font-bold text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" className="w-full p-2 rounded-xl border font-bold text-sm text-center" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                      <input type="time" className="w-full p-2 rounded-xl border font-bold text-sm text-center" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* LISTA PENDIENTES */}
              <div className="flex-1 border-r border-gray-100 flex flex-col h-[50%] xl:h-full">
                <div className="p-4 border-b bg-white flex justify-between items-center sticky top-0 z-10">
                  <h4 className="text-xs font-black text-[#1e3a5f] uppercase flex items-center gap-2"><Filter size={16}/> Por Asignar</h4>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">{availablePresentations.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {(!formData.symposium_id) && <div className="p-10 text-center text-gray-300 italic text-sm border-2 border-dashed rounded-xl">Selecciona un simposio.</div>}
                  {availablePresentations.map(pres => {
                    if (selectedWithTimes.find(p => p.id === pres.id)) return null;
                    return (
                      <div key={pres.id} onClick={() => togglePresentation(pres)} className="p-4 rounded-xl border-2 border-gray-100 hover:border-[#1e3a5f] hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-all shadow-sm">
                        <div className="pr-3 flex-1"><p className="text-sm font-bold text-gray-700 leading-snug group-hover:text-[#1e3a5f]">{pres.title}</p><p className="text-xs text-gray-500 mt-1 italic">{pres.authors}</p></div>
                        <ArrowRight size={20} className="text-gray-300 group-hover:text-[#1e3a5f] shrink-0"/>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CRONOGRAMA */}
              <div className="flex-1 flex flex-col h-[50%] xl:h-full bg-gray-50/50">
                <div className="p-4 border-b flex items-center gap-2 bg-white sticky top-0 z-10 shadow-sm">
                  <Timer size={16} className="text-orange-500"/>
                  <h4 className="text-xs font-black text-[#1e3a5f] uppercase italic">Cronograma Activo</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {selectedWithTimes.length === 0 && <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2"><LayoutGrid size={40} className="opacity-20"/><p className="text-sm italic">Arrastra o selecciona ponencias.</p></div>}
                  {selectedWithTimes.map((pres, index) => {
                    const hasError = internalTimeConflicts.includes(pres.id);
                    return (
                      <div key={pres.id} className={`bg-white p-4 rounded-xl border-l-[6px] shadow-md animate-in slide-in-from-right-4 ${hasError ? 'border-l-orange-500 ring-1 ring-orange-100' : 'border-l-[#1e3a5f]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded">#{index + 1}</span>
                          <button onClick={() => togglePresentation(pres)} className="text-gray-300 hover:text-red-500"><X size={16}/></button>
                        </div>
                        <p className="text-xs font-bold text-[#1e3a5f] uppercase leading-tight mb-3">{pres.title}</p>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <input type="time" className="flex-1 bg-white border border-gray-200 rounded-md p-1.5 text-xs font-bold text-center outline-none" value={pres.start_time} onChange={e => updatePresTime(pres.id, 'start_time', e.target.value)} />
                          <ArrowRight size={12} className="text-gray-300"/>
                          <input type="time" className="flex-1 bg-white border border-gray-200 rounded-md p-1.5 text-xs font-bold text-center outline-none" value={pres.end_time} onChange={e => updatePresTime(pres.id, 'end_time', e.target.value)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-100">CANCELAR</button>
              <button onClick={handleSubmit} disabled={loading} className={`px-8 sm:px-12 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-xl flex items-center gap-2 ${loading ? 'bg-gray-400 opacity-70' : 'bg-[#1e3a5f] active:scale-95'}`}>{loading ? '...' : 'GUARDAR'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
