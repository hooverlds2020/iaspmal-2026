// src/components/admin/AccommodationManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { optimizeImage } from '../../lib/imageOptimizer';
import { Plus, Edit2, Trash2, Image as ImageIcon, ArrowLeft, Save, UploadCloud, AlertTriangle, Building, Phone, Wifi, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AccommodationManager = () => {
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    nombre: '', rango: 'A', precio_desde: '', codigo: '', habitaciones: '',
    imagen_principal: '',
    documento_url: '', 
    contacto: { email: '', tel: '', whatsapp: '', whatsapp_display: '', web: '' },
    notas: { es: '', pt: '' },
    amenidades: [],
    flyers: [] 
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [docFile, setDocFile] = useState(null); 

  const availableAmenities = [
    { id: 'desayuno', label: 'Desayuno' },
    { id: 'wifi', label: 'Wifi' },
    { id: 'reunion', label: 'Sala de reunión' },
    { id: 'estacionamiento_extra', label: 'Estacionamiento (Extra)' }
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('alojamientos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setHoteles(data || []);
    } catch (error) { toast.error("Error al cargar hoteles"); } 
    finally { setLoading(false); }
  };

  const handleEdit = (hotel) => {
    setEditingId(hotel.id);
    setFormData({
      ...initialForm, ...hotel,
      contacto: hotel.contacto || initialForm.contacto,
      notas: hotel.notas || initialForm.notas,
      amenidades: hotel.amenidades || [],
      flyers: hotel.flyers || []
    });
    setMainImagePreview(hotel.imagen_principal);
    setMainImageFile(null);
    setDocFile(null);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDelete = async () => {
    try {
      await supabase.from('alojamientos').delete().eq('id', deleteId);
      toast.success('Hotel eliminado');
      fetchData();
    } catch (error) { toast.error('Error al eliminar'); } 
    finally { setDeleteId(null); }
  };

  const handleAmenityToggle = (id) => {
    const current = formData.amenidades || [];
    const updated = current.includes(id) ? current.filter(a => a !== id) : [...current, id];
    setFormData({ ...formData, amenidades: updated });
  };

  // ✅ CORRECCIÓN DE UNICIDAD: Función Helper para generar nombres únicos
  const generateUniqueFileName = (prefix, ext) => {
    // timestamp_stringAleatorio.ext
    const randomString = Math.random().toString(36).substring(2, 7);
    return `${prefix}_${Date.now()}_${randomString}.${ext}`;
  }

  // Subida de Imágenes (Siempre comprime)
  const uploadSingleImage = async (file, prefix = 'hotel') => {
    const optimizedFile = await optimizeImage(file);
    const fileExt = file.name.split('.').pop();
    
    // ✅ CORRECCIÓN DE UNICIDAD
    const fileName = generateUniqueFileName(prefix, fileExt);

    // ✅ SEGURIDAD: Añadimos upsert: true por si acaso
    const { error } = await supabase.storage.from('alojamientos').upload(fileName, optimizedFile, {
        upsert: true // Actualiza si existe, evitando el error 400
    });
    
    if (error) throw error;
    const { data } = supabase.storage.from('alojamientos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Subida inteligente para PDF o Imagen de Cotización
  const uploadDocument = async (file) => {
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    // ✅ CORRECCIÓN DE UNICIDAD
    const fileName = generateUniqueFileName('doc', fileExt);
    
    let finalFile = file;
    if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
      finalFile = await optimizeImage(file); 
    }
    
    // ✅ SEGURIDAD: Añadimos upsert: true
    const { error } = await supabase.storage.from('alojamientos').upload(fileName, finalFile, {
        upsert: true
    });
    
    if (error) throw error;
    const { data } = supabase.storage.from('alojamientos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addFlyer = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const toastId = toast.loading("Subiendo y optimizando imagen de habitación...");
    try {
      // ✅ Si esto falla por nombre duplicado, saltará al catch
      const url = await uploadSingleImage(file, 'habitacion');
      
      // ✅ Esto solo se ejecuta si la subida fue exitosa
      setFormData(prev => ({ 
          ...prev, 
          // Agregamos el nuevo flyer a la lista del estado
          flyers: [...prev.flyers, { titulo: `Habitación ${prev.flyers.length + 1}`, url }] 
      }));
      toast.success("Imagen agregada a la lista. Recuerda guardar el hotel para confirmar.", { id: toastId });
    } catch (error) { 
        console.error(error);
        toast.error(`Error al subir imagen: ${error.message || 'Conflicto de nombre'}`, { id: toastId }); 
    }
  };

  const updateFlyerTitle = (index, title) => {
    const newFlyers = [...formData.flyers];
    newFlyers[index].titulo = title;
    setFormData({ ...formData, flyers: newFlyers });
  };

  const removeFlyer = (index) => {
    const newFlyers = [...formData.flyers];
    newFlyers.splice(index, 1);
    setFormData({ ...formData, flyers: newFlyers });
    toast.info("Imagen removida de la lista temporal.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const toastId = toast.loading("Guardando hotel en la base de datos...");
    try {
      let finalImageUrl = formData.imagen_principal;
      if (mainImageFile) finalImageUrl = await uploadSingleImage(mainImageFile, 'logo');

      let finalDocUrl = formData.documento_url;
      if (docFile) finalDocUrl = await uploadDocument(docFile);

      const payload = { ...formData, imagen_principal: finalImageUrl, documento_url: finalDocUrl };

      if (editingId) {
        await supabase.from('alojamientos').update(payload).eq('id', editingId);
        toast.success('Hotel actualizado exitosamente', { id: toastId });
      } else {
        await supabase.from('alojamientos').insert([payload]);
        toast.success('Hotel guardado exitosamente', { id: toastId });
      }
      setIsEditorOpen(false);
      fetchData();
    } catch (err) { toast.error('Error al guardar: ' + err.message, { id: toastId }); } 
    finally { setUploading(false); }
  };

  const InputClass = "w-full p-3 rounded-xl border border-gray-200 focus:border-[#1e3a5f] outline-none text-sm font-bold text-gray-700 bg-white transition-all focus:ring-2 focus:ring-blue-100";

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="w-10 h-10 text-[#1e3a5f] animate-spin mb-4" />
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Cargando panel de administración...</p>
          </div>
      );
  }

  if (isEditorOpen) {
    return (
      <div className="animate-in fade-in pb-10">
        <button onClick={() => setIsEditorOpen(false)} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver a la lista
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 bg-[#1e3a5f] text-white flex items-center gap-2">
            <Building size={24}/> <h3 className="font-black uppercase tracking-widest text-xl">{editingId ? 'Editar Hotel' : 'Nuevo Hotel'}</h3>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50/50">
            {/* COLUMNA 1 */}
            <div className="space-y-5">
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2">Información Básica</h4>
              <input required className={InputClass} placeholder="Nombre del Hotel" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select required className={InputClass} value={formData.rango} onChange={e => setFormData({...formData, rango: e.target.value})}>
                  <option value="A">Rango A (Lujo / Centro Histórico)</option>
                  <option value="B">Rango B (Económico / Ejecutivo)</option>
                  <option value="C">Rango C (Hostal / Airbnb)</option>
                </select>
                <input required className={InputClass} placeholder="Precio Desde (Ej. 920)" value={formData.precio_desde} onChange={e => setFormData({...formData, precio_desde: e.target.value})} />
              </div>
              <input className={InputClass} placeholder="Código de Descuento (Ej. CONGRESO IASPM)" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
              
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2 pt-4">Imagen Principal / Logo</h4>
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-48 flex items-center justify-center overflow-hidden bg-white hover:border-[#1e3a5f] transition-colors group">
                {mainImagePreview ? <img src={mainImagePreview} className="h-full object-contain p-2" /> : <div className="text-gray-400 font-bold text-xs flex flex-col items-center"><UploadCloud size={32} className="mb-2"/> Subir Logo</div>}
                <input type="file" accept="image/*,.jpeg,.jpg,.png" onChange={e => { if(e.target.files[0]) { setMainImageFile(e.target.files[0]); setMainImagePreview(URL.createObjectURL(e.target.files[0])); } }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {mainImagePreview && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity"><UploadCloud size={16} className="mr-2"/> Cambiar</div>}
              </div>

              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2 pt-4">Cotización / Cartel (Opcional)</h4>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white flex items-center gap-4 hover:border-emerald-500 transition-colors group">
                 <div className="bg-gray-100 p-3 rounded-full text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><FileText size={24} /></div>
                 <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700">{docFile ? docFile.name : (formData.documento_url ? 'Documento ya subido (Clic para cambiar)' : 'Subir PDF, JPG, JPEG o PNG')}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Este archivo estará disponible para descargar en la web.</p>
                 </div>
                 <input type="file" accept=".pdf,.jpeg,.jpg,.png,image/jpeg,image/png" onChange={e => { if(e.target.files[0]) setDocFile(e.target.files[0]) }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>

              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2 pt-4">Amenidades</h4>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map(am => (
                  <button type="button" key={am.id} onClick={() => handleAmenityToggle(am.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${formData.amenidades.includes(am.id) ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {am.label}
                  </button>
                ))}
              </div>
            </div>

            {/* COLUMNA 2 */}
            <div className="space-y-5">
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2">Contacto</h4>
              <div className="grid grid-cols-2 gap-4">
                <input className={InputClass} placeholder="Teléfono" value={formData.contacto.tel} onChange={e => setFormData({...formData, contacto: {...formData.contacto, tel: e.target.value}})} />
                <input className={InputClass} placeholder="Email" value={formData.contacto.email} onChange={e => setFormData({...formData, contacto: {...formData.contacto, email: e.target.value}})} />
                <input className={InputClass} placeholder="WA (Ej. 5219671234567)" value={formData.contacto.whatsapp} onChange={e => setFormData({...formData, contacto: {...formData.contacto, whatsapp: e.target.value}})} />
                <input className={InputClass} placeholder="WA a mostrar (Ej. 967 123 4567)" value={formData.contacto.whatsapp_display} onChange={e => setFormData({...formData, contacto: {...formData.contacto, whatsapp_display: e.target.value}})} />
              </div>

              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2 pt-4">Notas (Políticas)</h4>
              <textarea className={`${InputClass} h-20 resize-none`} placeholder="Nota en Español (Ej. Persona extra $150)" value={formData.notas.es} onChange={e => setFormData({...formData, notas: {...formData.notas, es: e.target.value}})} />
              
              {/* ✅ AQUÍ ESTÁ LA LISTA QUE BUSCAS */}
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2 pt-4">Habitaciones / Galería</h4>
              <div className="space-y-3">
                {formData.flyers.length === 0 && (
                    <div className="text-center py-6 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                        <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">Aún no has subido fotos de habitaciones.</p>
                    </div>
                )}
                
                {formData.flyers.map((flyer, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-1">
                    <img src={flyer.url} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                    <input className="flex-1 text-sm outline-none font-bold text-gray-700 p-2 bg-gray-50 rounded-lg border border-gray-100 focus:border-blue-300 focus:bg-white" value={flyer.titulo} onChange={(e) => updateFlyerTitle(idx, e.target.value)} placeholder="Ej. Habitación Doble ($1,120)" />
                    
                    {/* ✅ BOTÓN DE ELIMINAR MINUATURA */}
                    <button type="button" onClick={() => removeFlyer(idx)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remover de la lista temporal">
                        <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
                
                <label className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 p-3.5 rounded-xl cursor-pointer hover:bg-blue-100 font-bold text-sm transition-colors shadow-inner">
                  <UploadCloud size={18} /> Subir Foto de Habitación
                  <input type="file" accept="image/*,.jpeg,.jpg,.png" onChange={addFlyer} className="hidden" />
                </label>
                <p className="text-[10px] text-gray-400 text-center font-medium mt-1">Recomendado: JPG, PNG o JPEG comprimidos.</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditorOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-50 border hover:bg-gray-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={uploading} className={`px-8 py-2.5 rounded-xl font-black text-white flex items-center gap-2 transition-all ${uploading ? 'bg-gray-400' : 'bg-[#1e3a5f] hover:bg-black hover:shadow-lg'}`}>
              <Save size={18} /> {uploading ? 'Guardando...' : 'Guardar Hotel'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic pl-2">Gestión de Alojamiento</h2>
        <button onClick={() => { setEditingId(null); setFormData(initialForm); setMainImagePreview(''); setDocFile(null); setIsEditorOpen(true); }} className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-black shadow-lg transition-all active:scale-95">
          <Plus size={16} /> Agregar Hotel
        </button>
      </div>

      {hoteles.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
              <Building size={56} className="text-gray-300 mb-5" />
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Aún no hay hoteles registrados en la base de datos.</p>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {hoteles.map(hotel => (
          <div key={hotel.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group">
            <div className="h-40 bg-gray-50 p-4 flex items-center justify-center border-b border-gray-100">
              <img src={hotel.imagen_principal} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4203251aa?q=80&w=600'; }} />
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => handleEdit(hotel)} className="p-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-50" title="Editar"><Edit2 size={16}/></button>
              <button onClick={() => setDeleteId(hotel.id)} className="p-2 bg-white text-red-600 rounded-lg shadow-md hover:bg-red-50" title="Eliminar"><Trash2 size={16}/></button>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider self-start ${hotel.rango === 'A' ? 'bg-emerald-50 text-emerald-700' : hotel.rango === 'B' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                Rango {hotel.rango}
              </span>
              <h3 className="font-black text-lg text-[#1e3a5f] mt-3 leading-tight flex-1">{hotel.nombre}</h3>
              <p className="text-sm font-bold text-gray-500 mt-1">${hotel.precio_desde} MXN</p>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-xs w-full text-center shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-5" />
            <h3 className="font-black text-gray-800 uppercase text-lg tracking-tight">¿Eliminar hotel?</h3>
            <p className="text-gray-500 text-sm mt-2 font-medium">Esta acción no se puede deshacer y borrará toda la información del hotel.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-black uppercase text-gray-500 hover:bg-gray-200 transition-colors">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-red-600 transition-colors">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationManager;
