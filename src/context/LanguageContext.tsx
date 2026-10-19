import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortalLanguage, LanguageInfo, PORTAL_LANGUAGES, getTranslation } from '../services/i18nService';

interface LanguageContextType {
  language: PortalLanguage;
  setLanguage: (lang: PortalLanguage) => void;
  languageInfo: LanguageInfo;
  isRTL: boolean;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ur',
  setLanguage: () => {},
  languageInfo: PORTAL_LANGUAGES[0],
  isRTL: true,
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<PortalLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tehreek_portal_lang') as PortalLanguage;
        if (saved && (saved === 'ur' || saved === 'ar' || saved === 'en')) {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return 'ur';
  });

  const languageInfo = PORTAL_LANGUAGES.find(l => l.code === language) || PORTAL_LANGUAGES[0];
  const isRTL = languageInfo.direction === 'rtl';

  const setLanguage = (lang: PortalLanguage) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tehreek_portal_lang', lang);
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [language, isRTL]);

  const t = (key: string, fallback?: string): string => {
    return getTranslation(language, key, fallback);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageInfo, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const usePortalLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};
