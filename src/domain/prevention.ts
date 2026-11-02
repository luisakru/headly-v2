import { addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import { PREVENTION_WINDOW_MAX_DAYS, PREVENTION_WINDOW_MIN_DAYS } from './constants';
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

export type PreventionEffectGap =
  | { reason: 'noData' }
  | { reason: 'effectiveAfterEnd' }
  | { reason: 'shortBefore'; days: number }
  | { reason: 'shortAfter'; days: number };

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
    return { reason: 'shortAfter', days: Math.max(0, available.after) };
  return undefined;
}
