// src/components/pages/Program.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ScheduleView from './ScheduleView';
import { 
  Users, ChevronDown, Printer, Loader2, Calendar, 
  List, MapPin, FileText, Mic2, Info, ChevronRight 
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print'; 
import PrintableProgram from './PrintableProgram'; 

const cleanCoordinators = (data) => {
  if (!data) return '';
  if (Array.isArray(data)) return data.join(', ');
  if (typeof data === 'string') {
    return data.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  }
  return data;
};

const Program = ({ lang }) => {
  const [view, setView] = useState('symposiums');
  const [symposiums, setSymposiums] = useState([]);      
  const [sessions, setSessions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [expandedSymposium, setExpandedSymposium] = useState(null);
  const [showPapers, setShowPapers] = useState({});
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef(null);

  const typeToPrint = view === 'schedule' ? 'schedule' : 'symposiums';
  const pdfTitle = view === 'schedule' ? 'Agenda_IASPMAL_2026' : 'Simposios_IASPMAL_2026';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: pdfTitle,
    onBeforeGetContent: () => {
        setIsPrinting(true);
        return Promise.resolve();
    },
    onAfterPrint: () => setIsPrinting(false),
    onPrintError: (error) => console.error("Error al imprimir:", error)
  });

  const fetchDataSafe = async () => {
    try {
      setLoading(true);
      const { data: sympData, error: sympError } = await supabase
        .from('symposiums')
        .select('*')
        .order('id', { ascending: true });
      
      if (sympError) throw sympError;

      const { data: presData, error: presError } = await supabase
        .from('presentations')
        .select('*');
      
      if (presError) throw presError;

      const combinedSympData = sympData.map(s => ({
        ...s,
        presentations: presData.filter(p => p.symposium_id === s.id).sort((a, b) => a.title.localeCompare(b.title))
      }));
      
      setSymposiums(combinedSympData);

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          symposiums ( name ),
          rooms ( name, venues ( name ) ),
          presentations ( id, title, authors )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (sessionError) throw sessionError;
      setSessions(sessionData || []);

    } catch (error) {
      console.error('Error al cargar programa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDataSafe(); }, []);

  const togglePapers = (e, id) => {
    e.stopPropagation(); 
    setShowPapers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 px-4">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {lang === 'es' ? 'Programa Académico' : 'Academic Program'}
          </h2>
        </div>
        
        <div className="flex gap-3">
          {/* BOTÓN ACTUALIZADO: AZUL MARINO XVII CONGRESO */}
          <button 
             onClick={() => handlePrint()}
             disabled={isPrinting || loading}
             className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-xl flex items-center gap-2 shadow-lg hover:bg-black transition-all text-sm font-bold disabled:opacity-50 active:scale-95"
          >
             {isPrinting ? <Loader2 size={18} className="animate-spin"/> : <Printer size={18} />}
             <span>{lang === 'es' ? 'Descargar PDF' : 'Download PDF'}</span>
          </button>

          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setView('symposiums')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${view === 'symposiums' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <List className="inline mr-2" size={16}/> {lang === 'es' ? 'Simposios' : 'Symposiums'}
            </button>
            <button onClick={() => setView('schedule')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${view === 'schedule' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Calendar className="inline mr-2" size={16}/> {lang === 'es' ? 'Agenda' : 'Schedule'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#1e3a5f]" size={48}/></div>
      ) : view === 'symposiums' ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          {symposiums.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden transition-all">
              
              <div 
                onClick={() => setExpandedSymposium(expandedSymposium === s.id ? null : s.id)}
                className={`p-5 cursor-pointer flex items-center gap-4 transition-colors ${expandedSymposium === s.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${expandedSymposium === s.id ? 'bg-[#1e3a5f] text-white' : 'bg-blue-50 text-[#1e3a5f]'}`}>
                  S{s.id}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 leading-snug text-lg">
                    {s.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-bold italic uppercase">
                    <Users size={14} className="text-[#f4a261] flex-shrink-0"/>
                    {cleanCoordinators(s.coordinator)}
                  </div>
                </div>
                <ChevronDown className={`text-gray-400 transition-transform ${expandedSymposium === s.id ? 'rotate-180' : ''}`} size={24} />
              </div>

              {expandedSymposium === s.id && (
                <div className="p-6 border-t border-gray-100 bg-white space-y-6">
                  <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info size={14}/> {lang === 'es' ? 'Sobre el Simposio' : 'About the Symposium'}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {s.description || "Descripción en proceso..."}
                    </p>
                  </div>

                  <div>
                    <button 
                      onClick={(e) => togglePapers(e, s.id)}
                      disabled={s.presentations.length === 0}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all border
                        ${s.presentations.length > 0 
                          ? 'bg-white border-blue-100 text-[#1e3a5f] hover:border-[#1e3a5f] shadow-sm' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'}
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <Mic2 size={18}/>
                        {lang === 'es' ? 'Ver Ponentes y Trabajos' : 'View Speakers and Papers'}
                        {s.presentations.length > 0 && (
                            <span className="bg-blue-50 text-[#1e3a5f] px-2 py-0.5 rounded-full text-[10px]">
                                {s.presentations.length}
                            </span>
                        )}
                      </span>
                      {s.presentations.length > 0 && (
                        <ChevronRight className={`transition-transform duration-200 ${showPapers[s.id] ? 'rotate-90' : ''}`} />
                      )}
                    </button>

                    {showPapers[s.id] && s.presentations.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                        {s.presentations.map(p => (
                          <div key={p.id} className="p-4 rounded-[1.5rem] border border-orange-50 bg-orange-50/20">
                            <h5 className="font-bold text-gray-800 text-sm leading-tight mb-2 uppercase tracking-tight">{p.title}</h5>
                            <div className="flex items-center gap-1 text-[#f4a261]">
                                <Users size={12} className="flex-shrink-0"/>
                                <p className="text-[11px] font-black uppercase tracking-tighter">{p.authors}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <ScheduleView embedded={true} lang={lang} />
      )}

      {/* COMPONENTE DE IMPRESIÓN */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <PrintableProgram 
            events={view === 'schedule' ? sessions : symposiums} 
            type={typeToPrint}   
            lang={lang} 
          />
        </div>
      </div>

    </div>
  );
};

export default Program;
