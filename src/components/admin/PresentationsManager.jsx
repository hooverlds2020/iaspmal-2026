import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Edit2, Trash2, X, Search, 
  Link as LinkIcon, ChevronDown, ChevronRight, Folder 
} from 'lucide-react';

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
        supabase.from('presentations').select('*, symposiums(name)').order('id', { ascending: false }),
        supabase.from('symposiums').select('id, name').order('name')
      ]);

      if (presRes.error) throw presRes.error;
      if (sympRes.error) throw sympRes.error;

      setPresentations(presRes.data || []);
      setSymposiums(sympRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error.message);
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
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: '' });
      fetchData();
    } catch (error) {
      alert('Error al guardar');
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
    if (!window.confirm('¿Eliminar esta ponencia?')) return;
    try {
      await supabase.from('presentations').delete().eq('id', id);
      fetchData();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const toggleAccordion = (symposiumName) => {
    setOpenAccordions(prev => ({
      ...prev,
      [symposiumName]: !prev[symposiumName]
    }));
  };

  // 1. Filtrar
  const filtered = presentations.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.authors?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Agrupar
  const groupedPresentations = filtered.reduce((acc, curr) => {
    const sympName = curr.symposiums?.name || 'Sin Simposio Asignado';
    if (!acc[sympName]) {
      acc[sympName] = [];
    }
    acc[sympName].push(curr);
    return acc;
  }, {});

  // 3. ORDENAMIENTO NATURAL (Aquí está el cambio clave)
  // Esto hace que "Simposio 2" vaya antes que "Simposio 10"
  const sortedSymposiumNames = Object.keys(groupedPresentations).sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* BARRA SUPERIOR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
            Total Registros: {presentations.length}
          </span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por título o autor..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#1e3a5f] bg-white shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', authors: '', author_affiliation: '', abstract_text: '', symposium_id: '', pdf_url: '' });
              setIsModalOpen(true);
            }} 
            className="bg-[#1e3a5f] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-md font-bold text-sm"
          >
            <Plus size={18} /> Nueva
          </button>
        </div>
      </div>

      {/* LISTA DE ACORDEONES */}
      <div className="space-y-4">
        {loading ? (
           <div className="p-20 text-center text-gray-400 italic">Cargando datos...</div>
        ) : sortedSymposiumNames.length === 0 ? (
           <div className="p-20 text-center text-gray-400 italic">No se encontraron resultados.</div>
        ) : (
          sortedSymposiumNames.map(sympName => {
            const papers = groupedPresentations[sympName];
            const isOpen = openAccordions[sympName] || searchTerm.length > 0;

            return (
              <div key={sympName} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleAccordion(sympName)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-[#1e3a5f]">
                      <Folder size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e3a5f] text-sm md:text-base pr-4">{sympName}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-500">
                      {papers.length} ponencias
                    </span>
                    {isOpen ? <ChevronDown size={20} className="text-gray-400"/> : <ChevronRight size={20} className="text-gray-400"/>}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white text-gray-400 border-b border-gray-50">
                        <tr>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest w-2/3">Título</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest">Autoría</th>
                          <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {papers.map(p => (
                          <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-gray-800 text-sm leading-tight">{p.title}</p>
                              {p.pdf_url && <span className="text-[9px] text-green-600 font-bold flex items-center gap-1 mt-1"><LinkIcon size={10}/> PDF ENLAZADO</span>}
                            </td>
                            <td className="p-4">
                              <p className="text-xs font-bold text-gray-600 uppercase">{p.authors}</p>
                              <p className="text-[10px] text-gray-400 italic truncate max-w-[150px]">{p.author_affiliation}</p>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-[#1e3a5f] text-white">
              <h3 className="font-bold text-lg">{editingId ? 'Editar Ponencia' : 'Nueva Ponencia'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                <textarea required className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" rows="2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Simposio</label>
                  <select required className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm bg-white" value={formData.symposium_id} onChange={e => setFormData({...formData, symposium_id: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {symposiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">PDF URL</label>
                  <input type="url" className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" value={formData.pdf_url} onChange={e => setFormData({...formData, pdf_url: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Autores</label>
                <input required className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" value={formData.authors} onChange={e => setFormData({...formData, authors: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Filiación</label>
                <input className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" value={formData.author_affiliation} onChange={e => setFormData({...formData, author_affiliation: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Resumen</label>
                <textarea className="w-full p-3 rounded-lg border focus:border-[#1e3a5f] outline-none text-sm" rows="4" value={formData.abstract_text} onChange={e => setFormData({...formData, abstract_text: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl font-bold text-white bg-[#1e3a5f] hover:bg-black">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationsManager;
