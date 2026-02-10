// src/components/pages/RegistrationForm.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sendRegistrationConfirmation } from '../../lib/resendClient';
import { Upload, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const RegistrationForm = ({ lang, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    country: '',
    category: '',
    presentation_title: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Categorías
  const categories = [
    { id: 'sur_global', es: 'Investigador/a del sur global', pt: 'Pesquisador/a do sul global' },
    { id: 'norte_global', es: 'Investigador/a del norte global', pt: 'Pesquisador/a do norte global' },
    { id: 'institucion_convocante', es: 'Investigador/a de institución convocante', pt: 'Pesquisador/a de instituição convocante' },
    { id: 'asistente', es: 'Asistente', pt: 'Assistente' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(selectedFile.type)) {
        toast.error(lang === 'es' ? 'Formato no válido. Solo JPG, PNG o PDF' : 'Formato inválido. Apenas JPG, PNG ou PDF');
        return;
      }

      if (selectedFile.size > maxSize) {
        toast.error(lang === 'es' ? 'El archivo pesa más de 5MB' : 'O arquivo é maior que 5MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const uploadFile = async (file, registrationId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${registrationId}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('registrations')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('registrations')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. OBTENER USUARIO LOGUEADO (CRÍTICO PARA SEGURIDAD RLS)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(lang === 'es' 
          ? 'Debes iniciar sesión para inscribirte. Por favor ve al menú "Admin/Login" o inicia sesión.' 
          : 'Você deve fazer login para se inscrever.');
      }

      if (!formData.full_name || !formData.email || !formData.country || !formData.category) {
        throw new Error(lang === 'es' ? 'Completa todos los campos obligatorios' : 'Preencha todos os campos obrigatórios');
      }

      if (!file) {
        throw new Error(lang === 'es' ? 'Debes adjuntar el comprobante de pago' : 'Você deve anexar o comprovante de pagamento');
      }

      const { data: registration, error: insertError } = await supabase
        .from('registrations')
        .insert([{
          full_name: formData.full_name,
          email: formData.email.trim().toLowerCase(),
          country: formData.country,
          category: formData.category,
          presentation_title: formData.presentation_title || null,
          
          // 2. VINCULAR EL REGISTRO CON EL USUARIO (EL CANDADO)
          user_id: user.id 
        }])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
            throw new Error(lang === 'es' 
                ? 'Este correo ya está registrado. Por favor ve al Inicio y verifica tu estatus.' 
                : 'Este e-mail já está registrado. Por favor, vá para a Home e verifique seu status.');
        }
        throw insertError;
      }

      const fileUrl = await uploadFile(file, registration.id);

      const { error: updateError } = await supabase
        .from('registrations')
        .update({ payment_proof_url: fileUrl })
        .eq('id', registration.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setFormData({ full_name: '', email: '', country: '', category: '', presentation_title: '' });
      setFile(null);
      
      await sendRegistrationConfirmation(formData.email, formData.full_name);

      if (onSuccess) {
        setTimeout(() => onSuccess(), 3000);
      }

    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || (lang === 'es' ? 'Ocurrió un error al registrar' : 'Ocorreu um erro ao registrar'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto animate-in zoom-in duration-300">
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            {lang === 'es' ? '¡Registro Recibido!' : 'Registro Recebido!'}
          </h3>
          <p className="text-green-700 mb-4 text-sm">
            {lang === 'es'
              ? 'Hemos recibido tus datos y comprobante. Te enviaremos un correo de confirmación.'
              : 'Recebemos seus dados e comprovante. Enviaremos um e-mail de confirmação.'}
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-md hover:shadow-lg text-sm"
          >
            {lang === 'es' ? 'Entendido' : 'Entendido'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Añadido max-h-[85vh] y overflow-y-auto para scroll en laptops */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 relative overflow-hidden flex flex-col max-h-[85vh] overflow-y-auto">
        {/* Adorno visual */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {lang === 'es' ? 'Inscripción' : 'Inscrição'}
        </h2>
        <p className="text-gray-500 mb-4 text-xs">
          {lang === 'es' ? 'Ingresa tus datos y comprobante.' : 'Insira seus dados e comprovante.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Nombre y Email en una fila para ahorrar espacio (opcional, o mantener apilados pero compactos) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'es' ? 'Nombre completo' : 'Nome completo'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-50 focus:bg-white"
                placeholder={lang === 'es' ? 'Ej. María González' : 'Ex. Maria Silva'}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'es' ? 'Correo electrónico' : 'E-mail'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-50 focus:bg-white"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* País */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'es' ? 'País' : 'País'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'es' ? 'Categoría' : 'Categoria'} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-50 focus:bg-white"
              >
                <option value="">
                  {lang === 'es' ? 'Seleccionar...' : 'Selecionar...'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {lang === 'es' ? cat.es : cat.pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Título Ponencia */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'es' ? 'Título de la ponencia (Opcional)' : 'Título da apresentação (Opcional)'}
            </label>
            <input
              type="text"
              value={formData.presentation_title}
              onChange={(e) => setFormData({...formData, presentation_title: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Archivo Compacto */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'es' ? 'Comprobante de pago' : 'Comprovante de pagamento'} <span className="text-red-500">*</span>
            </label>
            <div className={`mt-1 flex justify-center px-4 py-3 border-2 border-dashed rounded-lg transition cursor-pointer group ${file ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'}`}>
              <div className="space-y-1 text-center w-full">
                <label className="cursor-pointer w-full block">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 animate-in zoom-in">
                        <Check className="h-5 w-5 text-teal-600" />
                        <span className="text-xs text-teal-800 font-bold truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-teal-600">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        <span className="text-xs text-teal-700 underline ml-2">{lang === 'es' ? 'Cambiar' : 'Mudar'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                           <Upload className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition" />
                           <span className="font-bold text-teal-600">{lang === 'es' ? 'Clic para subir archivo' : 'Clique para enviar'}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">JPG, PNG, PDF (Max 5MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    required={!file}
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Botón Submit Compacto */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{lang === 'es' ? 'Procesando...' : 'Processando...'}</span>
                </div>
            ) : (
                lang === 'es' ? 'Confirmar Inscripción' : 'Confirmar Inscrição'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
