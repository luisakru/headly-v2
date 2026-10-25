import { eachDayOfInterval, format, startOfDay } from 'date-fns';
import type { Attack, Medication, MedicationIntake, TimeRange } from './types';

/** Local calendar day as YYYY-MM-DD. */
export function toDayKey(time: number | Date): string {
  return format(time, 'yyyy-MM-dd');
}

export function isInRange(time: number, range: TimeRange): boolean {
  return time >= range.start && time < range.end;
}

/** Days an attack overlaps. An active attack counts up to `now`. */
export function attackDayKeys(attack: Attack, now: number): string[] {
  const end = attack.endedAt ?? now;
  // An attack ending exactly at midnight does not touch the next day.
  const lastMoment = end > attack.startedAt ? end - 1 : attack.startedAt;
  return eachDayOfInterval({ start: startOfDay(attack.startedAt), end: lastMoment }).map(toDayKey);
}

export function attacksOnDay(attacks: Attack[], dayKey: string, now: number): Attack[] {
  return attacks.filter((attack) => attackDayKeys(attack, now).includes(dayKey));
}

export function intakesOnDay(intakes: MedicationIntake[], dayKey: string): MedicationIntake[] {
  return intakes.filter((intake) => toDayKey(intake.takenAt) === dayKey);
}

export function migraineDays(attacks: Attack[], now: number): Set<string> {
  return new Set(attacks.flatMap((attack) => attackDayKeys(attack, now)));
}

export function medicationDays(intakes: MedicationIntake[]): Set<string> {
  return new Set(intakes.map((intake) => toDayKey(intake.takenAt)));
}

export function triptanDays(intakes: MedicationIntake[], medications: Medication[]): Set<string> {
  const triptanIds = new Set(medications.filter((m) => m.isTriptan).map((m) => m.id));
  return medicationDays(intakes.filter((intake) => triptanIds.has(intake.medicationId)));
}

export function countDaysInRange(dayKeys: Set<string>, range: TimeRange): number {
  const first = toDayKey(range.start);
  const last = toDayKey(range.end - 1);
  let count = 0;
  for (const key of dayKeys) {
    if (key >= first && key <= last) count++;
  }
  return count;
}

export type DurationParts = { days: number; hours: number; minutes: number };

export function durationParts(ms: number): DurationParts {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  return {
    days: Math.floor(totalMinutes / (24 * 60)),
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
  };
}
