import { at, attacksOnDays, makeAttack, makeIntake, makeMedication } from '../test/factories';
import {
  averageMigraineDaysPerMonth,
  averagePainMax,
  effectivenessSummary,
  monthlyCounts,
  overuseMonths,
  totalMedicationDays,
} from './stats';

const range = { start: at(2026, 1, 1), end: at(2026, 3, 1) };
const now = at(2026, 3, 15);

test('monthlyCounts counts migraine and medication days per month', () => {
  const attacks = [
    ...attacksOnDays([
      [2026, 1, 3],
      [2026, 1, 10],
      [2026, 2, 5],
    ]),
    makeAttack({ startedAt: at(2026, 1, 31, 22), endedAt: at(2026, 2, 1, 4) }),
  ];
  const med = makeMedication();
  const intakes = [
    makeIntake({ medicationId: med.id, takenAt: at(2026, 1, 3, 11) }),
    makeIntake({ medicationId: med.id, takenAt: at(2026, 1, 3, 18) }),
    makeIntake({ medicationId: med.id, takenAt: at(2026, 2, 20, 9) }),
  ];
  expect(monthlyCounts(attacks, intakes, range, now)).toEqual([
    { month: '2026-01', migraineDays: 3, medicationDays: 1 },
    { month: '2026-02', migraineDays: 2, medicationDays: 1 },
  ]);
  expect(averageMigraineDaysPerMonth(attacks, range, now)).toBe(2.5);
  expect(totalMedicationDays(intakes, range)).toBe(2);
});

describe('effectivenessSummary', () => {
  const med = makeMedication();
  const intake = (day: number, effectiveness?: 'strong' | 'slight' | 'none' | 'worse') =>
    makeIntake({ medicationId: med.id, takenAt: at(2026, 1, day, 9), effectiveness });

  test('counts strong and slight as helpful and excludes unrated', () => {
    const intakes = [
      intake(1, 'strong'),
      intake(2, 'slight'),
      intake(3, 'none'),
      intake(4, 'worse'),
      intake(5),
    ];
    expect(effectivenessSummary(intakes, range)).toEqual({ rate: 0.5, rated: 4, unrated: 1 });
  });

  test('has no rate when nothing is rated', () => {
    expect(effectivenessSummary([intake(1)], range)).toEqual({
      rate: undefined,
      rated: 0,
      unrated: 1,
    });
  });

  test('ignores intakes outside the range', () => {
    const outside = makeIntake({
      medicationId: med.id,
      takenAt: at(2026, 3, 2),
      effectiveness: 'none',
    });
    expect(effectivenessSummary([intake(1, 'strong'), outside], range).rate).toBe(1);
  });
});

test('averagePainMax uses rated attacks that started in the range', () => {
  const attacks = [
    makeAttack({ startedAt: at(2026, 1, 2), endedAt: at(2026, 1, 2, 5), painMax: 6 }),
    makeAttack({ startedAt: at(2026, 1, 9), endedAt: at(2026, 1, 9, 5), painMax: 9 }),
    makeAttack({ startedAt: at(2026, 1, 12), endedAt: at(2026, 1, 12, 5) }),
    makeAttack({ startedAt: at(2025, 12, 5), endedAt: at(2025, 12, 5, 5), painMax: 2 }),
  ];
  expect(averagePainMax(attacks, range)).toBe(7.5);
  expect(averagePainMax([], range)).toBeUndefined();
});

describe('overuseMonths', () => {
  const triptan = makeMedication({ isTriptan: true });
  const other = makeMedication();
  const daily = (medicationId: string, month: number, days: number) =>
    Array.from({ length: days }, (_, i) =>
      makeIntake({ medicationId, takenAt: at(2026, month, i + 1, 9) }),
    );

  test('flags 10 triptan days in a month', () => {
    const result = overuseMonths(daily(triptan.id, 1, 10), [triptan, other], range);
    expect(result).toEqual([{ month: '2026-01', triptanDays: 10, medicationDays: 10 }]);
  });

  test('does not flag 9 triptan days', () => {
    expect(overuseMonths(daily(triptan.id, 1, 9), [triptan, other], range)).toEqual([]);
  });

  test('flags 15 medication days of any kind', () => {
    const result = overuseMonths(daily(other.id, 2, 15), [triptan, other], range);
    expect(result).toEqual([{ month: '2026-02', triptanDays: 0, medicationDays: 15 }]);
  });

  test('does not flag 14 medication days', () => {
    expect(overuseMonths(daily(other.id, 2, 14), [triptan, other], range)).toEqual([]);
  });
});
