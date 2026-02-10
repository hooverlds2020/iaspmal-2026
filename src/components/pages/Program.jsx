// src/components/pages/Program.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ScheduleView from './ScheduleView';
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Loader2, 
  Calendar, 
  List, 
  MapPin, 
  Info 
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print'; 
import PrintableProgram from './PrintableProgram'; 

// Función auxiliar para limpiar coordinadores (igual que en el PDF)
const cleanCoordinators = (data) => {
  if (!data) return '';
  if (Array.isArray(data)) return data.join(', ');
  if (typeof data === 'string') {
    // Intenta limpiar strings con formato JSON array si vienen sucios
    if (data.startsWith('{') && data.endsWith('}')) {
      return data.slice(1, -1).replace(/"/g, '').split(',').join(', ');
    }
    // Limpia corchetes y comillas de arrays stringificados
    return data.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  }
  return data;
};

const Program = ({ lang }) => {
  const [view, setView] = useState('symposiums');
  const [symposiums, setSymposiums] = useState([]);      
  const [loading, setLoading] = useState(true);
  const [expandedSymposium, setExpandedSymposium] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef(null);

  // Configuración dinámica del PDF
  const typeToPrint = view === 'schedule' ? 'schedule' : 'symposiums';
  const pdfTitle = view === 'schedule' ? 'Horario_IASPM_2026' : 'Simposios_IASPM_2026';

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

  useEffect(() => {
    fetchSymposiums();
  }, []);

  const fetchSymposiums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('symposiums')
        .select('*')
        .order('number', { ascending: true });

      if (error) throw error;
      setSymposiums(data || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSymposium = (id) => {
    setExpandedSymposium(expandedSymposium === id ? null : id);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* --- CABECERA SUPERIOR --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {lang === 'es' ? 'Programa Académico' : 'Academic Program'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {lang === 'es' ? 'Explora los simposios y la agenda general.' : 'Explore symposiums and general schedule.'}
          </p>
        </div>
        
        <button 
           onClick={() => handlePrint()}
           disabled={isPrinting || loading || symposiums.length === 0}
           className={`
             px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm font-bold cursor-pointer text-white transform hover:-translate-y-0.5
             ${view === 'schedule' 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}
             disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
           `}
        >
           {isPrinting ? <Loader2 size={18} className="animate-spin"/> : <Printer size={18} />}
           <span>
             {lang === 'es' 
                ? (view === 'schedule' ? 'Descargar Horario PDF' : 'Descargar Lista PDF')
                : 'Download PDF'}
           </span>
        </button>
      </div>

      {/* --- TABS DE NAVEGACIÓN --- */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button 
            onClick={() => setView('symposiums')} 
            className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg transition-all duration-200 ${view === 'symposiums' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
        >
          <List size={18}/>
          {lang === 'es' ? 'Listado Simposios' : 'Symposiums List'}
        </button>
        <button 
            onClick={() => setView('schedule')} 
            className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg transition-all duration-200 ${view === 'schedule' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
        >
          <Calendar size={18}/>
          {lang === 'es' ? 'Agenda General' : 'General Schedule'}
        </button>
      </div>

      {/* --- VISTA: LISTA DE SIMPOSIOS (ESTILO MEJORADO) --- */}
      {view === 'symposiums' ? (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
             <div className="py-20 text-center text-purple-600 flex flex-col items-center gap-3">
                 <Loader2 size={40} className="animate-spin"/>
                 <span className="font-medium">Cargando simposios...</span>
             </div>
          ) : (
            symposiums.map((symposium) => (
                <div 
                    key={symposium.id} 
                    className={`
                        bg-white border rounded-xl overflow-hidden transition-all duration-300
                        ${expandedSymposium === symposium.id ? 'shadow-lg border-purple-300 ring-1 ring-purple-100' : 'shadow-sm border-gray-200 hover:shadow-md'}
                    `}
                >
                   {/* Header de la Tarjeta */}
                   <div 
                        className={`p-5 cursor-pointer flex justify-between items-center gap-4 transition-colors ${expandedSymposium === symposium.id ? 'bg-purple-50' : 'bg-white hover:bg-gray-50'}`} 
                        onClick={() => toggleSymposium(symposium.id)}
                   >
                      <div className="flex items-center gap-4">
                          {/* Badge del Número */}
                          <div className={`
                                flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-black text-lg
                                ${expandedSymposium === symposium.id ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}
                          `}>
                              S{symposium.number}
                          </div>
                          
                          {/* Título */}
                          <div>
                              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                  {lang === 'es' ? symposium.title_es : symposium.title_pt}
                              </h3>
                              {/* Subtítulo pequeño con sala si existe */}
                              {symposium.room && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-medium">
                                      <MapPin size={12} className="text-purple-500"/>
                                      {symposium.room}
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Icono Flecha */}
                      <div className={`text-gray-400 transition-transform duration-300 ${expandedSymposium === symposium.id ? 'rotate-180 text-purple-600' : ''}`}>
                          <ChevronDown size={24}/>
                      </div>
                   </div>

                   {/* Contenido Expandible */}
                   {expandedSymposium === symposium.id && (
                       <div className="p-6 border-t border-purple-100 bg-white animate-in slide-in-from-top-2 duration-200">
                           
                           {/* Descripción */}
                           <div className="mb-6 text-gray-700 leading-relaxed text-base">
                               {lang === 'es' ? (symposium.description_es || "Sin descripción disponible.") : (symposium.description_pt || "No description available.")}
                           </div>

                           {/* Sección Coordinadores (Estilo Caja) */}
                           {symposium.coordinators && (
                               <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                   <div className="flex items-start gap-3">
                                       <div className="bg-white p-2 rounded-full shadow-sm text-purple-600 mt-0.5">
                                           <Users size={18} />
                                       </div>
                                       <div>
                                           <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                               {lang === 'es' ? 'Coordinación' : 'Coordinators'}
                                           </span>
                                           <span className="text-sm font-semibold text-gray-800">
                                               {cleanCoordinators(symposium.coordinators)}
                                           </span>
                                       </div>
                                   </div>
                               </div>
                           )}
                       </div>
                   )}
                </div>
            ))
          )}
        </div>
      ) : (
        /* --- VISTA: AGENDA GENERAL --- */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <ScheduleView embedded={true} lang={lang} />
        </div>
      )}

      {/* --- COMPONENTE OCULTO DE IMPRESIÓN --- */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
            <PrintableProgram 
                events={symposiums} 
                type={typeToPrint}   
                lang={lang} 
            />
        </div>
      </div>

    </div>
  );
};

export default Program;
