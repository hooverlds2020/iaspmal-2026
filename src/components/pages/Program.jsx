// src/components/pages/Program.jsx
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { useProgram } from '../../hooks/useProgram';

const Program = ({ lang }) => {
  const [viewMode, setViewMode] = useState('symposiums');
  const [selectedDay, setSelectedDay] = useState('all');
  const [expandedSymposium, setExpandedSymposium] = useState(null);
  
  // Cargar datos desde Supabase
  const { symposiums, loading, error } = useProgram();

  const days = [
    { value: 'all', label_es: 'Todos los días', label_en: 'All days' },
    { value: '2026-09-28', label_es: 'Lunes 28 Sep', label_en: 'Monday, Sep 28' },
    { value: '2026-09-29', label_es: 'Martes 29 Sep', label_en: 'Tuesday, Sep 29' },
    { value: '2026-09-30', label_es: 'Miércoles 30 Sep', label_en: 'Wednesday, Sep 30' },
    { value: '2026-10-01', label_es: 'Jueves 1 Oct', label_en: 'Thursday, Oct 1' },
    { value: '2026-10-02', label_es: 'Viernes 2 Oct', label_en: 'Friday, Oct 2' }
  ];

  const filteredSymposiums = symposiums.filter(sym => {
    if (selectedDay === 'all') return true;
    return sym.sessions?.some(s => s.day === selectedDay);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="ml-4 text-gray-600">
          {lang === 'es' ? 'Cargando programa...' : 'Loading program...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          {lang === 'es' 
            ? `Error al cargar el programa: ${error}`
            : `Error loading program: ${error}`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('symposiums')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'symposiums'
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {lang === 'es' ? 'Por Simposios' : 'By Symposiums'}
          </button>
          <button
            onClick={() => setViewMode('schedule')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'schedule'
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {lang === 'es' ? 'Por Horario' : 'By Schedule'}
          </button>
        </div>

        {/* Filtro de días */}
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {days.map(day => (
            <option key={day.value} value={day.value}>
              {lang === 'es' ? day.label_es : day.label_en}
            </option>
          ))}
        </select>
      </div>

      {/* Vista por simposios */}
      {viewMode === 'symposiums' && (
        <div className="space-y-4">
          {filteredSymposiums.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                {lang === 'es' 
                  ? 'No hay simposios programados aún. Serán anunciados próximamente.'
                  : 'No symposiums scheduled yet. They will be announced soon.'}
              </p>
            </div>
          ) : (
            filteredSymposiums.map(symposium => {
              const title = lang === 'es' ? symposium.title_es : symposium.title_en || symposium.title_es;
              const isExpanded = expandedSymposium === symposium.id;

              return (
                <div 
                  key={symposium.id} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSymposium(isExpanded ? null : symposium.id)}
                    className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-teal-600 text-white text-sm font-bold px-3 py-1 rounded">
                          S{symposium.number}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>{lang === 'es' ? 'Coordinadores:' : 'Coordinators:'}</strong>{' '}
                        {symposium.coordinators?.join(', ')}
                      </p>
                    </div>
                    <div className="ml-4 text-teal-600">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </button>

                  {isExpanded && symposium.sessions && symposium.sessions.length > 0 && (
                    <div className="px-6 pb-4 border-t border-gray-100 bg-gray-50">
                      <div className="space-y-3 mt-4">
                        {symposium.sessions.map((session, idx) => (
                          <div 
                            key={session.session_id} 
                            className="bg-white rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-center gap-4 text-sm text-gray-700 flex-wrap">
                              <span className="font-semibold text-teal-600">
                                {lang === 'es' ? 'Sesión' : 'Session'} {session.session_number}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(session.day + 'T00:00:00').toLocaleDateString(lang, { 
                                  weekday: 'long', 
                                  day: 'numeric', 
                                  month: 'long' 
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {session.start_time} - {session.end_time}
                              </span>
                              {session.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {session.room}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Vista por horario */}
      {viewMode === 'schedule' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-center">
            {lang === 'es' 
              ? 'Vista de horario en desarrollo. Pronto estará disponible.'
              : 'Schedule view in development. Coming soon.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Program;
