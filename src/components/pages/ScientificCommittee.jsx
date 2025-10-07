// src/components/pages/ScientificCommittee.jsx
import React from 'react';

const ScientificCommittee = ({ lang }) => {
  const comiteCientifico = [
    'Alicia González Sánchez (Conservatorio Superior de Música de Córdoba)',
    'Amalia Casas Mas (Universidad Complutense de Madrid)',
    'Ana Flávia Miguel (Universidade de Aveiro)',
    'Andrew Snyder (Inet md-Universidade Nova de Lisboa)',
    'Dario Ranocchiari (Universidad de Granada)',
    'Enrique Cámara De Landa (Universidad de Valladolid)',
    'Fernán Del Val Ripollés (Universidad Nacional de Educación a Distancia)',
    'Francisco Bethencourt Llobet (Universidad Complutense de Madrid)',
    'Gabriel Rusinek (Universidad Complutense de Madrid)',
    'Igor Sáenz Abarzuza (Universidad Pública de Navarra)',
    'Isabela de Aranzadi (Universidad Autónoma de Madrid)',
    'Iván Iglesias Iglesias (Universidad de Valladolid)',
    'Josep Martí i Pérez (Institut Català d\'Antropologia)',
    'Karlos Sánchez Ekiza (Universidad del País Vasco)',
    'Lidia López Gómez (Universitat Autònoma de Barcelona)',
    'Luís Costa Vázquez (Universidad de Vigo; Conservatorio Superior de Música de Vigo)',
    'Magda Polo Pujadas (Universitat de Barcelona)',
    'Marcos Andrés Vierge (Universidad Pública de Navarra)',
    'Maria Jesús Castro Martín (Esmuc; Conservatori Superior Liceu)',
    'Marta García Quiñones (TecnoCampus-Universitat Pompeu Fabra)',
    'Pedro Cravinho (Royal Birmingham Conservatoire)',
    'Rolf Bäcker (Escola Superior de Música de Catalunya)',
    'Rubén López-Cano (Escola Superior de Música de Catalunya)',
    'Ruth Piquer Sanclemente (Universidad Complutense de Madrid)',
    'Sergi González González (Universitat Autònoma de Barcelona)',
    'Sílvia Martínez García (Universitat Autònoma de Barcelona)',
    'Simone Luci Pereira (Universidade Paulista)',
    'Susana Moreno Fernández (Universidad de Valladolid)',
    'Susana Sardo (Universidade de Aveiro)'
  ];

  return (
    <div>
      <p className="text-gray-600 mb-6">
        {lang === 'es' 
          ? 'Miembros del Comité Científico del XVII Congreso de la IASPM-AL 2026:'
          : 'Members of the Scientific Committee of the 17th IASPM-AL Congress 2026:'}
      </p>
      <ul className="space-y-2">
        {comiteCientifico.map((name) => (
          <li key={name} className="text-sm text-gray-700 flex items-start">
            <span className="text-teal-600 mr-2">•</span>
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScientificCommittee;