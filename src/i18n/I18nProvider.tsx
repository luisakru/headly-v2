import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, type ReactNode } from 'react';
import { getSettings, updateSettings } from '../data/settingsRepository';
import type { Language } from '../domain/types';
import { dictionaries, I18nContext, type I18n } from './context';

async function setLanguage(language: Language) {
  await updateSettings({ language });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useLiveQuery(async () => (await getSettings()).language);

  useEffect(() => {
    if (language) document.documentElement.lang = language;
  }, [language]);

  const i18n = useMemo<I18n | null>(
    () => (language ? { language, t: dictionaries[language], setLanguage } : null),
    [language],
  );

  // Render nothing until settings load, so the UI never flashes in the wrong language.
  if (!i18n) return null;

  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>;
}
