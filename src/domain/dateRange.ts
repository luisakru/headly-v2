import { addMonths, differenceInCalendarMonths, format, startOfMonth } from 'date-fns';
import type { TimeRange } from './types';

export type DateRangePreset = '1M' | '3M' | '6M' | '1Y' | 'custom';

export type DateRange =
  | { preset: Exclude<DateRangePreset, 'custom'> }
  /** Months as YYYY-MM, both inclusive. */
  | { preset: 'custom'; fromMonth: string; toMonth: string };

const PRESET_MONTHS: Record<Exclude<DateRangePreset, 'custom'>, number> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '1Y': 12,
};

function parseMonth(month: string): Date {
  const [year, monthIndex] = month.split('-').map(Number);
  return new Date(year!, monthIndex! - 1, 1);
}

export function toMonthKey(time: number | Date): string {
  return format(time, 'yyyy-MM');
}

/** Presets cover whole calendar months, ending with the current month. */
export function resolveDateRange(range: DateRange, now: number): TimeRange {
  if (range.preset === 'custom') {
    const from = parseMonth(range.fromMonth);
    const to = parseMonth(range.toMonth);
    const [first, last] = from <= to ? [from, to] : [to, from];
    return { start: first.getTime(), end: addMonths(last, 1).getTime() };
  }
  const end = addMonths(startOfMonth(now), 1);
  return { start: addMonths(end, -PRESET_MONTHS[range.preset]).getTime(), end: end.getTime() };
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

export function countMonths(range: TimeRange): number {
  return differenceInCalendarMonths(range.end - 1, range.start) + 1;
}

/** The range of the same number of months directly before. */
export function previousRange(range: TimeRange): TimeRange {
  const start = addMonths(range.start, -countMonths(range));
  return { start: start.getTime(), end: range.start };
}
