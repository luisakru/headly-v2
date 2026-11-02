import { addDays } from 'date-fns';
import { at, makeAttack, makeIntake, makeMedication, makePrevention } from '../test/factories';
import {
  isActivePrevention,
  preventionEffect,
  preventionOverlapsRange,
  validatePrevention,
} from './prevention';

const med = makeMedication();

/** Attacks every `interval` days starting at `start`, for `count` attacks. */
function attacksEvery(start: number, interval: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const day = addDays(start, i * interval);
    return makeAttack({
      startedAt: day.getTime() + 10 * 3600_000,
      endedAt: day.getTime() + 14 * 3600_000,
    });
  });
}

describe('preventionEffect', () => {
  const prevention = makePrevention({ startDate: '2026-04-01' });

  test('compares 90-day windows before and after the start', () => {
    // 90 days before: one attack every 5 days (18). 90 days after: one every 10 days (9).
    const attacks = [
      ...attacksEvery(at(2026, 1, 1), 5, 18),
      ...attacksEvery(at(2026, 4, 1), 10, 9),
    ];
    const intakes = attacks.map((a) =>
      makeIntake({ medicationId: med.id, takenAt: a.startedAt + 3600_000 }),
    );
    const effect = preventionEffect(prevention, attacks, intakes, at(2026, 9, 1));
    expect(effect?.windowDays).toBe(90);
    expect(effect?.migraineDaysPer30).toEqual({ before: 6, after: 3 });
    expect(effect?.medicationDaysPer30).toEqual({ before: 6, after: 3 });
  });

  test('shortens both windows to the available data', () => {
    const attacks = attacksEvery(at(2026, 2, 20), 5, 20);
    const effect = preventionEffect(prevention, attacks, [], at(2026, 9, 1));
    expect(effect?.windowDays).toBe(40);
  });

  test('is undefined with less than 30 days before the start', () => {
    const attacks = attacksEvery(at(2026, 3, 10), 5, 20);
    expect(preventionEffect(prevention, attacks, [], at(2026, 9, 1))).toBeUndefined();
  });

  test('is undefined with less than 30 days after the start', () => {
    const attacks = attacksEvery(at(2026, 1, 1), 5, 20);
    expect(preventionEffect(prevention, attacks, [], at(2026, 4, 20))).toBeUndefined();
  });

  test('stops the after window at the end date', () => {
    const ended = makePrevention({ startDate: '2026-04-01', endDate: '2026-05-10' });
    const attacks = attacksEvery(at(2026, 1, 1), 5, 40);
    expect(preventionEffect(ended, attacks, [], at(2026, 9, 1))?.windowDays).toBe(40);
  });

  test('is undefined without any data', () => {
    expect(preventionEffect(prevention, [], [], at(2026, 9, 1))).toBeUndefined();
  });

  test('starts the after window when the prevention is expected to work', () => {
    const delayed = makePrevention({ startDate: '2026-04-01', effectiveFrom: '2026-06-01' });
    // Before the start: one attack every 5 days. From June: one every 10 days.
    const attacks = [
      ...attacksEvery(at(2026, 1, 1), 5, 18),
      ...attacksEvery(at(2026, 4, 1), 2, 30),
      ...attacksEvery(at(2026, 6, 1), 10, 9),
    ];
    const effect = preventionEffect(delayed, attacks, [], at(2026, 10, 1));
    expect(effect?.windowDays).toBe(90);
    expect(effect?.after).toEqual({ start: at(2026, 6, 1), end: at(2026, 8, 30) });
    expect(effect?.migraineDaysPer30).toEqual({ before: 6, after: 3 });
  });

  test('is undefined with less than 30 days after the expected effect', () => {
    const delayed = makePrevention({ startDate: '2026-04-01', effectiveFrom: '2026-06-01' });
    const attacks = attacksEvery(at(2026, 1, 1), 5, 20);
    expect(preventionEffect(delayed, attacks, [], at(2026, 6, 20))).toBeUndefined();
  });
});

test('isActivePrevention', () => {
  const now = at(2026, 5, 10, 12);
  expect(isActivePrevention(makePrevention({ startDate: '2026-01-01' }), now)).toBe(true);
  expect(
    isActivePrevention(makePrevention({ startDate: '2026-01-01', endDate: '2026-06-01' }), now),
  ).toBe(true);
  expect(
    isActivePrevention(makePrevention({ startDate: '2026-01-01', endDate: '2026-05-10' }), now),
  ).toBe(false);
});

test('preventionOverlapsRange', () => {
  const range = { start: at(2026, 3, 1), end: at(2026, 4, 1) };
  expect(preventionOverlapsRange(makePrevention({ startDate: '2026-03-31' }), range)).toBe(true);
  expect(preventionOverlapsRange(makePrevention({ startDate: '2026-04-01' }), range)).toBe(false);
  expect(
    preventionOverlapsRange(
      makePrevention({ startDate: '2025-01-01', endDate: '2026-03-01' }),
      range,
    ),
  ).toBe(true);
  expect(
    preventionOverlapsRange(
      makePrevention({ startDate: '2025-01-01', endDate: '2026-02-28' }),
      range,
    ),
  ).toBe(false);
});

describe('validatePrevention', () => {
  test('accepts no end date or an end on or after the start', () => {
    expect(validatePrevention({ startDate: '2026-04-01' })).toBeUndefined();
    expect(validatePrevention({ startDate: '2026-04-01', endDate: '2026-04-01' })).toBeUndefined();
  });

  test('rejects an end before the start', () => {
    expect(validatePrevention({ startDate: '2026-04-01', endDate: '2026-03-31' })).toBe(
      'endBeforeStart',
    );
  });

  test('rejects an expected effect before the start', () => {
    expect(validatePrevention({ startDate: '2026-04-01', effectiveFrom: '2026-03-31' })).toBe(
      'effectiveBeforeStart',
    );
    expect(
      validatePrevention({ startDate: '2026-04-01', effectiveFrom: '2026-04-01' }),
    ).toBeUndefined();
  });
});
