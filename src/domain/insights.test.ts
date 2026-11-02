import {
  at,
  attacksOnDays,
  makeAttack,
  makeIntake,
  makeMedication,
  makePrevention,
} from '../test/factories';
import { generateInsights, type InsightInput } from './insights';
import type { Attack, Effectiveness } from './types';

// Current range: 1 Apr – 29 Jun 2026 (90 days). Previous range: Jan–Mar 2026 (90 days).
const range = { start: at(2026, 4, 1), end: at(2026, 6, 30) };
const now = at(2026, 6, 29, 12);
const empty: InsightInput = {
  attacks: [],
  intakes: [],
  medications: [],
  preventions: [],
  range,
  now,
};

/** `perMonth` one-day attacks in each month from `firstMonth`, on days 1, 3, 5… */
function monthlyAttacks(
  firstMonth: number,
  months: number,
  perMonth: number,
  painLevel?: number,
): Attack[] {
  return Array.from({ length: months }).flatMap((_, m) =>
    attacksOnDays(
      Array.from({ length: perMonth }, (_, i) => [2026, firstMonth + m, 1 + i * 2]),
    ).map((attack) => ({ ...attack, painLevel })),
  );
}

test('returns nothing without data', () => {
  expect(generateInsights(empty)).toEqual([]);
});

describe('migraineDaysChange', () => {
  test('appears when migraine days per month changed by at least one', () => {
    const attacks = [...monthlyAttacks(1, 3, 6), ...monthlyAttacks(4, 3, 4)];
    expect(generateInsights({ ...empty, attacks })).toContainEqual(
      expect.objectContaining({ kind: 'migraineDaysChange', before: 6, after: 4 }),
    );
  });

  test('is hidden when the change is below one day', () => {
    const attacks = [...monthlyAttacks(1, 3, 4), ...monthlyAttacks(4, 3, 4)];
    expect(generateInsights({ ...empty, attacks }).map((i) => i.kind)).not.toContain(
      'migraineDaysChange',
    );
  });

  test('is hidden when data does not cover the previous range', () => {
    const attacks = [...monthlyAttacks(2, 2, 6), ...monthlyAttacks(4, 3, 4)];
    expect(generateInsights({ ...empty, attacks })).toEqual([]);
  });
});

describe('fewerButStrongerAttacks', () => {
  test('appears with fewer attacks but higher average pain', () => {
    const attacks = [...monthlyAttacks(1, 3, 5, 5), ...monthlyAttacks(4, 3, 3, 7)];
    const insight = generateInsights({ ...empty, attacks }).find(
      (i) => i.kind === 'fewerButStrongerAttacks',
    );
    expect(insight).toEqual({ kind: 'fewerButStrongerAttacks', painIncrease: 2 });
  });

  test('is hidden when pain rose by less than half a point', () => {
    const attacks = [...monthlyAttacks(1, 3, 5, 5), ...monthlyAttacks(4, 3, 3, 5)];
    expect(generateInsights({ ...empty, attacks }).map((i) => i.kind)).not.toContain(
      'fewerButStrongerAttacks',
    );
  });

  test('is hidden when there are not fewer attacks', () => {
    const attacks = [...monthlyAttacks(1, 3, 3, 5), ...monthlyAttacks(4, 3, 3, 8)];
    expect(generateInsights({ ...empty, attacks }).map((i) => i.kind)).not.toContain(
      'fewerButStrongerAttacks',
    );
  });
});

describe('preventionMedicationDaysChange', () => {
  const med = makeMedication();
  const prevention = makePrevention({ name: 'Amitriptyline', startDate: '2026-04-01' });

  function intakesForAttacks(attacks: Attack[]) {
    return attacks.map((a) =>
      makeIntake({ medicationId: med.id, takenAt: a.startedAt + 3600_000 }),
    );
  }

  test('appears when medication days changed by at least 10%', () => {
    const attacks = [...monthlyAttacks(1, 3, 5), ...monthlyAttacks(4, 3, 3)];
    const insight = generateInsights({
      ...empty,
      attacks,
      intakes: intakesForAttacks(attacks),
      medications: [med],
      preventions: [prevention],
    }).find((i) => i.kind === 'preventionMedicationDaysChange');
    expect(insight).toMatchObject({ preventionName: 'Amitriptyline' });
    expect(insight?.kind === 'preventionMedicationDaysChange' && insight.change).toBeCloseTo(
      -0.4,
      1,
    );
  });

  test('is hidden when the prevention lacks data', () => {
    const recent = makePrevention({ startDate: '2026-06-20' });
    const attacks = [...monthlyAttacks(1, 3, 5), ...monthlyAttacks(4, 3, 3)];
    const kinds = generateInsights({
      ...empty,
      attacks,
      intakes: intakesForAttacks(attacks),
      preventions: [recent],
    }).map((i) => i.kind);
    expect(kinds).not.toContain('preventionMedicationDaysChange');
  });

  test('is hidden for a prevention outside the range', () => {
    const old = makePrevention({ startDate: '2025-06-01', endDate: '2025-12-31' });
    const attacks = monthlyAttacks(1, 6, 4);
    const kinds = generateInsights({
      ...empty,
      attacks,
      intakes: intakesForAttacks(attacks),
      preventions: [old],
    }).map((i) => i.kind);
    expect(kinds).not.toContain('preventionMedicationDaysChange');
  });
});

describe('medicationEffectivenessChange', () => {
  const sumatriptan = makeMedication({ name: 'Sumatriptan', isTriptan: true });

  function ratedIntakes(month: number, ratings: Effectiveness[]) {
    return ratings.map((effectiveness, i) =>
      makeIntake({
        medicationId: sumatriptan.id,
        takenAt: at(2026, month, i + 1, 9),
        effectiveness,
      }),
    );
  }

  const input = (before: Effectiveness[], after: Effectiveness[]): InsightInput => ({
    ...empty,
    attacks: [makeAttack({ startedAt: at(2026, 1, 1, 8), endedAt: at(2026, 1, 1, 9) })],
    intakes: [...ratedIntakes(2, before), ...ratedIntakes(5, after)],
    medications: [sumatriptan],
  });

  test('appears when the rate changed by at least 10 points', () => {
    const insight = generateInsights(
      input(
        ['strong', 'strong', 'strong', 'strong', 'strong'],
        ['strong', 'strong', 'strong', 'none', 'none'],
      ),
    ).find((i) => i.kind === 'medicationEffectivenessChange');
    expect(insight).toMatchObject({
      kind: 'medicationEffectivenessChange',
      medicationName: 'Sumatriptan',
      before: 1,
      after: 0.6,
    });
  });

  test('is hidden with fewer than 5 rated intakes', () => {
    const kinds = generateInsights(
      input(['strong', 'strong', 'strong', 'strong', 'strong'], ['none', 'none', 'none', 'none']),
    ).map((i) => i.kind);
    expect(kinds).not.toContain('medicationEffectivenessChange');
  });

  test('is hidden when the rate barely changed', () => {
    const same: Effectiveness[] = ['strong', 'slight', 'strong', 'none', 'strong'];
    expect(generateInsights(input(same, same)).map((i) => i.kind)).not.toContain(
      'medicationEffectivenessChange',
    );
  });
});

describe('preventionEffectChange', () => {
  // Active since 1 Jan 2026, expected to work from the start.
  const prevention = makePrevention({ name: 'Aquipta', startDate: '2026-01-01' });
  const now = at(2026, 7, 15, 12);
  const daysFrom = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) =>
      makeAttack({
        startedAt: start + i * 86_400_000 * 2,
        endedAt: start + i * 86_400_000 * 2 + 3600_000,
      }),
    );

  test('appears when the latest 90 days differ from the first 90 days', () => {
    // First 90 days: 3 per 30 days. Latest 90 days: 6 per 30 days.
    const attacks = [
      ...daysFrom(at(2025, 12, 1, 10), 6),
      ...daysFrom(at(2026, 1, 1, 10), 3),
      ...daysFrom(at(2026, 1, 31, 10), 3),
      ...daysFrom(at(2026, 3, 2, 10), 3),
      ...daysFrom(at(2026, 4, 1, 10), 6),
      ...daysFrom(at(2026, 5, 1, 10), 6),
      ...daysFrom(at(2026, 5, 31, 10), 6),
    ];
    const insight = generateInsights({ ...empty, attacks, preventions: [prevention], now }).find(
      (i) => i.kind === 'preventionEffectChange',
    );
    expect(insight).toMatchObject({
      kind: 'preventionEffectChange',
      preventionName: 'Aquipta',
      early: 3,
      recent: 6,
      earlyRange: { start: at(2026, 1, 1), end: at(2026, 4, 1) },
      recentRange: { start: at(2026, 4, 1), end: at(2026, 6, 30) },
    });
  });

  test('needs six full blocks and an active prevention', () => {
    const attacks = daysFrom(at(2026, 1, 1, 10), 20);
    const early = generateInsights({
      ...empty,
      attacks,
      preventions: [prevention],
      now: at(2026, 6, 1),
    });
    expect(early.map((i) => i.kind)).not.toContain('preventionEffectChange');
    const ended = makePrevention({ startDate: '2026-01-01', endDate: '2026-07-01' });
    const kinds = generateInsights({ ...empty, attacks, preventions: [ended], now }).map(
      (i) => i.kind,
    );
    expect(kinds).not.toContain('preventionEffectChange');
  });
});
