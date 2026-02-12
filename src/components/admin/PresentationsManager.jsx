// src/components/admin/PresentationsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FileText, Search, User, Layers, Loader2, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const PresentationsManager = () => {
  const [presentations, setPresentations] = useState([]);
  const [symposiums, setSymposiums] = useState([]); // Necesitamos la lista para el select
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para el Modal (Crear/Editar)
  const [showModal, setShowModal] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    symposium_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar Ponencias
      const { data: presData, error: presError } = await supabase
        .from('presentations')
        .select(`
          id, title, authors, symposium_id,
          symposiums (name, id)
        `)
        .order('symposium_id', { ascending: true });

      if (presError) throw presError;

      // 2. Cargar Simposios (Para el formulario de agregar/editar)
      const { data: sympData, error: sympError } = await supabase
        .from('symposiums')
        .select('id, name')
        .order('id');

      if (sympError) throw sympError;

      setPresentations(presData);
      setSymposiums(sympData);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DEL CRUD ---

  // 1. ABRIR MODAL
  const openModal = (presentation = null) => {
    if (presentation) {
      // Modo Edición
      setEditingPresentation(presentation);
      setFormData({
        title: presentation.title,
        authors: presentation.authors,
        symposium_id: presentation.symposium_id
      });
    } else {
      // Modo Crear
      setEditingPresentation(null);
      setFormData({ title: '', authors: '', symposium_id: '' });
    }
    setShowModal(true);
  };

  // 2. GUARDAR (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPresentation) {
        // ACTUALIZAR
        const { error } = await supabase
          .from('presentations')
          .update({
            title: formData.title,
            authors: formData.authors,
            symposium_id: formData.symposium_id
          })
          .eq('id', editingPresentation.id);

        if (error) throw error;
        toast.success('Ponencia actualizada correctamente');
      } else {
        // CREAR NUEVA
        const { error } = await supabase
          .from('presentations')
          .insert([{
            title: formData.title,
            authors: formData.authors,
            symposium_id: formData.symposium_id
          }]);

        if (error) throw error;
        toast.success('Ponencia creada correctamente');
      }

      setShowModal(false);
      fetchData(); // Recargar la lista
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la ponencia');
    }
  };

  // 3. ELIMINAR
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres borrar esta ponencia? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Ponencia eliminada');
      // Actualizamos el estado local para que sea instantáneo
      setPresentations(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar');
    }
  };

  // Filtrado por buscador
  const filteredPresentations = presentations.filter(p => 
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.authors || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-iaspm-blue w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      
      {/* --- HEADER Y BUSCADOR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-iaspm-blue" />
          Ponencias Aceptadas ({presentations.length})
        </h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar título o autor..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-iaspm-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* BOTÓN NUEVO: AGREGAR */}
          <button 
            onClick={() => openModal()}
            className="bg-iaspm-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
      </div>

      {/* --- TABLA DE DATOS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-600">Título</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Autor(es)</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Simposio</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPresentations.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4 font-medium text-gray-900 w-[40%]">
                    {p.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600 w-[25%]">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-gray-400" />
                      {p.authors}
                    </div>
                  </td>
                  <td className="px-6 py-4 w-[20%]">
                    <div className="flex flex-col">
                      <span className="bg-blue-50 text-iaspm-blue text-xs px-2 py-0.5 rounded-full w-fit font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> ID: {p.symposium_id}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 line-clamp-1" title={p.symposiums?.name}>
                        {p.symposiums?.name}
                      </span>
                    </div>
                  </td>
                  {/* BOTONES DE EDICIÓN Y BORRADO (Aparecen al pasar el mouse) */}
                  <td className="px-6 py-4 text-right w-[15%]">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(p)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPresentations.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN / CREACIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {editingPresentation ? 'Editar Ponencia' : 'Nueva Ponencia'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Simposio</label>
                <select 
                  required
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-iaspm-blue"
                  value={formData.symposium_id}
                  onChange={(e) => setFormData({...formData, symposium_id: e.target.value})}
                >
                  <option value="">-- Seleccionar Simposio --</option>
                  {symposiums.map(s => (
                    <option key={s.id} value={s.id}>{s.id}. {s.name.substring(0, 60)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Ponencia</label>
                <textarea 
                  required
                  rows="3"
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-iaspm-blue"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor(es)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: PÉREZ, Juan y GÓMEZ, María"
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-iaspm-blue"
                  value={formData.authors}
                  onChange={(e) => setFormData({...formData, authors: e.target.value})}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm bg-iaspm-blue text-white rounded-lg hover:bg-blue-800 transition flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PresentationsManager;
