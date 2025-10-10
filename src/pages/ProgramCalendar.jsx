import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { X, Clock, Users, MapPin, FileText } from 'lucide-react';

const ProgramCalendar = ({ language = 'es' }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Colores para cada simposio
  const symposiumColors = [
    '#0891b2', // cyan-600
    '#7c3aed', // violet-600
    '#dc2626', // red-600
    '#ea580c', // orange-600
    '#16a34a', // green-600
    '#2563eb', // blue-600
    '#c026d3', // fuchsia-600
    '#ca8a04', // yellow-600
    '#0d9488', // teal-600
    '#db2777', // pink-600
    '#4f46e5', // indigo-600
    '#84cc16', // lime-600
    '#06b6d4', // cyan-500
    '#8b5cf6', // violet-500
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#d946ef', // fuchsia-500
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *,
          symposiums (
            number,
            title_es,
            title_en,
            coordinators
          ),
          rooms (
            name
          ),
          presentations (
            id,
            title_es,
            title_en,
            author_name,
            author_institution,
            duration_minutes,
            presentation_order,
            type
          )
        `)
        .order('day', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Convertir sesiones a eventos de FullCalendar
      const calendarEvents = sessions.map((session) => {
        const symposiumNumber = session.symposiums?.number || 1;
        const color = symposiumColors[(symposiumNumber - 1) % symposiumColors.length];
        
        // Combinar fecha con hora
        const startDateTime = `${session.day}T${session.start_time}`;
        const endDateTime = `${session.day}T${session.end_time}`;

        return {
          id: session.id,
          title: language === 'es' 
            ? `S${symposiumNumber}: ${session.symposiums?.title_es || 'Sin título'}` 
            : `S${symposiumNumber}: ${session.symposiums?.title_en || 'No title'}`,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            session: session,
            symposium: session.symposiums,
            room: session.rooms,
            presentations: session.presentations || []
          }
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowModal(true);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <style>
        {`
          .fc {
            font-family: inherit;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: #e5e7eb;
          }
          .fc-col-header-cell {
            background-color: #f9fafb;
            font-weight: 600;
            padding: 12px 4px;
          }
          .fc-timegrid-slot {
            height: 3em;
          }
          .fc-event {
            cursor: pointer;
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.75rem;
          }
          .fc-event:hover {
            opacity: 0.9;
          }
          .fc-daygrid-day-number {
            font-size: 0.875rem;
          }
          .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 700;
          }
          .fc-button {
            background-color: #0d9488 !important;
            border-color: #0d9488 !important;
            text-transform: capitalize !important;
          }
          .fc-button:hover {
            background-color: #0f766e !important;
            border-color: #0f766e !important;
          }
          .fc-button-active {
            background-color: #115e59 !important;
            border-color: #115e59 !important;
          }
        `}
      </style>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay,listWeek'
          }}
          locale={language === 'es' ? esLocale : 'en'}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
          slotDuration="00:30:00"
          expandRows={true}
          stickyHeaderDates={true}
          nowIndicator={true}
          dayMaxEvents={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          buttonText={{
            today: language === 'es' ? 'Hoy' : 'Today',
            week: language === 'es' ? 'Semana' : 'Week',
            day: language === 'es' ? 'Día' : 'Day',
            list: language === 'es' ? 'Lista' : 'List'
          }}
        />
      </div>

      {/* Modal de detalles */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEvent.title}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Información de la sesión */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock size={20} className="text-teal-600" />
                  <span className="font-medium">
                    {formatTime(selectedEvent.extendedProps.session.start_time)} - {formatTime(selectedEvent.extendedProps.session.end_time)}
                  </span>
                </div>

                {selectedEvent.extendedProps.room && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={20} className="text-teal-600" />
                    <span>{selectedEvent.extendedProps.room.name}</span>
                  </div>
                )}

                {selectedEvent.extendedProps.symposium?.coordinators && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <Users size={20} className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-sm text-gray-500 uppercase">
                        {language === 'es' ? 'Coordinadores' : 'Coordinators'}
                      </p>
                      <p>{selectedEvent.extendedProps.symposium.coordinators}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.extendedProps.session.notes_es && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <FileText size={20} className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-sm text-gray-500 uppercase">
                        {language === 'es' ? 'Notas' : 'Notes'}
                      </p>
                      <p>
                        {language === 'es' 
                          ? selectedEvent.extendedProps.session.notes_es 
                          : selectedEvent.extendedProps.session.notes_en || selectedEvent.extendedProps.session.notes_es}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de ponencias */}
              {selectedEvent.extendedProps.presentations.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    {language === 'es' ? 'Ponencias' : 'Presentations'} ({selectedEvent.extendedProps.presentations.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedEvent.extendedProps.presentations
                      .sort((a, b) => a.presentation_order - b.presentation_order)
                      .map((presentation) => (
                        <div key={presentation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start gap-3 mb-2">
                            <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-semibold">
                              {presentation.presentation_order}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {language === 'es' ? presentation.title_es : presentation.title_en || presentation.title_es}
                              </h4>
                              {presentation.author_name && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">{presentation.author_name}</span>
                                  {presentation.author_institution && ` - ${presentation.author_institution}`}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {presentation.duration_minutes} min
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                  {presentation.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramCalendar;
