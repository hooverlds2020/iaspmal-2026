import React from 'react';
import { ChevronDown } from 'lucide-react';

const Sidebar = ({ menuItems, currentPage, setCurrentPage, submenuOpen, toggleSubmenu, lang }) => {
  const menuTitle = {
    es: 'Menú principal',
    pt: 'Menu principal'
  };

  return (
    <aside className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      <h3 className="text-gray-900 font-bold mb-4 text-lg">
        {menuTitle[lang] || menuTitle.es}
      </h3>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <span>{lang === 'es' ? item.label : item.label_pt || item.label}</span>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      submenuOpen[item.id] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {submenuOpen[item.id] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subitem) => (
                      <button
                        key={subitem.id}
                        onClick={() => setCurrentPage(subitem.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition text-sm ${
                          currentPage === subitem.id
                            ? 'bg-teal-600 text-white font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {lang === 'es' ? subitem.label : subitem.label_pt || subitem.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition ${
                  currentPage === item.id
                    ? 'bg-teal-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{lang === 'es' ? item.label : item.label_pt || item.label}</span>
              </button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
