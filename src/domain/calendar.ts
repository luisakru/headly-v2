import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export type DayKind = 'none' | 'migraine' | 'migraineWithMedication' | 'medicationOnly';

/** Days of the last `weeks` weeks, Monday first, ending with the current week. */
export function recentWeekDays(now: number, weeks: number): Date[] {
  const start = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), -(weeks - 1));
  return Array.from({ length: weeks * 7 }, (_, index) => addDays(start, index));
}

/** Cells of a month grid, Monday first; `undefined` fills the cells outside the month. */
export function monthGridDays(month: number | Date): (Date | undefined)[] {
  const first = startOfMonth(month);
  const leading = (first.getDay() + 6) % 7;
  const days = eachDayOfInterval({ start: first, end: endOfMonth(first) });
  const trailing = (7 - ((leading + days.length) % 7)) % 7;
  return [
    ...Array<undefined>(leading).fill(undefined),
    ...days,
    ...Array<undefined>(trailing).fill(undefined),
  ];
}

export function dayKind(
  dayKey: string,
  migraineDayKeys: Set<string>,
  medicationDayKeys: Set<string>,
): DayKind {
  const hasMedication = medicationDayKeys.has(dayKey);
  if (migraineDayKeys.has(dayKey)) return hasMedication ? 'migraineWithMedication' : 'migraine';
  return hasMedication ? 'medicationOnly' : 'none';
}
