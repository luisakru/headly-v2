import { at } from '../test/factories';
import { countMonths, monthsInRange, previousRange, resolveDateRange } from './dateRange';

const now = at(2026, 3, 15, 12);

test('3M covers the current and two previous calendar months', () => {
  expect(resolveDateRange({ preset: '3M' }, now)).toEqual({
    start: at(2026, 1, 1),
    end: at(2026, 4, 1),
  });
});

test('1Y crosses the year boundary', () => {
  expect(resolveDateRange({ preset: '1Y' }, now)).toEqual({
    start: at(2025, 4, 1),
    end: at(2026, 4, 1),
  });
});

test('custom range includes both months, in either order', () => {
  const expected = { start: at(2024, 11, 1), end: at(2026, 3, 1) };
  expect(
    resolveDateRange({ preset: 'custom', fromMonth: '2024-11', toMonth: '2026-02' }, now),
  ).toEqual(expected);
  expect(
    resolveDateRange({ preset: 'custom', fromMonth: '2026-02', toMonth: '2024-11' }, now),
  ).toEqual(expected);
});

test('monthsInRange and countMonths agree', () => {
  const range = resolveDateRange({ preset: '6M' }, now);
  expect(monthsInRange(range)).toHaveLength(6);
  expect(countMonths(range)).toBe(6);
});

test('previousRange has the same length directly before', () => {
  expect(previousRange({ start: at(2026, 1, 1), end: at(2026, 4, 1) })).toEqual({
    start: at(2025, 10, 1),
    end: at(2026, 1, 1),
  });
});
