// src/components/layout/TopBar.jsx
import React from 'react';
import { Globe, User, Menu } from 'lucide-react';

const TopBar = ({ lang, setLang, onMobileMenuOpen }) => {
  return (
    <div className="bg-iaspm-blue text-white text-sm py-2 px-4 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* IZQUIERDA: Botón Menú (Solo visible en Móvil) */}
        <div className="flex items-center">
          <button onClick={onMobileMenuOpen} className="md:hidden p-1 hover:bg-white/10 rounded transition mr-2">
            <Menu className="w-6 h-6 text-white" />
          </button>
          {/* En escritorio este lado queda vacío para dar aire */}
        </div>

        {/* DERECHA: Herramientas (Idioma y Admin) */}
        <div className="flex items-center gap-4">
          
          {/* Selector de Idioma */}
          <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full hover:bg-black/30 transition border border-white/10">
            <Globe className="w-3 h-3 text-white/70" />
            <button 
              onClick={() => setLang('es')} 
              className={`font-bold px-1 transition ${lang === 'es' ? 'text-white' : 'text-white/50 hover:text-white'}`}
            >
              ES
            </button>
            <span className="text-white/30">|</span>
            <button 
              onClick={() => setLang('pt')} 
              className={`font-bold px-1 transition ${lang === 'pt' ? 'text-white' : 'text-white/50 hover:text-white'}`}
            >
              PT
            </button>
          </div>

          {/* Enlace Admin */}
          <a href="/admin" className="flex items-center gap-2 hover:text-iaspm-orange transition font-medium group">
            <div className="bg-white/10 p-1 rounded-full group-hover:bg-iaspm-orange group-hover:text-white transition">
               <User className="w-3 h-3" />
            </div>
            <span className="hidden sm:inline opacity-90 group-hover:opacity-100">Admin</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
