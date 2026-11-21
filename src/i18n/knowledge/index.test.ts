import { knowledgeArticles, parseArticle } from '.';

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

test('every article exists in both languages', () => {
  const keys = (language: 'de' | 'en') =>
    knowledgeArticles[language].map(({ group, slug, emoji }) => `${group}/${slug}/${emoji}`);
  expect(keys('de').length).toBeGreaterThan(0);
  expect(keys('de')).toEqual(keys('en'));
});
