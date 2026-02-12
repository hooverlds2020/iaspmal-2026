// src/components/layout/Header.jsx
import React from 'react';
import { Globe, User, Menu } from 'lucide-react';

const Header = ({ lang, setLang, onMobileMenuOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
      
      {/* CONTENEDOR PRINCIPAL CENTRADO
          Agregamos 'relative' aquí para que la marimba se ancle a ESTE espacio 
          y no al borde de la pantalla completa. */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* --- MARCA DE AGUA (MARIMBA) --- */}
        {/* MOVIDO AQUÍ ADENTRO.
            Ahora 'right-0' significa 'borde derecho del contenido', justo donde están los botones. */}
        <div className="absolute right-0 top-0 h-full w-1/2 md:w-1/3 flex justify-end items-center pointer-events-none z-0">
           <img 
              src="/images/Marimba_Watermark.png" 
              alt="" 
              // AJUSTES:
              // translate-x-4: La movemos solo un poquito a la derecha para que se asome sutilmente.
              // scale-125: Un poco más grande para que llene bien el espacio detrás de los botones.
              className="h-[160%] w-auto object-contain object-right opacity-[0.08] grayscale mix-blend-multiply translate-x-4 md:translate-x-8"
           />
        </div>

        {/* --- CONTENIDO (Texto y Botones) --- */}
        {/* 'relative z-10' para asegurar que los botones estén ENCIMA de la imagen */}
        <div className="relative z-10 flex justify-between items-center py-2 md:py-3"> 
          
          {/* 1. IZQUIERDA: LOGO E INFO */}
          <div className="flex items-center gap-4">
            <img 
              src="/images/logo-margen.jpg" 
              alt="XVII Congreso IASPM-AL" 
              className="h-16 md:h-20 w-auto object-contain hover:scale-105 transition-transform drop-shadow-sm"
            />
            
            <div className="hidden md:flex flex-col justify-center border-l-2 border-gray-100 pl-4 h-12 bg-white/60 backdrop-blur-sm rounded-r-lg pr-2">
               <h2 className="text-iaspm-blue font-bold text-sm md:text-base uppercase tracking-tight leading-none">
                  San Cristóbal de Las Casas
               </h2>
               <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chiapas, México
                  </span>
                  <span className="text-iaspm-orange font-bold text-xs md:text-sm">• 2026</span>
               </div>
            </div>
          </div>

          {/* 2. DERECHA: CONTROLES */}
          <div className="flex items-center gap-3 md:gap-6">
             
             {/* Selector de Idioma */}
             <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200/60 shadow-sm hover:border-iaspm-blue/30 transition-colors">
                <Globe className="w-3 h-3 text-gray-400" />
                <button 
                  onClick={() => setLang('es')} 
                  className={`text-xs font-bold px-1 transition ${lang === 'es' ? 'text-iaspm-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ES
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => setLang('pt')} 
                  className={`text-xs font-bold px-1 transition ${lang === 'pt' ? 'text-iaspm-blue' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  PT
                </button>
             </div>

             {/* Enlace Admin */}
             <a href="/admin" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-iaspm-orange transition text-xs font-medium group bg-white/80 backdrop-blur-sm py-1 px-3 rounded-full border border-gray-200/60 hover:border-iaspm-orange/30 shadow-sm">
                <div className="bg-gray-100 p-1 rounded-full group-hover:bg-iaspm-orange group-hover:text-white transition">
                   <User className="w-3 h-3" />
                </div>
                <span>Admin</span>
             </a>

             {/* Botón Hamburguesa */}
             <button 
               onClick={onMobileMenuOpen} 
               className="md:hidden p-2 text-gray-600 hover:bg-white hover:text-iaspm-blue rounded-lg transition bg-white/60 backdrop-blur-sm border border-transparent shadow-sm"
             >
               <Menu className="w-7 h-7" />
             </button>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
