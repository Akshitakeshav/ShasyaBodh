import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('shasyabodh_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('shasyabodh_lang', next);
      return next;
    });
  };

  const t = (key, variables = {}) => {
    if (!key) return '';
    const item = translations[key];
    let resolved = item && item[language] ? item[language] : key;

    // Simple variable interpolation (e.g., {name})
    Object.keys(variables).forEach((varKey) => {
      resolved = resolved.replace(`{${varKey}}`, variables[varKey]);
    });

    return resolved;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
