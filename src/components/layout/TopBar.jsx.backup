// src/components/layout/TopBar.jsx
import React from 'react';
import { Menu } from 'lucide-react';

const TopBar = ({ lang, setLang, onMobileMenuOpen }) => {
  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-teal-700">@congreso_iaspmal2026</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang('en')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              lang === 'en' 
                ? 'bg-teal-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('es')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              lang === 'es' 
                ? 'bg-teal-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            ES
          </button>
          <button 
            className="md:hidden p-2 rounded-lg border ml-2 hover:bg-gray-50" 
            onClick={onMobileMenuOpen}
          >
            <Menu className="w-5 h-5 text-teal-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;