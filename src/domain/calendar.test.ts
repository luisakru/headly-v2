import { at } from '../test/factories';
import { dayKind, monthGridDays, recentWeekDays } from './calendar';
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

describe('monthGridDays', () => {
  test('pads the month to whole weeks starting on Monday', () => {
    // 1 Jan 2026 is a Thursday, 31 Jan a Saturday.
    const cells = monthGridDays(at(2026, 1, 16, 12));
    expect(cells).toHaveLength(35);
    expect(cells.slice(0, 3)).toEqual([undefined, undefined, undefined]);
    expect(toDayKey(cells[3]!)).toBe('2026-01-01');
    expect(toDayKey(cells[33]!)).toBe('2026-01-31');
    expect(cells[34]).toBeUndefined();
  });

  test('needs no padding for a month from Monday to Sunday', () => {
    // February 2021 starts on a Monday and has exactly four weeks.
    const cells = monthGridDays(at(2021, 2, 1));
    expect(cells).toHaveLength(28);
    expect(cells.every(Boolean)).toBe(true);
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
