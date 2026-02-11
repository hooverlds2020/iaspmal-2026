// src/components/layout/Sidebar.jsx
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = ({ menuItems, currentPage, setCurrentPage, submenuOpen, toggleSubmenu, lang }) => {
  return (
    // AJUSTE: top-28 (aprox 112px).
    // Es la altura necesaria para que el menú no quede oculto ni flotando.
    <aside className="hidden md:block w-[280px] shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar self-start">
      
      <nav className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Encabezado del Menú */}
        <div className="p-4 bg-iaspm-blue text-white font-bold text-lg border-b border-white/10 shadow-sm">
          {lang === 'es' ? 'Menú Principal' : 'Menu Principal'}
        </div>
        
        <ul className="py-2">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = submenuOpen[item.id];
            const isChildActive = hasSubmenu && item.submenu.some(sub => sub.id === currentPage);

            return (
              <li key={item.id} className="border-b border-gray-50 last:border-0">
                <button
                  onClick={() => hasSubmenu ? toggleSubmenu(item.id) : setCurrentPage(item.id)}
                  className={`w-full text-left px-5 py-3.5 transition-all flex items-center justify-between group relative overflow-hidden
                    ${isActive || isChildActive
                      ? 'bg-blue-50 text-iaspm-blue font-bold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-iaspm-blue'
                    }`}
                >
                  {(isActive || isChildActive) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-iaspm-orange"></div>
                  )}

                  <span className="leading-tight z-10">{lang === 'pt' ? item.label_pt : item.label}</span>
                  
                  {hasSubmenu && (
                    <div className="bg-gray-100/50 rounded-full p-1 group-hover:bg-gray-200/50 transition">
                      {isSubmenuOpen 
                        ? <ChevronDown className="w-4 h-4 text-iaspm-orange" /> 
                        : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-iaspm-blue" />
                      }
                    </div>
                  )}
                </button>

                {hasSubmenu && isSubmenuOpen && (
                  <ul className="bg-gray-50/50 border-t border-gray-100 shadow-inner">
                    {item.submenu.map((subItem) => {
                      const isSubActive = currentPage === subItem.id;
                      return (
                        <li key={subItem.id}>
                          <button
                            onClick={() => setCurrentPage(subItem.id)}
                            className={`w-full text-left pl-10 pr-4 py-3 text-sm transition-colors border-l-2
                              ${isSubActive 
                                ? 'border-iaspm-orange text-iaspm-orange font-bold bg-white' 
                                : 'border-transparent text-gray-500 hover:text-iaspm-blue hover:bg-gray-100 hover:border-gray-300'
                              }`}
                          >
                            {lang === 'pt' ? subItem.label_pt : subItem.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        
        <div className="h-1.5 bg-gradient-to-r from-iaspm-blue via-iaspm-lightblue to-iaspm-orange"></div>
      </nav>
    </aside>
  );
};

export default Sidebar;
