import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Edit2, Trash2, X, 
  Calendar, Clock, MapPin, Users, 
  LayoutGrid, CheckCircle2, AlertCircle 
} from 'lucide-react';

const SessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [stats, setStats] = useState({ totalMesas: 0, assigned: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    symposium_id: '',
    room_id: '',
    date: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Traemos las Sesiones (Mesas) con sus relaciones
      const sessionsQuery = supabase
        .from('sessions')
        .select(`
          *,
          rooms (id, name),
          symposiums (id, name),
          presentations (count)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      // 2. Traemos datos auxiliares para el formulario y estadísticas
      const [sessionsRes, roomsRes, sympRes, presRes] = await Promise.all([
        sessionsQuery,
        supabase.from('rooms').select('id, name').order('name'),
        supabase.from('symposiums').select('id, name').order('name'),
        supabase.from('presentations').select('id, session_id') // Solo IDs para contar rápido
      ]);

      if (sessionsRes.error) throw sessionsRes.error;

      const sessionsData = sessionsRes.data || [];
      const presentationsData = presRes.data || [];

      setSessions(sessionsData);
      setRooms(roomsRes.data || []);
      setSymposiums(sympRes.data || []);

      // CÁLCULO DE ESTADÍSTICAS
      const assignedCount = presentationsData.filter(p => p.session_id !== null).length;
      const pendingCount = presentationsData.filter(p => p.session_id === null).length;

      setStats({
        totalMesas: sessionsData.length,
        assigned: assignedCount,
        pending: pendingCount
      });

    } catch (error) {
      console.error('Error cargando datos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const query = editingId 
        ? supabase.from('sessions').update(formData).eq('id', editingId)
        : supabase.from('sessions').insert([formData]);
      
      const { error } = await query;
      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', symposium_id: '', room_id: '', date: '', start_time: '', end_time: '' });
      fetchData();
    } catch (error) {
      alert('Error al guardar la mesa');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta mesa? Las ponencias asociadas quedarán "Sin Asignar".')) return;
    try {
      await supabase.from('sessions').delete().eq('id', id);
      fetchData();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setFormData({
      name: session.name,
      symposium_id: session.symposium_id,
      room_id: session.room_id,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- DASHBOARD DE ESTADÍSTICAS (Sustituye al título) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {/* Card 1: Total Mesas */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mesas Creadas</p>
            <p className="text-2xl font-black text-[#1e3a5f]">{stats.totalMesas}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <LayoutGrid size={24} />
          </div>
        </div>

        {/* Card 2: Ponencias Asignadas */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ponencias Asignadas</p>
            <p className="text-2xl font-black text-green-600">{stats.assigned}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Card 3: Pendientes (Alerta) */}
        <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1 h-full bg-orange-400"></div>
          <div>
            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Faltan por Asignar</p>
            <p className="text-2xl font-black text-orange-500">{stats.pending}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-500">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIÓN */}
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', symposium_id: '', room_id: '', date: '', start_time: '', end_time: '' });
            setIsModalOpen(true);
          }} 
          className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-md font-bold text-sm"
        >
          <Plus size={18} /> Nueva Mesa
        </button>
      </div>

      {/* GRID DE MESAS (SESIONES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic">Cargando mesas...</div>
        ) : sessions.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No hay mesas creadas aún.
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3 group">
              {/* Encabezado de la Tarjeta */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    {session.symposiums?.name ? 'Simposio' : 'Mesa General'}
                  </span>
                  <h3 className="font-bold text-[#1e3a5f] text-lg leading-tight line-clamp-2">
                    {session.symposiums?.name || session.name}
                  </h3>
                  {session.name && session.symposiums?.name && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">{session.name}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(session)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(session.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>

              {/* Detalles (Hora y Lugar) */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 truncate">{session.rooms?.name || 'Sin Sala'}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 truncate">
                    {session.start_time?.slice(0,5)} - {session.end_time?.slice(0,5)}
                  </span>
                </div>
              </div>

              {/* Footer de la tarjeta: Contador de ponencias */}
              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">{session.date}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${session.presentations[0].count > 0 ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-600'}`}>
                  <Users size={12} />
                  {session.presentations[0].count} Ponencias
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL PARA CREAR/EDITAR (Mantiene la funcionalidad original) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-[#1e3a5f] text-white">
              <h3 className="font-bold text-lg">{editingId ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre de la Mesa (Opcional)</label>
                <input className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" placeholder="Ej: Mesa 1, Panel A..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Simposio Asociado</label>
                <select className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm bg-white" value={formData.symposium_id} onChange={e => setFormData({...formData, symposium_id: e.target.value})}>
                  <option value="">-- General / Sin Simposio --</option>
                  {symposiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Sala / Aula</label>
                <select required className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm bg-white" value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})}>
                  <option value="">Seleccionar sala...</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Fecha</label>
                  <input required type="date" className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Inicio</label>
                  <input required type="time" className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Fin</label>
                  <input required type="time" className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl font-bold text-white bg-[#1e3a5f] hover:bg-black">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
