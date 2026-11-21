import type { Language } from '../../domain/types';
import collectionDe from './collection.de.md?raw';
import collectionEn from './collection.en.md?raw';
import migraineDe from './migraine.de.md?raw';
import migraineEn from './migraine.en.md?raw';

export type KnowledgePage = 'migraine' | 'collection';

export const knowledgeTexts: Record<Language, Record<KnowledgePage, string>> = {
  de: { migraine: migraineDe, collection: collectionDe },
  en: { migraine: migraineEn, collection: collectionEn },
};
