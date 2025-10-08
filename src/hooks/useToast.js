// src/hooks/useToast.js
import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type, duration });
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast
  };
};
