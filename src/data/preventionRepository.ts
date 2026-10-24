import type { Prevention } from '../domain/types';
import { db, newRecordFields } from './db';

type PreventionFields = Omit<Prevention, 'id' | 'createdAt' | 'updatedAt'>;

export function listPreventions(): Promise<Prevention[]> {
  return db.preventions.orderBy('startDate').toArray();
}

export async function createPrevention(fields: PreventionFields): Promise<Prevention> {
  const prevention = { ...newRecordFields(), ...fields };
  await db.preventions.add(prevention);
  return prevention;
}

export async function updatePrevention(id: string, changes: Partial<PreventionFields>) {
  await db.preventions.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deletePrevention(id: string) {
  await db.preventions.delete(id);
}
