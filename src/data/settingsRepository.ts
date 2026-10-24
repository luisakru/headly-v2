import type { Language, Settings } from '../domain/types';
import { db, SETTINGS_ID } from './db';

export function deviceLanguage(languageTag = navigator.language): Language {
  return languageTag.toLowerCase().startsWith('de') ? 'de' : 'en';
}

export function defaultSettings(): Settings {
  return { language: deviceLanguage(), backupReminderEnabled: true, installHintDismissed: false };
}

export async function getSettings(): Promise<Settings> {
  const { id, ...stored } = (await db.settings.get(SETTINGS_ID)) ?? { id: SETTINGS_ID };
  return { ...defaultSettings(), ...stored };
}

export async function updateSettings(changes: Partial<Settings>): Promise<Settings> {
  const settings = { ...(await getSettings()), ...changes };
  await db.settings.put({ ...settings, id: SETTINGS_ID });
  return settings;
}
