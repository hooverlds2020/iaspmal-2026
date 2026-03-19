import imageCompression from 'browser-image-compression';

export const optimizeImage = async (imageFile) => {
  const options = {
    maxSizeMB: 0.7,           // Máximo peso permitido
    maxWidthOrHeight: 1920,  // Resolución máxima (Full HD)
    useWebWorker: true,      // Para no trabar el navegador
  };

  try {
    return await imageCompression(imageFile, options);
  } catch (error) {
    console.error("Error comprimiendo:", error);
    return imageFile; // Si falla, devuelve el original para no romper el flujo
  }
};
