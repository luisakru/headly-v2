import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarMonths,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { PRESET_MONTHS, type DateRangePreset } from './dateRange';
import { attackDayKeys, countDaysInRange, medicationDays, toDayKey } from './days';
import type { Attack, MedicationIntake, TimeRange } from './types';

const TICK_STEPS = [1, 2, 5, 10, 20, 50, 100];
const MAX_TICK_INTERVALS = 4;
const MAX_LABELS = 7;
const WEEKS_IN_3M = 13;
/** Beyond this, "all" shows one bar per year so bars stay readable. */
const MAX_MONTH_BARS = 36;

export type ChartScale = {
  max: number;
  /** From 0 up to `max`, evenly spaced. */
  ticks: number[];
};

export type BucketSize = 'day' | 'week' | 'month' | 'year';

export type ChartBucket = {
  range: TimeRange;
  migraineDays: number;
  medicationDays: number;
  /** Highest pain level of the day's attacks; only for day buckets. */
  pain?: number;
};

/** A y-axis with round tick values and at most four intervals. */
export function chartScale(maxValue: number): ChartScale {
  const step =
    TICK_STEPS.find((candidate) => maxValue / candidate <= MAX_TICK_INTERVALS) ??
    TICK_STEPS[TICK_STEPS.length - 1]!;
  const intervals = Math.max(1, Math.ceil(maxValue / step));
  return {
    max: intervals * step,
    ticks: Array.from({ length: intervals + 1 }, (_, index) => index * step),
  };
}

/** Show every n-th label so they still fit. */
export function labelStep(count: number): number {
  return Math.max(1, Math.ceil(count / MAX_LABELS));
}

export function bucketSize(
  preset: DateRangePreset,
  now: number,
  firstDay: number | undefined,
): BucketSize {
  if (preset === '1W' || preset === '1M') return 'day';
  if (preset === '3M') return 'week';
  if (preset === 'all' && firstDay !== undefined)
    return differenceInCalendarMonths(now, firstDay) >= MAX_MONTH_BARS ? 'year' : 'month';
  return 'month';
}

const weekStart = (time: number | Date) => startOfWeek(time, { weekStartsOn: 1 });

/** The page that contains today. */
function currentPage(preset: DateRangePreset, now: number, firstDay: number | undefined) {
  const thisWeek = weekStart(now);
  const nextMonth = addMonths(startOfMonth(now), 1);
  switch (preset) {
    case '1W':
      return { start: thisWeek, end: addWeeks(thisWeek, 1) };
    case '3M':
      return { start: addWeeks(thisWeek, 1 - WEEKS_IN_3M), end: addWeeks(thisWeek, 1) };
    case 'all':
      return bucketSize(preset, now, firstDay) === 'year'
        ? { start: startOfYear(firstDay!), end: addYears(startOfYear(now), 1) }
        : { start: startOfMonth(firstDay ?? now), end: nextMonth };
    default:
      return { start: addMonths(nextMonth, -PRESET_MONTHS[preset]), end: nextMonth };
  }
}

function previousPage(preset: DateRangePreset, page: { start: Date; end: Date }) {
  if (preset === '1W' || preset === '3M') {
    const weeks = preset === '1W' ? 1 : WEEKS_IN_3M;
    return { start: addWeeks(page.start, -weeks), end: page.start };
  }
  const months = preset === 'all' ? 0 : PRESET_MONTHS[preset];
  return { start: addMonths(page.start, -months), end: page.start };
}

/** The periods the chart pages through, oldest first; the last one contains today. */
export function chartPages(
  preset: DateRangePreset,
  now: number,
  firstDay: number | undefined,
): TimeRange[] {
  let page = currentPage(preset, now, firstDay);
  const pages = [page];
  if (preset !== 'all' && firstDay !== undefined) {
    while (page.start.getTime() > firstDay) {
      page = previousPage(preset, page);
      pages.unshift(page);
    }
  }
  return pages.map(({ start, end }) => ({ start: start.getTime(), end: end.getTime() }));
}

function bucketRanges(page: TimeRange, size: BucketSize): TimeRange[] {
  const next = { day: addDays, week: addWeeks, month: addMonths, year: addYears }[size];
  const ranges: TimeRange[] = [];
  for (let start = startOfDay(page.start); start.getTime() < page.end; start = next(start, 1)) {
    ranges.push({ start: start.getTime(), end: next(start, 1).getTime() });
  }
  return ranges;
}

/** Buckets for every page; day sets are built once, so years of data stay fast. */
export function chartBuckets(
  pages: TimeRange[],
  size: BucketSize,
  attacks: Attack[],
  intakes: MedicationIntake[],
  now: number,
): ChartBucket[][] {
  const painByDay = new Map<string, number | undefined>();
  for (const attack of attacks) {
    for (const day of attackDayKeys(attack, now)) {
      const levels = [painByDay.get(day), attack.painLevel].filter((level) => level !== undefined);
      painByDay.set(day, levels.length > 0 ? Math.max(...levels) : undefined);
    }
  }
  const migraine = new Set(painByDay.keys());
  const medication = medicationDays(intakes);

  return pages.map((page) =>
    bucketRanges(page, size).map((range): ChartBucket => {
      if (size !== 'day')
        return {
          range,
          migraineDays: countDaysInRange(migraine, range),
          medicationDays: countDaysInRange(medication, range),
        };
      const day = toDayKey(range.start);
      const pain = painByDay.get(day);
      return {
        range,
        migraineDays: migraine.has(day) ? 1 : 0,
        medicationDays: medication.has(day) ? 1 : 0,
        ...(pain !== undefined && { pain }),
      };
    }),
  );
}
