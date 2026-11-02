import {
  INSIGHT_MIN_EFFECTIVENESS_CHANGE,
  INSIGHT_MIN_MIGRAINE_DAYS_CHANGE,
  INSIGHT_MIN_PAIN_INCREASE,
  INSIGHT_MIN_PREVENTION_CHANGE,
  INSIGHT_MIN_RATED_INTAKES,
  PREVENTION_CHANGE_BLOCKS,
  PREVENTION_WINDOW_RELIABLE_DAYS,
} from './constants';
import { previousRange } from './dateRange';
import {
  firstDataDay,
  isActivePrevention,
  preventionEffect,
  preventionOverlapsRange,
  preventionTrend,
  type PreventionEffect,
  type PreventionTrend,
} from './prevention';
import {
  averageMigraineDaysPerMonth,
  averagePain,
  countAttacksStartedIn,
  effectivenessSummary,
} from './stats';
import type { Attack, Medication, MedicationIntake, Prevention, TimeRange } from './types';

/** Structured insight; the sentence is built from locale templates. */
export type Insight =
  | {
      kind: 'migraineDaysChange';
      before: number;
      after: number;
      previousRange: TimeRange;
      range: TimeRange;
    }
  | {
      kind: 'preventionMedicationDaysChange';
      preventionName: string;
      change: number;
      effect: PreventionEffect;
    }
  | {
      kind: 'medicationEffectivenessChange';
      medicationName: string;
      before: number;
      after: number;
      previousRange: TimeRange;
      range: TimeRange;
    }
  | {
      kind: 'preventionEffectChange';
      preventionName: string;
      /** Migraine days per 30 days in the first and the latest 90 days. */
      early: number;
      recent: number;
      earlyRange: TimeRange;
      recentRange: TimeRange;
      baseline?: { range: TimeRange; migraineDaysPer30: number };
    }
  | { kind: 'fewerButStrongerAttacks'; painIncrease: number };

export type InsightInput = {
  attacks: Attack[];
  intakes: MedicationIntake[];
  medications: Medication[];
  preventions: Prevention[];
  range: TimeRange;
  now: number;
};

function migraineDaysChange({ attacks, range, now }: InsightInput, previous: TimeRange): Insight[] {
  const before = averageMigraineDaysPerMonth(attacks, previous, now);
  const after = averageMigraineDaysPerMonth(attacks, range, now);
  if (Math.abs(after - before) < INSIGHT_MIN_MIGRAINE_DAYS_CHANGE) return [];
  return [{ kind: 'migraineDaysChange', before, after, previousRange: previous, range }];
}

function preventionChanges({ attacks, intakes, preventions, range, now }: InsightInput): Insight[] {
  return preventions
    .filter((prevention) => preventionOverlapsRange(prevention, range))
    .flatMap((prevention): Insight[] => {
      const effect = preventionEffect(prevention, attacks, intakes, now);
      if (
        !effect ||
        effect.windowDays < PREVENTION_WINDOW_RELIABLE_DAYS ||
        effect.medicationDaysPer30.before === 0
      )
        return [];
      const { before, after } = effect.medicationDaysPer30;
      const change = (after - before) / before;
      if (Math.abs(change) < INSIGHT_MIN_PREVENTION_CHANGE) return [];
      return [
        {
          kind: 'preventionMedicationDaysChange',
          preventionName: prevention.name,
          change,
          effect,
        },
      ];
    });
}

/** Active preventions whose effect is now clearly weaker or stronger than at the start. */
function preventionEffectChanges({ attacks, intakes, preventions, now }: InsightInput): Insight[] {
  return preventions
    .filter((prevention) => isActivePrevention(prevention, now))
    .flatMap((prevention): Insight[] => {
      const trend = preventionTrend(prevention, attacks, intakes, now);
      if (!trend || trend.blocks.length < 2 * PREVENTION_CHANGE_BLOCKS) return [];
      const average = (blocks: PreventionTrend['blocks']) =>
        blocks.reduce((sum, block) => sum + block.migraineDays, 0) / blocks.length;
      const span = (blocks: PreventionTrend['blocks']) => ({
        start: blocks[0]!.range.start,
        end: blocks[blocks.length - 1]!.range.end,
      });
      const earlyBlocks = trend.blocks.slice(0, PREVENTION_CHANGE_BLOCKS);
      const recentBlocks = trend.blocks.slice(-PREVENTION_CHANGE_BLOCKS);
      const early = average(earlyBlocks);
      const recent = average(recentBlocks);
      if (Math.abs(recent - early) < INSIGHT_MIN_MIGRAINE_DAYS_CHANGE) return [];
      return [
        {
          kind: 'preventionEffectChange',
          preventionName: prevention.name,
          early,
          recent,
          earlyRange: span(earlyBlocks),
          recentRange: span(recentBlocks),
          ...(trend.baseline && { baseline: trend.baseline }),
        },
      ];
    });
}

function effectivenessChanges(
  { intakes, medications, range }: InsightInput,
  previous: TimeRange,
): Insight[] {
  return medications.flatMap((medication): Insight[] => {
    const own = intakes.filter((intake) => intake.medicationId === medication.id);
    const before = effectivenessSummary(own, previous);
    const after = effectivenessSummary(own, range);
    if (before.rated < INSIGHT_MIN_RATED_INTAKES || after.rated < INSIGHT_MIN_RATED_INTAKES)
      return [];
    if (Math.abs(after.rate! - before.rate!) < INSIGHT_MIN_EFFECTIVENESS_CHANGE) return [];
    return [
      {
        kind: 'medicationEffectivenessChange',
        medicationName: medication.name,
        before: before.rate!,
        after: after.rate!,
        previousRange: previous,
        range,
      },
    ];
  });
}

function fewerButStronger({ attacks, range }: InsightInput, previous: TimeRange): Insight[] {
  const painBefore = averagePain(attacks, previous);
  const painAfter = averagePain(attacks, range);
  if (painBefore === undefined || painAfter === undefined) return [];
  const fewer = countAttacksStartedIn(attacks, range) < countAttacksStartedIn(attacks, previous);
  const painIncrease = painAfter - painBefore;
  if (!fewer || painIncrease < INSIGHT_MIN_PAIN_INCREASE) return [];
  return [{ kind: 'fewerButStrongerAttacks', painIncrease }];
}

/** All insights whose data condition is met, most relevant first. */
export function generateInsights(input: InsightInput): Insight[] {
  const previous = previousRange(input.range);
  const dataStart = firstDataDay(input.attacks, input.intakes);
  const hasPrevious = dataStart !== undefined && dataStart <= previous.start;
  return [
    ...(hasPrevious ? migraineDaysChange(input, previous) : []),
    ...preventionChanges(input),
    ...preventionEffectChanges(input),
    ...(hasPrevious ? effectivenessChanges(input, previous) : []),
    ...(hasPrevious ? fewerButStronger(input, previous) : []),
  ];
}
