import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Search, Plus, Edit2, X, Trash2,
  MapPin, BookOpen, AlertCircle, Users, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const SymposiumsManager = () => {
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    coordinators: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('symposiums')
        .select('*, venues(name)');

      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => a.id - b.id);

      setSymposiums(sortedData);
    } catch (error) {
      console.error('Error cargando simposios:', error.message);
      toast.error('Error al cargar la lista de simposios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const query = editingId
        ? supabase.from('symposiums').update(formData).eq('id', editingId)
        : supabase.from('symposiums').insert([formData]);

      const { error } = await query;
      if (error) throw error;

      toast.success(editingId ? 'Simposio actualizado correctamente' : 'Simposio creado correctamente');

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', coordinators: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar: ' + error.message);
    }
  };

  const handleEdit = (symposium) => {
    setEditingId(symposium.id);
    setFormData({
      name: symposium.name,
      coordinators: symposium.coordinators || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const { error, count } = await supabase
        .from('symposiums')
        .delete({ count: 'exact' })
        .eq('id', deleteTarget.id);

      if (error) {
        if (error.code === '23503') {
          toast.error('No se puede eliminar: este simposio tiene sesiones o ponencias asociadas.');
        } else {
          toast.error('Error al eliminar: ' + error.message);
        }
        return;
      }

      if (!count) {
        toast.error('No se eliminó ningún registro. Verifica los permisos (RLS) de la tabla symposiums.');
        return;
      }

      toast.success('Simposio eliminado correctamente');
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = symposiums.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Listado de Simposios ({symposiums.length})</h2>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar simposio..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-600 bg-white shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', coordinators: '' });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md font-bold text-sm"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-10 text-center text-gray-400 italic">Cargando datos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed">
            No se encontraron simposios.
          </div>
        ) : (
          filtered.map(symposium => (
            <div key={symposium.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100">
                      ID: {symposium.id}
                    </span>
                    {symposium.venues?.name && (
                      <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-green-100">
                        <MapPin size={10} /> {symposium.venues.name}
                      </span>
                    )}
                </div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">{symposium.name}</h3>
                {symposium.coordinators ? (
                  <div className="flex items-start gap-2 text-gray-500 text-xs">
                    <Users size={14} className="mt-0.5 shrink-0" />
                    <p className="font-medium">{symposium.coordinators}</p>
                  </div>
                ) : (
                  <p className="text-xs text-orange-400 italic flex items-center gap-1"><AlertCircle size={12}/> Sin coordinadores asignados</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => setDeleteTarget(symposium)}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-bold text-sm"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
                <button
                  onClick={() => handleEdit(symposium)}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-bold text-sm"
                >
                  <Edit2 size={16} /> Editar Datos
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-bold text-lg">{editingId ? 'Editar Simposio' : 'Nuevo Simposio'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 rounded-full p-1"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Simposio</label>
                <textarea required className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-600 outline-none text-sm min-h-[60px]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Coordinación (Nombres)</label>
                <textarea
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-600 outline-none text-sm min-h-[80px]"
                  placeholder="Ej: Adalberto Paranhos, Julio Mendívil..."
                  value={formData.coordinators}
                  onChange={e => setFormData({...formData, coordinators: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-colors">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <h3 className="font-bold text-lg text-gray-800">Eliminar simposio</h3>
              </div>

              <p className="text-sm text-gray-600">
                ¿Seguro que deseas eliminar el simposio <span className="font-bold text-gray-800">"{deleteTarget.name}"</span> (ID: {deleteTarget.id})? Esta acción no se puede deshacer.
              </p>
              <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-lg p-3">
                Si este simposio tiene sesiones o ponencias asociadas, la eliminación puede fallar. Elimínalas primero desde "Agenda / Mesas" y "Ponencias".
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-[2] py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymposiumsManager;
