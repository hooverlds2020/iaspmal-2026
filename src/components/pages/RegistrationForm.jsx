// src/components/pages/RegistrationForm.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sendRegistrationConfirmation } from '../../lib/resendClient';
import { Upload, Check, Search, X, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const RegistrationForm = ({ lang, onClose }) => {
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
    { id: 'sur_global', es: 'Del Sur global', pt: 'Do Sul global' },
    { id: 'norte_global', es: 'Del Norte global', pt: 'Do Norte global' },
    { id: 'asistente', es: 'Asistente (si desea constancia)', pt: 'Assistente (se desejar certificado)' }
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

      if (!data || data.length === 0) {
        toast.warning(
          lang === 'es' 
            ? 'No encontramos coincidencias.' 
            : 'Nenhuma correspondência encontrada.',
          {
            description: lang === 'es' 
              ? 'Si no eres ponente, puedes registrarte directamente llenando tus datos abajo.' 
              : 'Se você não é palestrante, pode se registrar diretamente preenchendo seus dados abaixo.',
            duration: 6000,
            icon: <AlertCircle className="text-orange-500" />,
            action: {
              label: lang === 'es' ? 'Entendido' : 'Entendido',
              onClick: () => {
                document.getElementById('fullname-input')?.focus();
              }
            }
          }
        );
      }
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

      const fileExt = file.name.split('.').pop().toLowerCase();
      const filePath = `payments/${reg.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('registrations')
        .upload(filePath, file, {
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('registrations').getPublicUrl(filePath);
      await supabase.from('registrations').update({ payment_proof_url: publicUrl }).eq('id', reg.id);

      await sendRegistrationConfirmation(formData.email, formData.full_name).catch(console.error);
      
      setSuccess(true);
      // Hacemos scroll suave hacia arriba para que vea su trofeo de éxito
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error(err);
      toast.error(lang === 'es' ? 'Error al registrar: ' + err.message : 'Erro ao registrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- EL EFECTO "SWEET ALERT 2" INLINE ---
  if (success) {
    return (
      <div className="py-16 px-4 sm:px-10 text-center animate-in zoom-in-95 duration-500 bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center max-w-2xl mx-auto">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
            <div className="bg-emerald-100 p-6 rounded-full relative z-10">
                <Check className="text-emerald-500 size-16" strokeWidth={3} />
            </div>
        </div>
        <h3 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">
            {lang === 'es' ? '¡Registro Exitoso!' : 'Registro Bem-sucedido!'}
        </h3>
        <p className="text-gray-500 text-base mb-10 max-w-sm mx-auto leading-relaxed">
            {lang === 'es' 
              ? 'Hemos recibido tu comprobante e información. Te enviaremos un correo de confirmación.' 
              : 'Recebemos seu comprovante e informações. Enviaremos um e-mail de confirmação.'}
        </p>
        <button 
          onClick={onClose} 
          className="px-10 bg-[#1e3a5f] hover:bg-black text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg hover:shadow-2xl active:scale-95"
        >
            {lang === 'es' ? 'Volver al Inicio' : 'Voltar ao Início'}
        </button>
      </div>
    );
  }

  // --- RENDERIZADO INLINE DEL FORMULARIO ---
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">

      {/* HEADER DEL FORMULARIO INLINE */}
      <div className="px-6 sm:px-8 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic tracking-tight">
            {lang === 'es' ? 'Formulario de Inscripción' : 'Formulário de Inscrição'}
          </h2>  
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">

        {/* SECCIÓN 1: BUSCADOR */}
        <div className="bg-blue-50/50 p-5 sm:p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#1e3a5f] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full">1</div>
            <label className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide">
              {lang === 'es' ? 'Busca tu participación' : 'Busque sua participação'}
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setHasSearched(false);}}
                disabled={selectedFromList}
                className="w-full pl-12 pr-4 py-3.5 text-base font-medium text-gray-900 border-2 rounded-xl bg-white border-gray-200 outline-none focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-400 shadow-sm"
                placeholder={lang === 'es' ? "Escribe tu nombre o título..." : "Digite seu nome ou título..."}
              />
              <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#1e3a5f] transition-colors" size={20} />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="bg-[#1e3a5f] text-white py-3.5 px-8 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-black transition-all shadow-md active:scale-95 shrink-0"
            >
              {lang === 'es' ? 'Buscar' : 'Buscar'}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-5 space-y-3 animate-in slide-in-from-top-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Resultados:</p>
              {suggestions.map((p) => (
                <button key={p.id} type="button" onClick={() => handleSelectPresentation(p)} className="w-full text-left p-4 bg-white border-2 border-blue-100 rounded-xl flex justify-between items-center hover:border-orange-400 hover:shadow-md transition-all group">   
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-bold text-[#1e3a5f] leading-snug group-hover:text-orange-600 transition-colors">{p.authors}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{p.title}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-full group-hover:bg-orange-50 transition-colors">
                     <Check size={18} className="text-gray-300 group-hover:text-orange-500" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedFromList && (
            <div className="mt-5 flex justify-between items-start bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm">   
              <div className="flex gap-4">
                 <div className="bg-emerald-100 p-2 rounded-full mt-0.5">
                    <Check size={18} className="text-emerald-600" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                      {lang === 'es' ? 'Participación Seleccionada' : 'Participação Selecionada'}
                    </p>
                    <p className="text-sm font-bold text-gray-800">{formData.presentation_title}</p>
                 </div>
              </div>
              <button type="button" onClick={() => {setSelectedFromList(false); setFormData({...formData, presentation_id: null, presentation_title: '', full_name: ''})}} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                 <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* SECCIÓN 2: DATOS */}
        <form id="reg-form" onSubmit={handleSubmit} className={`space-y-6 transition-all duration-500 ${!hasSearched && !selectedFromList ? 'opacity-40 grayscale pointer-events-none filter blur-[1px]' : 'opacity-100'}`}>

          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#1e3a5f] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full">2</div>
            <label className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wide">
              {lang === 'es' ? 'Completa tus datos' : 'Preencha seus dados'}
            </label>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                {lang === 'es' ? 'Nombre Completo' : 'Nome Completo'}
              </label>
              <input
                id="fullname-input"
                type="text" required value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-[#1e3a5f] focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder={lang === 'es' ? "Nombre oficial para constancia" : "Nome oficial para o certificado"}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                   {lang === 'es' ? 'Correo Electrónico' : 'E-mail'}
                 </label>
                 <input type="email" required placeholder="ejemplo@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                   {lang === 'es' ? 'País de Residencia' : 'País de Residência'}
                 </label>
                 <input type="text" required placeholder="Ej. México" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {lang === 'es' ? 'Categoría de Inscripción' : 'Categoria de Inscrição'}
                </label>
                <div className="relative">
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer transition-all">
                    <option value="">-- Seleccionar --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{lang === 'es' ? c.es : c.pt}</option>)}
                    </select>
                    <div className="absolute right-5 top-4 pointer-events-none">
                        <span className="text-gray-400">▼</span>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  {lang === 'es' ? 'Comprobante de Pago' : 'Comprovante de Pagamento'}
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-blue-50 hover:border-[#1e3a5f] transition-all cursor-pointer group">
                  <input 
                    type="file" 
                    required 
                    accept="image/jpeg,image/png,image/jpg,application/pdf" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />

                  <div className="flex flex-col items-center gap-3 group-hover:scale-105 transition-transform">
                    {file ? (
                        <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 shadow-sm">
                            <FileText size={32} />
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-full text-gray-400 border border-gray-200 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-[#1e3a5f] transition-colors shadow-sm">
                            <Upload size={32} />
                        </div>
                    )}

                    <div className="text-center">
                        <p className={`text-sm font-black uppercase tracking-wide ${file ? 'text-emerald-600' : 'text-[#1e3a5f]'}`}>
                            {file ? 'Archivo Listo' : 'Subir Comprobante'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-[250px] mx-auto truncate font-medium">
                            {file ? file.name : 'Formatos aceptados: PDF, JPG, PNG'}
                        </p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </form>
      </div>

      <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100">
        <button
          form="reg-form" type="submit"
          disabled={loading || (!hasSearched && !selectedFromList)}
          className="w-full bg-[#1e3a5f] text-white font-black py-4.5 rounded-xl shadow-lg shadow-blue-900/20 uppercase text-sm tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
        >
          {loading ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               <span>Procesando...</span>
             </>
          ) : (
             <span>{lang === 'es' ? 'Finalizar Inscripción' : 'Finalizar Inscrição'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
