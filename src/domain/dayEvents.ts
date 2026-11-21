import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import {
  DAY_EVENT_MIN_BASELINE_DAYS,
  DAY_EVENT_MIN_COUNT,
  DAY_EVENT_MIN_RATE,
  DAY_EVENT_MIN_RATIO,
  DAY_EVENT_UNRELATED_MAX_RATIO,
  DAY_EVENT_UNRELATED_MIN_COUNT,
  MENSTRUAL_MIN_CYCLES,
  MENSTRUAL_MIN_SHARE,
  MENSTRUAL_WINDOW_DAYS_AFTER,
  MENSTRUAL_WINDOW_DAYS_BEFORE,
  PERIOD_MIN_GAP_DAYS,
} from './constants';
import { migraineDays, toDayKey } from './days';
import type { Attack, DayEvent, DayEventType } from './types';

export type DayEventPattern = {
  eventName: string;
  /** Occurrences followed by a migraine that started on the same or the next day. */
  hits: number;
  count: number;
  /** Share of all other days with a migraine start on that day or the next. */
  baselineRate: number;
  related: boolean;
};

const shiftKey = (dayKey: string, days: number) => toDayKey(addDays(parseISO(dayKey), days));

/** Every day from `first` to `last`, both included. */
function dayKeys(first: string, last: string): string[] {
  const count = differenceInCalendarDays(parseISO(last), parseISO(first)) + 1;
  return Array.from({ length: Math.max(count, 0) }, (_, index) => shiftKey(first, index));
}

/**
 * Small events that are clearly followed by migraine, or clearly not.
 * Only days whose next day is already over count, so every window is complete.
 */
export function dayEventPatterns(
  types: DayEventType[],
  events: DayEvent[],
  attacks: Attack[],
  now: number,
): DayEventPattern[] {
  const startDays = new Set(attacks.map((attack) => toDayKey(attack.startedAt)));
  const firstDay = [...startDays, ...events.map((event) => event.date)].sort()[0];
  if (!firstDay) return [];
  const lastDay = shiftKey(toDayKey(now), -1);
  const days = dayKeys(firstDay, lastDay);
  const hasWindowHit = (dayKey: string) =>
    startDays.has(dayKey) || startDays.has(shiftKey(dayKey, 1));

  return types
    .filter((type) => type.kind === 'custom')
    .flatMap((type): DayEventPattern[] => {
      const eventDays = new Set(
        events
          .filter((event) => event.typeId === type.id && event.date <= lastDay)
          .map((e) => e.date),
      );
      const otherDays = days.filter((dayKey) => !eventDays.has(dayKey));
      if (eventDays.size === 0 || otherDays.length < DAY_EVENT_MIN_BASELINE_DAYS) return [];

      const hits = [...eventDays].filter(hasWindowHit).length;
      const count = eventDays.size;
      const rate = hits / count;
      const baselineRate = otherDays.filter(hasWindowHit).length / otherDays.length;
      const related =
        count >= DAY_EVENT_MIN_COUNT &&
        rate >= DAY_EVENT_MIN_RATE &&
        rate >= DAY_EVENT_MIN_RATIO * baselineRate;
      const unrelated =
        count >= DAY_EVENT_UNRELATED_MIN_COUNT &&
        rate <= DAY_EVENT_UNRELATED_MAX_RATIO * baselineRate;
      if (!related && !unrelated) return [];
      return [{ eventName: type.name, hits, count, baselineRate, related }];
    });
}

export type MenstrualPattern = { hits: number; cycles: number };

/** First days of each period; days logged close together belong to one period. */
export function periodStarts(dates: string[]): string[] {
  const sorted = [...new Set(dates)].sort();
  return sorted.filter((date, index) => {
    const previous = sorted[index - 1];
    return (
      !previous ||
      differenceInCalendarDays(parseISO(date), parseISO(previous)) >= PERIOD_MIN_GAP_DAYS
    );
  });
}

/**
 * Migraine around the start of the period (ICHD-3: day 1 ± 2) in at least two out of three
 * cycles, and clearly more often than in the rest of the cycle.
 */
export function menstrualPattern(
  periodDates: string[],
  attacks: Attack[],
  now: number,
): MenstrualPattern | undefined {
  const today = toDayKey(now);
  const starts = periodStarts(periodDates);
  const complete = starts.filter((start) => shiftKey(start, MENSTRUAL_WINDOW_DAYS_AFTER) <= today);
  if (complete.length < MENSTRUAL_MIN_CYCLES) return undefined;

  const migraine = migraineDays(attacks, now);
  const windowOf = (start: string) =>
    dayKeys(
      shiftKey(start, -MENSTRUAL_WINDOW_DAYS_BEFORE),
      shiftKey(start, MENSTRUAL_WINDOW_DAYS_AFTER),
    );
  const hits = complete.filter((start) => windowOf(start).some((day) => migraine.has(day))).length;
  if (hits / complete.length < MENSTRUAL_MIN_SHARE) return undefined;

  // Rest of each full cycle: after one window and before the next.
  const windowDays = complete.flatMap(windowOf);
  const restDays = starts
    .slice(0, -1)
    .flatMap((start, index) =>
      dayKeys(
        shiftKey(start, MENSTRUAL_WINDOW_DAYS_AFTER + 1),
        shiftKey(starts[index + 1]!, -MENSTRUAL_WINDOW_DAYS_BEFORE - 1),
      ),
    );
  if (restDays.length === 0) return undefined;
  const share = (days: string[]) => days.filter((day) => migraine.has(day)).length / days.length;
  if (share(windowDays) < DAY_EVENT_MIN_RATIO * share(restDays)) return undefined;

  return { hits, cycles: complete.length };
}
