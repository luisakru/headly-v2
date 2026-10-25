import { at } from '../test/factories';
import { dayKind, recentWeekDays } from './calendar';
import { toDayKey } from './days';

describe('recentWeekDays', () => {
  test('covers whole weeks from Monday, ending with the current week', () => {
    // Saturday, 24 Oct 2026
    const days = recentWeekDays(at(2026, 10, 24, 15), 4);
    expect(days).toHaveLength(28);
    expect(toDayKey(days[0]!)).toBe('2026-09-28');
    expect(toDayKey(days[27]!)).toBe('2026-10-25');
  });

  test('starts the current week on the day itself when today is Monday', () => {
    const days = recentWeekDays(at(2026, 10, 26, 8), 1);
    expect(toDayKey(days[0]!)).toBe('2026-10-26');
  });
});

describe('dayKind', () => {
  const migraine = new Set(['2026-10-01', '2026-10-02']);
  const medication = new Set(['2026-10-02', '2026-10-03']);

  test.each([
    ['2026-10-01', 'migraine'],
    ['2026-10-02', 'migraineWithMedication'],
    ['2026-10-03', 'medicationOnly'],
    ['2026-10-04', 'none'],
  ])('%s is %s', (dayKey, kind) => {
    expect(dayKind(dayKey, migraine, medication)).toBe(kind);
  });
});
