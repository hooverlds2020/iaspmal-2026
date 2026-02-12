// src/components/layout/MobileSidebar.jsx
import React from 'react';
import { X, ChevronDown } from 'lucide-react';

const MobileSidebar = ({ isOpen, onClose, menuItems, currentPage, setCurrentPage, submenuOpen, toggleSubmenu, lang }) => {
  const menuTitle = {
    es: 'Menú principal',
    pt: 'Menu principal'
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro con desenfoque (Backdrop) */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Móvil */}
      <aside className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 md:hidden overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Encabezado: Azul Institucional */}
        <div className="p-5 bg-iaspm-blue text-white flex justify-between items-center sticky top-0 z-10 shadow-md">
           <h3 className="font-bold text-lg tracking-wide">
             {menuTitle[lang] || menuTitle.es}
           </h3>
           <button 
             onClick={onClose}
             className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
           >
             <X className="w-6 h-6 text-white" />
           </button>
        </div>

        {/* Lista de Navegación */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => {
             const isActive = currentPage === item.id;
             const isSubOpen = submenuOpen[item.id];
             // Verificamos si algún hijo está activo para resaltar el padre
             const isChildActive = item.submenu && item.submenu.some(sub => sub.id === currentPage);
             
             return (
              <div key={item.id} className="mb-1">
                {item.submenu ? (
                  // --- ITEM CON SUBMENÚ ---
                  <div className="rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all duration-200 border-l-4
                        ${isActive || isChildActive || isSubOpen
                            ? 'bg-blue-50 text-iaspm-blue font-bold border-iaspm-orange' 
                            : 'bg-transparent text-gray-700 hover:bg-gray-50 border-transparent'
                        }`}
                    >
                      <span>{lang === 'es' ? item.label : item.label_pt || item.label}</span>
                      <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isSubOpen ? 'rotate-180 text-iaspm-orange' : 'text-gray-400'
                        }`}
                      />
                    </button>
                    
                    {/* Lista del Submenú */}
                    <div className={`overflow-hidden transition-all duration-300 ${isSubOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-2 my-1">
                        {item.submenu.map((subitem) => {
                            const isSubActive = currentPage === subitem.id;
                            return (
                              <button
                                key={subitem.id}
                                onClick={() => {
                                  setCurrentPage(subitem.id);
                                  onClose();
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-r-lg text-sm transition-colors ${
                                  isSubActive
                                    ? 'text-iaspm-orange font-bold bg-orange-50'
                                    : 'text-gray-600 hover:text-iaspm-blue hover:bg-gray-50'
                                }`}
                              >
                                {lang === 'es' ? subitem.label : subitem.label_pt || subitem.label}
                              </button>
                            );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  // --- ITEM SIN SUBMENÚ ---
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-lg transition-all duration-200 border-l-4 ${
                      isActive
                        ? 'bg-blue-50 text-iaspm-blue font-bold border-iaspm-orange' // Estilo activo consistente con desktop
                        : 'bg-transparent text-gray-700 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <span>{lang === 'es' ? item.label : item.label_pt || item.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </nav>
        
        {/* Decoración inferior (Gradiente Institucional) */}
        <div className="h-2 bg-gradient-to-r from-iaspm-blue via-iaspm-lightblue to-iaspm-orange shrink-0"></div>
      </aside>
    </>
  );
};

export default MobileSidebar;
