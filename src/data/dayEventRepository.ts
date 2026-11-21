import type { DayEvent, DayEventType } from '../domain/types';
import { db, newRecordFields } from './db';

export async function listDayEventTypes(): Promise<DayEventType[]> {
  return (await db.dayEventTypes.toArray()).sort((a, b) => a.createdAt - b.createdAt);
}

export async function createDayEventType(
  fields: Pick<DayEventType, 'name' | 'kind'>,
): Promise<DayEventType> {
  const type = { ...newRecordFields(), ...fields };
  await db.dayEventTypes.add(type);
  return type;
}

export async function renameDayEventType(id: string, name: string) {
  await db.dayEventTypes.update(id, { name, updatedAt: Date.now() });
}

/** Removes the type and every day it was logged on. */
export async function deleteDayEventType(id: string) {
  await db.transaction('rw', db.dayEventTypes, db.dayEvents, async () => {
    await db.dayEvents.where('typeId').equals(id).delete();
    await db.dayEventTypes.delete(id);
  });
}

export function listDayEvents(): Promise<DayEvent[]> {
  return db.dayEvents.orderBy('date').toArray();
}

/** Logs the event on that day, or removes it if it is already logged. */
export async function toggleDayEvent(typeId: string, date: string) {
  await db.transaction('rw', db.dayEvents, async () => {
    const existing = await db.dayEvents
      .where('date')
      .equals(date)
      .filter((event) => event.typeId === typeId)
      .toArray();
    if (existing.length > 0) await db.dayEvents.bulkDelete(existing.map((event) => event.id));
    else await db.dayEvents.add({ ...newRecordFields(), typeId, date });
  });
}
