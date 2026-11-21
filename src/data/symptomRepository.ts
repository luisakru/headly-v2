import { mergeSymptoms } from '../domain/symptoms';
import type { Symptom } from '../domain/types';
import { db, newRecordFields } from './db';

export async function listSymptoms(): Promise<Symptom[]> {
  return mergeSymptoms(await db.symptoms.toArray());
}

export async function createSymptom(name: string): Promise<Symptom> {
  const symptom = { ...newRecordFields(), name, enabled: true };
  await db.symptoms.add(symptom);
  return symptom;
}

/** Stores a change; built-in symptoms are only stored once changed. */
export async function updateSymptom(
  symptom: Symptom,
  changes: Pick<Partial<Symptom>, 'name' | 'enabled'>,
) {
  await db.symptoms.put({ ...symptom, ...changes, updatedAt: Date.now() });
}

/** Own symptoms only; attacks keep the id and simply stop showing it. */
export async function deleteSymptom(id: string) {
  await db.symptoms.delete(id);
}
