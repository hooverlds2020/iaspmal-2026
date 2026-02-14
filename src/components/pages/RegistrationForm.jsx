import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sendRegistrationConfirmation } from '../../lib/resendClient';
import { Upload, Check, Search, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

const RegistrationForm = ({ lang, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    category: '',
    presentation_id: null,
    presentation_title: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    { id: 'sur_global', es: 'Investigador/a del sur global', pt: 'Pesquisador/a do sul global' },
    { id: 'norte_global', es: 'Investigador/a del norte global', pt: 'Pesquisador/a do norte global' },
    { id: 'institucion_convocante', es: 'Investigador/a de institución convocante', pt: 'Pesquisador/a de instituição convocante' },
    { id: 'asistente', es: 'Asistente General / Estudiante', pt: 'Assistente Geral / Estudante' }
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (searchTerm.length < 3) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('id, title, authors')
        .or(`authors.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
        .limit(5);
      if (error) throw error;
      setSuggestions(data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPresentation = (p) => {
    setFormData({ 
      ...formData, 
      full_name: p.authors.split(',')[0].trim(), 
      presentation_id: p.id, 
      presentation_title: p.title 
    });
    setSelectedFromList(true);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error(lang === 'es' ? 'Sube tu comprobante' : 'Suba o comprovante');
    setLoading(true);
    try {
      const { data: reg, error: regErr } = await supabase
        .from('registrations')
        .insert([{
          full_name: formData.full_name,
          email: formData.email.trim().toLowerCase(),
          country: formData.country,
          category: formData.category,
          status: 'pending'
        }])
        .select().single();
      if (regErr) throw regErr;
      if (formData.presentation_id) {
        await supabase.from('registration_presentations').insert([{
          registration_id: reg.id,
          presentation_id: formData.presentation_id
        }]);
      }
      const fileExt = file.name.split('.').pop();
      const filePath = `payments/${reg.id}.${fileExt}`;
      await supabase.storage.from('registrations').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('registrations').getPublicUrl(filePath);
      await supabase.from('registrations').update({ payment_proof_url: publicUrl }).eq('id', reg.id);
      await sendRegistrationConfirmation(formData.email, formData.full_name).catch(console.error);
      setSuccess(true);
      if (onSuccess) setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-10 text-center animate-in zoom-in h-full flex flex-col items-center justify-center bg-white">
        <Check className="text-emerald-600 size-16 mb-4 bg-emerald-100 rounded-full p-4" />
        <h3 className="text-2xl font-black text-[#1e3a5f] uppercase italic">¡Inscrito!</h3>
        <button onClick={onClose} className="mt-8 px-10 bg-[#1e3a5f] text-white py-4 rounded-xl font-bold uppercase text-xs">Cerrar</button>
      </div>
    );
  }

  return (
    /* CONTENEDOR MAESTRO: Controla el ancho en Laptop y el alto máximo en Tablet Horizontal */
    <div className="flex flex-col w-full max-w-xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-t-4 border-t-[#1e3a5f] h-full max-h-[85vh] lg:max-h-[80vh]">
      
      {/* HEADER FIJO: Un solo botón de cerrar, posicionado correctamente */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-white z-20 shrink-0">
        <div>
          <h2 className="text-base md:text-xl font-black text-[#1e3a5f] uppercase italic leading-none tracking-tight">Inscripción Individual</h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Participantes y Ponentes</p>
        </div>
        {/* BOTÓN ÚNICO DE CIERRE */}
        <button 
          onClick={onClose} 
          className="p-2 -mr-2 hover:bg-gray-50 rounded-full transition-colors group"
          aria-label="Cerrar"
        >
          <X size={24} className="text-gray-400 group-hover:text-red-500" />
        </button>
      </div>

      {/* ÁREA DE CONTENIDO CON SCROLL INDEPENDIENTE */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-white custom-scrollbar">
        
        {/* BUSCADOR */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 italic">1. Busca tu nombre o ponencia</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setHasSearched(false);}}
                disabled={selectedFromList}
                className="w-full px-4 py-3 text-sm border-2 rounded-xl bg-white border-gray-100 outline-none focus:border-[#1e3a5f]"
                placeholder="Nombre..." 
              />
              <Search className="absolute left-3 top-3 text-gray-300" size={18} />
            </div>
            <button 
              type="button"
              onClick={handleSearch}
              className="bg-[#1e3a5f] text-white py-3 px-6 rounded-xl font-black text-[10px] uppercase hover:bg-black transition-all"
            >
              Buscar
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-3 space-y-2 animate-in slide-in-from-top-2">
              {suggestions.map((p) => (
                <button key={p.id} type="button" onClick={() => handleSelectPresentation(p)} className="w-full text-left p-3 bg-white border border-emerald-100 rounded-xl flex justify-between items-center hover:border-emerald-500">
                  <div className="flex-1 pr-2">
                    <p className="text-[10px] font-bold text-[#1e3a5f] uppercase leading-tight">{p.authors}</p>
                    <p className="text-[9px] text-gray-400 italic truncate">{p.title}</p>
                  </div>
                  <Check size={14} className="text-emerald-500" />
                </button>
              ))}
            </div>
          )}

          {selectedFromList && (
            <div className="mt-3 flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <p className="text-[9px] font-bold text-[#1e3a5f] italic flex-1 pr-4">{formData.presentation_title}</p>
              <button type="button" onClick={() => {setSelectedFromList(false); setFormData({...formData, presentation_id: null, presentation_title: '', full_name: ''})}} className="text-red-500 text-[9px] font-black underline uppercase">Limpiar</button>
            </div>
          )}
        </div>

        {/* FORMULARIO DE DATOS */}
        <form id="reg-form" onSubmit={handleSubmit} className={`space-y-4 md:space-y-6 transition-opacity duration-300 ${!hasSearched && !selectedFromList ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="space-y-4">
            <div className="group">
              <label className="block text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 italic">Nombre Completo</label>
              <input 
                type="text" required value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold text-[#1e3a5f] focus:bg-white focus:border-[#1e3a5f] outline-none transition-all" 
                placeholder="Como aparecerá en la constancia"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="email" required placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm focus:bg-white focus:border-[#1e3a5f] outline-none" />
              <input type="text" required placeholder="País" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm focus:bg-white focus:border-[#1e3a5f] outline-none" />
            </div>
            <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold text-[#1e3a5f] focus:bg-white focus:border-[#1e3a5f] outline-none cursor-pointer">
              <option value="">-- Seleccionar Categoría --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{lang === 'es' ? c.es : c.pt}</option>)}
            </select>
            <div className="relative border-2 border-dashed rounded-xl p-6 text-center bg-gray-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer">
              <input type="file" required accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="mx-auto mb-1 text-gray-400" size={20} />
              <p className="text-[9px] font-black text-[#1e3a5f] uppercase truncate px-4">{file ? file.name : 'Subir Comprobante (PDF/JPG)'}</p>
            </div>
          </div>
        </form>
      </div>

      {/* FOOTER FIJO: Siempre visible al final del modal */}
      <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <button 
          form="reg-form" type="submit" 
          disabled={loading || (!hasSearched && !selectedFromList)}
          className="w-full bg-[#1e3a5f] text-white font-black py-4 rounded-xl shadow-lg uppercase text-[10px] tracking-widest disabled:opacity-50 hover:bg-black transition-all transform active:scale-[0.98]"
        >
          {loading ? 'Procesando...' : 'Finalizar Inscripción'}
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
