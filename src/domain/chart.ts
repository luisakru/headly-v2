import { addDays, addMonths, addWeeks, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { PRESET_MONTHS, type DateRangePreset } from './dateRange';
import { attacksOnDay, countDaysInRange, medicationDays, migraineDays, toDayKey } from './days';
import type { Attack, MedicationIntake, TimeRange } from './types';

const TICK_STEPS = [1, 2, 5, 10, 20, 50, 100];
const MAX_TICK_INTERVALS = 4;
const MAX_LABELS = 7;
const WEEKS_IN_3M = 13;

export type ChartScale = {
  max: number;
  /** From 0 up to `max`, evenly spaced. */
  ticks: number[];
};

export type BucketSize = 'day' | 'week' | 'month';

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

export function bucketSize(preset: DateRangePreset): BucketSize {
  if (preset === '1W' || preset === '1M') return 'day';
  if (preset === '3M') return 'week';
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
      return { start: startOfMonth(firstDay ?? now), end: nextMonth };
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
  const next = { day: addDays, week: addWeeks, month: addMonths }[size];
  const ranges: TimeRange[] = [];
  for (let start = startOfDay(page.start); start.getTime() < page.end; start = next(start, 1)) {
    ranges.push({ start: start.getTime(), end: next(start, 1).getTime() });
  }
  return ranges;
}

export function chartBuckets(
  page: TimeRange,
  size: BucketSize,
  attacks: Attack[],
  intakes: MedicationIntake[],
  now: number,
): ChartBucket[] {
  const migraine = migraineDays(attacks, now);
  const medication = medicationDays(intakes);
  return bucketRanges(page, size).map((range) => {
    const bucket: ChartBucket = {
      range,
      migraineDays: countDaysInRange(migraine, range),
      medicationDays: countDaysInRange(medication, range),
    };
    if (size !== 'day') return bucket;
    const levels = attacksOnDay(attacks, toDayKey(range.start), now)
      .map((attack) => attack.painLevel)
      .filter((level) => level !== undefined);
    return levels.length > 0 ? { ...bucket, pain: Math.max(...levels) } : bucket;
  });
}
