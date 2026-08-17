// src/components/admin/RestaurantesManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { optimizeImage } from '../../lib/imageOptimizer';
import { Plus, Edit2, Trash2, ArrowLeft, Save, UploadCloud, AlertTriangle, Coffee, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const RestaurantesManager = () => {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialForm = { nombre: '', imagen_url: '', url: '', recomendacion: '', orden: 0 };
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('restaurantes').select('*').order('orden', { ascending: true }).order('created_at', { ascending: false });
      if (error) throw error;
      setLugares(data || []);
    } catch (error) { toast.error("Error al cargar lugares"); }
    finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ ...initialForm, ...item });
    setImagePreview(item.imagen_url);
    setImageFile(null);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDelete = async () => {
    try {
      await supabase.from('restaurantes').delete().eq('id', deleteId);
      toast.success('Lugar eliminado');
      fetchData();
    } catch (error) { toast.error('Error al eliminar'); }
    finally { setDeleteId(null); }
  };

  const uploadImage = async (file) => {
    const optimizedFile = await optimizeImage(file);
    const fileExt = file.name.split('.').pop();
    const randomString = Math.random().toString(36).substring(2, 7);
    const fileName = `restaurante_${Date.now()}_${randomString}.${fileExt}`;
    const { error } = await supabase.storage.from('restaurantes').upload(fileName, optimizedFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('restaurantes').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const toastId = toast.loading("Guardando en la base de datos...");
    try {
      let finalImageUrl = formData.imagen_url;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);

      const payload = { ...formData, imagen_url: finalImageUrl, orden: Number(formData.orden) || 0 };

      if (editingId) {
        await supabase.from('restaurantes').update(payload).eq('id', editingId);
        toast.success('Actualizado exitosamente', { id: toastId });
      } else {
        await supabase.from('restaurantes').insert([payload]);
        toast.success('Guardado exitosamente', { id: toastId });
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
            <Coffee size={24}/> <h3 className="font-black uppercase tracking-widest text-xl">{editingId ? 'Editar Lugar' : 'Nuevo Lugar'}</h3>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50/50">
            <div className="space-y-5">
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2">Información</h4>
              <input required className={InputClass} placeholder="Nombre (Ej. Amor Negro)" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <input className={InputClass} placeholder="URL (sitio web, Instagram, etc.)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              <input type="number" className={InputClass} placeholder="Orden (menor número aparece primero)" value={formData.orden} onChange={e => setFormData({...formData, orden: e.target.value})} />
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2">Foto</h4>
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-48 flex items-center justify-center overflow-hidden bg-white hover:border-[#1e3a5f] transition-colors group">
                {imagePreview ? <img src={imagePreview} className="h-full w-full object-cover" /> : <div className="text-gray-400 font-bold text-xs flex flex-col items-center"><UploadCloud size={32} className="mb-2"/> Subir Foto</div>}
                <input type="file" accept="image/*,.jpeg,.jpg,.png" onChange={e => { if(e.target.files[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {imagePreview && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity"><UploadCloud size={16} className="mr-2"/> Cambiar</div>}
              </div>

              <h4 className="text-sm font-black text-[#1e3a5f] uppercase border-b border-gray-200 pb-2 pt-4">Recomendación (opcional)</h4>
              <textarea className={`${InputClass} h-24 resize-none`} placeholder="Ej. 10% de descuento en toda la carta, excepto Menú del Día. Déjalo vacío si no aplica." value={formData.recomendacion} onChange={e => setFormData({...formData, recomendacion: e.target.value})} />
              <p className="text-[10px] text-gray-400 font-medium -mt-3">Si se deja vacío, no aparecerá ningún texto de recomendación en la web pública.</p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditorOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-50 border hover:bg-gray-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={uploading} className={`px-8 py-2.5 rounded-xl font-black text-white flex items-center gap-2 transition-all ${uploading ? 'bg-gray-400' : 'bg-[#1e3a5f] hover:bg-black hover:shadow-lg'}`}>
              <Save size={18} /> {uploading ? 'Guardando...' : 'Guardar Lugar'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic pl-2">Cafés y Restaurantes</h2>
        <button onClick={() => { setEditingId(null); setFormData(initialForm); setImagePreview(''); setIsEditorOpen(true); }} className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-black shadow-lg transition-all active:scale-95">
          <Plus size={16} /> Agregar Lugar
        </button>
      </div>

      {lugares.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
          <Coffee size={56} className="text-gray-300 mb-5" />
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Aún no hay lugares registrados.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {lugares.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group">
            <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
              {item.imagen_url
                ? <img src={item.imagen_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <Coffee size={32} className="text-gray-300" />
              }
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => handleEdit(item)} className="p-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-50" title="Editar"><Edit2 size={16}/></button>
              <button onClick={() => setDeleteId(item.id)} className="p-2 bg-white text-red-600 rounded-lg shadow-md hover:bg-red-50" title="Eliminar"><Trash2 size={16}/></button>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-black text-base text-[#1e3a5f] leading-tight">{item.nombre}</h3>
              {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-1 flex items-center gap-1 hover:underline truncate"><LinkIcon size={12}/> {item.url}</a>}
              {item.recomendacion && <p className="text-xs text-gray-500 mt-2 bg-amber-50 border border-amber-100 rounded-lg p-2">{item.recomendacion}</p>}
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-xs w-full text-center shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-5" />
            <h3 className="font-black text-gray-800 uppercase text-lg tracking-tight">¿Eliminar lugar?</h3>
            <p className="text-gray-500 text-sm mt-2 font-medium">Esta acción no se puede deshacer.</p>
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

export default RestaurantesManager;
