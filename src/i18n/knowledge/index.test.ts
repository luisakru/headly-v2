import { factOfTheDay, knowledgeArticles, knowledgeFacts, knowledgeFigures, parseArticle } from '.';

test('parses group, slug, emoji, title and body from an article file', () => {
  const article = parseArticle(
    './de/basics/01-what-is-migraine.md',
    '# 🧠 Was ist Migräne?\n\nEin Absatz.\n',
  );
  expect(article).toEqual({
    language: 'de',
    group: 'basics',
    slug: 'what-is-migraine',
    emoji: '🧠',
    title: 'Was ist Migräne?',
    body: 'Ein Absatz.',
  });
});

test('every article exists in every language', () => {
  const keys = (language: 'de' | 'en' | 'es') =>
    knowledgeArticles[language].map(({ group, slug, emoji }) => `${group}/${slug}/${emoji}`);
  expect(keys('de').length).toBeGreaterThan(0);
  expect(keys('de')).toEqual(keys('en'));
  expect(keys('de')).toEqual(keys('es'));
});

test('every figure an article shows exists in its language', () => {
  for (const language of ['de', 'en', 'es'] as const) {
    for (const article of knowledgeArticles[language]) {
      for (const [, name] of article.body.matchAll(/^!\[[^\]]*\]\(([\w-]+)\)$/gm)) {
        expect(knowledgeFigures[language]).toHaveProperty(name ?? '');
      }
    }
  }
});

describe('facts', () => {
  test('every language has the same facts, each pointing to an existing article', () => {
    const articles = (language: 'de' | 'en' | 'es') =>
      knowledgeFacts[language].map((fact) => fact.article);
    expect(articles('de')).toEqual(articles('en'));
    expect(articles('de')).toEqual(articles('es'));
    const slugs = new Set(knowledgeArticles.de.map((article) => article.slug));
    for (const fact of knowledgeFacts.de) expect(slugs).toContain(fact.article);
  });

  test('shows every fact once before repeating', () => {
    const facts = knowledgeFacts.de;
    const DAY_MS = 24 * 60 * 60 * 1000;
    const start = new Date(2026, 10, 21, 12).getTime();
    const shown = facts.map((_, day) => factOfTheDay(facts, start + day * DAY_MS));
    expect(new Set(shown).size).toBe(facts.length);
    expect(factOfTheDay(facts, start + facts.length * DAY_MS)).toBe(shown[0]);
  });
});
