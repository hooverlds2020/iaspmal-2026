// src/components/pages/RegistrationForm.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sendRegistrationConfirmation } from '../../lib/resendClient';
import { Upload, Check, Search, X, FileText, AlertCircle } from 'lucide-react'; 
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
    if (searchTerm.length < 3) return toast.warning(lang === 'es' ? 'Escribe al menos 3 letras' : 'Digite pelo menos 3 letras');
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
      if (data.length === 0) toast.info(lang === 'es' ? 'No se encontraron resultados' : 'Nenhum resultado encontrado');
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
    if (!file) return toast.error(lang === 'es' ? 'Debes subir tu comprobante' : 'Você deve enviar seu comprovante');
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
      console.error(err);
      toast.error(lang === 'es' ? 'Error al registrar. Intenta de nuevo.' : 'Erro ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-10 text-center animate-in zoom-in h-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl">
        <div className="bg-emerald-100 p-4 rounded-full mb-6 animate-bounce">
            <Check className="text-emerald-600 size-12" />
        </div>
        <h3 className="text-2xl font-black text-[#1e3a5f] uppercase italic mb-2">¡Registro Exitoso!</h3>
        <p className="text-gray-600 text-sm mb-8 max-w-xs mx-auto">Hemos recibido tu información. Te enviaremos un correo de confirmación pronto.</p>
        <button onClick={onClose} className="px-8 bg-[#1e3a5f] hover:bg-black text-white py-3 rounded-xl font-bold uppercase text-xs transition-colors shadow-lg">
            Cerrar Ventana
        </button>
      </div>
    );
  }

  return (
    // --- CONTENEDOR INTELIGENTE ---
    // w-[95%]: Móvil (deja margenes laterales).
    // md:w-full max-w-xl: PC (ancho controlado).
    // h-[85dvh]: Móvil (altura fija que respeta barras de navegación).
    // md:h-auto md:max-h-[90vh]: PC (altura flexible según contenido, sin salirse de la pantalla).
    <div className="flex flex-col w-[95%] sm:w-[90%] md:w-full max-w-xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-t-8 border-t-[#1e3a5f] h-[85dvh] md:h-auto md:max-h-[90vh] relative my-auto transition-all duration-300">

      {/* HEADER FIJO */}
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-30 shrink-0">
        <div>
          <h2 className="text-lg md:text-xl font-black text-[#1e3a5f] uppercase italic leading-none tracking-tight">Inscripción</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
             <p className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Congreso 2026</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      {/* relative z-10: Asegura que el contenido esté en su capa correcta */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-white custom-scrollbar relative z-10">

        {/* SECCIÓN 1: BUSCADOR */}
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#1e3a5f] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">1</div>
            <label className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wide">Busca tu participación</label>   
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setHasSearched(false);}}
                disabled={selectedFromList}
                className="w-full pl-10 pr-4 py-3 text-sm font-medium text-gray-900 border-2 rounded-xl bg-white border-gray-200 outline-none focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-400" 
                placeholder="Escribe tu nombre..."
              />
              <Search className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-[#1e3a5f] transition-colors" size={18} />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="bg-[#1e3a5f] text-white py-3 px-6 rounded-xl font-bold text-xs uppercase hover:bg-blue-900 transition-all shadow-md active:transform active:scale-95" 
            >
              Buscar
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-4 space-y-2 animate-in slide-in-from-top-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Resultados:</p>
              {suggestions.map((p) => (
                <button key={p.id} type="button" onClick={() => handleSelectPresentation(p)} className="w-full text-left p-3 bg-white border border-blue-100 rounded-xl flex justify-between items-center hover:border-orange-400 hover:shadow-md transition-all group">
                  <div className="flex-1 pr-3">
                    <p className="text-xs font-bold text-[#1e3a5f] leading-snug group-hover:text-orange-600 transition-colors">{p.authors}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{p.title}</p>
                  </div>
                  <div className="bg-gray-50 p-1 rounded-full group-hover:bg-orange-50 transition-colors">
                     <Check size={14} className="text-gray-300 group-hover:text-orange-500" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedFromList && (
            <div className="mt-4 flex justify-between items-start bg-white p-3 rounded-xl border-l-4 border-emerald-500 shadow-sm">
              <div className="flex gap-3">
                 <div className="bg-emerald-100 p-1.5 rounded-full mt-0.5">
                    <Check size={14} className="text-emerald-600" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Seleccionado:</p>
                    <p className="text-xs font-bold text-[#1e3a5f]">{formData.presentation_title}</p>
                 </div>
              </div>
              <button type="button" onClick={() => {setSelectedFromList(false); setFormData({...formData, presentation_id: null, presentation_title: '', full_name: ''})}} className="text-gray-400 hover:text-red-500 transition-colors">
                 <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* SECCIÓN 2: DATOS */}
        <form id="reg-form" onSubmit={handleSubmit} className={`space-y-6 pb-2 transition-all duration-500 ${!hasSearched && !selectedFromList ? 'opacity-40 grayscale pointer-events-none filter blur-[1px]' : 'opacity-100'}`}>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#1e3a5f] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">2</div>
            <label className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wide">Completa tus datos</label>   
          </div>

          <div className="space-y-4 pl-1 md:pl-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Nombre Completo</label>
              <input
                type="text" required value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#1e3a5f] focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="Nombre oficial para constancia"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                 <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Correo Electrónico</label>
                 <input type="email" required placeholder="ejemplo@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-[#1e3a5f] outline-none transition-all" />
              </div>
              <div>
                 <label className="block text-[11px] font-bold text-gray-700 mb-1.5">País de Residencia</label>
                 <input type="text" required placeholder="Ej. México" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-[#1e3a5f] outline-none transition-all" />
              </div>
            </div>

            <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Categoría de Inscripción</label>
                <div className="relative">
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-[#1e3a5f] outline-none appearance-none cursor-pointer">
                    <option value="">-- Seleccionar --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{lang === 'es' ? c.es : c.pt}</option>)}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none">
                        <span className="text-gray-400">▼</span>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Comprobante de Pago</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-blue-50 hover:border-[#1e3a5f] transition-all cursor-pointer group">
                <input type="file" required accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                
                <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                    {file ? (
                        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                            <FileText size={24} />
                        </div>
                    ) : (
                        <div className="bg-gray-200 p-3 rounded-full text-gray-500 group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                            <Upload size={24} />
                        </div>
                    )}
                    
                    <div className="text-center">
                        <p className={`text-xs font-bold uppercase ${file ? 'text-emerald-600' : 'text-[#1e3a5f]'}`}>
                            {file ? 'Archivo Seleccionado' : 'Subir Archivo'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] mx-auto truncate">
                            {file ? file.name : 'Formatos: PDF, JPG, PNG'}
                        </p>
                    </div>
                </div>
                </div>
            </div>
          </div>
        </form>
      </div>

      {/* FOOTER FIJO INTELIGENTE */}
      {/* Móvil: pb-8 (Espacio para gestos). PC: md:pb-6 (Espacio normal) */}
      <div className="p-4 pb-8 md:p-6 md:pb-6 bg-white border-t border-gray-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 relative">
        <button
          form="reg-form" type="submit"
          disabled={loading || (!hasSearched && !selectedFromList)}
          className="w-full bg-[#1e3a5f] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? (
             <>
               <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               <span>Procesando...</span>
             </>
          ) : (
             <span>Finalizar Inscripción</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
