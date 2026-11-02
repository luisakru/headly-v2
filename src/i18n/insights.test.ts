import type { Insight } from '../domain/insights';
import { at } from '../test/factories';
import { formatInsight, formatInsightDetail } from './insights';
import { de } from './locales/de';
import { en } from './locales/en';

const ranges = {
  previousRange: { start: at(2026, 5, 1), end: at(2026, 8, 1) },
  range: { start: at(2026, 8, 1), end: at(2026, 11, 1) },
};

test.each([
  [
    { kind: 'migraineDaysChange', before: 6, after: 4, ...ranges },
    'Migraine days dropped from 6 to 4 per month.',
  ],
  [
    { kind: 'migraineDaysChange', before: 2, after: 3.5, ...ranges },
    'Migraine days rose from 2 to 3.5 per month.',
  ],
  [
    {
      kind: 'medicationEffectivenessChange',
      medicationName: 'Sumatriptan',
      months: 4,
      before: 0.91,
      after: 0.78,
    },
    'Sumatriptan has helped less over the last 4 months (91% to 78%).',
  ],
  [
    { kind: 'fewerButStrongerAttacks', painIncrease: 1.25 },
    'Fewer attacks, but on average 1.3 points stronger.',
  ],
] as const)('formats %o in English', (insight, sentence) => {
  expect(formatInsight(insight, en, 'en')).toBe(sentence);
});

test('formats numbers the German way', () => {
  expect(
    formatInsight({ kind: 'migraineDaysChange', before: 6, after: 4.5, ...ranges }, de, 'de'),
  ).toBe('Die Migränetage sind von 6 auf 4,5 pro Monat gesunken.');
});

describe('preventionMedicationDaysChange', () => {
  const insight: Insight = {
    kind: 'preventionMedicationDaysChange',
    preventionName: 'Amitriptyline',
    change: -0.5,
    effect: {
      windowDays: 90,
      before: { start: at(2026, 1, 1), end: at(2026, 4, 1) },
      after: { start: at(2026, 6, 1), end: at(2026, 8, 30) },
      migraineDaysPer30: { before: 6, after: 4 },
      medicationDaysPer30: { before: 5, after: 2.5 },
    },
  };

  test('states both values', () => {
    expect(formatInsight(insight, de, 'de')).toBe(
      'Seit Amitriptyline: 2,5 statt 5 Medikamententage pro Monat.',
    );
  });

  test('explains both windows', () => {
    expect(formatInsightDetail(insight, en, 'en')).toContain(
      'the 90 days before the start (Jan 1, 2026 – Mar 31, 2026) with 90 days from when it is expected to work (Jun 1, 2026 – Aug 29, 2026)',
    );
  });
});

test('explains the migraine days change with both periods', () => {
  expect(
    formatInsightDetail({ kind: 'migraineDaysChange', before: 6, after: 4, ...ranges }, de, 'de'),
  ).toContain(
    'Verglichen wird August 2026 – Oktober 2026 mit dem gleich langen Zeitraum davor (Mai 2026 – Juli 2026).',
  );
});

test('other insights have no detail', () => {
  expect(
    formatInsightDetail({ kind: 'fewerButStrongerAttacks', painIncrease: 1 }, en, 'en'),
  ).toBeUndefined();
});
