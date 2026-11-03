import type { LifeEvent } from '../domain/types';
import { db, newRecordFields } from './db';

type LifeEventFields = Omit<LifeEvent, 'id' | 'createdAt' | 'updatedAt'>;

export function listLifeEvents(): Promise<LifeEvent[]> {
  return db.lifeEvents.orderBy('date').toArray();
}

export async function createLifeEvent(fields: LifeEventFields): Promise<LifeEvent> {
  const lifeEvent = { ...newRecordFields(), ...fields };
  await db.lifeEvents.add(lifeEvent);
  return lifeEvent;
}

export async function updateLifeEvent(id: string, changes: Partial<LifeEventFields>) {
  await db.lifeEvents.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteLifeEvent(id: string) {
  await db.lifeEvents.delete(id);
}
