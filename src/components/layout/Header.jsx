// src/components/layout/Header.jsx
import React from 'react';
import { Globe, User, Menu } from 'lucide-react';

const Header = ({ lang, setLang, onMobileMenuOpen }) => {
  return (
    // h-[72px] define una altura fija para calcular el sticky del sidebar
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm h-[72px] flex items-center">
      
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">

        {/* Marca de agua decorativa */}
        <div className="absolute right-0 top-0 h-full w-1/3 flex justify-end items-center pointer-events-none overflow-hidden">
           <img
             src="/images/Marimba_Watermark.png"
             alt=""
             className="h-[180%] w-auto object-contain opacity-[0.08] grayscale mix-blend-multiply translate-x-10"
           />
        </div>

        <div className="relative z-10 flex justify-between items-center h-full">

          {/* IZQUIERDA: Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/images/logo-margen.jpg"
              alt="XVII Congreso IASPM-AL"
              className="h-12 md:h-14 w-auto object-contain hover:scale-105 transition-transform"
            />

            <div className="hidden md:flex flex-col justify-center border-l-2 border-gray-100 pl-4 h-10">
               <h2 className="text-[#1e3a5f] font-bold text-sm uppercase leading-none tracking-tight">
                 San Cristóbal de Las Casas
               </h2>
               <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chiapas, México</span>
                  <span className="text-orange-500 font-bold text-xs">• 2026</span>
               </div>
            </div>
          </div>

          {/* DERECHA: Controles */}
          <div className="flex items-center gap-3 md:gap-4">

             {/* Selector Idioma */}
             <div className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <button
                  onClick={() => setLang('es')}
                  className={`text-xs font-bold px-1.5 transition ${lang === 'es' ? 'text-[#1e3a5f]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ES
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setLang('pt')}
                  className={`text-xs font-bold px-1.5 transition ${lang === 'pt' ? 'text-[#1e3a5f]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  PT
                </button>
             </div>

             {/* Admin Link */}
             <a href="/admin" className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-orange-600 transition group bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <User className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Admin</span>
             </a>

             {/* Menú Móvil */}
             <button
               onClick={onMobileMenuOpen}
               className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
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
