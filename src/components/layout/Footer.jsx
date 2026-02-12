// src/components/layout/Footer.jsx
import React from 'react';

const Footer = ({ lang }) => {
  return (
    // CAMBIO: py-3 (Muy delgado, igual que el header)
    <footer className="bg-iaspm-blue text-white py-3 border-t-4 border-iaspm-orange font-sans text-xs relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* LAYOUT FLEXIBLE: Todo en una sola línea horizontal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
          
          {/* IZQUIERDA: Copyright (Lo esencial) */}
          <div className="text-center md:text-left opacity-90">
            <span className="font-bold">© 2026 IASPM-AL.</span>
            <span className="hidden sm:inline mx-1">-</span>
            <span className="block sm:inline">San Cristóbal de Las Casas, Chiapas.</span>
          </div>

          {/* DERECHA: Enlaces Legales y Contacto (En línea, no lista) */}
          <div className="flex items-center gap-4 text-blue-200">
            <a 
              href="mailto:contacto@iaspmal2026.org" 
              className="hover:text-white hover:underline transition-colors"
            >
              {lang === 'es' ? 'Contacto' : 'Contato'}
            </a>
            
            <span className="text-blue-800">|</span>
            
            <a 
              href="/aviso-privacidad" 
              className="hover:text-white hover:underline transition-colors"
            >
              {lang === 'es' ? 'Privacidad' : 'Privacidade'}
            </a>
            
            {/* Solo visible en PC para no saturar móvil */}
            <span className="hidden md:inline text-blue-800">|</span>
            <a 
              href="/admin" 
              className="hidden md:inline hover:text-white hover:underline transition-colors"
            >
              Admin
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
