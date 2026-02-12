// src/components/pages/Program.jsx
import React, { useState, useEffect } from 'react';
import { Download, List, Calendar, ChevronDown, Clock } from 'lucide-react';
import ScheduleView from './ScheduleView'; // Importamos la Agenda que ya creamos
import { supabase } from '../../lib/supabaseClient';

const Program = () => {
  // 1. ESTADO CON MEMORIA (Persistencia)
  // Al iniciar, buscamos si hay algo guardado en el navegador. Si no, empezamos en 'simposios'.
  const [activeTab, setActiveTab] = useState(() => {
    // Si es la primera vez, devuelve null, entonces usa 'simposios'
    return localStorage.getItem('program_active_tab') || 'simposios';
  });

  // 2. FUNCIÓN PARA CAMBIAR Y GUARDAR
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('program_active_tab', tab); // Guardamos la elección para el futuro
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER Y CONTROLES (Sticky) */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1e3a5f] tracking-tight">
                Programa Académico
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                XVIII Congreso IASPM-AL 2026
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl shadow-inner">
              {/* Botón Descargar (Decorativo por ahora) */}
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-xs font-bold shadow-md hover:bg-black transition-all hover:scale-105 active:scale-95">
                <Download size={14} /> <span className="hidden sm:inline">PDF</span>
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-2"></div>

              {/* BOTONES DE NAVEGACIÓN PERSISTENTE */}
              <button 
                onClick={() => handleTabChange('simposios')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'simposios' 
                    ? 'bg-white text-[#1e3a5f] shadow-sm scale-105' 
                    : 'text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-200/50'
                }`}
              >
                <List size={16} /> Simposios
              </button>

              <button 
                onClick={() => handleTabChange('agenda')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'agenda' 
                    ? 'bg-white text-[#1e3a5f] shadow-sm scale-105' 
                    : 'text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-200/50'
                }`}
              >
                <Calendar size={16} /> Agenda
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Renderizado Condicional: Muestra uno u otro según el estado */}
        {activeTab === 'simposios' ? (
          <SymposiumsList /> 
        ) : (
          <ScheduleView />
        )}

      </div>
    </div>
  );
};

// --- COMPONENTE INTERNO: LISTA DE SIMPOSIOS (ACORDEÓN) ---
// Este componente carga la lista de simposios desde Supabase
const SymposiumsList = () => {
  const [simposios, setSimposios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null); 

  useEffect(() => {
    const fetchSimposios = async () => {
      try {
        const { data, error } = await supabase.from('symposiums').select('*').order('id');
        if (error) throw error;
        setSimposios(data || []);
      } catch (e) {
        console.error("Error cargando simposios", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSimposios();
  }, []);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  if (loading) return <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f] mx-auto"></div></div>;

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {simposios.map((s, index) => (
        <div key={s.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
          
          {/* Cabecera del Acordeón */}
          <button 
            onClick={() => toggleAccordion(s.id)}
            className="w-full text-left p-6 flex items-start gap-4 focus:outline-none"
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-colors ${openId === s.id ? 'bg-[#1e3a5f] text-white' : 'bg-blue-50 text-[#1e3a5f] group-hover:bg-[#1e3a5f] group-hover:text-white'}`}>
              S{index + 1}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-bold text-[#1e3a5f] text-lg leading-tight group-hover:text-black transition-colors">{s.name}</h3>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wide">
                {s.coordinators || "Coordinación por definir"}
              </p>
            </div>
            <ChevronDown 
              className={`text-gray-300 transition-transform duration-300 mt-2 ${openId === s.id ? 'rotate-180 text-[#f4a261]' : ''}`} 
            />
          </button>

          {/* Contenido del Acordeón (Detalles) */}
          {openId === s.id && (
            <div className="px-6 pb-8 pt-0 pl-[5.5rem]">
              <div className="pt-4 border-t border-gray-50 space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed text-justify">
                  {s.description || "La descripción detallada de este simposio estará disponible próximamente."}
                </p>
                
                {/* Botón de acción dentro del simposio */}
                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={() => {
                            // Truco para cambiar de tab desde aquí
                            localStorage.setItem('program_active_tab', 'agenda');
                            window.location.reload(); // Recargamos para que el useEffect lo detecte
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl text-xs font-black text-[#f4a261] hover:bg-[#f4a261] hover:text-white transition-colors"
                    >
                        <Clock size={14}/> VER EN LA AGENDA
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Program;
