import { useCallback } from 'react';
import { Language } from '../types.ts';
import { translations } from '../constants.ts';

export const useLocalization = (language: Language) => {
  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return { t };
};
