// src/components/admin/PresentationsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Plus, Edit2, Trash2, X, Search,
  Link as LinkIcon, ChevronDown, ChevronRight, Folder, FileText, User, Save
} from 'lucide-react';
import { toast } from 'sonner'; // Alertas bonitas

const PresentationsManager = () => {
  const [presentations, setPresentations] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({});

  const [formData, setFormData] = useState({
    title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [presRes, sympRes] = await Promise.all([
        // --- AJUSTE: ORDENAMIENTO POR AUTOR (A-Z) ---
        supabase.from('presentations').select('*, symposiums(id, name)').order('authors', { ascending: true }),
        supabase.from('symposiums').select('id, name').order('id', { ascending: true })
      ]);

      if (presRes.error) throw presRes.error;
      if (sympRes.error) throw sympRes.error;

      setPresentations(presRes.data || []);
      setSymposiums(sympRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error.message);
      toast.error('Error al cargar la lista de ponencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const query = editingId
        ? supabase.from('presentations').update(formData).eq('id', editingId)
        : supabase.from('presentations').insert([formData]);

      const { error } = await query;
      if (error) throw error;

      toast.success(editingId ? 'Ponencia actualizada correctamente' : 'Ponencia registrada con éxito');

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: '' });
      fetchData();
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    }
  };

  const handleEdit = (pres) => {
    setEditingId(pres.id);
    setFormData({
      title: pres.title,
      authors: pres.authors,
      author_affiliation: pres.author_affiliation || '',
      abstract_text: pres.abstract_text || '',
      symposium_id: pres.symposium_id,
      pdf_url: pres.pdf_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    // Usamos confirm nativo por rapidez, pero podría ser modal personalizado
    if (!window.confirm('¿Seguro que deseas eliminar esta ponencia permanentemente?')) return;
    
    try {
      const { error } = await supabase.from('presentations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Ponencia eliminada');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar la ponencia');
    }
  };

  const toggleAccordion = (sympId) => {
    setOpenAccordions(prev => ({ ...prev, [sympId]: !prev[sympId] }));
  };

  const filtered = presentations.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.authors?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedBySympId = filtered.reduce((acc, curr) => {
    const id = curr.symposium_id || 'unassigned';
    if (!acc[id]) acc[id] = [];
    acc[id].push(curr);
    return acc;
  }, {});

  // Estilos auxiliares
  const Label = ({ children }) => (
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1">{children}</label>
  );
  const InputClasses = "w-full p-3 rounded-xl border border-gray-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-gray-700 transition-all";


  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 pl-2">
           <div className="bg-blue-50 p-2 rounded-xl text-[#1e3a5f]">
              <FileText size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic tracking-tight">Gestión de Ponencias</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                 {presentations.length} Registros Totales
              </p>
           </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por título o autor..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1e3a5f] bg-gray-50 focus:bg-white shadow-sm text-sm font-bold transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => { setEditingId(null); setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: '' }); setIsModalOpen(true); }} 
            className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 font-black text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {/* --- LISTADO (ACORDEONES) --- */}
      <div className="space-y-3">
        {loading ? (
           <div className="p-20 text-center text-gray-400 italic">Cargando datos...</div>
        ) : (
          symposiums.map(symp => {
            const papers = groupedBySympId[symp.id] || [];
            if (searchTerm && papers.length === 0) return null; // Si hay búsqueda, ocultar vacíos
            const isOpen = openAccordions[symp.id] || searchTerm.length > 0;

            return (
              <div key={symp.id} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-blue-200 shadow-md' : 'border-gray-200 shadow-sm'}`}>
                <button onClick={() => toggleAccordion(symp.id)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'}`}>
                       <Folder size={18} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-[#1e3a5f] uppercase mb-0.5 block tracking-wide">Simposio {symp.id}</span>
                      <h3 className="font-bold text-gray-800 text-sm md:text-base pr-4 leading-tight">{symp.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-500 uppercase">{papers.length} ponencias</span>
                    {isOpen ? <ChevronDown size={20} className="text-[#1e3a5f]"/> : <ChevronRight size={20} className="text-gray-300"/>}
                  </div>
                </button>
                
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/30">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                        <tr>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest w-[60%]">Título</th>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest">Autoría (A-Z)</th>
                          <th className="p-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {papers.map(p => (
                          <tr key={p.id} className="hover:bg-white transition-colors group/row">
                            <td className="p-4 align-top">
                              <p className="font-bold text-gray-800 text-sm leading-snug">{p.title}</p>
                              {p.pdf_url && <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-green-50 text-green-700 text-[9px] font-bold border border-green-100"><LinkIcon size={10}/> PDF LINK</span>}
                            </td>
                            <td className="p-4 align-top">
                              <div className="flex items-start gap-2">
                                 <User size={14} className="text-gray-400 mt-0.5" />
                                 <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase">{p.authors}</p>
                                    <p className="text-[10px] text-gray-400 italic truncate max-w-[200px]">{p.author_affiliation}</p>        
                                 </div>
                              </div>
                            </td>
                            <td className="p-4 text-right align-top">
                              <div className="flex justify-end gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-100"><Edit2 size={14}/></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-100"><Trash2 size={14}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {papers.length === 0 && (
                           <tr><td colSpan="3" className="p-6 text-center text-sm text-gray-400 italic">No hay ponencias registradas en este simposio.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL DE EDICIÓN (PREMIUM STYLE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-blue-900/20 animate-in zoom-in-95">
            
            {/* Cabecera Modal */}
            <div className="p-6 border-b border-blue-900/10 bg-[#1e3a5f] text-white shrink-0 flex justify-between items-center">
              <div>
                 <h3 className="font-black uppercase italic tracking-widest text-xl">
                    {editingId ? 'Editar Ponencia' : 'Nueva Ponencia'}
                 </h3>
                 <p className="text-[10px] font-medium text-blue-200 uppercase tracking-wide mt-1">
                    {editingId ? `ID: ${editingId}` : 'Registro de nuevo trabajo'}
                 </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 rounded-full p-2 transition-colors"><X size={24} /></button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 bg-white">
              
              <div>
                <Label>Título de la Ponencia</Label>
                <textarea required className={InputClasses} rows="2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ingrese el título completo..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Simposio Asignado</Label>
                  <select required className={InputClasses + " bg-white"} value={formData.symposium_id} onChange={e => setFormData({...formData, symposium_id: e.target.value})}>
                    <option value="">-- Seleccionar --</option>
                    {symposiums.map(s => <option key={s.id} value={s.id}>Simposio {s.id}: {s.name.substring(0,30)}...</option>)}
                  </select>
                </div>
                <div>
                  <Label>Enlace PDF (Opcional)</Label>
                  <input type="url" className={InputClasses} value={formData.pdf_url} onChange={e => setFormData({...formData, pdf_url: e.target.value})} placeholder="https://..." />
                </div>
              </div>

              <div>
                <Label>Autores (Apellidos, Nombres)</Label>
                <input required className={InputClasses} value={formData.authors} onChange={e => setFormData({...formData, authors: e.target.value})} placeholder="Ej: PÉREZ, JUAN" />
                <p className="text-[10px] text-gray-400 italic text-right mt-1">Formato sugerido: APELLIDOS, Nombres</p>
              </div>

              <div>
                <Label>Filiación Institucional</Label>
                <input className={InputClasses} value={formData.author_affiliation} onChange={e => setFormData({...formData, author_affiliation: e.target.value})} placeholder="Ej: Universidad Nacional..." />
              </div>

              <div>
                <Label>Resumen / Abstract</Label>
                <textarea className={InputClasses} rows="5" value={formData.abstract_text} onChange={e => setFormData({...formData, abstract_text: e.target.value})} placeholder="Pegue aquí el resumen..." />
              </div>

            </form>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-20 shrink-0">
               <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl font-bold text-xs text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-colors uppercase tracking-wide">Cancelar</button>
               <button type="submit" onClick={handleSubmit} className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#1e3a5f] hover:bg-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                  <Save size={16} /> Guardar Datos
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationsManager;
