import React from 'react';
import { FileText, Book, Music } from 'lucide-react';

const AcceptedFormats = ({ lang }) => {
  const content = {
    es: {
      title: 'Formatos admitidos',
      formats: [
        { icon: FileText, title: 'Ponencia' },
        { icon: Book, title: 'Presentación de libro' },
        { icon: Music, title: 'Intervención musical' }
      ]
    },
    en: {
      title: 'Accepted Formats',
      formats: [
        { icon: FileText, title: 'Paper Presentation' },
        { icon: Book, title: 'Book Presentation' },
        { icon: Music, title: 'Musical Intervention' }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-teal-700 mb-8 text-center">{t.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.formats.map((format, index) => {
            const Icon = format.icon;
            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-lg p-8 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-teal-600 text-white p-5 rounded-full mb-4">
                    <Icon size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {format.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AcceptedFormats;
