// src/components/pages/ScientificCommittee.jsx
import React from 'react';

const ScientificCommittee = ({ lang }) => {
  const comiteCientifico = [
    'Lizette Alegre (Facultad de Música de la Universidad Nacional Autónoma de México)',
    'Natalia Bieletto Bueno (Centro de Investigación en Artes y Humanidades de la Universidad Mayor de Chile)',
    'Carlos Bonfim (Instituto de Humanidades, Artes y Ciencias Prof. Milton Santos, de la Universidad Federal da Bahía, Brasil)',
    'María Luisa de la Garza Chávez (Centro de Estudios Superiores de México y Centroamérica - Universidad de Ciencias y Artes de Chiapas)',
    'Mercedes Liska (CONICET - Universidad de Buenos Aires, Argentina)',
    'Fernando Elías Llanos (Escuela de Música y Artes Escénicas, Universidad Federal de Goiás, Brasil)',
    'Darío Tejeda (Instituto de Estudios Caribeños, República Dominicana)',
  ];

  return (
    <div>
      <p className="text-gray-600 mb-6">
        {lang === 'es' 
          ? 'Miembros del Comité Académico del XVII Congreso de la IASPM-AL 2026:'
          : 'Members of the Academic Committee of the 17th IASPM-AL Congress 2026:'}
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
