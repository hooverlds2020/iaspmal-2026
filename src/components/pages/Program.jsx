// src/components/pages/Program.jsx
import React, { useState } from 'react';
import { Download, List, Calendar, ChevronDown, Clock } from 'lucide-react';
import ScheduleView from './ScheduleView'; 
import { supabase } from '../../lib/supabaseClient';

const Program = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('program_active_tab') || 'simposios');
  const handleTabChange = (tab) => { setActiveTab(tab); localStorage.setItem('program_active_tab', tab); };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-in fade-in duration-500">
      {/* Header Sticky Compacto */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2"> 
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
            
            {/* TÍTULO: Se oculta en móvil para ganar espacio */}
            <div className="hidden md:block">
              <h1 className="text-2xl md:text-3xl font-black text-[#1e3a5f] tracking-tight">Programa Académico</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">XVIII Congreso IASPM-AL 2026</p>
            </div>

            {/* BOTONES: Full width en móvil */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 bg-gray-100 p-1 rounded-lg">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-md text-xs font-bold shadow-sm hover:bg-black transition-all"><Download size={14} /> PDF</button>
              <div className="flex gap-1">
                <button onClick={() => handleTabChange('simposios')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'simposios' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-400'}`}><List size={14} /> Simposios</button>
                <button onClick={() => handleTabChange('agenda')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'agenda' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-400'}`}><Calendar size={14} /> Agenda</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido sin padding extra en móvil */}
      <div className="max-w-full md:max-w-7xl mx-auto px-0 md:px-8 py-0 md:py-4">
        {activeTab === 'simposios' ? <SymposiumsList /> : <ScheduleView />}
      </div>
    </div>
  );
};

const SymposiumsList = () => {
  const [simposios, setSimposios] = useState([]);
  const [openId, setOpenId] = useState(null); 
  React.useEffect(() => { supabase.from('symposiums').select('*').order('id').then(({data}) => setSimposios(data||[])) }, []);

  return (
    <div className="space-y-3 max-w-4xl mx-auto p-2 md:p-0">
      {simposios.map((s, index) => (
        <div key={s.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <button onClick={() => setOpenId(openId === s.id ? null : s.id)} className="w-full text-left p-4 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${openId === s.id ? 'bg-[#1e3a5f] text-white' : 'bg-blue-50 text-[#1e3a5f]'}`}>S{index+1}</div>
            <div className="flex-1"><h3 className="font-bold text-[#1e3a5f] text-sm leading-tight">{s.name}</h3></div>
            <ChevronDown className={`text-gray-300 transition-transform ${openId === s.id ? 'rotate-180' : ''}`} />
          </button>
          {openId === s.id && (
            <div className="px-4 pb-4 pl-[3rem]">
              <p className="text-xs text-gray-600 mb-3">{s.description || "Detalles próximamente."}</p>
              <button onClick={() => { localStorage.setItem('program_active_tab', 'agenda'); window.location.reload(); }} className="px-3 py-1.5 bg-orange-50 text-[#f4a261] rounded-lg text-[10px] font-bold border border-orange-100 flex items-center gap-1"><Clock size={12}/> VER HORARIOS</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Program;
