// src/components/pages/HomeLanding.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Search, CheckCircle, Ticket, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const HomeLanding = ({ lang, setCurrentPage }) => {
  const [emailCheck, setEmailCheck] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);

  // --- EFECTO DE AUTOLIMPIEZA ---
  // Si encontramos un resultado, esperamos 6 segundos y lo borramos
  useEffect(() => {
    if (statusResult) {
      const timer = setTimeout(() => {
        setStatusResult(null);
        setEmailCheck(''); // Opcional: limpiar también el campo de texto
      }, 6000); // 6000ms = 6 segundos
      return () => clearTimeout(timer);
    }
  }, [statusResult]);

  // --- LÓGICA DE BÚSQUEDA ---
  const checkStatus = async (e) => {
    e.preventDefault();
    if (!emailCheck) return;
    setLoadingCheck(true);
    setStatusResult(null);

    const cleanEmail = emailCheck.trim().toLowerCase();

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('status, full_name') // Ya no pedimos 'attendance_code'
        .ilike('email', cleanEmail) 
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setStatusResult({ 
          found: true, 
          name: data.full_name, 
          status: data.status
        });
      } else {
        setStatusResult({ found: false });
      }
    } catch (err) {
      console.error(err);
      setStatusResult({ error: true });
    } finally {
      setLoadingCheck(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-teal-900 rounded-3xl overflow-hidden shadow-2xl text-white group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-multiply transition-transform duration-1000 group-hover:scale-105"></div>
        
        <div className="relative p-6 md:p-12 lg:p-16 flex flex-col items-start gap-6">
          <span className="bg-teal-500/20 border border-teal-400/30 text-teal-100 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide backdrop-blur-sm shadow-sm">
            28 Sep - 02 Oct, 2026
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-2xl leading-tight drop-shadow-lg">
            Ética, Política y <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400">Música Popular</span>
          </h1>
          <p className="text-lg text-teal-50 max-w-xl leading-relaxed drop-shadow-md">
            {lang === 'es' 
              ? 'Bienvenidos al XVII Congreso de la IASPM-AL en San Cristóbal de Las Casas. Un espacio para repensar las intersecciones sonoras en América Latina.'
              : 'Welcome to the XVII IASPM-AL Congress in San Cristóbal de Las Casas. A space to rethink sonic intersections in Latin America.'}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <button onClick={() => setCurrentPage('cuotas')} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:-translate-y-1 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              {lang === 'es' ? 'Inscribirse Ahora' : 'Register Now'}
            </button>
            <button onClick={() => setCurrentPage('programa')} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3.5 rounded-xl font-semibold transition backdrop-blur-md flex items-center gap-2 hover:bg-white/25">
              {lang === 'es' ? 'Ver Programa' : 'View Program'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SHORTCUTS */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { id: 'programa', icon: Calendar, color: 'purple', title: { es: 'Agenda Académica', en: 'Academic Agenda' }, desc: { es: 'Consulta los simposios, ponencias y actividades.', en: 'Check symposia and activities.' } },
          { id: 'sedes', icon: MapPin, color: 'blue', title: { es: 'Sedes y Mapas', en: 'Venues & Maps' }, desc: { es: 'Ubica los auditorios en el centro histórico.', en: 'Locate auditoriums in the center.' } },
          { id: 'cuotas', icon: Users, color: 'orange', title: { es: 'Inscripción y Costos', en: 'Registration & Fees' }, desc: { es: 'Revisa costos para estudiantes e investigadores.', en: 'Check fees for students and researchers.' } }
        ].map((item) => (
          <button key={item.id} onClick={() => setCurrentPage(item.id)} className="text-left group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all duration-300 hover:-translate-y-1">
            <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">{lang === 'es' ? item.title.es : item.title.en}</h3>
            <p className="text-sm text-gray-500">{lang === 'es' ? item.desc.es : item.desc.en}</p>
          </button>
        ))}
      </div>

      {/* 3. CHECK STATUS WIDGET (LIMPIO Y AUTOMÁTICO) */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="w-6 h-6 text-teal-600" />
            {lang === 'es' ? 'Verifica tu Inscripción' : 'Check Registration'}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {lang === 'es' 
              ? 'Si ya realizaste tu pago, ingresa tu correo para verificar tu estatus.' 
              : 'If you already paid, enter your email to check your status.'}
          </p>
        </div>
        
        <div className="flex-1 w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-gray-100 ring-1 ring-gray-100">
          <form onSubmit={checkStatus} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">{lang === 'es' ? 'Correo Electrónico' : 'Email Address'}</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="ejemplo@correo.com" 
                  value={emailCheck}
                  onChange={(e) => setEmailCheck(e.target.value)}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
                <button disabled={loadingCheck} type="submit" className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center">
                  {loadingCheck ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* RESULTADOS (Se auto-destruyen en 6s) */}
            {statusResult && (
              <div className={`mt-4 p-4 rounded-xl text-sm border animate-in slide-in-from-top-2 fade-in duration-500 ${
                statusResult.found 
                  ? (statusResult.status === 'paid' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200') 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {statusResult.found ? (
                  <div className="flex gap-3">
                    {statusResult.status === 'paid' ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-yellow-600" />}
                    <div className="flex-1">
                      <p className="font-bold text-base">{statusResult.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span>{lang === 'es' ? 'Estado:' : 'Status:'}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${statusResult.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                          {statusResult.status === 'paid' ? (lang === 'es' ? 'Aprobado' : 'Approved') : (lang === 'es' ? 'En Revisión' : 'Pending')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>
                      {lang === 'es' ? 'No encontramos registros.' : 'No registration found.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* 4. LOGOS (Placeholders mejorados) */}
      <div className="border-t border-gray-200 pt-10 pb-4">
        <p className="text-center text-xs text-gray-400 font-bold mb-8 uppercase tracking-[0.2em]">{lang === 'es' ? 'Instituciones Convocantes' : 'Convening Institutions'}</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Reemplaza con <img> reales cuando las tengas */}
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-teal-100 hover:text-teal-600 hover:shadow-md transition-all">UNICACH</div>
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-teal-100 hover:text-teal-600 hover:shadow-md transition-all">IASPM</div>
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-teal-100 hover:text-teal-600 hover:shadow-md transition-all">CESMECA</div>
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-teal-100 hover:text-teal-600 hover:shadow-md transition-all">CHIAPAS</div>
        </div>
      </div>
    </div>
  );
};

export default HomeLanding;
