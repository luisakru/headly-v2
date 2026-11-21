import { at, makeAttack } from '../test/factories';
import { startPattern } from './startPattern';

const range = { start: at(2026, 1, 1), end: at(2027, 1, 1) };
// 2026-03-02 is a Monday.
const attackOn = (day: number, hour: number) => makeAttack({ startedAt: at(2026, 3, day, hour) });
/** One attack per weekday and week, Monday to Sunday, at the given hours. */
const spread = (weeks: number, hours: number[]) =>
  Array.from({ length: weeks * 7 }, (_, i) => attackOn(2 + i, hours[i % hours.length]!));

test('says nothing with fewer than 15 attacks', () => {
  expect(startPattern(spread(2, [8]), range)).toBeUndefined();
});

test('says nothing when starts are spread evenly', () => {
  expect(startPattern(spread(3, [2, 8, 14, 20]), range)).toBeUndefined();
});

test('marks a part of the day with at least half of all starts', () => {
  const pattern = startPattern(spread(3, [8, 9, 14, 20]), range);
  expect(pattern?.dayParts).toEqual([0, 11, 5, 5]);
  expect(pattern?.notableDayParts).toEqual([1]);
});

test('marks a weekday with twice the usual starts', () => {
  const mondays = [9, 16, 23, 30].map((day) => attackOn(day, 14));
  const pattern = startPattern([...spread(2, [2, 8, 14, 20]), ...mondays], range);
  expect(pattern?.weekdays[0]).toBe(6);
  expect(pattern?.notableWeekdays).toEqual([0]);
});

test('marks the weekend when Saturday and Sunday together stand out', () => {
  const weekends = [7, 8, 14, 15, 21, 22].map((day) => attackOn(day, 14));
  const pattern = startPattern([...spread(2, [2, 8, 14, 20]), ...weekends], range);
  expect(pattern?.notableWeekdays).toEqual([5, 6]);
});
