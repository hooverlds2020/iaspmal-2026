// src/components/layout/MobileSidebar.jsx
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  menuItems, 
  currentPage, 
  setCurrentPage, 
  submenuOpen, 
  toggleSubmenu,
  lang 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div 
        className="absolute top-0 left-0 w-80 h-full bg-white shadow-xl overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            {lang === 'es' ? 'Menú principal' : 'Main Menu'}
          </h2>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.id);
                    } else {
                      setCurrentPage(item.id);
                      onClose();
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm flex items-center justify-between ${
                    currentPage === item.id
                      ? 'bg-teal-600 text-white font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{lang === 'es' ? item.label : item.label_en || item.label}</span>
                  {item.submenu && (
                    submenuOpen[item.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )
                  )}
                </button>
                {item.submenu && submenuOpen[item.id] && (
                  <div className="mt-1 space-y-1 pl-3">
                    {item.submenu.map((subitem) => (
                      <button
                        key={subitem.id}
                        onClick={() => {
                          setCurrentPage(subitem.id);
                          onClose();
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                          currentPage === subitem.id
                            ? 'bg-teal-500 text-white font-medium'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {subitem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;