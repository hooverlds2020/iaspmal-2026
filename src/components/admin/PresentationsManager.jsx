// src/components/admin/PresentationsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Edit2, Trash2, Save, X, Search, 
  FileText, Building2, AlignLeft, link as LinkIcon 
} from 'lucide-react';

const PresentationsManager = () => {
  const [presentations, setPresentations] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado del formulario con los nuevos campos
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    author_affiliation: '', // Nuevo
    abstract_text: '',      // Nuevo
    pdf_url: '',            // Nuevo
    symposium_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: presData } = await supabase.from('presentations').select('*, symposiums(name)').order('id');
      const { data: sympData } = await supabase.from('symposiums').select('id, name');
      setPresentations(presData || []);
      setSymposiums(sympData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await supabase.from('presentations').update(formData).eq('id', editingId);
      } else {
        await supabase.from('presentations').insert([formData]);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Error al guardar');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', pdf_url: '', symposium_id: '' });
    setEditingId(null);
  };

  const handleEdit = (p) => {
    setFormData({
      title: p.title,
      authors: p.authors,
      author_affiliation: p.author_affiliation || '',
      abstract_text: p.abstract_text || '',
      pdf_url: p.pdf_url || '',
      symposium_id: p.symposium_id || ''
    });
    setEditingId(p.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">Gestión de Ponencias</h2>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[#1e3a5f] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-black transition-all"
        >
          <Plus size={20} /> Nueva Ponencia
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por título o autor..." 
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#f4a261] outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Listado */}
      <div className="grid grid-cols-1 gap-4">
        {presentations.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.authors.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all">
            <div className="flex-1">
              <span className="text-[10px] font-black text-[#f4a261] uppercase">{p.symposiums?.name || 'Sin Simposio'}</span>
              <h3 className="font-bold text-[#1e3a5f] text-lg leading-tight">{p.title}</h3>
              <p className="text-sm text-gray-500 font-medium italic">{p.authors}</p>
              {p.author_affiliation && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Building2 size={12}/> {p.author_affiliation}
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18}/></button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b bg-[#1e3a5f] text-white flex justify-between items-center">
              <h3 className="font-bold text-xl">{editingId ? 'Editar Ponencia' : 'Nueva Ponencia'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Título de la Ponencia</label>
                  <input 
                    required 
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-[#f4a261] outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                {/* Autores */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Autor(es)</label>
                  <input 
                    required 
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-[#f4a261] outline-none"
                    value={formData.authors}
                    onChange={(e) => setFormData({...formData, authors: e.target.value})}
                  />
                </div>

                {/* Filiación */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Filiación / Institución</label>
                  <input 
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-[#f4a261] outline-none"
                    value={formData.author_affiliation}
                    onChange={(e) => setFormData({...formData, author_affiliation: e.target.value})}
                    placeholder="Ej: UNAM, México"
                  />
                </div>

                {/* Resumen (Textarea) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Resumen del Trabajo</label>
                  <textarea 
                    rows="6"
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-[#f4a261] outline-none resize-none"
                    value={formData.abstract_text}
                    onChange={(e) => setFormData({...formData, abstract_text: e.target.value})}
                    placeholder="Escribe o pega aquí el resumen..."
                  />
                </div>

                {/* Simposio y PDF */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Simposio Asignado</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none"
                    value={formData.symposium_id}
                    onChange={(e) => setFormData({...formData, symposium_id: e.target.value})}
                  >
                    <option value="">Seleccionar Simposio...</option>
                    {symposiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-2">Enlace PDF (Opcional)</label>
                  <input 
                    type="url"
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-[#f4a261] outline-none"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({...formData, pdf_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#1e3a5f] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg">
                  <Save size={20}/> Guardar Ponencia
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
