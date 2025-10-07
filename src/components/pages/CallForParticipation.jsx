// src/components/pages/CallForParticipation.jsx
import React from 'react';

const CallForParticipation = ({ lang }) => {
  const content = {
    es: {
      intro: 'Esta edición del Congreso de la IASPM-AL busca promover la reflexión crítica y la producción de conocimiento en torno al papel de la música en contextos de conflicto social y político.',
      formats: 'Formatos admitidos:',
      items: [
        'Comunicación individual (250–300 palabras)',
        'Panel/mesa redonda (3–4 ponentes)',
        'Póster (250–300 palabras)',
        'Presentación de libro'
      ]
    },
    en: {
      intro: 'This edition of the IASPM-AL Congress seeks to promote critical reflection and knowledge production regarding the role of music in contexts of social and political conflict.',
      formats: 'Accepted formats:',
      items: [
        'Individual paper (250–300 words)',
        'Panel/roundtable (3–4 speakers)',
        'Poster (250–300 words)',
        'Book presentation'
      ]
    }
  };

  const t = content[lang];

  return (
    <div>
      <p className="mb-4 text-gray-700">{t.intro}</p>
      <h3 className="font-bold text-gray-900 mb-3">{t.formats}</h3>
      <ul className="list-disc pl-6 space-y-2">
        {t.items.map((item, idx) => (
          <li key={idx} className="text-gray-700">{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default CallForParticipation;