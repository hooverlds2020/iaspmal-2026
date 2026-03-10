// src/components/pages/Alojamiento.jsx
import React, { useState } from 'react';
import { MapPin, Copy, ImageIcon, Check, Phone, Mail, MessageCircle, Info, Coffee, Wifi, Car, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Alojamiento = ({ lang }) => {
  const [activeTab, setActiveTab] = useState('todos');
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const hoteles = [
    {
      id: 1,
      rango: 'A',
      nombre: 'Hotel Diego de Mazariegos',
      precio_desde: '920',
      codigo: 'CONGRESO IASPMLA',
      habitaciones: 'Estándar, Colonial, De Lujo',
      imagen_principal: '/images/hoteles/mazariegos-logo.jpg',
      contacto: {
        email: 'reserva@diegodemazariegos.com',
        tel: '01 967 678 08 33',
        whatsapp: '5219671358088',
        whatsapp_display: '967 135 80 88',
        web: null
      },
      notas: {
        es: 'Tarifa con impuestos incluidos. Ocupación sencilla o doble. Persona extra: $150 pesos. Sin alimentos.',
        pt: 'Tarifa com impostos incluídos. Ocupação individual ou dupla. Pessoa extra: $150 pesos. Sem refeições.'
      },
      amenidades: [],
      flyers: [
        { titulo: 'Habitación Estándar ($920 MXN)', url: '/images/hoteles/mazariegos-estandar.jpg' },
        { titulo: 'Habitación Colonial ($1,120 MXN)', url: '/images/hoteles/mazariegos-colonial.jpg' },
        { titulo: 'Habitación De Lujo ($1,320 MXN)', url: '/images/hoteles/mazariegos-lujo.jpg' }
      ]
    },
    {
      id: 2,
      rango: 'A',
      nombre: 'Hotel Posada Real de Chiapas',
      precio_desde: '1593',
      codigo: 'IASPM-AL',
      habitaciones: 'Sencilla, Doble, Triple, Cuádruple',
      imagen_principal: '/images/hoteles/posada-real-logo.jpg',
      contacto: {
        email: 'gerentedeventas@posadarealdechiapas.com.mx',
        tel: '(967) 678 0064',
        whatsapp: '5219676780064', 
        whatsapp_display: '(967) 678 0064',
        web: 'www.posadarealdechiapas.com.mx'
      },
      notas: { 
        es: 'Ubicado en Francisco I Madero # 19, Centro Histórico. El estacionamiento tiene un costo extra.', 
        pt: 'Localizado na Francisco I Madero # 19, Centro Histórico. O estacionamento tem custo extra.' 
      },
      amenidades: ['desayuno', 'wifi', 'reunion', 'estacionamiento_extra'],
      flyers: [
        { titulo: 'Flyer Tarifas Especiales', url: '/images/hoteles/posada-real-flyer.jpg' },
        { titulo: 'Habitaciones Dobles', url: '/images/hoteles/posada-real-doble.jpg' },
        { titulo: 'Habitaciones King', url: '/images/hoteles/posada-real-king.jpg' },
        { titulo: 'Lobby / Instalaciones', url: '/images/hoteles/posada-real-lobby.jpg' }
      ]
    },
    {
      id: 3,
      rango: 'B',
      nombre: 'Hotel Posada Mexicana',
      precio_desde: '600',
      codigo: 'PENDIENTE',
      habitaciones: 'Dobles colcha amarilla',
      imagen_principal: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=600',
      contacto: null,
      notas: { es: '', pt: '' },
      amenidades: [],
      flyers: []
    }
  ];

  const filteredHoteles = activeTab === 'todos' 
    ? hoteles 
    : hoteles.filter(h => h.rango === activeTab);

  const handleCopy = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    toast.success(lang === 'es' ? 'Código copiado al portapapeles' : 'Código copiado!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla suavemente al mostrar los detalles
  };

  const handleBackToList = () => {
    setSelectedHotel(null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla al volver a la lista
  };

  const renderAmenity = (type) => {
      switch(type){
          case 'desayuno': return <div className="flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded"><Coffee size={12}/> {lang === 'es' ? 'Desayuno incluido' : 'Café da manhã'}</div>;
          case 'wifi': return <div className="flex items-center gap-1.5 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded"><Wifi size={12}/> Wifi</div>;
          case 'estacionamiento_extra': return <div className="flex items-center gap-1.5 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded"><Car size={12}/> {lang === 'es' ? 'Estacionamiento (extra)' : 'Estacionamento (extra)'}</div>;
          case 'reunion': return <div className="flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded"><Users size={12}/> {lang === 'es' ? 'Sala de reunión' : 'Sala de reunião'}</div>;
          default: return null;
      }
  }

  // --- VISTA 2: DETALLES DEL HOTEL (INLINE) ---
  if (selectedHotel) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto">
        
        {/* BOTÓN DE REGRESO */}
        <button 
          onClick={handleBackToList} 
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm transition-colors group bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          {lang === 'es' ? 'Volver a la lista de hoteles' : 'Voltar à lista de hotéis'}
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* HEADER DEL HOTEL */}
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start bg-gray-50/50">
             <div className="w-32 h-32 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedHotel.imagen_principal} 
                  alt={selectedHotel.nombre} 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4203251aa?q=80&w=600'; }}
                />
             </div>
             <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black text-[#1e3a5f] uppercase tracking-tight mb-2">{selectedHotel.nombre}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                  <MapPin size={16}/> San Cristóbal de Las Casas
                </p>
                
                {selectedHotel.codigo && selectedHotel.codigo !== 'PENDIENTE' && (
                  <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl">
                    <div>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">{lang === 'es' ? 'Código de Descuento' : 'Código de Desconto'}</p>
                      <p className="font-mono font-bold text-orange-900 text-base leading-none">{selectedHotel.codigo}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(selectedHotel.codigo)}
                      className="bg-white text-orange-500 p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors shadow-sm ml-2 border border-orange-100"
                      title="Copiar código"
                    >
                      {copiedCode === selectedHotel.codigo ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                )}
             </div>
          </div>

          {/* CONTENIDO PRINCIPAL DEL HOTEL */}
          <div className="p-6 md:p-8 space-y-8">
            
            {/* INFO Y CONTACTO */}
            {selectedHotel.contacto && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100">
                  <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest">
                    {lang === 'es' ? 'Contacto para Reservaciones' : 'Contato para Reservas'}
                  </h4>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <a href={`mailto:${selectedHotel.contacto.email}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group border border-gray-100">
                      <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Mail size={20}/></div>
                      <span className="text-xs font-bold text-gray-700 break-all">{selectedHotel.contacto.email}</span>
                    </a>
                    <a href={`tel:${selectedHotel.contacto.tel.replace(/\s+/g, '')}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group border border-gray-100">
                      <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Phone size={20}/></div>
                      <span className="text-sm font-bold text-gray-700">{selectedHotel.contacto.tel}</span>
                    </a>
                    <a href={`https://wa.me/${selectedHotel.contacto.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group border border-emerald-100">
                      <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><MessageCircle size={20}/></div>
                      <span className="text-sm font-bold text-emerald-800">WA: {selectedHotel.contacto.whatsapp_display}</span>
                    </a>
                  </div>
                  
                  {selectedHotel.notas.es && (
                    <div className="flex items-start gap-3 text-sm text-gray-600 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                      <Info size={20} className="shrink-0 mt-0.5 text-amber-500" />
                      <p className="leading-relaxed font-medium">{lang === 'es' ? selectedHotel.notas.es : selectedHotel.notas.pt}</p>
                    </div>
                  )}

                  {selectedHotel.contacto.web && (
                     <div className="mt-5 text-center">
                         <a href={`https://${selectedHotel.contacto.web}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-2">
                            {lang === 'es' ? 'Visitar sitio web oficial' : 'Visitar site oficial'}
                         </a>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* GALERÍA DE FLYERS */}
            {selectedHotel.flyers.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2 px-2">
                  <ImageIcon size={18} /> {lang === 'es' ? 'Galería e Información' : 'Galeria e Informação'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedHotel.flyers.map((flyer, index) => (
                    <div key={index} className={`bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex flex-col ${index === 0 && flyer.titulo.includes('Flyer') ? 'md:col-span-2' : ''}`}>
                      <div className="p-3.5 bg-[#1e3a5f] text-center border-b border-gray-100 shrink-0">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{flyer.titulo}</p>
                      </div>
                      <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
                          <img 
                          src={flyer.url} 
                          alt={flyer.titulo} 
                          className="max-h-[70vh] w-full object-contain rounded-lg shadow-sm"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600'; }}
                          />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-base font-medium">
                  {lang === 'es' ? 'No hay imágenes disponibles para este hotel aún.' : 'Nenhuma imagem disponível para este hotel ainda.'}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 1: GRID PRINCIPAL DE HOTELES ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-gray-700 shadow-sm">
        <p className="leading-relaxed">
          {lang === 'es' 
            ? 'San Cristóbal de Las Casas cuenta con una amplia oferta hotelera. A continuación, presentamos opciones con tarifas preferenciales para los asistentes al congreso. ¡No olvides mencionar el código de descuento al reservar por teléfono o correo!' 
            : 'San Cristóbal de Las Casas possui uma ampla rede hoteleira. Abaixo, apresentamos opções com tarifas preferenciais para os participantes. Não se esqueça de mencionar o código de desconto ao reservar por telefone ou e-mail!'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <button 
          onClick={() => setActiveTab('todos')}
          className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-black transition-all ${activeTab === 'todos' ? 'bg-[#1e3a5f] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {lang === 'es' ? 'Todas las opciones' : 'Todas as opções'}
        </button>
        <button 
          onClick={() => setActiveTab('A')}
          className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-black transition-all ${activeTab === 'A' ? 'bg-[#1e3a5f] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {lang === 'es' ? 'Rango A (Desde $900)' : 'Faixa A (A partir de $900)'}
        </button>
        <button 
          onClick={() => setActiveTab('B')}
          className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-black transition-all ${activeTab === 'B' ? 'bg-[#1e3a5f] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {lang === 'es' ? 'Rango B (Económicos)' : 'Faixa B (Econômicos)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHoteles.map(hotel => (
          <div key={hotel.id} className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            
            <div className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100">
              <img 
                src={hotel.imagen_principal} 
                alt={hotel.nombre} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4203251aa?q=80&w=600'; }}
              />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black text-[#1e3a5f] shadow-md border border-gray-100">
                {lang === 'es' ? 'Desde' : 'Desde'} ${hotel.precio_desde} MXN
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-black text-xl text-[#1e3a5f] mb-1.5 leading-tight">{hotel.nombre}</h3>
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 font-medium"><MapPin size={14}/> San Cristóbal de Las Casas</p>
              
              {hotel.amenidades && hotel.amenidades.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                      {hotel.amenidades.map((am, i) => <React.Fragment key={i}>{renderAmenity(am)}</React.Fragment>)}
                  </div>
              )}

              <div className="space-y-4 mb-6 flex-1">
                {hotel.codigo && hotel.codigo !== 'PENDIENTE' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex justify-between items-center group/code hover:bg-orange-100 transition-colors">
                    <div>
                      <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-0.5">{lang === 'es' ? 'Código de Descuento' : 'Código de Desconto'}</p>
                      <p className="font-mono font-bold text-orange-900 text-sm">{hotel.codigo}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(hotel.codigo)}
                      className="bg-white text-orange-500 p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                      title="Copiar código"
                    >
                      {copiedCode === hotel.codigo ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sin código especial</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleSelectHotel(hotel)}
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-black text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
              >
                <ImageIcon size={16} /> {lang === 'es' ? 'Ver Habitaciones y Reservar' : 'Ver Quartos e Reservar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alojamiento;
