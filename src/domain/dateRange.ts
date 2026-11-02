import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  format,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import type { TimeRange } from './types';

export type DateRangePreset = '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | 'all';

export const PRESET_MONTHS: Record<Exclude<DateRangePreset, '1W' | 'all'>, number> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '1Y': 12,
  '2Y': 24,
};

export function toMonthKey(time: number | Date): string {
  return format(time, 'yyyy-MM');
}

/** The end of today, so ranges "up to today" include it. */
export function endOfToday(now: number): number {
  return addDays(startOfDay(now), 1).getTime();
}

/** The preset's length counted back from today, e.g. the last 3 months. */
export function lookbackRange(
  preset: DateRangePreset,
  now: number,
  firstDay: number | undefined,
): TimeRange {
  const end = endOfToday(now);
  const start =
    preset === '1W'
      ? addDays(end, -7)
      : preset === 'all'
        ? startOfDay(firstDay ?? now)
        : addMonths(end, -PRESET_MONTHS[preset]);
  return { start: start.valueOf(), end };
}

export function monthsInRange(range: TimeRange): TimeRange[] {
  const months: TimeRange[] = [];
  for (
    let month = startOfMonth(range.start);
    month.getTime() < range.end;
    month = addMonths(month, 1)
  ) {
    months.push({ start: month.getTime(), end: addMonths(month, 1).getTime() });
  }
  return months;
}

/** The range of the same number of days directly before. */
export function previousRange(range: TimeRange): TimeRange {
  const days = differenceInCalendarDays(range.end, range.start);
  return { start: addDays(range.start, -days).getTime(), end: range.start };
}
