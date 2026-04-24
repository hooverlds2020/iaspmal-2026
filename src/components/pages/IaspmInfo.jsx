import React from 'react';

const IaspmInfo = ({ lang }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-gray-700 leading-relaxed space-y-5 text-sm md:text-base">
        
        <p>
          La IASPM-AL es la Rama Latinoamericana de la Asociación Internacional para el Estudio de la Música Popular (<strong>IASPM-International Association for the Study of Popular Music</strong>).
        </p>
        <p>
          Se trata de un espacio multidisciplinario de convergencia en torno a la reflexión de las músicas populares latinoamericanas y caribeñas en cualquiera de sus dimensiones estéticas, usos y períodos históricos.
        </p>
        <p>
          La asociación se fundó en Buenos Aires el 8 de octubre de 1995. En 1997 institucionalizó sus congresos en Santiago de Chile, y sus asambleas en Bogotá en 2000. Sus congresos continuaron en México (2002), Río de Janeiro, Brasil (2004), Buenos Aires, Argentina (2005), La Habana, Cuba (2006), Lima, Perú (2008), Caracas, Venezuela (2010), Córdoba, Argentina (2012), Salvador de Bahía, Brasil (2014), La Habana, Cuba (2016), San Juan, Puerto Rico (2018), Medellín, Colombia (2020), Valparaíso, Chile (2022) y Recife, Brasil (2024).
        </p>
        <p>
          En su calidad de asociación, la IASPM-AL se define como un espacio académico de gestión y coordinación abierto a todos los campos de investigación de la música. Sus actividades incluyen tanto la transmisión de experiencias de músicos prácticos, como la producción teórica de estudiosos y académicos que realizan aportes al conocimiento social por medio de la problematización de las músicas populares.
        </p>
        <p>
          Sus objetivos principales son: proponer e impulsar iniciativas para el desarrollo de los estudios de música popular en América Latina, favorecer la articulación del trabajo de investigación de la membresía de la Rama, y divulgar tanto su producción como publicaciones y otros acontecimientos de interés para los estudiosos de la música popular en la región.
        </p>
        <p>
          Nuestra asociación fue creada como una rama de la <strong>International Association for the Study of Popular Music</strong>, pero su organización interna y sus actividades son pensadas según las necesidades y expectativas regionales.
        </p>
        
        <div className="bg-blue-50/60 p-5 rounded-xl border-l-4 border-[#1e3a5f] my-8 shadow-sm">
          <p className="font-medium text-[#1e3a5f] text-base md:text-lg">
            En la actualidad la IASPM-AL cuenta con una membresía activa de unas <strong>400</strong> personas, procedentes de unos <strong>20</strong> países.
          </p>
        </div>

        <h3 className="text-xl font-black text-[#1e3a5f] mt-10 mb-4 border-b pb-3 uppercase tracking-wide">
          La Directiva del bienio 2024-2026 se encuentra conformada por:
        </h3>
        
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Presidente</span>
            <span className="font-bold text-[#1e3a5f]">Darío Tejeda</span> <span className="text-gray-600">(República Dominicana)</span>
          </li>
          <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Vicepresidente</span>
            <span className="font-bold text-[#1e3a5f]">Herom Vargas</span> <span className="text-gray-600">(Brasil)</span>
          </li>
          <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Secretaria</span>
            <span className="font-bold text-[#1e3a5f]">Luciana Mendonça</span> <span className="text-gray-600">(Brasil)</span>
          </li>
          <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tesorera</span>
            <span className="font-bold text-[#1e3a5f]">Paula Mesa</span> <span className="text-gray-600">(Argentina)</span>
          </li>
          <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Editora</span>
            <span className="font-bold text-[#1e3a5f]">Violeta Solano-Vargas</span> <span className="text-gray-600">(Colombia)</span>
          </li>
          <li className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Webmaster</span>
            <span className="font-bold text-[#1e3a5f]">Marcelo Bergamin Conter</span> <span className="text-gray-600">(Brasil)</span>
          </li>
        </ul>

        {/* ENLACE AL FINAL */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
          <a 
            href="https://iaspmal.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center gap-3 bg-[#1e3a5f] hover:bg-black text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <span className="tracking-wide uppercase text-sm font-black">Visitar www.iaspmal.com</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

      </div>
    </div>
  );
};

export default IaspmInfo;
