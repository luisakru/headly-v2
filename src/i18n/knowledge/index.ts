import { differenceInCalendarDays } from 'date-fns';
import type { Language } from '../../domain/types';
import factsDe from './de/facts.json';
import factsEn from './en/facts.json';

export type KnowledgeGroup = 'basics' | 'lesserKnown';

export type Article = {
  group: KnowledgeGroup;
  /** File name without the order prefix, the same in every language. */
  slug: string;
  emoji: string;
  title: string;
  /** Markdown without the title line. */
  body: string;
};

/** Parses `de/basics/01-what-is-migraine.md` whose first line is `# 🧠 Title`. */
export function parseArticle(path: string, source: string): Article & { language: Language } {
  const [, language, group, slug] = /(\w+)\/(\w+)\/\d+-([\w-]+)\.md$/.exec(path) ?? [];
  const [titleLine = '', ...rest] = source.trim().split('\n');
  const [, emoji = '', title = ''] = /^#\s+(\S+)\s+(.+)$/.exec(titleLine) ?? [];
  return {
    language: language as Language,
    group: group as KnowledgeGroup,
    slug: slug ?? '',
    emoji,
    title,
    body: rest.join('\n').trim(),
  };
}

const files = import.meta.glob<string>('./*/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const knowledgeArticles: Record<Language, Article[]> = { de: [], en: [] };

for (const path of Object.keys(files).sort()) {
  const { language, ...article } = parseArticle(path, files[path] ?? '');
  knowledgeArticles[language].push(article);
}

const figureFiles = import.meta.glob<string>('./*/figures/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** SVG figures by language and name, e.g. `de/figures/pill.svg` is `knowledgeFigures.de.pill`. */
export const knowledgeFigures: Record<Language, Record<string, string>> = { de: {}, en: {} };

for (const [path, svg] of Object.entries(figureFiles)) {
  const [, language, name] = /(\w+)\/figures\/([\w-]+)\.svg$/.exec(path) ?? [];
  knowledgeFigures[language as Language][name ?? ''] = svg;
}

export type Fact = {
  text: string;
  /** Slug of the article the fact comes from. */
  article: string;
};

export const knowledgeFacts: Record<Language, Fact[]> = { de: factsDe, en: factsEn };

/** One fact per day, in a fixed order, so every fact comes once before any repeats. */
export function factOfTheDay(facts: Fact[], now: number): Fact | undefined {
  if (facts.length === 0) return undefined;
  const day = differenceInCalendarDays(now, 0);
  return facts[((day % facts.length) + facts.length) % facts.length];
}
