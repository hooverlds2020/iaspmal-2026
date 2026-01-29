// src/components/pages/Program.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ScheduleView from './ScheduleView';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

const Program = ({ lang }) => {
  const [view, setView] = useState('symposiums');
  const [symposiums, setSymposiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSymposium, setExpandedSymposium] = useState(null);

  useEffect(() => {
    if (view === 'symposiums') {
      fetchSymposiums();
    }
  }, [view]);

  const fetchSymposiums = async () => {
    try {
      setLoading(true);
      // Query simplificada - solo symposiums sin relaciones
      const { data, error } = await supabase
        .from('symposiums')
        .select('*')
        .order('number', { ascending: true });

      if (error) {
        console.error('Error fetching symposiums:', error);
        throw error;
      }
      
      console.log('Symposiums loaded:', data);
      setSymposiums(data || []);
    } catch (error) {
      console.error('Error in fetchSymposiums:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSymposium = (id) => {
    setExpandedSymposium(expandedSymposium === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Tabs de navegación */}
      <div className="flex gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => setView('symposiums')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all ${
            view === 'symposiums'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang === 'es' ? 'Por Simposios' : 'Por Simpósios'}
        </button>
        <button
          onClick={() => setView('schedule')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all ${
            view === 'schedule'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang === 'es' ? 'Por Horario' : 'Por Horário'}
        </button>
      </div>

      {/* Contenido */}
      {view === 'symposiums' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : symposiums.length === 0 ? (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-blue-900 font-semibold">
                {lang === 'es' ? '📅 Lista de simposios' : '📅 Lista de simpósios'}
              </p>
              <p className="text-blue-700 text-sm mt-1">
                {lang === 'es'
                  ? 'No hay simposios disponibles en este momento.'
                  : 'Não há simpósios disponíveis no momento.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {symposiums.map((symposium) => (
                <div key={symposium.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                  <button
                    onClick={() => toggleSymposium(symposium.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded">
                          S{symposium.number}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {lang === 'es' ? symposium.title_es : (symposium.title_pt || symposium.title_es || symposium.title_es)}
                          </h3>
                          {symposium.coordinators && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{symposium.coordinators}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedSymposium === symposium.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expandedSymposium === symposium.id && symposium.description_es && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <p className="text-gray-700 text-sm">
                        {lang === 'es' ? symposium.description_es : (symposium.description_pt || symposium.description_en || symposium.description_es)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <ScheduleView embedded={true} lang={lang} />
        </div>
      )}
    </div>
  );
};

export default Program;
