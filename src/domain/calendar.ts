import { addDays, addWeeks, startOfWeek } from 'date-fns';

export type DayKind = 'none' | 'migraine' | 'migraineWithMedication' | 'medicationOnly';

/** Days of the last `weeks` weeks, Monday first, ending with the current week. */
export function recentWeekDays(now: number, weeks: number): Date[] {
  const start = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), -(weeks - 1));
  return Array.from({ length: weeks * 7 }, (_, index) => addDays(start, index));
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
