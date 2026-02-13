// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { LogOut, Users, Calendar, FileText, Settings, DollarSign, MapPin } from 'lucide-react';
import SymposiumsManager from '../components/admin/SymposiumsManager';
import SessionsManager from '../components/admin/SessionsManager';
import PresentationsManager from '../components/admin/PresentationsManager';
import SymposiumVenueManager from '../components/admin/SymposiumVenueManager';
import RegistrationsDashboard from './RegistrationsDashboard';
import FinancesDashboard from './FinancesDashboard';
import { supabase } from '../lib/supabaseClient';

const AdminDashboard = ({ user, onLogout }) => {
  // AJUSTE: Leemos del localStorage al iniciar, si no hay nada, por defecto 'sedes'
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('admin_active_section') || 'sedes';
  });

  // AJUSTE: Función para cambiar de sección y guardar el estado en el navegador
  const handleSectionChange = (sectionName) => {
    setActiveSection(sectionName);
    localStorage.setItem('admin_active_section', sectionName);
  };

  const handleLogout = async () => {
    // Limpiamos la sección al salir si lo deseas (opcional)
    // localStorage.removeItem('admin_active_section');
    await supabase.auth.signOut();
    onLogout();
  };

  const getButtonClass = (sectionName) => {
    const isActive = activeSection === sectionName;
    return `w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium text-sm ${
      isActive
        ? 'bg-blue-600 text-white shadow-md transform translate-x-1' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'      
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">
                I
             </div>
             <div>
                <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">IASPM-AL <span className="text-blue-600">2026</span></h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Panel de Administración</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR REORDENADO */}
          <aside className="md:col-span-3 lg:col-span-3 sticky top-24">
            <nav className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-4">Menú Principal</h2>
              <ul className="space-y-1">
                {/* 1. Sedes y Asignación */}
                <li>
                  <button onClick={() => handleSectionChange('sedes')} className={getButtonClass('sedes')}>
                    <MapPin className="w-5 h-5" /> Sedes y Asignación
                  </button>
                </li>
                {/* 2. Gestión de Simposios */}
                <li>
                  <button onClick={() => handleSectionChange('simposios')} className={getButtonClass('simposios')}>
                    <Users className="w-5 h-5" /> Gestión de Simposios
                  </button>
                </li>
                {/* 3. Agenda / Mesas */}
                <li>
                  <button onClick={() => handleSectionChange('sesiones')} className={getButtonClass('sesiones')}>
                    <Calendar className="w-5 h-5" /> Agenda / Mesas
                  </button>
                </li>
                {/* 4. Ponencias */}
                <li>
                  <button onClick={() => handleSectionChange('ponencias')} className={getButtonClass('ponencias')}>
                    <FileText className="w-5 h-5" /> Ponencias
                  </button>
                </li>
              </ul>

              <div className="my-4 border-t border-gray-100 mx-4"></div>

              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-4">Administración</h2>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => handleSectionChange('registros')} className={getButtonClass('registros')}>
                    <Settings className="w-5 h-5" /> Registros
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSectionChange('finanzas')} className={getButtonClass('finanzas')}>
                    <DollarSign className="w-5 h-5" /> Finanzas
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main className="md:col-span-9 lg:col-span-9">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm min-h-[500px]">
              {activeSection === 'sedes' && <SymposiumVenueManager />}
              {activeSection === 'simposios' && <SymposiumsManager />}
              {activeSection === 'sesiones' && <SessionsManager />}
              {activeSection === 'ponencias' && <PresentationsManager />}
              {activeSection === 'registros' && <RegistrationsDashboard />}
              {activeSection === 'finanzas' && <FinancesDashboard />}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
