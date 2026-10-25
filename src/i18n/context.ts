import { createContext, useContext } from 'react';
import type { Language } from '../domain/types';
import { de } from './locales/de';
import { en, type Dictionary } from './locales/en';

export const dictionaries: Record<Language, Dictionary> = { de, en };

export type I18n = {
  language: Language;
  t: Dictionary;
  setLanguage: (language: Language) => Promise<void>;
};

export const I18nContext = createContext<I18n | null>(null);

export function useI18n(): I18n {
  const i18n = useContext(I18nContext);
  if (!i18n) throw new Error('useI18n must be used inside I18nProvider');
  return i18n;
}
