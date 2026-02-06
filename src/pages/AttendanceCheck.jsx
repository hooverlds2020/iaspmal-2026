// src/pages/AttendanceCheck.jsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AttendanceCheck = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    // ESTRATEGIA DE REDIRECCIÓN:
    // En lugar de procesar aquí, mandamos todo a la herramienta segura de Staff.
    if (code) {
      // Si el QR trae código, lo pasamos a la URL de Staff
      navigate(`/staff/attendance?code=${code}`);
    } else {
      // Si no trae código, solo mandamos al login de Staff
      navigate('/staff/attendance');
    }
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Conectando con sistema seguro...</h2>
        <p className="text-gray-500 text-sm mt-2">Redirigiendo a Staff Access</p>
      </div>
    </div>
  );
};

export default AttendanceCheck;
