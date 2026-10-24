import type { Medication } from '../domain/types';
import { db, newRecordFields } from './db';

type MedicationFields = Omit<Medication, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;

export async function listMedications({ includeArchived = false } = {}): Promise<Medication[]> {
  const all = await db.medications.orderBy('name').toArray();
  return includeArchived ? all : all.filter((medication) => !medication.archived);
}

export async function createMedication(fields: MedicationFields): Promise<Medication> {
  const medication = { ...newRecordFields(), archived: false, ...fields };
  await db.medications.add(medication);
  return medication;
}

export async function updateMedication(
  id: string,
  changes: Partial<Omit<Medication, 'id' | 'createdAt'>>,
) {
  await db.medications.update(id, { ...changes, updatedAt: Date.now() });
}

export function archiveMedication(id: string, archived = true) {
  return updateMedication(id, { archived });
}
