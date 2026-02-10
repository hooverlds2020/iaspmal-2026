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
      image: '/images/el-carmen.webp', // Actualizado a .webp
      coordinates: { lat: 16.7370, lng: -92.6378 },
      mapLink: '' 
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
      image: '/images/dif.webp', // Actualizado a .webp
      coordinates: { lat: 16.7360, lng: -92.6370 },
      mapLink: ''
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
      image: '/images/facultad-derecho.webp', // Actualizado a .webp
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
      image: '/images/casa-mazariegos.webp', // Actualizado a .webp
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
      image: '/images/carlos-jurado.webp', // Actualizado a .webp
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
      image: '/images/musac.webp', // Actualizado a .webp
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
      image: '/images/teatro.webp', // Actualizado a .webp
      coordinates: { lat: 16.7355, lng: -92.6380 },
      mapLink: ''
    }
  ];

  const openInMaps = (venue) => {
    const query = encodeURIComponent(`${venue.name} San Cristóbal de las Casas`);
    const url = venue.mapLink || `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

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
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer group flex flex-col h-full"
            onClick={() => setSelectedVenue(venue)}
          >
            {/* Imagen */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                // Fallback por si la imagen webp no carga (volver a jpg o placeholder)
                onError={(e) => {
                  // Intenta cargar la JPG si la WEBP falla, o usa un placeholder
                  if (e.target.src.includes('.webp')) {
                     e.target.src = e.target.src.replace('.webp', '.jpg');
                  } else {
                     e.target.src = `https://via.placeholder.com/800x600/0d9488/ffffff?text=${encodeURIComponent(venue.name)}`;
                  }
                }}
              />
              {/* Overlay suave al hacer hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              
              {/* Icono flotante */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                <span className="text-xl">{venue.icon}</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
                {venue.name}
              </h3>
              
              {/* Dirección compacta */}
              <div className="mb-3 text-xs text-gray-500 flex items-start gap-1.5">
                <span className="text-teal-600 mt-0.5">📍</span>
                <span className="line-clamp-2">
                  {venue.address.street}, {venue.address.zone}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                {venue.description}
              </p>

              {/* Espacios */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {venue.spaces.slice(0, 2).map((space, index) => (
                    <span
                      key={index}
                      className="text-[10px] uppercase tracking-wide font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100"
                    >
                      {space}
                    </span>
                  ))}
                  {venue.spaces.length > 2 && (
                    <span className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
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
                className="w-full bg-white border border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 group-hover:bg-teal-600 group-hover:text-white"
              >
                <span>🗺️</span>
                <span>{lang === 'es' ? 'Ver en Mapa' : 'View on Map'}</span>
              </button>
            </div>
          </div>
        ))}
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
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15286.326848606086!2d-92.63750000000002!3d16.737500000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2smx!4v1679000000000!5m2!1ses!2smx"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={lang === 'es' ? 'Mapa de las sedes' : 'Venues map'}
          ></iframe>
          
          {/* Overlay informativo */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded shadow text-xs text-gray-500">
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
            <div className="relative h-72">
              <img
                src={selectedVenue.image}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center text-white transition-all"
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
                        {selectedVenue.description}
                      </p>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wide text-teal-700">
                            {lang === 'es' ? 'Dirección' : 'Address'}
                        </h4>
                        <div className="text-gray-700 text-sm space-y-1">
                            <p className="font-medium">{selectedVenue.address.street}</p>
                            <p>{selectedVenue.address.zone}</p>
                            <p>{selectedVenue.address.city}</p>
                            <p className="text-gray-500 text-xs">{selectedVenue.address.zip}</p>
                        </div>
                      </div>
                  </div>

                  <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-teal-600">🏛️</span>
                        {lang === 'es' ? 'Espacios' : 'Spaces'}
                      </h3>
                      <ul className="space-y-3">
                        {selectedVenue.spaces.map((space, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700 text-sm bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                            <span className="text-teal-500 font-bold">✓</span>
                            {space}
                        </li>
                        ))}
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
