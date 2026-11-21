import { at, makeIntake, makeMedication } from '../test/factories';
import { nextIntakeAt } from './nextIntake';

const sumatriptan = makeMedication({ name: 'Sumatriptan', minIntervalHours: 2 });
const intakes = [
  makeIntake({ medicationId: sumatriptan.id, takenAt: at(2026, 3, 5, 7) }),
  makeIntake({ medicationId: sumatriptan.id, takenAt: at(2026, 3, 5, 9, 15) }),
];

test('is the latest intake plus the interval while that is ahead', () => {
  expect(nextIntakeAt(sumatriptan, intakes, at(2026, 3, 5, 10))).toBe(at(2026, 3, 5, 11, 15));
});

test('is undefined once the time has come', () => {
  expect(nextIntakeAt(sumatriptan, intakes, at(2026, 3, 5, 11, 15))).toBeUndefined();
});

test('is undefined without an interval or intakes', () => {
  expect(nextIntakeAt(makeMedication(), intakes, at(2026, 3, 5, 10))).toBeUndefined();
  expect(nextIntakeAt(sumatriptan, [], at(2026, 3, 5, 10))).toBeUndefined();
});
