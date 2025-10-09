import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react';

const SessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    symposium_id: '',
    notes_es: '',
    notes_en: '',
    day: '',
    start_time: '',
    end_time: '',
    room_id: '',
    session_number: 1
  });

  useEffect(() => {
    fetchSessions();
    fetchSymposiums();
    fetchRooms();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          symposiums (number, title_es),
          rooms (name)
        `)
        .order('day', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      alert('Error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const fetchSymposiums = async () => {
    try {
      const { data, error } = await supabase
        .from('symposiums')
        .select('id, number, title_es')
        .order('number');

      if (error) throw error;
      setSymposiums(data || []);
    } catch (error) {
      console.error('Error fetching symposiums:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleOpenModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        symposium_id: session.symposium_id,
        notes_es: session.notes_es || '',
        notes_en: session.notes_en || '',
        day: session.day,
        start_time: session.start_time,
        end_time: session.end_time,
        room_id: session.room_id || '',
        session_number: session.session_number
      });
    } else {
      setEditingSession(null);
      setFormData({
        symposium_id: '',
        notes_es: '',
        notes_en: '',
        day: '',
        start_time: '',
        end_time: '',
        room_id: '',
        session_number: 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(formData)
          .eq('id', editingSession.id);

        if (error) throw error;
        alert('Sesión actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert([formData]);

        if (error) throw error;
        alert('Sesión creada correctamente');
      }

      setShowModal(false);
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error al guardar la sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sesión?')) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Sesión eliminada correctamente');
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error al eliminar la sesión');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Total: {sessions.length} sesiones</p>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Sesión
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                    S{session.symposiums?.number || 'N/A'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Sesión {session.session_number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {session.symposiums?.title_es || 'Sin título'}
                </h3>

                {session.notes_es && (
                  <p className="text-gray-700 text-sm mb-3">
                    {session.notes_es}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-teal-600" />
                    <span>{formatDate(session.day)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-teal-600" />
                    <span>
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </span>
                  </div>
                  {session.rooms && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-teal-600" />
                      <span>{session.rooms.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleOpenModal(session)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay sesiones creadas</p>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic en "Nueva Sesión" para crear la primera
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingSession ? 'Editar Sesión' : 'Nueva Sesión'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Simposio *
                  </label>
                  <select
                    required
                    value={formData.symposium_id}
                    onChange={(e) => setFormData({ ...formData, symposium_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar simposio</option>
                    {symposiums.map((symposium) => (
                      <option key={symposium.id} value={symposium.id}>
                        S{symposium.number} - {symposium.title_es}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Sesión *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.session_number}
                    onChange={(e) => setFormData({ ...formData, session_number: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notas (Español)
                  </label>
                  <textarea
                    value={formData.notes_es}
                    onChange={(e) => setFormData({ ...formData, notes_es: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Notas o descripción de la sesión"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notas (Inglés)
                  </label>
                  <textarea
                    value={formData.notes_en}
                    onChange={(e) => setFormData({ ...formData, notes_en: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Session notes or description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sala
                  </label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Sin asignar</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingSession ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
