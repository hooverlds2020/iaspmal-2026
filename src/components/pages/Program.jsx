// src/components/pages/Program.jsx
import React, { useState, useEffect } from 'react';
import { Download, List, Calendar, ChevronDown, Users, FileText, Search, X } from 'lucide-react';
import ScheduleView from './ScheduleView';
import PrintableProgram from './PrintableProgram';
import { supabase } from '../../lib/supabaseClient';

const Program = ({ lang }) => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('program_active_tab') || 'simposios');
  const [allData, setAllData] = useState([]);

  const handleTabChange = (tab) => {
    setAllData([]); 
    setActiveTab(tab);
    localStorage.setItem('program_active_tab', tab);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('printable-area').innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Programa IASPM-AL 2026</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1, h2, h3 { color: #1e3a5f; }
            .event-item { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="print-header"><h1>XVII Congreso IASPM-AL 2026</h1><p>San Cristóbal de Las Casas, Chiapas</p></div>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-in fade-in duration-500">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-black text-[#1e3a5f] tracking-tight uppercase italic">
                {activeTab === 'simposios' ? (lang === 'es' ? 'Simposios Temáticos' : 'Symposiums') : (lang === 'es' ? 'Agenda General' : 'General Schedule')}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">XVIII Congreso IASPM-AL 2026</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-xs font-bold shadow-md hover:bg-black transition-all">
                <Download size={14} /> <span className="hidden sm:inline">PDF</span>
              </button>
              <div className="bg-gray-100 p-1 rounded-xl flex">
                <button onClick={() => handleTabChange('simposios')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'simposios' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  <List size={14} /> <span>Simposios</span>
                </button>
                <button onClick={() => handleTabChange('agenda')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'agenda' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  <Calendar size={14} /> <span>Agenda</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simposios' ? <SymposiumsList onDataLoaded={setAllData} lang={lang} /> : <ScheduleView onDataLoaded={setAllData} lang={lang} />}
      </div>
      <div className="hidden"><div id="printable-area"><PrintableProgram events={allData} type={activeTab === 'simposios' ? 'symposiums' : 'schedule'} /></div></div>
    </div>
  );
};

const SymposiumsList = ({ onDataLoaded, lang }) => {
  const [simposios, setSimposios] = useState([]);
  const [filteredSimposios, setFilteredSimposios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  // --- LÓGICA DE FILTRADO QUIRÚRGICO MEJORADA ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSimposios(simposios);
      // Opcional: Cerrar todo al limpiar búsqueda para limpiar la vista
      // setOpenId(null); 
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = simposios.map(s => {
        const headerMatches = s.name.toLowerCase().includes(lower) || 
                              (s.coordinators && s.coordinators.toLowerCase().includes(lower));
        const matchingPresentations = s.presentations.filter(p => 
          p.title.toLowerCase().includes(lower) || 
          p.authors.toLowerCase().includes(lower)
        );

        if (headerMatches) return s; // Coincide encabezado, mostramos todo
        else if (matchingPresentations.length > 0) return { ...s, presentations: matchingPresentations }; // Coincide hijo, mostramos solo hijos
        else return null;
      }).filter(Boolean);

      setFilteredSimposios(filtered);
      
      // Auto-abrir si encontramos pocos resultados para mejor UX
      if (filtered.length > 0 && filtered.length < 5) {
         setOpenId(filtered[0].id);
      }
    }
  }, [searchTerm, simposios]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('symposiums').select(`*, venues (name), presentations (id, title, authors, abstract_text)`);
      if (error) throw error;
      const sortedSymposiums = (data || []).sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0]) || 0;
        const numB = parseInt(b.name.match(/\d+/)?.[0]) || 0;
        return numA - numB;
      });
      const sortedData = sortedSymposiums.map(symposium => ({
        ...symposium,
        presentations: (symposium.presentations || []).sort((a, b) => (a.authors || "").localeCompare(b.authors || "", 'es', { sensitivity: 'base' }))
      }));
      setSimposios(sortedData);
      setFilteredSimposios(sortedData);
      if (onDataLoaded) onDataLoaded(sortedData);
    } catch (e) { console.error("Error cargando simposios:", e); } finally { setLoading(false); }
  };

  const handleToggle = (id) => {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen) {
      setTimeout(() => {
        const element = document.getElementById(`sympo-${id}`);
        if (element) {
          const headerOffset = 180; 
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 300);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-4"><div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#1e3a5f]"></div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cargando...</p></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-[135px] z-30 md:static">
         <div className="relative w-full sm:max-w-md group">
            <input type="text" placeholder={lang === 'es' ? "Buscar por simposio, autor o título..." : "Search by symposium, author or title..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 text-gray-800" />
            <Search className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-[#1e3a5f] transition-colors" size={18} />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors"><X size={18} /></button>}
         </div>
         <div className="text-right hidden sm:block">
            <p className="text-2xl font-black text-[#1e3a5f]">{filteredSimposios.length}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resultados</p>
         </div>
      </div>

      <div className="space-y-4">
        {filteredSimposios.length === 0 ? (
           <div className="text-center py-12 opacity-60"><div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"><Search className="w-8 h-8 text-gray-400" /></div><p className="text-gray-500 font-medium">No se encontraron resultados.</p></div>
        ) : (
          filteredSimposios.map((s) => (
            <div key={s.id} id={`sympo-${s.id}`} className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${openId === s.id ? 'border-[#1e3a5f] shadow-lg ring-1 ring-[#1e3a5f]/10' : 'border-gray-200 hover:border-orange-200'}`}>
              <button onClick={() => handleToggle(s.id)} className="w-full text-left p-5 flex flex-col gap-3 group focus:outline-none">
                <div className="flex justify-between items-start w-full">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wider ${openId === s.id ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-500'}`}>Simposio {s.id}</span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-100 flex items-center gap-1"><FileText size={10} /> {s.presentations?.length || 0} Ponencias</span>
                  </div>
                  <ChevronDown className={`text-gray-400 transition-transform duration-300 ${openId === s.id ? 'rotate-180 text-[#1e3a5f]' : ''}`} />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold leading-tight pr-4 ${openId === s.id ? 'text-[#1e3a5f]' : 'text-gray-800 group-hover:text-orange-600 transition-colors'}`}>{s.name}</h3>
                <div className="flex items-start gap-2 pt-2 mt-1 border-t border-gray-50 w-full"><Users size={14} className="text-iaspm-orange mt-0.5 shrink-0" /><div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Coordinación</p><p className="text-sm font-medium text-gray-600">{s.coordinators || 'Pendiente'}</p></div></div>
              </button>
              {openId === s.id && (
                <div className="p-5 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                   <h4 className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest mb-4 flex items-center gap-2"><div className="w-1 h-4 bg-iaspm-orange rounded-full"></div>Trabajos Aceptados {searchTerm && "(Filtrados)"}</h4>
                   <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                     {s.presentations?.map((p, idx) => (
                       <div key={p.id || idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow animate-in fade-in zoom-in-95 duration-300">
                         <p className="font-bold text-gray-900 text-sm mb-2 leading-snug">{p.title}</p>
                         <p className="text-xs text-gray-600 font-medium flex items-start gap-1.5 bg-gray-50 p-2 rounded-lg"><Users size={12} className="mt-0.5 shrink-0 text-iaspm-orange" /> <span className="uppercase tracking-wide text-[10px]">{p.authors}</span></p>
                       </div>
                     ))}
                     {(!s.presentations || s.presentations.length === 0) && <p className="text-sm text-gray-400 italic col-span-2 text-center py-4">No hay resultados para tu búsqueda en este simposio.</p>}
                   </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Program;
