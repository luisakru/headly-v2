import { OVERUSE_MEDICATION_DAYS_PER_MONTH, OVERUSE_TRIPTAN_DAYS_PER_MONTH } from './constants';
import { countMonths, monthsInRange, toMonthKey } from './dateRange';
import { countDaysInRange, isInRange, medicationDays, migraineDays, triptanDays } from './days';
import type { Attack, Effectiveness, Medication, MedicationIntake, TimeRange } from './types';

export type MonthCount = {
  /** YYYY-MM */
  month: string;
  migraineDays: number;
  medicationDays: number;
};

export type EffectivenessSummary = {
  /** Share of rated intakes that helped, 0–1. Undefined when nothing is rated. */
  rate?: number;
  rated: number;
  unrated: number;
};

export type OveruseMonth = {
  month: string;
  triptanDays: number;
  medicationDays: number;
};

const HELPFUL: ReadonlySet<Effectiveness> = new Set(['strong', 'slight']);

export function monthlyCounts(
  attacks: Attack[],
  intakes: MedicationIntake[],
  range: TimeRange,
  now: number,
): MonthCount[] {
  const migraine = migraineDays(attacks, now);
  const medication = medicationDays(intakes);
  return monthsInRange(range).map((month) => ({
    month: toMonthKey(month.start),
    migraineDays: countDaysInRange(migraine, month),
    medicationDays: countDaysInRange(medication, month),
  }));
}

export function averageMigraineDaysPerMonth(attacks: Attack[], range: TimeRange, now: number) {
  return countDaysInRange(migraineDays(attacks, now), range) / countMonths(range);
}

export function totalMedicationDays(intakes: MedicationIntake[], range: TimeRange): number {
  return countDaysInRange(medicationDays(intakes), range);
}

export function effectivenessSummary(
  intakes: MedicationIntake[],
  range: TimeRange,
): EffectivenessSummary {
  const inRange = intakes.filter((intake) => isInRange(intake.takenAt, range));
  const rated = inRange.filter((intake) => intake.effectiveness !== undefined);
  const helped = rated.filter((intake) => HELPFUL.has(intake.effectiveness!)).length;
  return {
    rate: rated.length > 0 ? helped / rated.length : undefined,
    rated: rated.length,
    unrated: inRange.length - rated.length,
  };
}

/** Average maximum pain of attacks that started in the range and have a rating. */
export function averagePainMax(attacks: Attack[], range: TimeRange): number | undefined {
  const levels = attacks
    .filter((attack) => isInRange(attack.startedAt, range) && attack.painMax !== undefined)
    .map((attack) => attack.painMax!);
  return levels.length > 0
    ? levels.reduce((sum, level) => sum + level, 0) / levels.length
    : undefined;
}

export function countAttacksStartedIn(attacks: Attack[], range: TimeRange): number {
  return attacks.filter((attack) => isInRange(attack.startedAt, range)).length;
}

export function overuseMonths(
  intakes: MedicationIntake[],
  medications: Medication[],
  range: TimeRange,
): OveruseMonth[] {
  const triptan = triptanDays(intakes, medications);
  const medication = medicationDays(intakes);
  return monthsInRange(range)
    .map((month) => ({
      month: toMonthKey(month.start),
      triptanDays: countDaysInRange(triptan, month),
      medicationDays: countDaysInRange(medication, month),
    }))
    .filter(
      (month) =>
        month.triptanDays >= OVERUSE_TRIPTAN_DAYS_PER_MONTH ||
        month.medicationDays >= OVERUSE_MEDICATION_DAYS_PER_MONTH,
    );
}
