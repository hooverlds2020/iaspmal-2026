// src/components/layout/Footer.jsx
import React from 'react';

const Footer = ({ lang }) => {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <a className="hover:text-teal-700 transition" href="#">
            {lang === 'es' ? 'Privacidad' : 'Privacy'}
          </a>
          <span>•</span>
          <a className="hover:text-teal-700 transition" href="#">
            {lang === 'es' ? 'Accesibilidad' : 'Accessibility'}
          </a>
        </div>
        <div className="text-gray-500">IASPMAL 2026</div>
      </div>
    </footer>
  );
};

export default Footer;