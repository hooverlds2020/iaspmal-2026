// src/components/admin/PresentationsManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Plus, Edit2, Trash2, X, Search,
  Link as LinkIcon, ChevronDown, ChevronRight, Folder, FileText, User, Save, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner'; 

const PresentationsManager = () => {
  const [presentations, setPresentations] = useState([]);
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false); // Cambiado de Modal a Editor
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

      setIsEditorOpen(false);
      setEditingId(null);
      setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: '' });
      fetchData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    }
  };

  const handleEdit = (pres) => {
    setEditingId(pres.id);
    setFormData({
      title: pres.title || '',
      authors: pres.authors || '',
      author_affiliation: pres.author_affiliation || '',
      abstract_text: pres.abstract_text || '',
      symposium_id: pres.symposium_id || '',
      pdf_url: pres.pdf_url || ''
    });
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
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
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">{children}</label>
  );
  const InputClasses = "w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-gray-700 transition-all bg-white";

  // --- VISTA 2: EDITOR INLINE DE PONENCIAS ---
  if (isEditorOpen) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-5xl mx-auto pb-10">
        <button 
          onClick={() => { setIsEditorOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          className="mb-5 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm transition-colors group bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a la lista de ponencias
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
          
          {/* Cabecera del Editor */}
          <div className="p-6 md:p-8 border-b border-blue-900/10 bg-[#1e3a5f] text-white shrink-0">
             <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-100">
                   <FileText size={28} />
                </div>
                <div>
                   <h3 className="font-black uppercase italic tracking-widest text-2xl md:text-3xl">
                      {editingId ? 'Editar Ponencia' : 'Nueva Ponencia'}
                   </h3>
                   <p className="text-xs font-medium text-blue-200 uppercase tracking-wide mt-1.5">
                      {editingId ? `Editando registro ID: ${editingId}` : 'Creando nuevo registro en la base de datos'}
                   </p>
                </div>
             </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 md:space-y-8 bg-gray-50/30">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <Label>Título Completo de la Ponencia</Label>
                  <textarea required className={`${InputClasses} resize-y min-h-[80px] text-lg`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ingrese el título de la ponencia..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Simposio Asignado</Label>
                    <select required className={InputClasses} value={formData.symposium_id} onChange={e => setFormData({...formData, symposium_id: e.target.value})}>
                      <option value="">-- Seleccionar Simposio --</option>
                      {symposiums.map(s => <option key={s.id} value={s.id}>Simposio {s.id}: {s.name.substring(0,40)}...</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Enlace al PDF (Opcional)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="url" className={`${InputClasses} pl-10`} value={formData.pdf_url} onChange={e => setFormData({...formData, pdf_url: e.target.value})} placeholder="https://drive.google.com/..." />
                    </div>
                  </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Autores (Apellidos, Nombres)</Label>
                    <input required className={InputClasses} value={formData.authors} onChange={e => setFormData({...formData, authors: e.target.value})} placeholder="Ej: PÉREZ, JUAN; GARCÍA, ANA" />
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mt-2 flex items-center gap-1"><User size={12}/> Formato sugerido: APELLIDOS, Nombres</p>
                  </div>
                  <div>
                    <Label>Filiación Institucional</Label>
                    <input className={InputClasses} value={formData.author_affiliation} onChange={e => setFormData({...formData, author_affiliation: e.target.value})} placeholder="Ej: Universidad Nacional Autónoma de México" />
                  </div>
                </div>

                <div>
                  <Label>Resumen / Abstract</Label>
                  <textarea className={`${InputClasses} resize-y min-h-[150px] leading-relaxed`} value={formData.abstract_text} onChange={e => setFormData({...formData, abstract_text: e.target.value})} placeholder="Pegue aquí el contenido del resumen..." />
                </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-4 pt-4">
               <button type="button" onClick={() => { setIsEditorOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-3.5 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors uppercase tracking-wide">
                  Cancelar
               </button>
               <button type="submit" className="px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-[#1e3a5f] hover:bg-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95">
                  <Save size={18} /> {editingId ? 'Actualizar Ponencia' : 'Guardar Ponencia'}
               </button>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // --- VISTA 1: LISTADO PRINCIPAL ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 pl-2">
           <div className="bg-blue-50 p-3 rounded-2xl text-[#1e3a5f]">
              <FileText size={28} />
           </div>
           <div>
              <h2 className="text-xl md:text-2xl font-black text-[#1e3a5f] uppercase italic tracking-tight">Gestión de Ponencias</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                 {presentations.length} Registros Totales
              </p>
           </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por título o autor..." 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e3a5f] bg-gray-50 focus:bg-white shadow-sm text-sm font-bold transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => { 
              setEditingId(null); 
              setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: '' }); 
              setIsEditorOpen(true); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }} 
            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 font-black text-xs uppercase tracking-widest"
          >
            <Plus size={18} /> Nueva
          </button>
        </div>
      </div>

      {/* LISTADO (ACORDEONES) */}
      <div className="space-y-4">
        {loading ? (
           <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Cargando datos...</div>
        ) : (
          symposiums.map(symp => {
            const papers = groupedBySympId[symp.id] || [];
            if (searchTerm && papers.length === 0) return null; 
            const isOpen = openAccordions[symp.id] || searchTerm.length > 0;

            return (
              <div key={symp.id} className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-200 shadow-xl' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                <button onClick={() => toggleAccordion(symp.id)} className="w-full flex items-center justify-between p-5 md:p-6 bg-white hover:bg-gray-50/50 transition-colors text-left group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${isOpen ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-[#1e3a5f] group-hover:bg-blue-50'}`}>
                       <Folder size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-blue-500 uppercase mb-1 block tracking-widest">Simposio {symp.id}</span>
                      <h3 className="font-black text-[#1e3a5f] text-base md:text-lg pr-4 leading-tight">{symp.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-black px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 uppercase">{papers.length} ponencias</span>
                    <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                       {isOpen ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                    </div>
                  </div>
                </button>
                
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-2 md:p-4">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                            <tr>
                              <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest w-[55%]">Título de la Ponencia</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Autoría (A-Z)</th>
                              <th className="p-4 pr-6 text-right"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {papers.map(p => (
                              <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group/row">
                                <td className="p-4 pl-6 align-top">
                                  <p className="font-bold text-[#1e3a5f] text-sm leading-snug">{p.title}</p>
                                  {p.pdf_url && <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md bg-green-50 text-green-700 text-[9px] font-black tracking-wider uppercase border border-green-200 shadow-sm"><LinkIcon size={12}/> Documento Adjunto</span>}
                                </td>
                                <td className="p-4 align-top">
                                  <div className="flex items-start gap-2.5">
                                     <div className="bg-gray-100 p-1.5 rounded text-gray-400 shrink-0"><User size={14} /></div>
                                     <div>
                                        <p className="text-xs font-black text-gray-700 uppercase">{p.authors}</p>
                                        <p className="text-[11px] font-bold text-gray-400 line-clamp-2 max-w-[250px] mt-0.5">{p.author_affiliation}</p>        
                                     </div>
                                  </div>
                                </td>
                                <td className="p-4 pr-6 text-right align-top">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm"><Edit2 size={16}/></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-white hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm"><Trash2 size={16}/></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {papers.length === 0 && (
                               <tr><td colSpan="3" className="p-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">No hay ponencias registradas en este simposio.</td></tr>
                            )}
                          </tbody>
                        </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default PresentationsManager;
