import React from 'react';

const Footer = ({ lang }) => {
  return (
    // CAMBIO: bg-iaspm-blue (Azul Institucional) y texto blanco
    <footer className="bg-iaspm-blue text-white py-12 border-t-4 border-iaspm-orange mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          
          {/* Columna 1: Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">IASPM-AL 2026</h3>
            <p className="opacity-80 leading-relaxed">
              XVII Congreso de la Asociación Internacional para el Estudio de la Música Popular, Rama Latinoamericana.
            </p>
            <p className="mt-4 opacity-80">
              San Cristóbal de Las Casas, Chiapas, México.
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-iaspm-orange">Enlaces</h3>
            <ul className="space-y-2 opacity-80">
              <li><a href="https://iaspmal.com/" target="_blank" rel="noopener noreferrer" className="hover:text-iaspm-orange transition">Sitio Web IASPM-AL</a></li>
              <li><a href="#" className="hover:text-iaspm-orange transition">Contacto</a></li>
              <li><a href="#" className="hover:text-iaspm-orange transition">Aviso de Privacidad</a></li>
            </ul>
          </div>

          {/* Columna 3: Créditos */}
          <div className="md:text-right">
             <p className="opacity-60 text-xs">
               &copy; {new Date().getFullYear()} IASPM-AL. 
               {lang === 'es' ? ' Todos los derechos reservados.' : ' Todos os direitos reservados.'}
             </p>
             <p className="mt-2 opacity-40 text-xs">
               Desarrollado para el XVII Congreso.
             </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
