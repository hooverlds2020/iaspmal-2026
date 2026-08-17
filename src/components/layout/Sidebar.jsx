// src/components/layout/Sidebar.jsx
import React from 'react';
import { 
  Home, Info, Mic, Ticket, Users, FileText, Calendar, 
  BookOpen, MapPin, Building, ChevronDown, ChevronRight, Briefcase, Globe, Music, Image 
} from 'lucide-react';

const Sidebar = ({ menuItems, currentPage, setCurrentPage, submenuOpen, toggleSubmenu, lang }) => {
  
  // Mapa de iconos según el ID del menú
  const getIcon = (id) => {
    const icons = {
      'home': Home,
      'llamada': Info,
      'conferenciantes': Mic,
      'cuotas': Ticket,
      'comite-academico': Users,
      'comite-organizador': Users,
      'programa': Calendar,
      'conciertos': Music, 
      'presentaciones-libros': BookOpen,
      'actividades-congreso': Calendar,
      'info-complementaria': Info,
      'sedes': MapPin,
      'instituciones-convocantes': Building,
      'organizaciones': Users,
      'alojamiento': Home,
      'san-cristobal': MapPin,
      'musica-vivo': Music, 
      'cartel': FileText,
      'galeria': Image // <--- Agregamos el ícono de la cámara/foto para Galería
    };
    return icons[id] || ChevronRight;
  };

  return (
    <aside className="hidden lg:block relative h-full">
      {/* AJUSTE APLICADO: top-[140px] para librar el nuevo encabezado más alto */}
      <nav className="sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar pr-3 pb-10">
        
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = getIcon(item.id);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = submenuOpen[item.id];
            const isChildActive = hasSubmenu && item.submenu.some(sub => sub.id === currentPage);

            return (
              <div key={item.id} className="group mb-1">
                <button
                  onClick={() => hasSubmenu ? toggleSubmenu(item.id) : setCurrentPage(item.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                    ${isActive || isChildActive
                      ? 'bg-[#1e3a5f] text-white shadow-lg shadow-blue-900/10 transform scale-[1.02]' 
                      : 'text-gray-600 hover:bg-white hover:text-[#1e3a5f] hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={`transition-colors ${isActive || isChildActive ? 'text-orange-400' : 'text-gray-400 group-hover:text-orange-500'}`} />
                    <span className="leading-snug text-left">
                      {lang === 'es' ? item.label : item.label_pt}
                    </span>
                  </div>

                  {hasSubmenu && (
                    <ChevronDown size={15} className={`transition-transform duration-200 opacity-60 ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Submenú con animación suave */}
                {hasSubmenu && isSubmenuOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {item.submenu.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setCurrentPage(sub.id)}
                        className={`
                          w-full text-left px-3 py-2 rounded-lg text-xs transition-all block
                          ${currentPage === sub.id 
                            ? 'text-orange-600 font-bold bg-orange-50' 
                            : 'text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-50'
                          }
                        `}
                      >
                        {lang === 'es' ? sub.label : sub.label_pt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tarjeta decorativa al final */}
        <div className="mt-8 mx-2 p-4 bg-gradient-to-br from-[#1e3a5f]/5 to-transparent rounded-2xl border border-[#1e3a5f]/10 text-center">
            <Globe className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IASPM-AL</p>
            <p className="text-xs font-black text-[#1e3a5f] mt-1">Chiapas 2026</p>
        </div>

      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #e2e8f0; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
