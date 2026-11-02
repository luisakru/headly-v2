import { at, makeAttack, makeIntake, makeMedication } from '../test/factories';
import { chartBuckets, chartPages, chartScale, labelStep } from './chart';

test('an empty chart still has one interval', () => {
  expect(chartScale(0)).toEqual({ max: 1, ticks: [0, 1] });
});

test('small values use steps of one', () => {
  expect(chartScale(3)).toEqual({ max: 3, ticks: [0, 1, 2, 3] });
  expect(chartScale(4)).toEqual({ max: 4, ticks: [0, 1, 2, 3, 4] });
});

test('larger values round up to a round step', () => {
  expect(chartScale(7)).toEqual({ max: 8, ticks: [0, 2, 4, 6, 8] });
  expect(chartScale(14)).toEqual({ max: 15, ticks: [0, 5, 10, 15] });
  expect(chartScale(31)).toEqual({ max: 40, ticks: [0, 10, 20, 30, 40] });
});

test('labels thin out for long pages', () => {
  expect(labelStep(7)).toBe(1);
  expect(labelStep(12)).toBe(2);
  expect(labelStep(13)).toBe(2);
  expect(labelStep(24)).toBe(4);
  expect(labelStep(31)).toBe(5);
});

describe('chartPages', () => {
  // Monday, 2 November 2026.
  const now = at(2026, 11, 2, 12);

  test('1W pages are calendar weeks back to the first data', () => {
    expect(chartPages('1W', now, at(2026, 10, 20))).toEqual([
      { start: at(2026, 10, 19), end: at(2026, 10, 26) },
      { start: at(2026, 10, 26), end: at(2026, 11, 2) },
      { start: at(2026, 11, 2), end: at(2026, 11, 9) },
    ]);
  });

  test('1M pages are calendar months', () => {
    expect(chartPages('1M', now, at(2026, 10, 15))).toEqual([
      { start: at(2026, 10, 1), end: at(2026, 11, 1) },
      { start: at(2026, 11, 1), end: at(2026, 12, 1) },
    ]);
  });

  test('3M pages are 13 weeks ending with the current week', () => {
    expect(chartPages('3M', now, at(2026, 10, 1))).toEqual([
      { start: at(2026, 8, 10), end: at(2026, 11, 9) },
    ]);
  });

  test('1Y pages end with the current month', () => {
    expect(chartPages('1Y', now, at(2025, 6, 1))).toEqual([
      { start: at(2024, 12, 1), end: at(2025, 12, 1) },
      { start: at(2025, 12, 1), end: at(2026, 12, 1) },
    ]);
  });

  test('all is one page from the first month with data', () => {
    expect(chartPages('all', now, at(2024, 3, 15))).toEqual([
      { start: at(2024, 3, 1), end: at(2026, 12, 1) },
    ]);
  });

  test('without data only the current page remains', () => {
    expect(chartPages('1W', now, undefined)).toHaveLength(1);
  });
});

describe('chartBuckets', () => {
  const now = at(2026, 11, 2, 12);
  const med = makeMedication();
  const attacks = [
    makeAttack({ startedAt: at(2026, 10, 27, 8), endedAt: at(2026, 10, 27, 12), painLevel: 4 }),
    makeAttack({ startedAt: at(2026, 10, 27, 18), endedAt: at(2026, 10, 27, 20), painLevel: 7 }),
    makeAttack({ startedAt: at(2026, 10, 29, 8), endedAt: at(2026, 10, 29, 9) }),
  ];
  const intakes = [makeIntake({ medicationId: med.id, takenAt: at(2026, 10, 29, 9) })];

  test('day buckets carry the highest pain of the day', () => {
    const week = { start: at(2026, 10, 26), end: at(2026, 11, 2) };
    const buckets = chartBuckets(week, 'day', attacks, intakes, now);
    expect(buckets).toHaveLength(7);
    expect(buckets[1]).toMatchObject({ migraineDays: 1, medicationDays: 0, pain: 7 });
    expect(buckets[3]).toMatchObject({ migraineDays: 1, medicationDays: 1 });
    expect(buckets[3]?.pain).toBeUndefined();
    expect(buckets[0]).toMatchObject({ migraineDays: 0, medicationDays: 0 });
  });

  test('week and month buckets count days', () => {
    const page = { start: at(2026, 10, 26), end: at(2026, 11, 9) };
    expect(
      chartBuckets(page, 'week', attacks, intakes, now).map((bucket) => bucket.migraineDays),
    ).toEqual([2, 0]);
    const months = { start: at(2026, 10, 1), end: at(2026, 12, 1) };
    expect(
      chartBuckets(months, 'month', attacks, intakes, now).map((bucket) => bucket.medicationDays),
    ).toEqual([1, 0]);
  });
});
