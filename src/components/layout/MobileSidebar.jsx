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
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 md:hidden overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 font-bold text-lg">
              {menuTitle[lang] || menuTitle.es}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
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
                            onClick={() => {
                              setCurrentPage(subitem.id);
                              onClose();
                            }}
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
                    onClick={() => {
                      setCurrentPage(item.id);
                      onClose();
                    }}
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
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
