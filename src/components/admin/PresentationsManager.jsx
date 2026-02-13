// src/components/admin/PresentationsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Edit2, Trash2, X, Search, 
  FileText, Link as LinkIcon // <--- CORRECCIÓN IMPORTANTE: 'Link' con mayúscula y alias para no chocar
} from 'lucide-react';

const PresentationsManager = () => {
  const [presentations, setPresentations] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [presRes, sympRes] = await Promise.all([
        supabase.from('presentations').select('*, symposiums(name)').order('created_at', { ascending: false }),
        supabase.from('symposiums').select('id, name').order('name')
      ]);
      setPresentations(presRes.data || []);
      setSymposiums(sympRes.data || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const query = editingId 
        ? supabase.from('presentations').update(formData).eq('id', editingId)
        : supabase.from('presentations').insert([formData]);
      
      const { error } = await query;
      if (error) throw error;
      
      setIsModalOpen(false); setEditingId(null);
      setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: '' });
      fetchData();
    } catch (error) { alert('Error al guardar'); }
  };

  const handleEdit = (pres) => {
    setEditingId(pres.id);
    setFormData({
      title: pres.title, authors: pres.authors, author_affiliation: pres.author_affiliation,
      abstract_text: pres.abstract_text, symposium_id: pres.symposium_id, pdf_url: pres.pdf_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
      await supabase.from('presentations').delete().eq('id', id);
      fetchData();
    }
  };

  const filtered = presentations.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">Ponencias</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <input type="text" placeholder="Buscar..." className="flex-1 px-4 py-2 rounded-xl border" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <button onClick={() => { setEditingId(null); setFormData({title:'', authors:'', author_affiliation:'', abstract_text:'', symposium_id:'', pdf_url:''}); setIsModalOpen(true); }} className="bg-[#1e3a5f] text-white px-4 py-2 rounded-xl flex items-center gap-2"><Plus size={20} /> Nueva</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4 text-xs uppercase text-gray-400">Título</th><th className="p-4 text-xs uppercase text-gray-400">Autores</th><th className="p-4 text-right"></th></tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4"><p className="font-bold text-[#1e3a5f] text-sm line-clamp-2">{p.title}</p><span className="text-[10px] bg-blue-50 text-blue-600 px-2 rounded-full">{p.symposiums?.name}</span></td>
                <td className="p-4"><p className="text-xs font-bold">{p.authors}</p></td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Ponencia</h3><button onClick={()=>setIsModalOpen(false)}><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea placeholder="Título" required className="w-full p-2 border rounded-lg" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} />
              <select required className="w-full p-2 border rounded-lg" value={formData.symposium_id} onChange={e=>setFormData({...formData, symposium_id:e.target.value})}>
                <option value="">Simposio...</option>
                {symposiums.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input placeholder="Autores" required className="w-full p-2 border rounded-lg" value={formData.authors} onChange={e=>setFormData({...formData, authors:e.target.value})} />
              <input placeholder="Filiación" className="w-full p-2 border rounded-lg" value={formData.author_affiliation} onChange={e=>setFormData({...formData, author_affiliation:e.target.value})} />
              <textarea placeholder="Resumen..." className="w-full p-2 border rounded-lg" rows="4" value={formData.abstract_text} onChange={e=>setFormData({...formData, abstract_text:e.target.value})} />
              <div className="relative"><LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={16}/><input placeholder="URL PDF" className="w-full pl-9 p-2 border rounded-lg" value={formData.pdf_url} onChange={e=>setFormData({...formData, pdf_url:e.target.value})} /></div>
              <button type="submit" className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-bold">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationsManager;
