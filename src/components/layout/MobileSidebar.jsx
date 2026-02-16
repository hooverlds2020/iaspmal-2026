// src/components/layout/MobileSidebar.jsx
import React from 'react';
import { 
  X, ChevronDown, Home, Info, Mic, Ticket, Users, FileText, Calendar, 
  BookOpen, MapPin, Building, Briefcase 
} from 'lucide-react';

const MobileSidebar = ({ isOpen, onClose, menuItems, currentPage, setCurrentPage, submenuOpen, toggleSubmenu, lang }) => {
  if (!isOpen) return null;

  const getIcon = (id) => {
    const icons = {
      'home': Home, 'llamada': Info, 'conferenciantes': Mic, 'cuotas': Ticket,
      'comite-academico': Users, 'comite-organizador': Users, 'programa': Calendar,
      'talleres': Briefcase, 'presentaciones-libros': BookOpen, 'actividades-congreso': Calendar,
      'info-complementaria': Info, 'sedes': MapPin, 'instituciones-convocantes': Building,
      'organizaciones': Users, 'alojamiento': Home, 'san-cristobal': MapPin, 'cartel': FileText
    };
    return icons[id] || Info;
  };

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[300px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#1e3a5f] text-white">
          <div>
             <h2 className="font-bold text-lg leading-tight">IASPM-AL</h2>
             <p className="text-[10px] opacity-70 uppercase tracking-widest">Congreso 2026</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = getIcon(item.id);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = submenuOpen[item.id];

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if(hasSubmenu) toggleSubmenu(item.id);
                    else { setCurrentPage(item.id); onClose(); }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                        ? 'bg-orange-50 text-orange-700 font-bold shadow-sm' 
                        : 'text-gray-600 active:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
                  <span className="flex-1 text-left">{lang === 'es' ? item.label : item.label_pt}</span>
                  {hasSubmenu && <ChevronDown size={16} className={`transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />}
                </button>

                {hasSubmenu && isSubmenuOpen && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 pl-3 mb-2">
                    {item.submenu.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => { setCurrentPage(sub.id); onClose(); }}
                        className={`
                          w-full text-left px-3 py-2 rounded-lg text-xs block
                          ${currentPage === sub.id ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-gray-500'}
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
      </div>
    </div>
  );
};

export default MobileSidebar;
