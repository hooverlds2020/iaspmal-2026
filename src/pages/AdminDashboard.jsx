// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { LogOut, Users, Calendar, FileText, Settings, DollarSign, MapPin, LayoutGrid } from 'lucide-react';
import SymposiumsManager from '../components/admin/SymposiumsManager';
import SessionsManager from '../components/admin/SessionsManager';
import PresentationsManager from '../components/admin/PresentationsManager';
import SymposiumVenueManager from '../components/admin/SymposiumVenueManager';
import RegistrationsDashboard from './RegistrationsDashboard';
import FinancesDashboard from './FinancesDashboard';
import { supabase } from '../lib/supabaseClient';

const AdminDashboard = ({ user, onLogout }) => {
  // Persistencia de la sección activa
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('admin_active_section') || 'sedes';
  });

  const handleSectionChange = (sectionName) => {
    setActiveSection(sectionName);
    localStorage.setItem('admin_active_section', sectionName);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  // Componente de Botón de Navegación (Para limpiar el código)
  const NavButton = ({ id, label, icon: Icon }) => {
    const isActive = activeSection === id;
    return (
      <button
        onClick={() => handleSectionChange(id)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden ${
          isActive
            ? 'bg-[#1e3a5f] text-white shadow-lg translate-x-1'
            : 'text-gray-500 hover:bg-white hover:shadow-md hover:text-[#1e3a5f]'
        }`}
      >
        <Icon size={20} className={`shrink-0 transition-colors ${isActive ? 'text-blue-200' : 'text-gray-400 group-hover:text-[#1e3a5f]'}`} />
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-[#1e3a5f] w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">
                I
             </div>
             <div>
                <h1 className="text-lg font-black text-[#1e3a5f] tracking-tight leading-none">IASPM-AL <span className="text-blue-500">2026</span></h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Panel de Administración</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-700">{user?.email}</span>
                <span className="text-[10px] text-green-600 font-black uppercase tracking-wide flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                </span>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-all font-bold text-xs uppercase tracking-wide border border-red-100 hover:border-transparent"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SIDEBAR DE NAVEGACIÓN */}
          <aside className="lg:col-span-3 sticky top-24 z-20">
            <nav className="bg-gray-100/50 p-1 rounded-2xl border border-gray-200/60">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-1">
                 
                 <div className="px-4 py-2 mb-2">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Académico</h2>
                 </div>
                 
                 <NavButton id="sedes" label="Sedes y Asignación" icon={MapPin} />
                 <NavButton id="simposios" label="Gestión de Simposios" icon={Users} />
                 <NavButton id="sesiones" label="Agenda / Mesas" icon={Calendar} />
                 <NavButton id="ponencias" label="Ponencias" icon={FileText} />

                 <div className="my-4 border-t border-gray-100 mx-4"></div>

                 <div className="px-4 py-2 mb-2">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administración</h2>
                 </div>

                 <NavButton id="registros" label="Inscripciones" icon={LayoutGrid} />
                 <NavButton id="finanzas" label="Finanzas" icon={DollarSign} />
                 
                 {/* Botón extra para configuración futura */}
                 {/* <NavButton id="config" label="Configuración" icon={Settings} /> */}
              </div>
            </nav>
          </aside>

          {/* ÁREA DE TRABAJO (Aquí se renderizan los componentes que ya editamos) */}
          <main className="lg:col-span-9">
            {/* Contenedor blanco con sombra suave donde viven los módulos */}
            <div className="bg-white rounded-[2rem] border border-gray-200/80 p-6 md:p-8 shadow-xl shadow-gray-200/40 min-h-[600px] relative overflow-hidden">
              
              {/* Fondo decorativo sutil */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -z-0 pointer-events-none opacity-50"></div>

              <div className="relative z-10">
                  {activeSection === 'sedes' && <SymposiumVenueManager />}
                  {activeSection === 'simposios' && <SymposiumsManager />}
                  {activeSection === 'sesiones' && <SessionsManager />}
                  {activeSection === 'ponencias' && <PresentationsManager />}
                  {activeSection === 'registros' && <RegistrationsDashboard />}
                  {activeSection === 'finanzas' && <FinancesDashboard />}
              </div>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
