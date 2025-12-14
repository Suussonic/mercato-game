'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load saved preferences
    const savedLanguage = localStorage.getItem('language') as Language;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, t, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
