import type { Effectiveness, MedicationIntake } from '../domain/types';
import { db, newRecordFields } from './db';

export function listIntakes(): Promise<MedicationIntake[]> {
  return db.medicationIntakes.orderBy('takenAt').toArray();
}

export function listIntakesForAttack(attackId: string): Promise<MedicationIntake[]> {
  return db.medicationIntakes.where('attackId').equals(attackId).sortBy('takenAt');
}

export async function logIntake(
  medicationId: string,
  { takenAt = Date.now(), attackId }: { takenAt?: number; attackId?: string } = {},
): Promise<MedicationIntake> {
  const intake = { ...newRecordFields(), medicationId, takenAt, attackId };
  await db.medicationIntakes.add(intake);
  return intake;
}

export async function updateIntake(
  id: string,
  changes: Partial<Omit<MedicationIntake, 'id' | 'createdAt'>>,
) {
  await db.medicationIntakes.update(id, { ...changes, updatedAt: Date.now() });
}

export function rateIntake(id: string, effectiveness: Effectiveness) {
  return updateIntake(id, { effectiveness });
}

export async function deleteIntake(id: string) {
  await db.medicationIntakes.delete(id);
}
