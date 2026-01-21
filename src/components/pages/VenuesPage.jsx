// src/components/pages/VenuesPage.jsx
import React, { useState } from 'react';

function VenuesPage({ lang }) {
  const [selectedVenue, setSelectedVenue] = useState(null);

  const venues = [
    {
      id: 1,
      name: 'Centro Cultural El Carmen',
      description: lang === 'es' 
        ? 'Espacio cultural emblemático ubicado en el corazón del centro histórico.'
        : 'Emblematic cultural space located in the heart of the historic center.',
      address: {
        street: 'Hermanos Domínguez S/N',
        zone: 'Zona Centro',
        city: 'San Cristóbal de las Casas, Chiapas',
        zip: 'C.P. 29220'
      },
      spaces: [
        'Sala de Exposiciones',
        'Sala de Usos Múltiples',
        'Sala Julio Barrientos'
      ],
      icon: '🏛️',
      image: 'https://images.unsplash.com/photo-1580130732478-260d6c6ca155?w=800&h=600&fit=crop',
      coordinates: { lat: 16.7370, lng: -92.6378 },
      mapLink: 'https://maps.app.goo.gl/mhqQrW75tVCzv47d9'
    },
    {
      id: 2,
      name: 'Auditorio del DIF',
      description: lang === 'es'
        ? 'Auditorio principal para conferencias magistrales.'
        : 'Main auditorium for keynote lectures.',
      address: {
        street: 'Miguel Hidalgo 7',
        zone: 'Zona Centro',
        city: 'San Cristóbal de las Casas, Chiapas',
        zip: 'C.P. 29200'
      },
      spaces: ['Auditorio principal'],
      icon: '🎭',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
      coordinates: { lat: 16.7360, lng: -92.6370 },
      mapLink: 'https://maps.app.goo.gl/cmMu53nuujH2hvXH6'
    },
    {
      id: 3,
      name: 'Facultad de Derecho',
      description: lang === 'es'
        ? 'Instalaciones académicas de la universidad.'
        : 'University academic facilities.',
      address: {
        street: 'Av. Miguel Hidalgo No. 8',
        zone: 'Centro Histórico',
        city: 'San Cristóbal de las Casas, Chiapas',
        zip: 'C.P. 29220'
      },
      spaces: ['Auditorio', 'Aula Magna'],
      icon: '⚖️',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
      coordinates: { lat: 16.7380, lng: -92.6390 },
      mapLink: ''
    },
    {
      id: 4,
      name: 'Casa Mazariegos',
      description: lang === 'es'
        ? 'Casa colonial histórica con múltiples espacios.'
        : 'Historic colonial house with multiple spaces.',
      address: {
        street: 'Crescencio Rosas No. 4',
        zone: 'Zona Centro',
        city: 'San Cristóbal de las Casas, Chiapas',
        zip: 'C.P. 29200'
      },
      spaces: ['Sala 1', 'Sala 2', 'Sala 3', 'Patio'],
      icon: '🏰',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
      coordinates: { lat: 16.7365, lng: -92.6385 },
      mapLink: ''
    },
    {
      id: 5,
      name: 'Centro Cultural Carlos Jurado',
      description: lang === 'es'
        ? 'Centro cultural con salas adaptadas para presentaciones.'
        : 'Cultural center with rooms adapted for presentations.',
      address: {
        street: '16 de Septiembre No. 1',
        zone: 'Zona Centro',
        city: 'San Cristóbal de las Casas, Chiapas',
        zip: 'C.P. 29200'
      },
      spaces: ['Sala 1', 'Sala 2'],
      icon: '🎨',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop',
      coordinates: { lat: 16.7375, lng: -92.6375 },
      mapLink: ''
    },
    {
      id: 6,
      name: 'MUSAC',
      description: lang === 'es'
        ? 'Museo de las Culturas de San Cristóbal.'
        : 'Museum of Cultures of San Cristóbal.',
      address: {
        street: 'Plaza 31 Marzo, Calle Diego de Mazariegos S/N',
        zone: 'Zona Centro',
        city: 'San Cristóbal de las Casas, Chiapas',
        zip: 'C.P. 29200'
      },
      spaces: ['Espacios del museo'],
      icon: '🖼️',
      image: 'https://images.unsplash.com/photo-1565452447621-94ef2dae2d9d?w=800&h=600&fit=crop',
      coordinates: { lat: 16.7385, lng: -92.6365 },
      mapLink: ''
    },
    {
      id: 7,
      name: 'Teatro Zebadúa',
      description: lang === 'es'
        ? 'Teatro histórico para eventos especiales.'
        : 'Historic theater for special events.',
      address: {
        street: 'Av 20 de Noviembre No. 7',
        zone: 'Zona Centro',
        city: 'San Cristóbal de las Casas, Chiapas',
        zip: 'C.P. 29200'
      },
      spaces: ['Teatro principal'],
      icon: '🎪',
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop',
      coordinates: { lat: 16.7355, lng: -92.6380 },
      mapLink: ''
    }
  ];

  const openInMaps = (venue) => {
    const url = venue.mapLink || 
      `https://www.google.com/maps/search/?api=1&query=${venue.coordinates.lat},${venue.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
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
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer group"
            onClick={() => setSelectedVenue(venue)}
          >
            {/* Imagen */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x600/0d9488/ffffff?text=${encodeURIComponent(venue.name)}`;
                }}
              />
              {/* Icono flotante */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                <span className="text-2xl">{venue.icon}</span>
              </div>
              {/* Badge provisional */}
              <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                📷 {lang === 'es' ? 'Provisional' : 'Temporary'}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">
                {venue.name}
              </h3>
              
              {/* Dirección compacta */}
              <div className="mb-3 text-xs text-gray-600 flex items-start gap-1">
                <span className="text-teal-600 mt-0.5">📍</span>
                <span className="line-clamp-2">
                  {venue.address.street}, {venue.address.zone}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {venue.description}
              </p>

              {/* Espacios */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                  {lang === 'es' ? 'Espacios' : 'Spaces'} ({venue.spaces.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {venue.spaces.slice(0, 2).map((space, index) => (
                    <span
                      key={index}
                      className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full"
                    >
                      {space}
                    </span>
                  ))}
                  {venue.spaces.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{venue.spaces.length - 2}
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
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>{lang === 'es' ? 'Ver ubicación' : 'View location'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mapa general */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="bg-teal-700 text-white p-4">
          <h3 className="text-xl font-bold mb-1">
            {lang === 'es' ? 'Ubicación General' : 'General Location'}
          </h3>
          <p className="text-sm text-teal-100">
            {lang === 'es'
              ? 'Todas las sedes están en el centro histórico, a distancia caminable'
              : 'All venues are in the historic center, within walking distance'}
          </p>
        </div>
        
        <div className="h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3822.5!2d-92.6378!3d16.7370!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ed4531619ba4c9%3A0x8e5558c5c875fc37!2sSan%20Crist%C3%B3bal%20de%20las%20Casas%2C%20Chiapas!5e0!3m2!1ses!2smx!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={lang === 'es' ? 'Mapa de las sedes' : 'Venues map'}
          />
        </div>

        {/* Leyenda */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="font-bold text-gray-800 mb-3 text-sm">
            {lang === 'es' ? 'Leyenda de ubicaciones:' : 'Location legend:'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {venues.map((venue) => (
              <div key={venue.id} className="flex items-center gap-2">
                <span className="text-lg">{venue.icon}</span>
                <span className="text-xs text-gray-700">{venue.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <div className="text-2xl mb-2">🚶</div>
          <h3 className="font-bold text-gray-800 mb-1">
            {lang === 'es' ? 'Distancias caminables' : 'Walking distances'}
          </h3>
          <p className="text-gray-700 text-sm">
            {lang === 'es'
              ? 'Todas las sedes están a 5-15 minutos caminando entre sí.'
              : 'All venues are 5-15 minutes walking distance from each other.'}
          </p>
        </div>

        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <div className="text-2xl mb-2">🌡️</div>
          <h3 className="font-bold text-gray-800 mb-1">
            {lang === 'es' ? 'Clima templado' : 'Mild climate'}
          </h3>
          <p className="text-gray-700 text-sm">
            {lang === 'es'
              ? 'Temperatura promedio de 15-20°C. Traer ropa abrigada para las noches.'
              : 'Average temperature 15-20°C. Bring warm clothing for evenings.'}
          </p>
        </div>

        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <div className="text-2xl mb-2">🏔️</div>
          <h3 className="font-bold text-gray-800 mb-1">
            {lang === 'es' ? 'Altura' : 'Altitude'}
          </h3>
          <p className="text-gray-700 text-sm">
            {lang === 'es'
              ? '2,200 metros sobre el nivel del mar. Tómate tiempo para aclimatarte.'
              : '2,200 meters above sea level. Take time to acclimate.'}
          </p>
        </div>
      </div>

      {/* Nota sobre imágenes */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-800 mb-1">
              {lang === 'es' ? 'Nota sobre las imágenes' : 'Note about images'}
            </h3>
            <p className="text-amber-700 text-sm">
              {lang === 'es'
                ? 'Las imágenes mostradas son provisionales y serán reemplazadas por fotografías reales de cada sede próximamente.'
                : 'The images shown are provisional and will be replaced with actual photographs of each venue soon.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedVenue && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVenue(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64">
              <img
                src={selectedVenue.image}
                alt={selectedVenue.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 font-bold text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedVenue.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedVenue.name}
                  </h2>
                </div>
              </div>

              {/* Dirección completa */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-teal-600">📍</span>
                  {lang === 'es' ? 'Dirección' : 'Address'}
                </h3>
                <div className="text-gray-700 text-sm space-y-1">
                  <p>{selectedVenue.address.street}</p>
                  <p>{selectedVenue.address.zone}</p>
                  <p>{selectedVenue.address.city}</p>
                  <p>{selectedVenue.address.zip}</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{selectedVenue.description}</p>
              
              <h3 className="font-bold text-gray-800 mb-3">
                {lang === 'es' ? 'Espacios disponibles:' : 'Available spaces:'}
              </h3>
              <ul className="space-y-2 mb-6">
                {selectedVenue.spaces.map((space, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="text-teal-600">✓</span>
                    {space}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openInMaps(selectedVenue)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                📍 {lang === 'es' ? 'Ver en Google Maps' : 'View on Google Maps'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenuesPage;
