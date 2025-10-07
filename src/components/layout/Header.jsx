// src/components/layout/Header.jsx
import React from 'react';

const Header = ({ lang }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full">
      <header className="bg-[#fef8eb] rounded-2xl p-4 md:p-8 border border-amber-200/50">
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center md:text-left">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
            <img 
              src="/images/logo-iaspmal.png" 
              alt="IASPM-AL 2026" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-teal-700 leading-tight mb-2">
              {lang === 'es' 
                ? 'XVII Congreso de la IASPM-AL 2026'
                : '17th IASPM-AL Congress 2026'}
            </h1>
            <p className="text-sm md:text-lg text-gray-700 mb-1">
              {lang === 'es'
                ? 'Ética, Política y Música Popular'
                : 'Ethics, Politics and Popular Music'}
            </p>
            <p className="text-xs md:text-base text-gray-600">
              {lang === 'es'
                ? '28 Septiembre al 2 Octubre de 2026, San Cristóbal de Las Casas, Chiapas, México.'
                : 'September 28 - October 2, 2026, San Cristóbal de Las Casas, Chiapas, Mexico.'}
            </p>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;