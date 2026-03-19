// src/components/pages/Alojamiento.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, Copy, ImageIcon, Check, Phone, Mail, MessageCircle, Info, Coffee, Wifi, Car, Users, ArrowLeft, Loader2, Building, FileText } from 'lucide-react';
import { toast } from 'sonner';

const renderRangeBadge = (rango) => {
  const map = {
    'A': { text: 'Lujo / Centro Histórico', bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-100' },
    'B': { text: 'Económico / Ejecutivo', bg: 'bg-amber-50', color: 'text-amber-700', border: 'border-amber-100' },
    'C': { text: 'Hostal / Airbnb', bg: 'bg-gray-100', color: 'text-gray-700', border: 'border-gray-200' },
  };
  const data = map[rango];
  if (!data) return null;
  return (
    <span className={`text-[10px] font-black ${data.bg} ${data.color} ${data.border} border px-2.5 py-1 rounded-full uppercase tracking-wider shadow-inner`}>
      {data.text}
    </span>
  );
}

const Alojamiento = ({ lang }) => {
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    const fetchHoteles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('alojamientos').select('*').order('precio_desde', { ascending: true });
        if (error) throw error;
        setHoteles(data || []);
      } catch (err) {
        toast.error(lang === 'es' ? "Error al cargar alojamientos" : "Erro ao carregar alojamentos");
      } finally {
        setLoading(false);
      }
    };
    fetchHoteles();
  }, [lang]);

  const filteredHoteles = activeTab === 'todos' ? hoteles : hoteles.filter(h => h.rango === activeTab);

  const handleCopy = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    toast.success(lang === 'es' ? 'Código copiado' : 'Código copiado!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderAmenity = (type) => {
      switch(type){
          case 'desayuno': return <div className="flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded"><Coffee size={12}/> {lang === 'es' ? 'Desayuno' : 'Café da manhã'}</div>;
          case 'wifi': return <div className="flex items-center gap-1.5 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded"><Wifi size={12}/> Wifi</div>;
          case 'estacionamiento_extra': return <div className="flex items-center gap-1.5 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded"><Car size={12}/> {lang === 'es' ? 'Estac. (extra)' : 'Estac. (extra)'}</div>;
          case 'reunion': return <div className="flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded"><Users size={12}/> {lang === 'es' ? 'Sala' : 'Sala'}</div>;
          default: return null;
      }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <Loader2 className="w-12 h-12 text-[#1e3a5f] animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{lang === 'es' ? 'Cargando opciones...' : 'Carregando opções...'}</p>
      </div>
    );
  }

  if (selectedHotel) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto pb-10">
        <button onClick={() => setSelectedHotel(null)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm w-fit">
          <ArrowLeft size={18} /> {lang === 'es' ? 'Volver a la lista' : 'Voltar à lista'}
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start bg-gray-50/50">
             <div className="w-32 h-32 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex items-center justify-center overflow-hidden">
                <img src={selectedHotel.imagen_principal} alt={selectedHotel.nombre} className="max-h-full max-w-full object-contain" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4203251aa?q=80&w=600'; }} />
             </div>
             <div className="flex-1 text-center md:text-left">
                <div className="mb-2.5 flex justify-center md:justify-start">
                    {renderRangeBadge(selectedHotel.rango)}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-[#1e3a5f] uppercase tracking-tight mb-2 leading-tight">{selectedHotel.nombre}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center justify-center md:justify-start gap-1.5 font-medium"><MapPin size={16}/> San Cristóbal de Las Casas</p>
                {selectedHotel.codigo && selectedHotel.codigo !== 'PENDIENTE' && (
                  <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl">
                    <div>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">{lang === 'es' ? 'Código' : 'Código'}</p>
                      <p className="font-mono font-bold text-orange-900 text-base leading-none">{selectedHotel.codigo}</p>
                    </div>
                    <button onClick={() => handleCopy(selectedHotel.codigo)} className="bg-white text-orange-500 p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors shadow-sm ml-2 border border-orange-100">
                      {copiedCode === selectedHotel.codigo ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                )}
             </div>
          </div>
          <div className="p-6 md:p-8 space-y-8">
            {selectedHotel.contacto && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100"><h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest">{lang === 'es' ? 'Contacto para Reservaciones' : 'Contato para Reservas'}</h4></div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {selectedHotel.contacto.email && <a href={`mailto:${selectedHotel.contacto.email}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group border border-gray-100"><div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Mail size={20}/></div><span className="text-xs font-bold text-gray-700 break-all">{selectedHotel.contacto.email}</span></a>}
                    {selectedHotel.contacto.tel && <a href={`tel:${selectedHotel.contacto.tel.replace(/\s+/g, '')}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group border border-gray-100"><div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Phone size={20}/></div><span className="text-sm font-bold text-gray-700">{selectedHotel.contacto.tel}</span></a>}
                    {selectedHotel.contacto.whatsapp && <a href={`https://wa.me/${selectedHotel.contacto.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group border border-emerald-100"><div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><MessageCircle size={20}/></div><span className="text-sm font-bold text-emerald-800">WA: {selectedHotel.contacto.whatsapp_display || 'Contactar'}</span></a>}
                  </div>
                  {selectedHotel.notas?.[lang] && (
                    <div className="flex items-start gap-3 text-sm text-gray-600 bg-amber-50/50 p-4 rounded-xl border border-amber-100"><Info size={20} className="shrink-0 mt-0.5 text-amber-500" /><p className="leading-relaxed font-medium">{selectedHotel.notas[lang]}</p></div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ BOTÓN DE DESCARGA PDF */}
            {selectedHotel.documento_url && (
              <a 
                href={selectedHotel.documento_url} 
                target="_blank" 
                rel="noreferrer" 
                className="mt-4 flex items-center justify-center gap-3 w-full bg-blue-50 hover:bg-[#1e3a5f] text-[#1e3a5f] hover:text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest border border-blue-200 transition-all shadow-sm group"
              >
                <FileText size={20} className="group-hover:scale-110 transition-transform" /> 
                {lang === 'es' ? 'Ver Cotización / Cartel Oficial' : 'Ver Cotação / Cartaz Oficial'}
              </a>
            )}

            {selectedHotel.flyers?.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2 px-2"><ImageIcon size={18} /> {lang === 'es' ? 'Galería e Información' : 'Galeria e Informação'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedHotel.flyers.map((flyer, index) => (
                    <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex flex-col">
                      <div className="p-3.5 bg-[#1e3a5f] text-center shrink-0"><p className="text-xs font-bold text-white uppercase tracking-wider">{flyer.titulo}</p></div>
                      <div className="flex-1 bg-gray-100 flex items-center justify-center p-4"><img src={flyer.url} alt={flyer.titulo} className="max-h-[70vh] w-full object-contain rounded-lg" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600'; }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-10">
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-gray-700 shadow-sm">
        <p className="leading-relaxed text-sm font-medium">
          {lang === 'es' 
            ? 'San Cristóbal de Las Casas cuenta con una amplia oferta hotelera. A continuación, presentamos opciones con tarifas preferenciales para los asistentes al congreso. ¡No olvides mencionar el código de descuento al reservar por teléfono o correo!' 
            : 'San Cristóbal de Las Casas possui uma ampla rede hoteleira. Abaixo, apresentamos opções com tarifas preferenciais para os participantes. Não se esqueça de mencionar o código de desconto ao reservar por telefone ou e-mail!'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 border-b border-gray-200 pb-5">
        {[
          { id: 'todos', es: 'Todas las opciones', pt: 'Todas as opções' },
          { id: 'A', es: 'Rango A (Lujo/Centro)', pt: 'Faixa A (Luxo/Centro)' },
          { id: 'B', es: 'Rango B (Económicos)', pt: 'Faixa B (Econômicos)' },
          { id: 'C', es: 'Rango C (Hostales/Airbnb)', pt: 'Faixa C (Hostels/Airbnb)' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 rounded-full text-xs uppercase tracking-wider font-black transition-all ${activeTab === tab.id ? 'bg-[#1e3a5f] text-white shadow-lg translate-y-[-1px]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {lang === 'es' ? tab.es : tab.pt}
          </button>
        ))}
      </div>

      {hoteles.length === 0 && !loading && (
         <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
           <Building size={56} className="text-gray-300 mb-5" />
           <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{lang === 'es' ? 'Aún no hay hoteles registrados.' : 'Ainda não há hotéis registrados.'}</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {filteredHoteles.map(hotel => (
          <div key={hotel.id} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100">
              <img src={hotel.imagen_principal} alt={hotel.nombre} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542314831-c6a4203251aa?q=80&w=600'; }} />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black text-[#1e3a5f] shadow-md border border-gray-100">
                {lang === 'es' ? 'Desde' : 'Desde'} ${hotel.precio_desde} MXN
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="mb-3">
                {renderRangeBadge(hotel.rango)}
              </div>
              
              <h3 className="font-black text-xl text-[#1e3a5f] mb-1.5 leading-tight">{hotel.nombre}</h3>
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 font-medium"><MapPin size={14}/> San Cristóbal de Las Casas</p>
              
              {hotel.amenidades && hotel.amenidades.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                      {hotel.amenidades.map((am, i) => <React.Fragment key={i}>{renderAmenity(am)}</React.Fragment>)}
                  </div>
              )}

              {hotel.codigo && hotel.codigo !== 'PENDIENTE' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex justify-between items-center group/code hover:bg-orange-100 transition-colors mb-5">
                  <div>
                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-0.5">{lang === 'es' ? 'Código de Descuento' : 'Código de Desconto'}</p>
                    <p className="font-mono font-bold text-orange-900 text-sm">{hotel.codigo}</p>
                  </div>
                  <button onClick={() => handleCopy(hotel.codigo)} className="bg-white text-orange-500 p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors shadow-sm" title="Copiar código">
                    {copiedCode === hotel.codigo ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              )}

              <button onClick={() => handleSelectHotel(hotel)} className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-black text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md mt-auto">
                <ImageIcon size={16} /> {lang === 'es' ? 'Ver Detalles y Reservar' : 'Ver Detalhes e Reservar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alojamiento;
