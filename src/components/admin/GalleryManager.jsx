// src/components/admin/GalleryManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { optimizeImage } from '../../lib/imageOptimizer'; // ✅ AJUSTE: Importación del optimizador
import * as LucideIcons from 'lucide-react'; 
import { toast } from 'sonner';

const { 
  Plus, Edit2, Trash2, Image: ImageIcon, ArrowLeft, 
  Save, UploadCloud, AlertTriangle, Eye, EyeOff, Calendar 
} = LucideIcons;

// ✅ VALORES ESTANDARIZADOS — deben coincidir exactamente con Gallery.jsx
const FECHA_OPTIONS = [
  { value: '28 de Septiembre', label: '28 de Septiembre' },
  { value: '29 de Septiembre', label: '29 de Septiembre' },
  { value: '30 de Septiembre', label: '30 de Septiembre' },
  { value: '1 de Octubre',      label: '1 de Octubre' },
  { value: '2 de Octubre',      label: '2 de Octubre' },
];

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialForm = { 
    image_url: '', 
    titulo: '', 
    activo: true, 
    orden: 0, 
    fecha_tag: '28 de Septiembre'   // ✅ valor por defecto estandarizado
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('galeria')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      toast.error("Error al cargar la galería");
    } finally { setLoading(false); }
  };

  const handleEdit = (img) => {
    setEditingId(img.id);
    setFormData({
      image_url: img.image_url || '',
      titulo: img.titulo || '',
      activo: img.activo,
      orden: img.orden || 0,
      fecha_tag: img.fecha_tag || '28 de Septiembre'  // ✅ fallback estandarizado
    });
    setImagePreview(img.image_url);
    setImageFile(null);
    setIsEditorOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const executeDelete = async () => {
    try {
      await supabase.from('galeria').delete().eq('id', deleteId);
      toast.success('Imagen eliminada correctamente');
      fetchData();
    } catch (error) { 
        toast.error('Error al eliminar'); 
    } finally { 
        setDeleteId(null); 
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    // ✅ AJUSTE: Optimización antes de subir
    const optimizedFile = await optimizeImage(file);
    
    const { error: uploadError } = await supabase.storage.from('galeria').upload(fileName, optimizedFile);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('galeria').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !formData.image_url) return toast.error("Debes seleccionar una imagen.");
    
    setUploading(true);
    try {
      let finalImageUrl = formData.image_url;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);

      const payload = { ...formData, image_url: finalImageUrl };

      if (editingId) {
        await supabase.from('galeria').update(payload).eq('id', editingId);
        toast.success('Imagen actualizada');
      } else {
        await supabase.from('galeria').insert([payload]);
        toast.success('Imagen guardada con éxito');
      }

      setIsEditorOpen(false);
      fetchData();
    } catch (err) { 
      toast.error('Error al guardar: ' + err.message); 
    } finally { 
      setUploading(false); 
    }
  };

  const InputClasses = "w-full p-3 rounded-xl border border-gray-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-gray-700 transition-all bg-white";
  const Label = ({ children }) => <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">{children}</label>;

  if (isEditorOpen) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setIsEditorOpen(false)} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm transition-colors group bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver a la galería
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
          <div className="p-6 bg-[#1e3a5f] text-white font-black uppercase italic tracking-widest text-xl flex items-center gap-2">
            <ImageIcon size={24}/> {editingId ? 'Editar Imagen' : 'Nueva Imagen'}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50">
            <div className="space-y-4">
              <Label>Fotografía</Label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl bg-white h-[300px] flex items-center justify-center overflow-hidden group">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400 font-bold text-xs">
                    <UploadCloud className="mx-auto mb-2" size={40}/> 
                    Haz clic para subir fotografía
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-5">
              {/* ✅ SELECTOR DE FECHA — valores estandarizados */}
              <div>
                <Label><Calendar size={14} className="text-[#1e3a5f]"/> Fecha del Evento (Para Pestañas)</Label>
                <select 
                  className={InputClasses}
                  value={formData.fecha_tag}
                  onChange={e => setFormData({...formData, fecha_tag: e.target.value})}
                >
                  {FECHA_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Pie de foto / Título (Opcional)</Label>
                <input 
                  className={InputClasses} 
                  value={formData.titulo} 
                  onChange={e => setFormData({...formData, titulo: e.target.value})} 
                  placeholder="Ej: Ceremonia de apertura" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                 <div>
                    <p className="text-xs font-black text-gray-800 uppercase">Estado</p>
                    <p className="text-[10px] text-gray-500 font-bold">¿Visible en la galería?</p>
                 </div>
                 <button 
                  onClick={() => setFormData({...formData, activo: !formData.activo})} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}
                 >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
            <button onClick={() => setIsEditorOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 text-xs uppercase bg-gray-50 border transition-colors hover:bg-gray-100">Cancelar</button>
            <button onClick={handleSubmit} disabled={uploading} className="px-8 py-2.5 rounded-xl font-black text-white text-xs uppercase bg-[#1e3a5f] hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95">
              <Save size={16} /> {uploading ? 'Guardando...' : 'Guardar Imagen'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic leading-none">Galería de Fotos</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Organización por días del congreso</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData(initialForm); setImagePreview(''); setIsEditorOpen(true); }} 
          className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95 shrink-0"
        >
          <Plus size={16} /> Nueva Foto
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map(img => (
          <div key={img.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group shadow-sm relative hover:shadow-md transition-shadow">
            <img src={img.image_url} className="w-full aspect-square object-cover" />
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(img)} className="p-1.5 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-50"><Edit2 size={12}/></button>
              <button onClick={() => setDeleteId(img.id)} className="p-1.5 bg-white text-red-600 rounded-lg shadow-md hover:bg-red-50"><Trash2 size={12}/></button>
            </div>
            
            <div className="p-3 bg-white">
               <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase mb-1">
                  <Calendar size={10} /> {img.fecha_tag}
               </div>
               <p className="text-[10px] font-bold text-gray-600 truncate">{img.titulo || 'Sin título'}</p>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-xs w-full text-center shadow-2xl border border-red-50">
            <AlertTriangle size={36} className="text-red-500 mx-auto mb-4" />
            <h3 className="font-black text-gray-800 uppercase italic text-lg">¿Eliminar esta foto?</h3>
            <p className="text-xs text-gray-500 font-bold mt-1">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-black uppercase text-gray-500 transition-colors hover:bg-gray-200">No</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase shadow-lg transition-all hover:bg-red-600 active:scale-95">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
