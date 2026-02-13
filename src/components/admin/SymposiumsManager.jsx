import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Search, Plus, Edit2, X, 
  MapPin, BookOpen, AlertCircle, Users 
} from 'lucide-react';

const SymposiumsManager = () => {
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    coordinators: '' // NUEVO CAMPO
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('symposiums')
        .select('*, venues(name)'); // Traemos todo, incluyendo coordinators

      if (error) throw error;

      // Ordenamiento Natural
      const sortedData = (data || []).sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      setSymposiums(sortedData);
    } catch (error) {
      console.error('Error cargando simposios:', error.message);
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
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', coordinators: '' });
      fetchData();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleEdit = (symposium) => {
    setEditingId(symposium.id);
    setFormData({
      name: symposium.name,
      coordinators: symposium.coordinators || '' // Cargamos lo que haya
    });
    setIsModalOpen(true);
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
                
                {/* MOSTRAR COORDINADORES EN LA TARJETA */}
                {symposium.coordinators ? (
                  <div className="flex items-start gap-2 text-gray-500 text-xs">
                    <Users size={14} className="mt-0.5 shrink-0" />
                    <p className="font-medium">{symposium.coordinators}</p>
                  </div>
                ) : (
                  <p className="text-xs text-orange-400 italic flex items-center gap-1"><AlertCircle size={12}/> Sin coordinadores asignados</p>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-50">
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

      {/* MODAL */}
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

              {/* CAMPO NUEVO PARA COORDINADORES */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Coordinación (Nombres)</label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-600 outline-none text-sm min-h-[80px]" 
                  placeholder="Ej: Adalberto Paranhos, Julio Mendívil..." 
                  value={formData.coordinators} 
                  onChange={e => setFormData({...formData, coordinators: e.target.value})} 
                />
                <p className="text-[10px] text-gray-400">Copia y pega los nombres tal como aparecen en el documento.</p>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-colors">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SymposiumsManager;
