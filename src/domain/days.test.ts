import { at, makeAttack, makeIntake, makeMedication } from '../test/factories';
import { attackDayKeys, countDaysInRange, migraineDays, triptanDays } from './days';

describe('attackDayKeys', () => {
  test('counts a single day', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 9), endedAt: at(2026, 3, 5, 18) });
    expect(attackDayKeys(attack, at(2026, 4, 1))).toEqual(['2026-03-05']);
  });

  test('counts both days when an attack crosses midnight', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 22), endedAt: at(2026, 3, 6, 3) });
    expect(attackDayKeys(attack, at(2026, 4, 1))).toEqual(['2026-03-05', '2026-03-06']);
  });

  test('does not count the next day when an attack ends exactly at midnight', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 20), endedAt: at(2026, 3, 6, 0) });
    expect(attackDayKeys(attack, at(2026, 4, 1))).toEqual(['2026-03-05']);
  });

  test('counts across a month and year boundary', () => {
    const attack = makeAttack({ startedAt: at(2025, 12, 31, 20), endedAt: at(2026, 1, 1, 8) });
    expect(attackDayKeys(attack, at(2026, 2, 1))).toEqual(['2025-12-31', '2026-01-01']);
  });

  test('counts an active attack up to today', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 22) });
    expect(attackDayKeys(attack, at(2026, 3, 7, 9))).toEqual([
      '2026-03-05',
      '2026-03-06',
      '2026-03-07',
    ]);
  });

  test('handles the daylight saving switch', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 28, 22), endedAt: at(2026, 3, 29, 12) });
    expect(attackDayKeys(attack, at(2026, 4, 1))).toEqual(['2026-03-28', '2026-03-29']);
  });
});

test('migraineDays merges days of several attacks', () => {
  const attacks = [
    makeAttack({ startedAt: at(2026, 3, 5, 6), endedAt: at(2026, 3, 5, 9) }),
    makeAttack({ startedAt: at(2026, 3, 5, 20), endedAt: at(2026, 3, 6, 2) }),
  ];
  expect([...migraineDays(attacks, at(2026, 4, 1))].sort()).toEqual(['2026-03-05', '2026-03-06']);
});

test('countDaysInRange splits an attack across months', () => {
  const days = migraineDays(
    [makeAttack({ startedAt: at(2026, 1, 31, 20), endedAt: at(2026, 2, 1, 6) })],
    at(2026, 3, 1),
  );
  expect(countDaysInRange(days, { start: at(2026, 1, 1), end: at(2026, 2, 1) })).toBe(1);
  expect(countDaysInRange(days, { start: at(2026, 2, 1), end: at(2026, 3, 1) })).toBe(1);
});

test('triptanDays only counts triptan intakes', () => {
  const triptan = makeMedication({ name: 'Sumatriptan', isTriptan: true });
  const other = makeMedication();
  const intakes = [
    makeIntake({ medicationId: triptan.id, takenAt: at(2026, 3, 1, 9) }),
    makeIntake({ medicationId: triptan.id, takenAt: at(2026, 3, 1, 15) }),
    makeIntake({ medicationId: other.id, takenAt: at(2026, 3, 2, 9) }),
  ];
  expect([...triptanDays(intakes, [triptan, other])]).toEqual(['2026-03-01']);
});
