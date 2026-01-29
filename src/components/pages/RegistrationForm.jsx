import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sendRegistrationConfirmation } from '../../lib/resendClient';
import { Upload, Check, X } from 'lucide-react';

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
  const [error, setError] = useState('');

  const categories = [
    { id: 'sur_global', es: 'Investigador/a del sur global', pt: 'Pesquisador/a do sul global' },
    { id: 'norte_global', es: 'Investigador/a del norte global', pt: 'Pesquisador/a do norte global' },
    { id: 'institucion_convocante', es: 'Investigador/a de institución convocante', pt: 'Pesquisador/a de instituição convocante' },
    { id: 'estudiante', es: 'Estudiante', pt: 'Estudante' },
    { id: 'asistente', es: 'Asistente', pt: 'Assistente' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(selectedFile.type)) {
        setError(lang === 'es' ? 'Solo se permiten archivos JPG, PNG o PDF' : 'Apenas arquivos JPG, PNG ou PDF são permitidos');
        return;
      }

      if (selectedFile.size > maxSize) {
        setError(lang === 'es' ? 'El archivo no debe superar 5MB' : 'O arquivo não deve exceder 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
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
    setError('');

    try {
      // Validaciones
      if (!formData.full_name || !formData.email || !formData.country || !formData.category) {
        throw new Error(lang === 'es' ? 'Por favor complete todos los campos obligatorios' : 'Por favor, preencha todos os campos obrigatórios');
      }

      if (!file) {
        throw new Error(lang === 'es' ? 'Por favor adjunte el comprobante de pago' : 'Por favor, anexe o comprovante de pagamento');
      }

      // Insertar registro
      const { data: registration, error: insertError } = await supabase
        .from('registrations')
        .insert([{
          full_name: formData.full_name,
          email: formData.email,
          country: formData.country,
          category: formData.category,
          presentation_title: formData.presentation_title || null
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Subir archivo
      const fileUrl = await uploadFile(file, registration.id);

      // Actualizar con URL del archivo
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ payment_proof_url: fileUrl })
        .eq('id', registration.id);

      if (updateError) throw updateError;

      // Éxito
      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        country: '',
        category: '',
        presentation_title: ''
      });
      setFile(null);

      // Enviar correo de confirmación
      await sendRegistrationConfirmation(formData.email, formData.full_name);
      
      // Cerrar modal si se proporciona la función
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000); // Esperar 2 segundos antes de cerrar
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || (lang === 'es' ? 'Error al procesar el registro' : 'Erro ao processar o registro'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-3">
            {lang === 'es' ? '¡Registro exitoso!' : 'Registro bem-sucedido!'}
          </h3>
          <p className="text-green-700 mb-4">
            {lang === 'es' 
              ? 'Hemos recibido tu solicitud de inscripción. Recibirás un correo de confirmación en breve.'
              : 'Recebemos sua solicitação de inscrição. Você receberá um e-mail de confirmação em breve.'}
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            {lang === 'es' ? 'Realizar otra inscripción' : 'Fazer outra inscrição'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {lang === 'es' ? 'Formulario de Inscripción' : 'Formulário de Inscrição'}
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-start">
              <X className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === 'es' ? 'Nombre completo' : 'Nome completo'} *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === 'es' ? 'Correo electrónico' : 'E-mail'} *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === 'es' ? 'País' : 'País'} *
            </label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === 'es' ? 'Categoría de inscripción' : 'Categoria de inscrição'} *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">
                {lang === 'es' ? 'Seleccione una categoría' : 'Selecione uma categoria'}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {lang === 'es' ? cat.es : cat.pt}
                </option>
              ))}
            </select>
          </div>

          {/* Título de ponencia (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === 'es' ? 'Título de la ponencia (opcional)' : 'Título da apresentação (opcional)'}
            </label>
            <input
              type="text"
              value={formData.presentation_title}
              onChange={(e) => setFormData({...formData, presentation_title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Comprobante de pago */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {lang === 'es' ? 'Comprobante de pago' : 'Comprovante de pagamento'} * (JPG, PNG, PDF - max 5MB)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-teal-500 transition">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500">
                    <span>{lang === 'es' ? 'Seleccionar archivo' : 'Selecionar arquivo'}</span>
                    <input
                      type="file"
                      required
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {file && (
                  <p className="text-sm text-green-600 font-semibold">
                    ✓ {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (lang === 'es' ? 'Procesando...' : 'Processando...')
              : (lang === 'es' ? 'Enviar Inscripción' : 'Enviar Inscrição')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
