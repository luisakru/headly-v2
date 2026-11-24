import { at, makeAttack } from '../test/factories';
import { dayEventPatterns, menstrualPattern, periodStarts, shownDayEvents } from './dayEvents';
import type { DayEvent, DayEventType } from './types';

const flight: DayEventType = {
  id: 'flight',
  name: 'Flight',
  kind: 'custom',
  createdAt: 0,
  updatedAt: 0,
};
const event = (date: string, typeId = 'flight'): DayEvent => ({
  id: `${typeId}-${date}`,
  typeId,
  date,
  createdAt: 0,
  updatedAt: 0,
});
const attackOn = (month: number, day: number) =>
  makeAttack({ startedAt: at(2026, month, day, 10), endedAt: at(2026, month, day, 14) });
const now = at(2026, 6, 30, 12);

describe('dayEventPatterns', () => {
  // A quiet baseline: one migraine on the first of each month, January to June.
  const baseline = [1, 2, 3, 4, 5, 6].map((month) => attackOn(month, 1));

  test('finds an event that is usually followed by migraine the same or the next day', () => {
    const dates = ['2026-02-10', '2026-03-10', '2026-04-10', '2026-05-10', '2026-06-10'];
    const attacks = [
      ...baseline,
      attackOn(2, 11),
      attackOn(3, 10),
      attackOn(4, 11),
      attackOn(5, 11),
    ];

    expect(
      dayEventPatterns(
        [flight],
        dates.map((d) => event(d)),
        attacks,
        now,
      ),
    ).toEqual([expect.objectContaining({ eventName: 'Flight', hits: 4, count: 5, related: true })]);
  });

  test('says nothing with too few occurrences', () => {
    const dates = ['2026-02-10', '2026-03-10', '2026-04-10'];
    const attacks = [...baseline, attackOn(2, 10), attackOn(3, 10), attackOn(4, 10)];
    expect(
      dayEventPatterns(
        [flight],
        dates.map((d) => event(d)),
        attacks,
        now,
      ),
    ).toEqual([]);
  });

  test('says an event is unrelated once it happened often without more migraine', () => {
    const dates = Array.from({ length: 8 }, (_, i) => `2026-0${(i % 4) + 2}-${15 + i}`);
    expect(
      dayEventPatterns(
        [flight],
        dates.map((d) => event(d)),
        baseline,
        now,
      ),
    ).toEqual([expect.objectContaining({ hits: 0, count: 8, related: false })]);
  });

  test('ignores today, whose next day is not over yet', () => {
    const dates = ['2026-06-30'];
    expect(
      dayEventPatterns(
        [flight],
        dates.map((d) => event(d)),
        baseline,
        now,
      ),
    ).toEqual([]);
  });
});

describe('periodStarts', () => {
  test('keeps the first day of each period', () => {
    expect(periodStarts(['2026-01-02', '2026-01-01', '2026-01-03', '2026-01-29'])).toEqual([
      '2026-01-01',
      '2026-01-29',
    ]);
  });
});

describe('menstrualPattern', () => {
  const starts = ['2026-01-10', '2026-02-07', '2026-03-07', '2026-04-04'];

  test('finds migraine around the period start in at least two of three cycles', () => {
    const attacks = [attackOn(1, 9), attackOn(2, 8), attackOn(3, 5), attackOn(2, 20)];
    expect(menstrualPattern(starts, attacks, now)).toEqual({ hits: 3, cycles: 4 });
  });

  test('counts day 1 ± 2 only, not three days after', () => {
    const attacks = [attackOn(1, 13), attackOn(2, 10), attackOn(3, 10)];
    expect(menstrualPattern(starts, attacks, now)).toBeUndefined();
  });

  test('says nothing when migraine is just as common in the rest of the cycle', () => {
    const everyFewDays = Array.from({ length: 30 }, (_, i) =>
      makeAttack({ startedAt: at(2026, 1, 1 + i * 3, 10), endedAt: at(2026, 1, 1 + i * 3, 14) }),
    );
    expect(menstrualPattern(starts, everyFewDays, now)).toBeUndefined();
  });

  test('needs three cycles', () => {
    expect(menstrualPattern(starts.slice(0, 2), [attackOn(1, 9), attackOn(2, 8)], now)).toBe(
      undefined,
    );
  });
});

test('shownDayEvents leaves out hidden types and their days', () => {
  const alcohol: DayEventType = { ...flight, id: 'alcohol', name: 'Alcohol', hidden: true };
  const shown = shownDayEvents(
    [flight, alcohol],
    [event('2026-10-01'), event('2026-10-02', 'alcohol')],
  );
  expect(shown.types).toEqual([flight]);
  expect(shown.events.map((e) => e.typeId)).toEqual(['flight']);
});
