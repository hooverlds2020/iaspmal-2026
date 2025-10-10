// src/components/pages/Program.jsx
import React, { useState } from 'react';
import ScheduleView from './ScheduleView';

const Program = ({ lang }) => {
  const [view, setView] = useState('symposiums'); // 'symposiums' o 'schedule'

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
          {lang === 'es' ? 'Por Simposios' : 'By Symposiums'}
        </button>
        <button
          onClick={() => setView('schedule')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-all ${
            view === 'schedule'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang === 'es' ? 'Por Horario' : 'By Schedule'}
        </button>
      </div>

      {/* Contenido */}
      {view === 'symposiums' ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-blue-900 font-semibold">
              {lang === 'es' 
                ? '📅 Lista de simposios y sesiones' 
                : '📅 List of symposiums and sessions'}
            </p>
            <p className="text-blue-700 text-sm mt-1">
              {lang === 'es'
                ? 'Aquí se mostrará la lista completa de simposios organizados por temática.'
                : 'Here will be displayed the complete list of symposiums organized by topic.'}
            </p>
          </div>
          
          <div className="grid gap-4">
            {/* Aquí puedes agregar la lista de simposios */}
            <p className="text-gray-600">
              {lang === 'es'
                ? 'Lista de simposios próximamente...'
                : 'List of symposiums coming soon...'}
            </p>
          </div>
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
