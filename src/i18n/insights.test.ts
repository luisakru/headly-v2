import { formatInsight } from './insights';
import { de } from './locales/de';
import { en } from './locales/en';

test.each([
  [
    { kind: 'migraineDaysChange', before: 6, after: 4 },
    'Migraine days dropped from 6 to 4 per month.',
  ],
  [
    { kind: 'migraineDaysChange', before: 2, after: 3.5 },
    'Migraine days rose from 2 to 3.5 per month.',
  ],
  [
    { kind: 'preventionMedicationDaysChange', preventionName: 'Amitriptyline', change: -0.38 },
    'Since starting Amitriptyline: 38% fewer medication days.',
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
  expect(formatInsight({ kind: 'migraineDaysChange', before: 6, after: 4.5 }, de, 'de')).toBe(
    'Die Migränetage sind von 6 auf 4,5 pro Monat gesunken.',
  );
});
