// src/components/pages/RegistrationForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sendRegistrationConfirmation } from '../../lib/resendClient';
import { Upload, Check, Search, ChevronRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const RegistrationForm = ({ lang, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    category: '',
    presentation_title: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    const searchAuthors = async () => {
      if (searchTerm.length < 3 || selectedFromList) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from('presentations')
        .select('id, title, authors')
        .ilike('authors', `%${searchTerm}%`)
        .limit(5);

      if (!error && data) setSuggestions(data);
      setIsSearching(false);
    };
    const debounce = setTimeout(searchAuthors, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedFromList]);

  const handleSelectAuthor = (presentation) => {
    setFormData({
      ...formData,
      full_name: presentation.authors,
      presentation_title: presentation.title
    });
    setSearchTerm(presentation.authors);
    setSelectedFromList(true);
    setSuggestions([]);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error(lang === 'es' ? 'El archivo es demasiado grande (máx 5MB)' : 'Arquivo muito grande');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error(lang === 'es' ? 'Debe adjuntar el comprobante de pago' : 'Deve anexar o comprovante');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(lang === 'es' ? 'Sesión expirada. Inicie sesión de nuevo.' : 'Sessão expirada.');

      const { data: registration, error: insertError } = await supabase
        .from('registrations')
        .insert([{
          full_name: formData.full_name,
          email: formData.email.trim().toLowerCase(),
          country: formData.country,
          category: formData.category,
          presentation_title: selectedFromList ? formData.presentation_title : (lang === 'es' ? 'Asistencia General' : 'Assistência Geral'),
          user_id: user.id 
        }])
        .select().single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error(lang === 'es' ? 'Este correo ya está registrado.' : 'Este e-mail já está registrado.');
        }
        throw insertError;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `payment-proofs/${registration.id}.${fileExt}`;
      await supabase.storage.from('registrations').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('registrations').getPublicUrl(filePath);

      await supabase.from('registrations').update({ payment_proof_url: publicUrl }).eq('id', registration.id);

      sendRegistrationConfirmation(formData.email, formData.full_name).catch(console.error);

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
      <div className="p-6 sm:p-8 text-center animate-in zoom-in max-w-sm mx-auto">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-black text-[#1e3a5f] uppercase italic">¡Inscrito!</h3>
        <p className="text-gray-500 text-sm mt-2">Recibirás un correo tras la validación.</p>
        <button onClick={onClose} className="mt-6 w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Finalizar</button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full max-h-[80vh] sm:max-h-[85vh]">
      {/* Cabecera optimizada para móvil */}
      <div className="px-4 py-4 sm:py-6 border-b border-gray-100 shrink-0">
        <h2 className="text-lg sm:text-2xl font-black text-[#1e3a5f] uppercase italic leading-tight">
          {lang === 'es' ? 'Inscripción' : 'Inscrição'}
        </h2>
        <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nuevos Participantes y Ponentes</p>
      </div>

      {/* Área de scroll con padding ajustable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 custom-scrollbar">
        <form id="reg-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pb-4">
          
          <div className="relative">
            <label className="block text-[9px] sm:text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest italic">
              {lang === 'es' ? 'Nombre Completo (Ponente o Asistente)' : 'Nome Completo'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setFormData({...formData, full_name: e.target.value});
                  setSelectedFromList(false);
                }}
                className="w-full px-4 py-3 sm:py-4 pl-10 text-sm border-2 border-gray-100 rounded-xl sm:rounded-2xl focus:border-[#1e3a5f] bg-gray-50/30 outline-none transition-all font-bold text-[#1e3a5f]"
                placeholder={lang === 'es' ? 'Tu nombre...' : 'Seu nome...'}
              />
              <Search className="absolute left-3.5 top-3 sm:top-4 text-gray-400" size={16} />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {suggestions.map((p) => (
                  <button key={p.id} type="button" onClick={() => handleSelectAuthor(p)} className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors">
                    <div className="flex-1 pr-2">
                      <p className="text-[10px] sm:text-xs font-black text-[#1e3a5f] uppercase truncate">{p.authors}</p>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 italic line-clamp-1">{p.title}</p>
                    </div>
                    <ChevronRight size={12} className="text-[#1e3a5f]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[8px] sm:text-[9px] font-black uppercase text-gray-400 mb-1 italic">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl bg-gray-50/30 outline-none" />
            </div>
            <div>
              <label className="block text-[8px] sm:text-[9px] font-black uppercase text-gray-400 mb-1 italic">País *</label>
              <input type="text" required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl bg-gray-50/30 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[8px] sm:text-[9px] font-black uppercase text-gray-400 mb-1 italic">Categoría *</label>
            <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl bg-gray-50/30 outline-none font-black text-[#1e3a5f] appearance-none cursor-pointer">
              <option value="">{lang === 'es' ? 'Seleccionar...' : 'Selecionar...'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{lang === 'es' ? cat.es : cat.pt}</option>
              ))}
            </select>
          </div>

          <div className="pt-1">
            <label className="block text-[9px] sm:text-[10px] font-black uppercase text-[#1e3a5f] mb-2 ml-1 italic underline decoration-teal-400 underline-offset-4">Comprobante de Pago *</label>
            <div className={`mt-1 flex justify-center px-4 py-5 sm:py-7 border-2 border-dashed rounded-2xl sm:rounded-3xl transition-all ${file ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200 bg-gray-50/20'}`}>
              <label className="cursor-pointer w-full text-center">
                {file ? (
                  <div className="flex flex-col items-center gap-1">
                    <Check className="text-emerald-600" size={18} />
                    <span className="text-[9px] text-[#1e3a5f] font-black truncate max-w-[150px]">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="text-gray-400" size={20} />
                    <p className="text-[8px] sm:text-[9px] font-black text-[#1e3a5f] uppercase">Subir comprobante</p>
                  </div>
                )}
                <input type="file" required accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="sr-only" />
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Botón de acción fijo al final */}
      <div className="p-4 sm:p-6 bg-gray-50/50 shrink-0 border-t border-gray-100">
        <button
          form="reg-form"
          type="submit"
          disabled={loading}
          className="w-full bg-[#1e3a5f] hover:bg-black text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all uppercase tracking-widest text-[10px] sm:text-[11px] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (lang === 'es' ? 'Finalizar Inscripción' : 'Finalizar Inscrição')}
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
