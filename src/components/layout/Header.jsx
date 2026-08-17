// src/components/layout/Header.jsx
import React from 'react';
import { Globe, User, Menu } from 'lucide-react';

const Header = ({ lang, setLang, onMobileMenuOpen }) => {
  return (
    // CAMBIO 1: Aumentamos la altura de la franja blanca de h-[72px] a h-[100px]
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md h-[100px] flex items-center">
      
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">

         <div className="relative z-10 flex justify-between items-center h-full gap-4">

          {/* IZQUIERDA: Logo Horizontal - Ahora mucho más grande */}
          <div className="flex items-center h-full py-3">
            <img
              src="/images/logo-horizontal-iaspm.png"
              alt="XVII Congreso IASPM-AL"
              // CAMBIO 2: Subimos drásticamente las alturas responsivas del logo
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain hover:scale-[1.03] transition-transform origin-left"
            />
          </div>

          {/* DERECHA: Controles (shrink-0 asegura que no se amontonen) */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">

             {/* Selector Idioma */}
             <div className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <button
                  onClick={() => setLang('es')}
                  className={`text-[10px] md:text-xs font-black px-1.5 transition ${lang === 'es' ? 'text-[#1e3a5f]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ES
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setLang('pt')}
                  className={`text-[10px] md:text-xs font-black px-1.5 transition ${lang === 'pt' ? 'text-[#1e3a5f]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  PT
                </button>
             </div>

             {/* Admin Link */}
             <a href="/admin" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#1e3a5f] transition group bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <User className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Admin</span>
             </a>

             {/* Menú Móvil */}
             <button
               onClick={onMobileMenuOpen}
               className="lg:hidden p-2 text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
             >
               <Menu className="w-6 h-6" />
             </button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
