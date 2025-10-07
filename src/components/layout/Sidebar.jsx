// src/components/layout/Sidebar.jsx
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = ({ 
  menuItems, 
  currentPage, 
  setCurrentPage, 
  submenuOpen, 
  toggleSubmenu,
  lang 
}) => {
  return (
    <aside className="hidden md:block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">
            {lang === 'es' ? 'Menú principal' : 'Main Menu'}
          </h2>
        </div>
        <nav className="p-3">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.id);
                  } else {
                    setCurrentPage(item.id);
                  }
                }}
                className={`w-full text-left px-4 py-2.5 rounded-md transition-all text-sm flex items-center justify-between ${
                  currentPage === item.id && !item.submenu
                    ? 'bg-teal-600 text-white font-medium shadow-sm'
                    : 'hover:bg-gray-100 text-gray-700'
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
                <div className="mt-1 mb-2 space-y-1 pl-4">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.id}
                      onClick={() => setCurrentPage(subitem.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm ${
                        currentPage === subitem.id
                          ? 'bg-teal-500 text-white font-medium'
                          : 'hover:bg-gray-100 text-gray-600'
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
    </aside>
  );
};

export default Sidebar;