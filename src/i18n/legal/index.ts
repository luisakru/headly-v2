import type { Language } from '../../domain/types';
import privacyDe from './privacy.de.md?raw';
import privacyEn from './privacy.en.md?raw';

export type LegalPage = 'privacy';

export const legalTexts: Record<Language, Record<LegalPage, string>> = {
  de: { privacy: privacyDe },
  en: { privacy: privacyEn },
};
