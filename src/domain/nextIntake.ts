import type { Medication, MedicationIntake } from './types';

const HOUR_MS = 60 * 60 * 1000;

/** When the medication may be taken again after its latest intake, if that is still ahead. */
export function nextIntakeAt(
  medication: Medication | undefined,
  intakes: MedicationIntake[],
  now: number,
): number | undefined {
  if (!medication?.minIntervalHours) return undefined;
  const latest = Math.max(
    ...intakes.filter((intake) => intake.medicationId === medication.id).map((i) => i.takenAt),
  );
  if (!Number.isFinite(latest)) return undefined;
  const next = latest + medication.minIntervalHours * HOUR_MS;
  return next > now ? next : undefined;
}
