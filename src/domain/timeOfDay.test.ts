import { at } from '../test/factories';
import { timeOfDay } from './timeOfDay';

test('splits the day into morning, day, evening and night', () => {
  expect(timeOfDay(at(2026, 3, 5, 5))).toBe('morning');
  expect(timeOfDay(at(2026, 3, 5, 11))).toBe('day');
  expect(timeOfDay(at(2026, 3, 5, 18))).toBe('evening');
  expect(timeOfDay(at(2026, 3, 5, 22))).toBe('night');
  expect(timeOfDay(at(2026, 3, 5, 2))).toBe('night');
});
