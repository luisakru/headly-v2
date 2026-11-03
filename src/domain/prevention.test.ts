import { addDays } from 'date-fns';
import { at, makeAttack, makeIntake, makeMedication, makePrevention } from '../test/factories';
import {
  isActivePrevention,
  preventionEffect,
  preventionEffectGap,
  preventionChart,
  preventionTrend,
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

  test('compares short windows down to 14 days', () => {
    const attacks = attacksEvery(at(2026, 3, 10), 5, 20);
    expect(preventionEffect(prevention, attacks, [], at(2026, 9, 1))?.windowDays).toBe(22);
  });

  test('is undefined with less than 14 days before the start', () => {
    const attacks = attacksEvery(at(2026, 3, 20), 5, 20);
    expect(preventionEffect(prevention, attacks, [], at(2026, 9, 1))).toBeUndefined();
  });

  test('is undefined with less than 14 days after the start', () => {
    const attacks = attacksEvery(at(2026, 1, 1), 5, 20);
    expect(preventionEffect(prevention, attacks, [], at(2026, 4, 10))).toBeUndefined();
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

  test('is undefined with less than 14 days after the expected effect', () => {
    const delayed = makePrevention({ startDate: '2026-04-01', effectiveFrom: '2026-06-01' });
    const attacks = attacksEvery(at(2026, 1, 1), 5, 20);
    expect(preventionEffect(delayed, attacks, [], at(2026, 6, 10))).toBeUndefined();
  });
});

describe('preventionEffectGap', () => {
  const prevention = makePrevention({ startDate: '2026-04-01' });
  const attacks = attacksEvery(at(2026, 1, 1), 5, 20);

  test('is undefined when there is an effect', () => {
    expect(preventionEffectGap(prevention, attacks, [], at(2026, 9, 1))).toBeUndefined();
  });

  test('names the missing data', () => {
    expect(preventionEffectGap(prevention, [], [], at(2026, 9, 1))).toEqual({ reason: 'noData' });
    expect(
      preventionEffectGap(prevention, attacksEvery(at(2026, 3, 25), 1, 3), [], at(2026, 9, 1)),
    ).toEqual({ reason: 'shortBefore', days: 7 });
    expect(preventionEffectGap(prevention, attacks, [], at(2026, 4, 10))).toEqual({
      reason: 'shortAfter',
      days: 9,
    });
  });

  test('names the expected effect when it shortens the comparison', () => {
    const delayed = makePrevention({ startDate: '2026-04-01', effectiveFrom: '2026-04-05' });
    expect(preventionEffectGap(delayed, attacks, [], at(2026, 4, 12))).toEqual({
      reason: 'shortAfterEffective',
      days: 7,
    });
  });

  test('flags an expected effect after the end', () => {
    const odd = makePrevention({
      startDate: '2026-04-01',
      effectiveFrom: '2026-06-01',
      endDate: '2026-05-01',
    });
    expect(preventionEffectGap(odd, attacks, [], at(2026, 9, 1))).toEqual({
      reason: 'effectiveAfterEnd',
    });
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

describe('preventionTrend', () => {
  const prevention = makePrevention({ startDate: '2026-04-01', effectiveFrom: '2026-05-01' });

  test('counts migraine days per full 30-day block from the expected effect', () => {
    // Before the start: every 5 days. From 1 May: every 3 days, then every 10 days from 31 May.
    const attacks = [
      ...attacksEvery(at(2026, 1, 1), 5, 18),
      ...attacksEvery(at(2026, 5, 1), 3, 10),
      ...attacksEvery(at(2026, 5, 31), 10, 6),
    ];
    const trend = preventionTrend(prevention, attacks, [], at(2026, 7, 15));
    expect(trend?.baseline?.migraineDaysPer30).toBe(6);
    expect(trend?.blocks).toEqual([
      { range: { start: at(2026, 5, 1), end: at(2026, 5, 31) }, migraineDays: 10 },
      { range: { start: at(2026, 5, 31), end: at(2026, 6, 30) }, migraineDays: 3 },
    ]);
  });

  test('has no baseline with less than 14 days before the start', () => {
    const attacks = attacksEvery(at(2026, 3, 25), 5, 20);
    const trend = preventionTrend(prevention, attacks, [], at(2026, 7, 15));
    expect(trend?.baseline).toBeUndefined();
    expect(trend?.blocks).toHaveLength(2);
  });
});

describe('preventionChart', () => {
  test('shows 90 days before, the build-up, the effect and 90 days after the end', () => {
    const prevention = makePrevention({
      startDate: '2026-04-01',
      effectiveFrom: '2026-05-01',
      endDate: '2026-06-29',
    });
    // Every 5 days from 1 Jan, i.e. 6 per 30 days.
    const attacks = attacksEvery(at(2026, 1, 1), 5, 60);
    const chart = preventionChart(prevention, attacks, [], at(2026, 11, 1));
    expect(chart?.blocks.map((block) => block.phase)).toEqual([
      'before',
      'before',
      'before',
      'buildUp',
      'effective',
      'effective',
      'after',
      'after',
      'after',
    ]);
    expect(chart?.blocks[0]?.range).toEqual({ start: at(2026, 1, 1), end: at(2026, 1, 31) });
    expect(chart?.blocks[6]?.range.start).toBe(at(2026, 6, 30));
    expect(chart?.baseline).toBe(6);
  });

  test('keeps a short prevention as one scaled block', () => {
    const prevention = makePrevention({ startDate: '2026-04-01', endDate: '2026-04-10' });
    // 5 migraine days in the 10 days of the prevention.
    const attacks = [...attacksEvery(at(2026, 1, 1), 10, 9), ...attacksEvery(at(2026, 4, 1), 2, 5)];
    const chart = preventionChart(prevention, attacks, [], at(2026, 4, 20));
    const during = chart?.blocks.filter((block) => block.phase === 'effective');
    expect(during).toEqual([
      {
        phase: 'effective',
        range: { start: at(2026, 4, 1), end: at(2026, 4, 11) },
        migraineDaysPer30: 15,
      },
    ]);
    // Only 9 days after the end so far: too short for a block.
    expect(chart?.blocks.some((block) => block.phase === 'after')).toBe(false);
  });

  test('uses 60-day blocks for long preventions', () => {
    const prevention = makePrevention({ startDate: '2023-01-01' });
    const attacks = attacksEvery(at(2022, 10, 1), 5, 300);
    const chart = preventionChart(prevention, attacks, [], at(2026, 11, 1));
    const first = chart!.blocks.find((block) => block.phase === 'effective')!;
    expect(first.range).toEqual({ start: at(2023, 1, 1), end: at(2023, 3, 2) });
  });
});
