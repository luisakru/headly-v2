import { Dexie, type EntityTable } from 'dexie';
import type { Attack, Medication, MedicationIntake, Prevention, Settings } from '../domain/types';

export const SETTINGS_ID = 'settings';

export type SettingsRecord = Settings & { id: typeof SETTINGS_ID };

export class HeadlyDatabase extends Dexie {
  attacks!: EntityTable<Attack, 'id'>;
  medications!: EntityTable<Medication, 'id'>;
  medicationIntakes!: EntityTable<MedicationIntake, 'id'>;
  preventions!: EntityTable<Prevention, 'id'>;
  settings!: EntityTable<SettingsRecord, 'id'>;

  constructor() {
    super('headly');
    this.version(1).stores({
      attacks: 'id, startedAt',
      medications: 'id, name',
      medicationIntakes: 'id, medicationId, attackId, takenAt',
      preventions: 'id, startDate',
      settings: 'id',
    });
  }
}

export const db = new HeadlyDatabase();

export class DomainError<Code extends string = string> extends Error {
  constructor(readonly code: Code) {
    super(code);
    this.name = 'DomainError';
  }
}

export function newRecordFields() {
  const now = Date.now();
  return { id: crypto.randomUUID(), createdAt: now, updatedAt: now };
}
