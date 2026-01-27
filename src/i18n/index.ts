import { useState, useEffect } from 'react';
import { storage } from '../storage';
import { translations, Language } from './locales';

export const i18n = {
  get: (key: string, lang: Language = 'en', params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }

    if (typeof value === 'string' && params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }

    return value || key;
  }
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    storage.get().then(settings => {
      setLanguage(settings.language);
    });
  }, []);

  const t = (key: string, params?: Record<string, any>) => {
    return i18n.get(key, language, params);
  };

  const changeLanguage = async (lang: Language) => {
    const settings = await storage.get();
    await storage.set({ ...settings, language: lang });
    setLanguage(lang);
  };

  return { t, language, changeLanguage };
}
