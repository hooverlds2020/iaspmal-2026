// src/components/admin/SliderManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { optimizeImage } from '../../lib/imageOptimizer'; // ✅ AJUSTE: Importación del optimizador
import * as LucideIcons from 'lucide-react'; 
import { toast } from 'sonner';

const { Plus, Edit2, Trash2, Image: ImageIcon, Link: LinkIcon, Calendar, CheckCircle2, XCircle, ArrowLeft, Save, UploadCloud, AlertTriangle, Eye, EyeOff } = LucideIcons;

const SliderManager = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    image_url: '', titulo: '', descripcion: '', enlace_url: '', 
    abrir_nueva_pestana: false, activo: true, fecha_inicio: '', fecha_fin: '', orden: 0
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('slider_home')
        .select('*')
        .order('orden', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSliders(data || []);
    } catch (error) {
      toast.error("Error al cargar los sliders");
    } finally { setLoading(false); }
  };

  const handleEdit = (slider) => {
    setEditingId(slider.id);
    setFormData({
      image_url: slider.image_url || '',
      titulo: slider.titulo || '',
      descripcion: slider.descripcion || '',
      enlace_url: slider.enlace_url || '',
      abrir_nueva_pestana: slider.abrir_nueva_pestana || false,
      activo: slider.activo,
      fecha_inicio: slider.fecha_inicio ? slider.fecha_inicio.slice(0, 16) : '',
      fecha_fin: slider.fecha_fin ? slider.fecha_fin.slice(0, 16) : '',
      orden: slider.orden || 0
    });
    setImagePreview(slider.image_url);
    setImageFile(null);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('slider_home').delete().eq('id', deleteId);
      toast.success('Slider eliminado correctamente');
      fetchData();
    } catch (error) { 
      toast.error('Error al eliminar'); 
    } finally { 
      setDeleteId(null); 
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await supabase.from('slider_home').update({ activo: !currentStatus }).eq('id', id);
      toast.success(currentStatus ? 'Slider desactivado' : 'Slider activado');
      fetchData();
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // ✅ AJUSTE: Optimización del archivo antes de la subida
    const optimizedFile = await optimizeImage(file);

    const { error: uploadError } = await supabase.storage.from('sliders').upload(filePath, optimizedFile);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('sliders').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !formData.image_url) return toast.error("Debes subir una imagen para el slider.");
    
    setUploading(true);
    try {
      let finalImageUrl = formData.image_url;
      
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
      };

      if (editingId) {
        await supabase.from('slider_home').update(payload).eq('id', editingId);
        toast.success('Slider actualizado exitosamente');
      } else {
        await supabase.from('slider_home').insert([payload]);
        toast.success('Slider creado exitosamente');
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

  // --- VISTA 2: EDITOR ---
  if (isEditorOpen) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto pb-10 p-4 md:p-6">
        <button onClick={() => setIsEditorOpen(false)} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm transition-colors group bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver a la lista
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
          <div className="p-5 sm:p-6 border-b border-blue-900/10 bg-[#1e3a5f] text-white shrink-0">
            <h3 className="font-black uppercase italic tracking-widest text-xl sm:text-2xl flex items-center gap-2">
              <ImageIcon size={24}/> {editingId ? 'Editar Slider' : 'Nuevo Slider'}
            </h3>
            <p className="text-xs font-medium text-blue-200 uppercase tracking-wide mt-1">Configura la imagen, textos y programación</p>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50/50">
            {/* Columna Izquierda: Imagen */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest border-b pb-2">1. Imagen Principal</h4>
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:border-[#1e3a5f] transition-colors group overflow-hidden h-[250px] flex items-center justify-center">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold flex items-center gap-2"><UploadCloud size={20}/> Cambiar Imagen</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="bg-blue-50 text-blue-500 p-4 rounded-full inline-block mb-3"><ImageIcon size={32}/></div>
                    <p className="text-sm font-bold text-gray-600">Haz clic para subir imagen</p>
                    <p className="text-xs text-gray-400 mt-1">Recomendado: 1920x1080px</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
                 <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">Estado del Slider</p>
                    <p className="text-xs text-gray-500">¿Visible en la página principal?</p>
                 </div>
                 <button onClick={() => setFormData({...formData, activo: !formData.activo})} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>
            </div>

            {/* Columna Derecha: Datos */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest border-b pb-2">2. Contenido Opcional</h4>
              
              <div>
                <Label>Título (Opcional)</Label>
                <input className={InputClasses} value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ej: Convocatoria Abierta" />
              </div>
              
              <div>
                <Label>Descripción Breve (Opcional)</Label>
                <textarea className={`${InputClasses} min-h-[80px]`} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Ej: Participa en el XVII Congreso..." />
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <Label><LinkIcon size={12}/> Enlace / URL (Opcional)</Label>
                <input type="url" className={InputClasses} value={formData.enlace_url} onChange={e => setFormData({...formData, enlace_url: e.target.value})} placeholder="https://..." />
                
                {formData.enlace_url && (
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={formData.abrir_nueva_pestana} onChange={e => setFormData({...formData, abrir_nueva_pestana: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
                    <span className="text-xs font-bold text-gray-600">Abrir enlace en una nueva pestaña</span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label><Calendar size={12}/> Mostrar Desde (Opcional)</Label>
                  <input type="datetime-local" className={InputClasses} value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
                </div>
                <div>
                  <Label><Calendar size={12}/> Ocultar El (Opcional)</Label>
                  <input type="datetime-local" className={InputClasses} value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-bold text-right">* Deja las fechas en blanco para mostrar permanentemente.</p>

            </div>
          </div>

          <div className="p-5 sm:p-6 border-t border-gray-200 bg-white flex justify-end gap-4 shrink-0">
            <button onClick={() => setIsEditorOpen(false)} className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 uppercase tracking-wide transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={uploading} className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-lg transition-all flex items-center gap-2 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e3a5f] hover:bg-black active:scale-95'}`}>
              <Save size={18} /> {uploading ? 'Guardando...' : 'Guardar Slider'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 1: GRID PRINCIPAL ---
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">      
        <div>
          <h2 className="text-xl font-black text-[#1e3a5f] uppercase italic pl-2">Sliders Home</h2>
          <p className="text-xs font-bold text-gray-400 pl-2 mt-1">Administra el carrusel principal</p>
        </div>
        <button onClick={() => { 
            setEditingId(null); setFormData(initialForm); setImagePreview(''); setImageFile(null); setIsEditorOpen(true); 
          }} className="bg-[#1e3a5f] w-full sm:w-auto text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex justify-center gap-2 items-center shadow-lg active:scale-95">
          <Plus size={16} /> Nuevo Slider
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sliders.length === 0 && !loading && (
          <div className="col-span-full p-10 bg-white border border-dashed border-gray-300 rounded-3xl text-center text-gray-400">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold">No hay sliders configurados aún.</p>
          </div>
        )}

        {sliders.map(s => {
          const isScheduled = s.fecha_inicio || s.fecha_fin;
          
          return (
            <div key={s.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all flex flex-col overflow-hidden ${!s.activo ? 'opacity-70 grayscale-[30%]' : ''}`}>
              {/* Imagen Banner */}
              <div className="h-48 w-full relative bg-gray-100">
                <img src={s.image_url} alt={s.titulo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                   <button onClick={() => toggleStatus(s.id, s.activo)} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 transition-colors ${s.activo ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                      {s.activo ? <><Eye size={12}/> Visible</> : <><EyeOff size={12}/> Oculto</>}
                   </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                   <h3 className="font-black text-white text-lg leading-tight line-clamp-1">{s.titulo || 'Sin Título (Solo Imagen)'}</h3>
                   {s.enlace_url && <p className="text-[10px] text-blue-300 mt-1 flex items-center gap-1 uppercase font-bold"><LinkIcon size={10}/> Con enlace</p>}
                </div>

                {/* Botones Flotantes Editar/Borrar */}
                <div className="absolute top-4 right-4 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(s)} className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"><Edit2 size={16}/></button>
                  <button onClick={() => setDeleteId(s.id)} className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg"><Trash2 size={16}/></button>
                </div>
              </div>

              {/* Info Inferior */}
              {isScheduled && (
                 <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Calendar size={16}/></div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Programación</p>
                        <p className="text-xs font-bold text-gray-800">
                          {s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString() : 'Siempre'} - {s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString() : 'Siempre'}
                        </p>
                    </div>
                 </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Borrar */}
      {deleteId && (
        <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 border border-red-100">
            <div className="bg-red-50 p-4 rounded-full inline-block mb-4"><AlertTriangle size={32} className="text-red-500" /></div>
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase italic mb-2 tracking-tight">¿Eliminar Slider?</h3>
            <p className="text-sm font-medium text-gray-600 mb-8 leading-relaxed">Esta acción borrará el banner de la base de datos.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 uppercase tracking-wide text-xs">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-md hover:bg-red-600 uppercase tracking-widest text-xs">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SliderManager;
