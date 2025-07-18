import { createContext, useContext, useState, ReactNode } from 'react';
import { SupportedLanguage, translations } from '@/utils/i18n';

type LanguageContextType = {
  language: SupportedLanguage;
  t: (key: keyof typeof translations.en, params?: Record<string, any>) => string;
  setLanguage: (lang: SupportedLanguage) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const t = (key: keyof typeof translations.en, params?: Record<string, any>): string => {
    let text = translations[language][key] || translations.en[key] || key;
    
    // Replace template parameters
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
