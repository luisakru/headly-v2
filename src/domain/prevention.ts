import { addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import {
  PREVENTION_CHART_MAX_BLOCKS,
  PREVENTION_TREND_BLOCK_DAYS,
  PREVENTION_WINDOW_MAX_DAYS,
  PREVENTION_WINDOW_MIN_DAYS,
} from './constants';
import { countDaysInRange, medicationDays, migraineDays, toDayKey } from './days';
import type { Attack, MedicationIntake, Prevention, TimeRange } from './types';

export type PreventionEffect = {
  windowDays: number;
  before: TimeRange;
  after: TimeRange;
  migraineDaysPer30: { before: number; after: number };
  medicationDaysPer30: { before: number; after: number };
};

export type PreventionValidationError = 'endBeforeStart' | 'effectiveBeforeStart';

export function validatePrevention({
  startDate,
  effectiveFrom,
  endDate,
}: Pick<Prevention, 'startDate' | 'effectiveFrom' | 'endDate'>):
  PreventionValidationError | undefined {
  if (endDate !== undefined && endDate < startDate) return 'endBeforeStart';
  if (effectiveFrom !== undefined && effectiveFrom < startDate) return 'effectiveBeforeStart';
  return undefined;
}

export function isActivePrevention(prevention: Prevention, now: number): boolean {
  return prevention.endDate === undefined || prevention.endDate > toDayKey(now);
}

export function preventionOverlapsRange(prevention: Prevention, range: TimeRange): boolean {
  const starts = parseISO(prevention.startDate).getTime();
  const ends = prevention.endDate ? addDays(parseISO(prevention.endDate), 1).getTime() : Infinity;
  return starts < range.end && ends > range.start;
}

/** Earliest day with any recorded attack or intake. */
export function firstDataDay(attacks: Attack[], intakes: MedicationIntake[]): number | undefined {
  const times = [...attacks.map((a) => a.startedAt), ...intakes.map((i) => i.takenAt)];
  return times.length > 0 ? startOfDay(Math.min(...times)).getTime() : undefined;
}

export type PreventionTrend = {
  /** Migraine days per 30 days in up to 90 days before the start, if there are 14 or more. */
  baseline?: { range: TimeRange; migraineDaysPer30: number };
  /** Migraine days in each full 30-day block from `effectiveFrom`, oldest first. */
  blocks: { range: TimeRange; migraineDays: number }[];
};

export type PreventionEffectGap =
  | { reason: 'noData' }
  | { reason: 'effectiveAfterEnd' }
  | { reason: 'shortBefore'; days: number }
  | { reason: 'shortAfter'; days: number }
  | { reason: 'shortAfterEffective'; days: number };

/** Days of data before the start and from `effectiveFrom` up to the end or today. */
function availableDays(
  prevention: Prevention,
  attacks: Attack[],
  intakes: MedicationIntake[],
  now: number,
) {
  const dataStart = firstDataDay(attacks, intakes);
  if (dataStart === undefined) return undefined;
  const start = parseISO(prevention.startDate);
  const effectiveFrom = parseISO(prevention.effectiveFrom ?? prevention.startDate);
  const afterLimit = prevention.endDate
    ? Math.min(addDays(parseISO(prevention.endDate), 1).getTime(), startOfDay(now).getTime())
    : startOfDay(now).getTime();
  return {
    start,
    effectiveFrom,
    before: differenceInCalendarDays(start, dataStart),
    after: differenceInCalendarDays(afterLimit, effectiveFrom),
  };
}

/**
 * Compares a window before the start date with an equal window from `effectiveFrom`
 * (up to 90 days each). Undefined if either window has less than 14 days of data.
 */
export function preventionEffect(
  prevention: Prevention,
  attacks: Attack[],
  intakes: MedicationIntake[],
  now: number,
): PreventionEffect | undefined {
  const available = availableDays(prevention, attacks, intakes, now);
  if (!available) return undefined;
  const { start, effectiveFrom } = available;
  const windowDays = Math.min(PREVENTION_WINDOW_MAX_DAYS, available.before, available.after);
  if (windowDays < PREVENTION_WINDOW_MIN_DAYS) return undefined;

  const before = { start: addDays(start, -windowDays).getTime(), end: start.getTime() };
  const after = {
    start: effectiveFrom.getTime(),
    end: addDays(effectiveFrom, windowDays).getTime(),
  };
  const migraine = migraineDays(attacks, now);
  const medication = medicationDays(intakes);
  const per30 = (days: Set<string>, range: TimeRange) =>
    (countDaysInRange(days, range) / windowDays) * 30;

  return {
    windowDays,
    before,
    after,
    migraineDaysPer30: { before: per30(migraine, before), after: per30(migraine, after) },
    medicationDaysPer30: { before: per30(medication, before), after: per30(medication, after) },
  };
}

/** Why `preventionEffect` has no result; undefined when it has one. */
export function preventionEffectGap(
  prevention: Prevention,
  attacks: Attack[],
  intakes: MedicationIntake[],
  now: number,
): PreventionEffectGap | undefined {
  const available = availableDays(prevention, attacks, intakes, now);
  if (!available) return { reason: 'noData' };
  if (
    prevention.endDate &&
    prevention.effectiveFrom &&
    prevention.effectiveFrom > prevention.endDate
  )
    return { reason: 'effectiveAfterEnd' };
  if (available.before < PREVENTION_WINDOW_MIN_DAYS)
    return { reason: 'shortBefore', days: Math.max(0, available.before) };
  if (available.after < PREVENTION_WINDOW_MIN_DAYS)
    return {
      reason: prevention.effectiveFrom ? 'shortAfterEffective' : 'shortAfter',
      days: Math.max(0, available.after),
    };
  return undefined;
}

/** How migraine days developed block by block since the prevention is expected to work. */
export function preventionTrend(
  prevention: Prevention,
  attacks: Attack[],
  intakes: MedicationIntake[],
  now: number,
): PreventionTrend | undefined {
  const available = availableDays(prevention, attacks, intakes, now);
  if (!available) return undefined;
  const migraine = migraineDays(attacks, now);
  const blockCount = Math.max(0, Math.floor(available.after / PREVENTION_TREND_BLOCK_DAYS));
  const blocks = Array.from({ length: blockCount }, (_, index) => {
    const start = addDays(available.effectiveFrom, index * PREVENTION_TREND_BLOCK_DAYS);
    const range = {
      start: start.getTime(),
      end: addDays(start, PREVENTION_TREND_BLOCK_DAYS).getTime(),
    };
    return { range, migraineDays: countDaysInRange(migraine, range) };
  });
  const baselineDays = Math.min(PREVENTION_WINDOW_MAX_DAYS, available.before);
  if (baselineDays < PREVENTION_WINDOW_MIN_DAYS) return { blocks };
  const range = {
    start: addDays(available.start, -baselineDays).getTime(),
    end: available.start.getTime(),
  };
  return {
    blocks,
    baseline: { range, migraineDaysPer30: (countDaysInRange(migraine, range) / baselineDays) * 30 },
  };
}

export type PreventionChartPhase = 'before' | 'buildUp' | 'effective' | 'after';

export type PreventionChart = {
  /** Oldest first; partial blocks are scaled to 30 days too. */
  blocks: { phase: PreventionChartPhase; range: TimeRange; migraineDaysPer30: number }[];
  /** Migraine days per 30 days across the blocks before the start. */
  baseline?: number;
};

/**
 * Splits `start`–`end` into blocks. A remainder shorter than 14 days is dropped,
 * unless `keepShort` and there is no full block.
 */
function splitIntoBlocks(
  start: Date,
  end: Date,
  blockDays: number,
  { fromEnd = false, keepShort = false } = {},
): TimeRange[] {
  const days = differenceInCalendarDays(end, start);
  if (days <= 0) return [];
  const full = Math.floor(days / blockDays);
  const rest = days % blockDays;
  const keepRest = rest >= PREVENTION_WINDOW_MIN_DAYS || (keepShort && full === 0 && rest > 0);
  const sizes = Array.from({ length: full }, () => blockDays);
  if (keepRest) {
    if (fromEnd) sizes.unshift(rest);
    else sizes.push(rest);
  }
  let blockStart = fromEnd ? addDays(end, -sizes.reduce((sum, size) => sum + size, 0)) : start;
  return sizes.map((size) => {
    const blockEnd = addDays(blockStart, size);
    const range = { start: blockStart.getTime(), end: blockEnd.getTime() };
    blockStart = blockEnd;
    return range;
  });
}

/**
 * Migraine days per 30 days in up to 90 days before the start, during the prevention
 * (split at `effectiveFrom`) and, once ended, in up to 90 days after the end.
 */
export function preventionChart(
  prevention: Prevention,
  attacks: Attack[],
  intakes: MedicationIntake[],
  now: number,
): PreventionChart | undefined {
  const dataStart = firstDataDay(attacks, intakes);
  if (dataStart === undefined) return undefined;
  const today = startOfDay(now);
  const start = parseISO(prevention.startDate);
  const end = prevention.endDate ? addDays(parseISO(prevention.endDate), 1) : undefined;
  const duringEnd = end && end < today ? end : today;
  const effectiveFrom = new Date(
    Math.min(parseISO(prevention.effectiveFrom ?? prevention.startDate).getTime(), +duringEnd),
  );
  const beforeStart = new Date(
    Math.max(dataStart, addDays(start, -PREVENTION_WINDOW_MAX_DAYS).getTime()),
  );
  const afterEnd = end
    ? new Date(Math.min(addDays(end, PREVENTION_WINDOW_MAX_DAYS).getTime(), +today))
    : undefined;

  const spanDays = differenceInCalendarDays(afterEnd ?? duringEnd, beforeStart);
  const blockDays =
    spanDays > PREVENTION_CHART_MAX_BLOCKS * PREVENTION_TREND_BLOCK_DAYS
      ? 2 * PREVENTION_TREND_BLOCK_DAYS
      : PREVENTION_TREND_BLOCK_DAYS;
  const phases: [PreventionChartPhase, TimeRange[]][] = [
    ['before', splitIntoBlocks(beforeStart, start, blockDays, { fromEnd: true })],
    ['buildUp', splitIntoBlocks(start, effectiveFrom, blockDays, { keepShort: true })],
    ['effective', splitIntoBlocks(effectiveFrom, duringEnd, blockDays, { keepShort: true })],
    ['after', end && afterEnd ? splitIntoBlocks(end, afterEnd, blockDays) : []],
  ];

  const migraine = migraineDays(attacks, now);
  const per30 = (range: TimeRange) =>
    (countDaysInRange(migraine, range) / differenceInCalendarDays(range.end, range.start)) * 30;
  const blocks = phases.flatMap(([phase, ranges]) =>
    ranges.map((range) => ({ phase, range, migraineDaysPer30: per30(range) })),
  );
  const before = phases[0]![1];
  return before.length > 0
    ? {
        blocks,
        baseline: per30({ start: before[0]!.start, end: before[before.length - 1]!.end }),
      }
    : { blocks };
}
