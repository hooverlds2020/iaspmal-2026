import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit2, Trash2, User, Clock, FileText, Calendar, Building, Mail, Globe } from 'lucide-react';

const PresentationsManager = () => {
  const [presentations, setPresentations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState(null);
  const [formData, setFormData] = useState({
    session_id: '',
    title_es: '',
    title_en: '',
    abstract_es: '',
    abstract_en: '',
    author_name: '',
    author_institution: '',
    author_email: '',
    author_country: '',
    duration_minutes: 20,
    presentation_order: 1,
    type: 'oral'
  });

  useEffect(() => {
    fetchPresentations();
    fetchSessions();
  }, []);

  const fetchPresentations = async () => {
    try {
      const { data, error } = await supabase
        .from('presentations')
        .select(`
          *,
          sessions (
            session_number,
            day,
            start_time,
            symposiums (number, title_es)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresentations(data || []);
    } catch (error) {
      console.error('Error fetching presentations:', error);
      alert('Error al cargar las ponencias');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          session_number,
          day,
          start_time,
          symposiums (number, title_es)
        `)
        .order('day', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleOpenModal = (presentation = null) => {
    if (presentation) {
      setEditingPresentation(presentation);
      setFormData({
        session_id: presentation.session_id,
        title_es: presentation.title_es || '',
        title_en: presentation.title_en || '',
        abstract_es: presentation.abstract_es || '',
        abstract_en: presentation.abstract_en || '',
        author_name: presentation.author_name || '',
        author_institution: presentation.author_institution || '',
        author_email: presentation.author_email || '',
        author_country: presentation.author_country || '',
        duration_minutes: presentation.duration_minutes || 20,
        presentation_order: presentation.presentation_order || 1,
        type: presentation.type || 'oral'
      });
    } else {
      setEditingPresentation(null);
      setFormData({
        session_id: '',
        title_es: '',
        title_en: '',
        abstract_es: '',
        abstract_en: '',
        author_name: '',
        author_institution: '',
        author_email: '',
        author_country: '',
        duration_minutes: 20,
        presentation_order: 1,
        type: 'oral'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPresentation) {
        const { error } = await supabase
          .from('presentations')
          .update(formData)
          .eq('id', editingPresentation.id);

        if (error) throw error;
        alert('Ponencia actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('presentations')
          .insert([formData]);

        if (error) throw error;
        alert('Ponencia creada correctamente');
      }

      setShowModal(false);
      fetchPresentations();
    } catch (error) {
      console.error('Error saving presentation:', error);
      alert('Error al guardar la ponencia');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta ponencia?')) return;

    try {
      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Ponencia eliminada correctamente');
      fetchPresentations();
    } catch (error) {
      console.error('Error deleting presentation:', error);
      alert('Error al eliminar la ponencia');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return timeStr?.substring(0, 5) || '';
  };

  const getTypeLabel = (type) => {
    const types = {
      'oral': 'Oral',
      'poster': 'Póster',
      'keynote': 'Magistral',
      'workshop': 'Taller'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'oral': 'bg-blue-100 text-blue-800',
      'poster': 'bg-purple-100 text-purple-800',
      'keynote': 'bg-amber-100 text-amber-800',
      'workshop': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
        <p className="text-gray-600">Total: {presentations.length} ponencias</p>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Ponencia
        </button>
      </div>

      <div className="space-y-4">
        {presentations.map((presentation) => (
          <div
            key={presentation.id}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                    S{presentation.sessions?.symposiums?.number || '?'}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Sesión {presentation.sessions?.session_number || '?'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(presentation.type)}`}>
                    {getTypeLabel(presentation.type)}
                  </span>
                  <span className="text-gray-500 text-xs">
                    Orden: {presentation.presentation_order}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {presentation.title_es || 'Sin título'}
                </h3>
                <p className="text-gray-600 italic mb-3 text-sm">
                  {presentation.title_en}
                </p>

                {presentation.author_name && (
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {presentation.author_name}
                      </span>
                    </div>
                    {presentation.author_institution && (
                      <div className="flex items-center gap-2 ml-6">
                        <Building size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {presentation.author_institution}
                        </span>
                      </div>
                    )}
                    {presentation.author_country && (
                      <div className="flex items-center gap-2 ml-6">
                        <Globe size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {presentation.author_country}
                        </span>
                      </div>
                    )}
                    {presentation.author_email && (
                      <div className="flex items-center gap-2 ml-6">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {presentation.author_email}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {presentation.abstract_es && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {presentation.abstract_es}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  {presentation.sessions?.day && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-teal-600" />
                      <span>{formatDate(presentation.sessions.day)}</span>
                    </div>
                  )}
                  {presentation.sessions?.start_time && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-teal-600" />
                      <span>{formatTime(presentation.sessions.start_time)}</span>
                    </div>
                  )}
                  {presentation.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-blue-600" />
                      <span>{presentation.duration_minutes} min</span>
                    </div>
                  )}
                </div>

                {presentation.sessions?.symposiums?.title_es && (
                  <div className="mt-2 text-xs text-gray-500">
                    {presentation.sessions.symposiums.title_es}
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleOpenModal(presentation)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(presentation.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {presentations.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No hay ponencias creadas</p>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic en "Nueva Ponencia" para crear la primera
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingPresentation ? 'Editar Ponencia' : 'Nueva Ponencia'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sesión y Tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sesión *
                    </label>
                    <select
                      required
                      value={formData.session_id}
                      onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar sesión</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          S{session.symposiums?.number} - Sesión {session.session_number} - {formatDate(session.day)} {formatTime(session.start_time)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="oral">Oral</option>
                      <option value="poster">Póster</option>
                      <option value="keynote">Magistral</option>
                      <option value="workshop">Taller</option>
                    </select>
                  </div>
                </div>

                {/* Orden y Duración */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Orden de Presentación *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.presentation_order}
                      onChange={(e) => setFormData({ ...formData, presentation_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duración (minutos) *
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Títulos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título (Español) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_es}
                    onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Título de la ponencia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título (Inglés) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Presentation title"
                  />
                </div>

                {/* Información del Autor */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Autor/Ponente</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.author_name}
                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ej: Dr. María García López"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Institución
                      </label>
                      <input
                        type="text"
                        value={formData.author_institution}
                        onChange={(e) => setFormData({ ...formData, author_institution: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ej: Universidad Nacional Autónoma de México"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.author_email}
                          onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="autor@universidad.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          País
                        </label>
                        <input
                          type="text"
                          value={formData.author_country}
                          onChange={(e) => setFormData({ ...formData, author_country: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Ej: México"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resúmenes */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen/Abstract</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Resumen (Español)
                      </label>
                      <textarea
                        value={formData.abstract_es}
                        onChange={(e) => setFormData({ ...formData, abstract_es: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Resumen o abstract de la ponencia"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Resumen (Inglés)
                      </label>
                      <textarea
                        value={formData.abstract_en}
                        onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Abstract or summary"
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
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
                    {loading ? 'Guardando...' : editingPresentation ? 'Actualizar' : 'Crear'}
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

export default PresentationsManager;
