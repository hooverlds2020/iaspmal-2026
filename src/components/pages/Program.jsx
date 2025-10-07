// src/components/pages/Program.jsx
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, ChevronDown, ChevronRight } from 'lucide-react';

const Program = ({ lang }) => {
  const [viewMode, setViewMode] = useState('symposiums'); // 'symposiums' | 'schedule'
  const [selectedDay, setSelectedDay] = useState('all');
  const [expandedSymposium, setExpandedSymposium] = useState(null);

  // DATOS TEMPORALES - Después vendrán de Supabase
  const mockSymposiums = [
    {
      id: 1,
      number: 1,
      title_es: 'Música popular y política',
      title_en: 'Popular Music and Politics',
      coordinators: ['Adalberto Paranhos', 'Julio Mendivil'],
      sessions: [
        {
          day: '2026-09-28',
          start_time: '09:00',
          end_time: '11:00',
          room: 'Sala A'
        },
        {
          day: '2026-09-29',
          start_time: '14:00',
          end_time: '16:00',
          room: 'Sala C'
        }
      ]
    },
    {
      id: 2,
      number: 2,
      title_es: 'Música popular y políticas sonoras',
      title_en: 'Popular Music and Sound Policies',
      coordinators: ['Ana María Ochoa Gautier'],
      sessions: [
        {
          day: '2026-09-28',
          start_time: '11:30',
          end_time: '13:30',
          room: 'Sala B'
        }
      ]
    }
  ];

  const days = [
    { value: 'all', label_es: 'Todos los días', label_en: 'All days' },
    { value: '2026-09-28', label_es: 'Lunes 28 Sep', label_en: 'Monday, Sep 28' },
    { value: '2026-09-29', label_es: 'Martes 29 Sep', label_en: 'Tuesday, Sep 29' },
    { value: '2026-09-30', label_es: 'Miércoles 30 Sep', label_en: 'Wednesday, Sep 30' },
    { value: '2026-10-01', label_es: 'Jueves 1 Oct', label_en: 'Thursday, Oct 1' },
    { value: '2026-10-02', label_es: 'Viernes 2 Oct', label_en: 'Friday, Oct 2' }
  ];

  const filteredSymposiums = mockSymposiums.filter(sym => {
    if (selectedDay === 'all') return true;
    return sym.sessions?.some(s => s.day === selectedDay);
  });

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
          {filteredSymposiums.map(symposium => {
            const title = lang === 'es' ? symposium.title_es : symposium.title_en;
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
                      {symposium.coordinators.join(', ')}
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

                {isExpanded && symposium.sessions && (
                  <div className="px-6 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="space-y-3 mt-4">
                      {symposium.sessions.map((session, idx) => (
                        <div 
                          key={idx} 
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center gap-4 text-sm text-gray-700 flex-wrap">
                            <span className="font-semibold text-teal-600">
                              {lang === 'es' ? 'Sesión' : 'Session'} {idx + 1}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.day).toLocaleDateString(lang, { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.start_time} - {session.end_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {session.room}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredSymposiums.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                {lang === 'es' 
                  ? 'No hay simposios programados para este día.'
                  : 'No symposiums scheduled for this day.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vista por horario (simplificada por ahora) */}
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