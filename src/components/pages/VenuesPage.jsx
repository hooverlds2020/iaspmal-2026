// src/components/pages/VenuesPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, Maximize2, X, Info, Thermometer, Mountain, Loader2 } from 'lucide-react';

function VenuesPage({ lang }) {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venues, setVenues] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Pop-up del Mapa Corredor
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
    const url = venue.map_url || `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#1e3a5f]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1e3a5f] mb-4"></div>
        <p className="font-bold uppercase tracking-widest text-sm">
           {lang === 'es' ? 'Cargando sedes...' : 'Carregando sedes...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Introducción */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-700 text-lg leading-relaxed">
          {lang === 'es'
            ? 'El XVII Congreso de la IASPM-AL 2026 se llevará a cabo en el corredor cultural del centro histórico de San Cristóbal de Las Casas. Todas las sedes están conectadas por andadores peatonales.'
            : 'O XVII Congresso IASPM-AL 2026 acontecerá no corredor cultural do centro histórico de San Cristóbal de Las Casas. Todas as sedes estão conectadas por vias pedestres.'}
        </p>
      </div>

      {/* SECCIÓN DEL MAPA PERSONALIZADO (CROQUIS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase italic tracking-tight flex items-center gap-2">
                <MapPin className="text-orange-500" /> {lang === 'es' ? 'Corredor de Sedes' : 'Corredor de Sedes'}
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                {lang === 'es' ? 'Click para ampliar' : 'Clique para ampliar'}
            </span>
        </div>
        
        <div 
            onClick={() => setIsMapModalOpen(true)}
            className="relative group cursor-pointer rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 aspect-[16/9] md:aspect-[21/9]"
        >
            <img 
                src="/images/corredor_sedes.jpeg" 
                alt="Mapa Corredor Sedes" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Capa de interacción */}
            <div className="absolute inset-0 bg-[#1e3a5f]/10 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="bg-white/90 p-4 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-all duration-300">
                    <Maximize2 size={32} className="text-[#1e3a5f]" />
                </div>
            </div>
            <div className="absolute bottom-4 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                <p className="text-[#1e3a5f] font-black text-[10px] uppercase tracking-[0.2em]">
                    {lang === 'es' ? 'Ver Mapa Detallado' : 'Ver Mapa Detalhado'}
                </p>
            </div>
        </div>
      </div>

      {/* Grid de Sedes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {venues.map((venue, index) => {
          const venueRooms = rooms.filter(r => r.venue_id === venue.id);
          const venueIcon = icons[index % icons.length];
          return (
            <div
              key={venue.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group flex flex-col h-full"
              onClick={() => setSelectedVenue({ ...venue, rooms: venueRooms, icon: venueIcon })}
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={venue.image_url || 'https://via.placeholder.com/400x300'}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-xl w-10 h-10 flex items-center justify-center shadow-lg text-xl">
                  {venueIcon}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-[#1e3a5f] text-lg mb-2 group-hover:text-orange-500 transition-colors uppercase leading-tight">
                  {venue.name}
                </h3>
                <div className="mb-4 text-[11px] font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
                  <MapPin size={14} className="text-orange-500" /> {venue.address || 'Centro Histórico'}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {venue.description}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg">
                        {venueRooms.length} {venueRooms.length === 1 ? 'Espacio' : 'Espacios'}
                    </span>
                    <button className="text-[#1e3a5f] font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        {lang === 'es' ? 'Ver más →' : 'Ver mais →'}
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <InfoCard icon="🚶" title={lang === 'es' ? 'Todo Cerca' : 'Perto de Tudo'} text={lang === 'es' ? 'Sedes a máximo 15 min caminando.' : 'Sedes a no máximo 15 min a pé.'} />
        <InfoCard icon="🌡️" title={lang === 'es' ? 'Clima' : 'Clima'} text={lang === 'es' ? 'Promedio 18°C. Traiga abrigo.' : 'Média de 18°C. Traga agasalho.'} />
        <InfoCard icon="🏔️" title={lang === 'es' ? 'Altitud' : 'Altitude'} text={lang === 'es' ? '2,200 msnm. Vaya con calma.' : '2.200 msnm. Vá com calma.'} />
      </div>

      {/* ========================================== */}
      {/* MODAL POP-UP DEL MAPA CORREDOR            */}
      {/* ========================================== */}
      {isMapModalOpen && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
            onClick={() => setIsMapModalOpen(false)}
        >
            <div className="absolute inset-0 bg-[#1e3a5f]/90 backdrop-blur-md"></div>
            
            <button 
                className="absolute top-6 right-6 z-10 bg-white text-[#1e3a5f] p-3 rounded-full hover:rotate-90 transition-transform duration-300 shadow-2xl"
                onClick={() => setIsMapModalOpen(false)}
            >
                <X size={28} />
            </button>

            <div 
                className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white p-1 rounded-3xl shadow-2xl overflow-hidden w-full overflow-y-auto max-h-full scrollbar-hide">
                    <img 
                        src="/images/corredor_sedes.jpeg" 
                        alt="Mapa Completo" 
                        className="w-full h-auto rounded-2xl"
                    />
                </div>
                <p className="mt-4 text-white font-black uppercase tracking-[0.4em] text-[10px] opacity-60">
                    XVII Congreso IASPM-AL 2026 • Chiapas, México
                </p>
            </div>
        </div>
      )}

      {/* Modal de Detalle de Sede */}
      {selectedVenue && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedVenue(null)}>
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="relative h-64">
                    <img src={selectedVenue.image_url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setSelectedVenue(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white backdrop-blur-md p-2 rounded-full shadow-lg transition-colors"><X size={20}/></button>
                    <div className="absolute bottom-6 left-8">
                         <h2 className="text-3xl font-black text-white uppercase italic tracking-tight drop-shadow-lg">{selectedVenue.name}</h2>
                    </div>
                </div>
                <div className="p-8">
                    <p className="text-gray-600 mb-6 leading-relaxed">{selectedVenue.description}</p>
                    <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4">Salas y Espacios</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {selectedVenue.rooms.map(room => (
                            <div key={room.id} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 font-bold text-xs text-[#1e3a5f]">
                                <span className="text-orange-500">✓</span> {room.name}
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => openInMaps(selectedVenue)}
                        className="w-full mt-8 bg-[#1e3a5f] hover:bg-black text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg"
                    >
                        {lang === 'es' ? 'Cómo llegar con Google Maps' : 'Como chegar com Google Maps'}
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
      <div className="text-3xl bg-gray-50 p-3 rounded-xl shadow-inner">{icon}</div>
      <div>
        <h4 className="font-black text-[#1e3a5f] uppercase text-[10px] tracking-widest mb-1">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

export default VenuesPage;
