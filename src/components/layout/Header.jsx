import React from 'react';

const Header = ({ lang }) => {
  const content = {
    es: {
      title: 'XVII Congreso de la IASPM-AL 2026',
      subtitle: 'Ética, Política y Música Popular',
      date: '28 de Septiembre al 2 de Octubre de 2026, San Cristóbal de Las Casas, Chiapas, México.'
    },
    pt: {
      title: 'XVII Congresso da IASPM-AL 2026',
      subtitle: 'Ética, Política e Música Popular',
      date: '28 de setembro a 2 de outubro de 2026, San Cristóbal de Las Casas, Chiapas, México.'
    }
  };

  const t = content[lang] || content.es;

  return (
    <header className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 -mt-6">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src="/images/logo-iaspmal.png" 
              alt="IASPM-AL Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-teal-700 text-3xl font-bold mb-2">
              {t.title}
            </h1>
            <p className="text-gray-800 text-lg font-semibold mb-1">
              {t.subtitle}
            </p>
            <p className="text-gray-600 text-sm">
              {t.date}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
