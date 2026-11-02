import { at } from '../test/factories';
import { lookbackRange, monthsInRange, previousRange } from './dateRange';

const now = at(2026, 3, 15, 12);

test('lookbackRange counts back from the end of today', () => {
  expect(lookbackRange('1W', now, undefined)).toEqual({
    start: at(2026, 3, 9),
    end: at(2026, 3, 16),
  });
  expect(lookbackRange('3M', now, undefined)).toEqual({
    start: at(2025, 12, 16),
    end: at(2026, 3, 16),
  });
  expect(lookbackRange('all', now, at(2024, 5, 3, 9))).toEqual({
    start: at(2024, 5, 3),
    end: at(2026, 3, 16),
  });
});

test('monthsInRange lists the calendar months a range touches', () => {
  expect(monthsInRange({ start: at(2026, 1, 20), end: at(2026, 3, 2) })).toHaveLength(3);
});

test('previousRange has the same number of days directly before', () => {
  expect(previousRange({ start: at(2026, 3, 1), end: at(2026, 3, 16) })).toEqual({
    start: at(2026, 2, 14),
    end: at(2026, 3, 1),
  });
});
