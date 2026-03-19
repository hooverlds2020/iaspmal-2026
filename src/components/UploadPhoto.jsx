import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { optimizeImage } from '../lib/imageOptimizer';

export default function UploadPhoto() {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // --- AQUÍ OCURRE LA MAGIA ---
      const compressedFile = await optimizeImage(file);
      
      const fileName = `${Date.now()}-${file.name}`;
      
      // Subir al bucket 'galeria' (Asegúrate que exista en tu Supabase)
      const { data, error } = await supabase.storage
        .from('galeria')
        .upload(fileName, compressedFile);

      if (error) throw error;
      alert("¡Imagen optimizada y subida correctamente!");
      
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <input 
        type="file" 
        onChange={handleUpload} 
        disabled={loading}
        className="text-white"
      />
      {loading && <p className="text-blue-400 mt-2">Comprimiendo y subiendo...</p>}
    </div>
  );
}
