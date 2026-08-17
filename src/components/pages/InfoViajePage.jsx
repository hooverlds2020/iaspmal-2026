// src/components/pages/InfoViajePage.jsx
// Plantilla reutilizable para páginas de contenido estático largo (traslados, movilidad, salud)
import React from 'react';

const InfoViajePage = ({ intro, blocks = [] }) => {
  return (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      {intro && <p>{intro}</p>}
      {blocks.map((block, i) => (
        <div key={i}>
          {block.heading && <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-wide mt-6 mb-2">{block.heading}</h3>}
          {block.text && <p className="mb-2">{block.text}</p>}
          {block.list && (
            <ul className="list-disc pl-5 space-y-1.5">
              {block.list.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          )}
          {block.highlight && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-3 text-sm">
              {block.highlight}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InfoViajePage;
