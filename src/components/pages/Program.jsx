// src/components/pages/Program.jsx
import React, { useState, useEffect } from 'react';
import { Download, List, Calendar, ChevronDown, Users, FileText, MapPin } from 'lucide-react';
import ScheduleView from './ScheduleView'; 
import PrintableProgram from './PrintableProgram'; 
import { supabase } from '../../lib/supabaseClient';

const Program = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('program_active_tab') || 'simposios');
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(false);

  // SOLUCIÓN: Al cambiar de pestaña, reseteamos los datos para que el componente nuevo 
  // cargue sus propios datos frescos y no use los de la pestaña anterior.
  const handleTabChange = (tab) => { 
    setAllData([]); // Limpiamos datos anteriores para evitar conflictos de ordenamiento
    setActiveTab(tab); 
    localStorage.setItem('program_active_tab', tab); 
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('printable-area').innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Programa IASPM-AL 2026</title>
          ${styles}
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-in fade-in duration-500">
      
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"> 
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            
            <div className="hidden md:block text-left">
              <h1 className="text-2xl font-black text-[#1e3a5f] tracking-tight">
                {activeTab === 'simposios' ? 'Listado de Simposios' : 'Agenda del Congreso'}
              </h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                XVIII Congreso de la IASPM-AL 2026
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-3 bg-gray-100 p-1.5 rounded-xl">
              <button 
                onClick={handlePrint}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-xs font-bold shadow-lg hover:bg-black transition-all"
              >
                <Download size={14} /> <span>Descargar PDF</span>
              </button>
              
              <div className="flex gap-1 flex-1 md:flex-none justify-center">
                <button 
                  onClick={() => handleTabChange('simposios')} 
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'simposios' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-400'}`}
                >
                  <List size={14} /> Simposios
                </button>
                <button 
                  onClick={() => handleTabChange('agenda')} 
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'agenda' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-400'}`}
                >
                  <Calendar size={14} /> Agenda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'simposios' ? (
          <SymposiumsList onDataLoaded={setAllData} />
        ) : (
          <ScheduleView onDataLoaded={setAllData} />
        )}
      </div>

      <div className="hidden">
        <div id="printable-area">
          <PrintableProgram 
            events={allData} 
            type={activeTab === 'simposios' ? 'symposiums' : 'schedule'} 
          />
        </div>
      </div>
    </div>
  );
};

const SymposiumsList = ({ onDataLoaded }) => {
  const [simposios, setSimposios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('symposiums')
        .select(`*, venues (name), presentations (id, title, authors, abstract_text, start_time, end_time)`);
      
      if (error) throw error;

      // ORDENAMIENTO SEGURO: Verificamos que existan datos y nombres antes de comparar
      const sorted = (data || []).sort((a, b) => {
        const nameA = a?.name || ""; 
        const nameB = b?.name || "";
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });

      setSimposios(sorted);
      if (onDataLoaded) onDataLoaded(sorted);
    } catch (e) { 
      console.error("Error en simposios:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
    if (openId !== id) {
      setTimeout(() => {
        const el = document.getElementById(`sympo-${id}`);
        if (el) {
          const offset = window.innerWidth < 768 ? 140 : 100;
          window.scrollTo({ 
            top: el.getBoundingClientRect().top + window.scrollY - offset, 
            behavior: 'smooth' 
          });
        }
      }, 100);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400 italic">Cargando Simposios...</div>;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {simposios.map((s) => (
        <div 
          key={s.id} 
          id={`sympo-${s.id}`} 
          className={`bg-white border rounded-xl overflow-hidden transition-all ${openId === s.id ? 'border-blue-400 shadow-md ring-1 ring-blue-50' : 'border-gray-200'}`}
        >
          <button onClick={() => handleToggle(s.id)} className="w-full text-left p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#1e3a5f] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                {s.id}
              </span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                <FileText size={10} /> {s.presentations?.length || 0} Ponencias
              </span>
            </div>
            
            <h3 className={`text-lg sm:text-xl font-bold leading-tight ${openId === s.id ? 'text-[#1e3a5f]' : 'text-gray-800'}`}>
              {s.name}
            </h3>

            <div className="flex items-start gap-2 pt-1 border-t border-gray-50 mt-1">
               <Users size={14} className="text-blue-400 mt-0.5 shrink-0" />
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Coordinación</p>
                  <p className="text-sm font-medium text-gray-700">{s.coordinators || 'Por confirmar'}</p>
               </div>
            </div>
          </button>

          {openId === s.id && (
            <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Trabajos Aceptados</h4>
               <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                 {s.presentations?.map(p => (
                   <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                     <p className="font-bold text-gray-800 text-sm mb-1">{p.title}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                       <Users size={10} /> {p.authors}
                     </p>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Program;
