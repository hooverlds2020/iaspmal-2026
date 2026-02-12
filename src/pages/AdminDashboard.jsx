// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { LogOut, Users, Calendar, FileText, Settings, DollarSign, MapPin } from 'lucide-react'; // Agregamos MapPin
import SymposiumsManager from '../components/admin/SymposiumsManager';
import SessionsManager from '../components/admin/SessionsManager';
import PresentationsManager from '../components/admin/PresentationsManager';
import SymposiumVenueManager from '../components/admin/SymposiumVenueManager'; // <--- IMPORT NUEVO
import { supabase } from '../lib/supabaseClient';
import RegistrationsDashboard from './RegistrationsDashboard';
import FinancesDashboard from './FinancesDashboard';

const AdminDashboard = ({ user, onLogout }) => {
  // Estado para controlar qué sección se muestra
  const [activeSection, setActiveSection] = useState('simposios');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-teal-700">Panel Admin - IASPMAL 2026</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <nav className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-bold text-gray-900 mb-4">Menú</h2>
              <ul className="space-y-2">
                
                {/* Opción 1: Simposios (Gestión general) */}
                <li>
                  <button
                    onClick={() => setActiveSection('simposios')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeSection === 'simposios'
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Simposios
                  </button>
                </li>

                {/* Opción NUEVA: Sedes y Asignación */}
                <li>
                  <button
                    onClick={() => setActiveSection('sedes')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeSection === 'sedes'
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Sedes y Simposios
                  </button>
                </li>

                {/* Opción 2: Sesiones */}
                <li>
                  <button
                    onClick={() => setActiveSection('sesiones')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeSection === 'sesiones'
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Sesiones (Mesas)
                  </button>
                </li>

                {/* Opción 3: Ponencias */}
                <li>
                  <button
                    onClick={() => setActiveSection('ponencias')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeSection === 'ponencias'
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Ponencias
                  </button>
                </li>

                {/* Opción 4: Registros */}
                <li>
                  <button
                    onClick={() => setActiveSection('registros')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeSection === 'registros'
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Registros
                  </button>
                </li>

                {/* Opción 5: Finanzas */}
                <li>
                  <button
                    onClick={() => setActiveSection('finanzas')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeSection === 'finanzas'
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    Finanzas
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <main className="md:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {activeSection === 'simposios' && 'Gestión de Simposios'}
                {activeSection === 'sedes' && 'Asignación de Sedes'} 
                {activeSection === 'sesiones' && 'Gestión de Sesiones'}
                {activeSection === 'ponencias' && 'Gestión de Ponencias'}
                {activeSection === 'registros' && 'Gestión de Registros'}
                {activeSection === 'finanzas' && 'Panel Financiero'}
              </h2>

              {/* Renderizado condicional de componentes */}
              {activeSection === 'simposios' && <SymposiumsManager />}
              
              {/* COMPONENTE NUEVO */}
              {activeSection === 'sedes' && <SymposiumVenueManager />}

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
