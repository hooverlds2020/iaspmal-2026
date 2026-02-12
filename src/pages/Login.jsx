// src/pages/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onLogin(data.user);
    } catch (error) {
      setError('Credenciales incorrectas. Por favor verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* ==============================================
          SECCIÓN IZQUIERDA (BRANDING) - Solo PC/Tablet
         ============================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-iaspm-blue overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* TEXTURA DE FONDO (MARIMBA) */}
        {/* Usamos la marimba como marca de agua sutil, cubriendo todo el fondo */}
        <div className="absolute inset-0 z-0">
           <img 
             src="/images/Marimba_Watermark.png" 
             alt="Textura Marimba" 
             className="w-full h-full object-cover opacity-10 mix-blend-overlay grayscale"
           />
           {/* Gradiente para asegurar legibilidad */}
           <div className="absolute inset-0 bg-gradient-to-t from-iaspm-blue via-iaspm-blue/80 to-transparent"></div>
        </div>

        {/* CONTENIDO SUPERIOR */}
        <div className="relative z-10">
           <img 
             src="/images/logo-margen.jpg" 
             alt="Logo IASPM" 
             className="h-20 w-auto mb-6 rounded-lg shadow-lg bg-white p-2" 
           />
           <h1 className="text-4xl font-bold tracking-tight mb-2">
             Bienvenido de nuevo
           </h1>
           <p className="text-blue-100 text-lg opacity-90 max-w-md">
             Panel de Administración del XVII Congreso de la IASPM-AL, San Cristóbal de Las Casas 2026.
           </p>
        </div>

        {/* CONTENIDO INFERIOR (Footer decorativo) */}
        <div className="relative z-10 text-sm text-blue-200">
          <p>© 2026 IASPM América Latina</p>
          <p className="opacity-60">Ética, política y música popular</p>
        </div>
      </div>


      {/* ==============================================
          SECCIÓN DERECHA (FORMULARIO)
         ============================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-sm space-y-8">
          
          {/* HEADER MÓVIL (Solo visible cuando se oculta la izquierda) */}
          <div className="lg:hidden text-center">
             <img 
               src="/images/logo-margen.jpg" 
               alt="Logo" 
               className="h-16 w-auto mx-auto mb-4 mix-blend-multiply" 
             />
             <h2 className="text-2xl font-bold text-gray-900">Panel Administrativo</h2>
             <p className="text-gray-500 text-sm mt-1">Inicia sesión para gestionar el congreso</p>
          </div>

          {/* HEADER DE ESCRITORIO (Título del form) */}
          <div className="hidden lg:block">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Iniciar Sesión</h2>
            <p className="text-gray-500 mt-2">Ingresa tus credenciales para acceder.</p>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-in fade-in slide-in-from-top-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-iaspm-blue focus:border-iaspm-blue sm:text-sm transition duration-150 ease-in-out"
                  placeholder="admin@iaspmal.org"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-iaspm-blue focus:border-iaspm-blue sm:text-sm transition duration-150 ease-in-out"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-iaspm-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iaspm-orange transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accediendo...
                </>
              ) : (
                <>
                  Entrar al Panel
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>
          
          <div className="text-center text-xs text-gray-400 mt-6">
             <p>Acceso restringido únicamente para personal autorizado.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;
