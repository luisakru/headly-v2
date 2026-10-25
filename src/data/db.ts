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
    // Start and maximum pain became one pain level that the user keeps up to date.
    this.version(2)
      .stores({})
      .upgrade((tx) =>
        tx
          .table('attacks')
          .toCollection()
          .modify((attack: Attack & { painAtStart?: number; painMax?: number }) => {
            const painLevel = attack.painMax ?? attack.painAtStart;
            if (painLevel !== undefined) attack.painLevel = painLevel;
            delete attack.painAtStart;
            delete attack.painMax;
          }),
      );
  }
}

export const db = new HeadlyDatabase();

export class DomainError<Code extends string = string> extends Error {
  constructor(readonly code: Code) {
    super(code);
    this.name = 'DomainError';
  }
}

/** `crypto.randomUUID` only exists in secure contexts, so a phone on the dev server's LAN address lacks it. */
function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function newRecordFields() {
  const now = Date.now();
  return { id: newId(), createdAt: now, updatedAt: now };
}
