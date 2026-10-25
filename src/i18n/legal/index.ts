import type { Language } from '../../domain/types';
import imprintDe from './imprint.de.md?raw';
import imprintEn from './imprint.en.md?raw';
import privacyDe from './privacy.de.md?raw';
import privacyEn from './privacy.en.md?raw';

export type LegalPage = 'privacy' | 'imprint';

export const legalTexts: Record<Language, Record<LegalPage, string>> = {
  de: { privacy: privacyDe, imprint: imprintDe },
  en: { privacy: privacyEn, imprint: imprintEn },
};
