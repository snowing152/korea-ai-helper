'use client';

import { useEffect } from 'react';
import { LANGUAGES } from '../constants/languages';

export default function LanguageSelector({ language, setLanguage }) {
  useEffect(() => {
    const saved = localStorage.getItem('preferred_language');
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setLanguage(saved);
    }
  }, [setLanguage]);

  const handleSelect = (code) => {
    setLanguage(code);
    localStorage.setItem('preferred_language', code);
  };

  return (
    <div className="flex gap-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
