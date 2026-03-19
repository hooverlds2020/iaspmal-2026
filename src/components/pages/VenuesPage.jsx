// src/components/pages/VenuesPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

function VenuesPage({ lang }) {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venues, setVenues] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Array de iconos variados para las tarjetas
  const icons = ['🏛️', '🎭', '⚖️', '🏰', '🎨', '🖼️', '🎪', '🏢', '🏫'];

  useEffect(() => {
    fetchVenuesAndRooms();
  }, []);

  const fetchVenuesAndRooms = async () => {
    try {
      setLoading(true);
      const [venuesRes, roomsRes] = await Promise.all([
        supabase.from('venues').select('*').order('id'),
        supabase.from('rooms').select('*').order('name')
      ]);

      if (venuesRes.error) throw venuesRes.error;
      if (roomsRes.error) throw roomsRes.error;

      setVenues(venuesRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (error) {
      console.error('Error cargando sedes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (venue) => {
    const query = encodeURIComponent(`${venue.name} San Cristóbal de las Casas`);
    const url = venue.map_url || `https://maps.google.com/?q=${query}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600 mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
          {lang === 'es' ? 'Cargando sedes...' : 'Loading venues...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Descripción inicial */}
      <div>
        <p className="text-gray-700 text-lg mb-4">
          {lang === 'es'
            ? 'El XVII Congreso de la IASPM-AL 2026 se llevará a cabo en diversos espacios culturales e institucionales del centro histórico de San Cristóbal de Las Casas.'
            : 'The 17th IASPM-AL Congress 2026 will take place in various cultural and institutional spaces in the historic center of San Cristóbal de Las Casas.'}
        </p>
      </div>

      {/* Grid de sedes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue, index) => {
          // Obtener las salas correspondientes a esta sede
          const venueRooms = rooms.filter(r => r.venue_id === venue.id);
          const venueIcon = icons[index % icons.length]; // Asigna un icono cíclicamente

          return (
            <div
              key={venue.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer group flex flex-col h-full"
              onClick={() => setSelectedVenue({ ...venue, rooms: venueRooms, icon: venueIcon })}
            >
              {/* Imagen */}
              <div className="relative h-56 overflow-hidden bg-gray-100">
                {venue.image_url ? (
                  <img
                    src={venue.image_url}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      if (e.target.src.includes('.webp')) {
                         e.target.src = e.target.src.replace('.webp', '.jpg');
                      } else {
                         e.target.src = `https://via.placeholder.com/800x600/0d9488/ffffff?text=${encodeURIComponent(venue.name)}`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="text-6xl">{venueIcon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                
                {/* Icono flotante */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                  <span className="text-xl">{venueIcon}</span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
                  {venue.name}
                </h3>
                
                {/* Dirección */}
                <div className="mb-3 text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-teal-600 mt-0.5">📍</span>
                  <span className="line-clamp-2">
                    {venue.address || (lang === 'es' ? 'Centro Histórico' : 'Historic Center')}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                  {venue.description || (lang === 'es' ? 'Sede oficial del congreso.' : 'Official congress venue.')}
                </p>

                {/* Espacios (Salas) */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {venueRooms.length === 0 && (
                       <span className="text-[10px] uppercase tracking-wide font-medium bg-gray-50 text-gray-400 px-2 py-1 rounded-md border border-gray-200">
                         {lang === 'es' ? 'Múltiples espacios' : 'Multiple spaces'}
                       </span>
                    )}
                    {venueRooms.slice(0, 2).map((room) => (
                      <span
                        key={room.id}
                        className="text-[10px] uppercase tracking-wide font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100"
                      >
                        {room.name}
                      </span>
                    ))}
                    {venueRooms.length > 2 && (
                      <span className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
                        +{venueRooms.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openInMaps(venue);
                  }}
                  className="w-full bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 group-hover:bg-teal-600 group-hover:text-white"
                >
                  <span>🗺️</span>
                  <span>{lang === 'es' ? 'Ver en Mapa' : 'View on Map'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mapa general */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">
              {lang === 'es' ? 'Mapa de Sedes' : 'Venues Map'}
            </h3>
            <p className="text-xs text-gray-400">
              {lang === 'es'
                ? 'Centro Histórico de San Cristóbal de Las Casas'
                : 'Historic Center of San Cristóbal de Las Casas'}
            </p>
          </div>
        </div>
        
        <div className="h-96 bg-gray-100 relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15252.827666248554!2d-92.6375!3d16.7375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={lang === 'es' ? 'Mapa de las sedes' : 'Venues map'}
          ></iframe>
          
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded shadow text-xs text-gray-500 font-bold">
            San Cristóbal de Las Casas, Chiapas
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex items-start gap-4">
          <div className="text-3xl bg-white p-2 rounded-full shadow-sm">🚶</div>
          <div>
            <h3 className="font-bold text-blue-900 mb-1">
              {lang === 'es' ? 'Todo cerca' : 'Everything close'}
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              {lang === 'es'
                ? 'Todas las sedes se encuentran en el centro histórico, a una distancia máxima de 15 minutos caminando.'
                : 'All venues are located in the historic center, within a maximum 15-minute walking distance.'}
            </p>
          </div>
        </div>

        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 flex items-start gap-4">
          <div className="text-3xl bg-white p-2 rounded-full shadow-sm">🌡️</div>
          <div>
            <h3 className="font-bold text-orange-900 mb-1">
              {lang === 'es' ? 'Clima' : 'Climate'}
            </h3>
            <p className="text-orange-800 text-sm leading-relaxed">
              {lang === 'es'
                ? 'Templado húmedo. Promedio 18°C. Las noches pueden ser frías. Se recomienda traer ropa abrigada.'
                : 'Humid temperate. Average 18°C. Nights can be cold. Warm clothing is recommended.'}
            </p>
          </div>
        </div>

        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 flex items-start gap-4">
          <div className="text-3xl bg-white p-2 rounded-full shadow-sm">🏔️</div>
          <div>
            <h3 className="font-bold text-purple-900 mb-1">
              {lang === 'es' ? 'Altitud' : 'Altitude'}
            </h3>
            <p className="text-purple-800 text-sm leading-relaxed">
              {lang === 'es'
                ? '2,200 msnm. Tómate el primer día con calma para aclimatarte a la altura.'
                : '2,200 meters above sea level. Take the first day easy to acclimatize to the altitude.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedVenue && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedVenue(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-72 bg-gray-100">
              {selectedVenue.image_url ? (
                <img
                  src={selectedVenue.image_url}
                  alt={selectedVenue.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.target.src.includes('.webp')) {
                       e.target.src = e.target.src.replace('.webp', '.jpg');
                    } else {
                       e.target.src = `https://via.placeholder.com/800x600/0d9488/ffffff?text=${encodeURIComponent(selectedVenue.name)}`;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-6xl">{selectedVenue.icon}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center text-white transition-all border border-white/20"
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl bg-white/20 backdrop-blur-md p-2 rounded-lg">{selectedVenue.icon}</span>
                    <h2 className="text-3xl font-bold text-shadow-sm">
                    {selectedVenue.name}
                    </h2>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                  <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-teal-600">ℹ️</span>
                        {lang === 'es' ? 'Información' : 'Information'}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                        {selectedVenue.description || (lang === 'es' ? 'Información de la sede próximamente.' : 'Venue information coming soon.')}
                      </p>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wide text-teal-700">
                            {lang === 'es' ? 'Dirección' : 'Address'}
                        </h4>
                        <div className="text-gray-700 text-sm space-y-1">
                            <p className="font-medium">{selectedVenue.address || 'San Cristóbal de Las Casas'}</p>
                            <p className="text-gray-500 text-xs mt-2">C.P. 29200, Chiapas, México</p>
                        </div>
                      </div>
                  </div>

                  <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-teal-600">🏛️</span>
                        {lang === 'es' ? 'Salas / Espacios' : 'Rooms / Spaces'}
                      </h3>
                      <ul className="space-y-3">
                        {selectedVenue.rooms && selectedVenue.rooms.length > 0 ? (
                          selectedVenue.rooms.map((room) => (
                            <li key={room.id} className="flex items-center gap-3 text-gray-700 text-sm bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                                <span className="text-teal-500 font-bold">✓</span>
                                {room.name}
                            </li>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            {lang === 'es' ? 'Espacios por confirmar.' : 'Spaces to be confirmed.'}
                          </p>
                        )}
                      </ul>

                      <button
                        onClick={() => openInMaps(selectedVenue)}
                        className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-teal-100 hover:shadow-teal-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <span>🗺️</span> 
                        {lang === 'es' ? 'Cómo llegar' : 'Get directions'}
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenuesPage;
