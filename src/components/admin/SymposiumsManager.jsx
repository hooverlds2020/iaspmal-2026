// src/components/admin/SymposiumsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Toast from '../common/Toast';
import { useToast } from '../../hooks/useToast';


const SymposiumsManager = () => {
  const [symposiums, setSymposiums] = useState([]);
  const { toast, showToast, hideToast } = useToast();	
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    title_es: '',
    title_en: '',
    description_es: '',
    description_en: '',
    coordinators: ''
  });

  useEffect(() => {
    loadSymposiums();
  }, []);

  const loadSymposiums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('symposiums')
        .select('*')
        .order('number');

      if (error) throw error;
      setSymposiums(data || []);
    } catch (error) {
      console.error('Error loading symposiums:', error);
      showToast('Error al cargar simposios: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (symposium) => {
    setEditingId(symposium.id);
    setFormData({
      number: symposium.number,
      title_es: symposium.title_es,
      title_en: symposium.title_en || '',
      description_es: symposium.description_es || '',
      description_en: symposium.description_en || '',
      coordinators: symposium.coordinators?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('symposiums')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadSymposiums();
      showToast('Simposio eliminado correctamente', 'success');
      } catch (error) {
      console.error('Error deleting symposium:', error);
      showToast('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const coordinatorsArray = formData.coordinators
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const dataToSave = {
        number: parseInt(formData.number),
        title_es: formData.title_es,
        title_en: formData.title_en || null,
        description_es: formData.description_es || null,
        description_en: formData.description_en || null,
        coordinators: coordinatorsArray
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('symposiums')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Simposio actualizado correctamente', 'success');
      } else {
        // Insert
        const { error } = await supabase
          .from('symposiums')
          .insert([dataToSave]);

        if (error) throw error;
        showToast('Simposio creado correctamente', 'success');
      }

      resetForm();
      loadSymposiums();
    } catch (error) {
      console.error('Error saving symposium:', error);
      showToast('Error al guardar: ' + error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      title_es: '',
      title_en: '',
      description_es: '',
      description_en: '',
      coordinators: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}	  

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Simposios ({symposiums.length}/19)
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Simposio
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingId ? 'Editar Simposio' : 'Nuevo Simposio'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="19"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordinadores * (separados por comas)
                </label>
                <input
                  type="text"
                  required
                  value={formData.coordinators}
                  onChange={(e) => setFormData({ ...formData, coordinators: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Nombre1, Nombre2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título (Español) *
              </label>
              <input
                type="text"
                required
                value={formData.title_es}
                onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título (Inglés)
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Español)
              </label>
              <textarea
                rows="3"
                value={formData.description_es}
                onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Inglés)
              </label>
              <textarea
                rows="3"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {symposiums.map((symposium) => (
          <div
            key={symposium.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-teal-600 text-white text-sm font-bold px-3 py-1 rounded">
                    S{symposium.number}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{symposium.title_es}</h3>
                </div>
                {symposium.title_en && (
                  <p className="text-sm text-gray-600 italic mb-2">{symposium.title_en}</p>
                )}
                <p className="text-sm text-gray-600">
                  <strong>Coordinadores:</strong> {symposium.coordinators?.join(', ')}
                </p>
                {symposium.description_es && (
                  <p className="text-sm text-gray-500 mt-2">{symposium.description_es}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(symposium)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(symposium.id, symposium.title_es)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SymposiumsManager;
