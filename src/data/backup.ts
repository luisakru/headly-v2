import { z } from 'zod';
import { PAIN_LEVEL_MAX, PAIN_LEVEL_MIN } from '../domain/constants';
import { toDayKey } from '../domain/days';
import type { Attack, Medication, MedicationIntake, Prevention } from '../domain/types';
import { db, DomainError } from './db';
import { updateSettings } from './settingsRepository';

/** Matches the database version; bump both together and migrate older backups below. */
export const BACKUP_SCHEMA_VERSION = 2;

export type BackupData = {
  attacks: Attack[];
  medications: Medication[];
  medicationIntakes: MedicationIntake[];
  preventions: Prevention[];
};

export type Backup = {
  app: 'headly';
  schemaVersion: number;
  exportedAt: number;
  data: BackupData;
};

export type BackupError = 'invalidFile' | 'newerVersion';
export type ImportMode = 'merge' | 'replace';
export type ImportSummary = Record<keyof BackupData, number>;

const TABLE_NAMES = ['attacks', 'medications', 'medicationIntakes', 'preventions'] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const recordFields = { id: z.string().min(1), createdAt: z.number(), updatedAt: z.number() };

const backupSchema = z.object({
  app: z.literal('headly'),
  schemaVersion: z.number(),
  exportedAt: z.number(),
  data: z.object({
    attacks: z.array(
      z.object({
        ...recordFields,
        startedAt: z.number(),
        endedAt: z.number().optional(),
        painLevel: z.number().int().min(PAIN_LEVEL_MIN).max(PAIN_LEVEL_MAX).optional(),
        notes: z.string().optional(),
      }),
    ),
    medications: z.array(
      z.object({
        ...recordFields,
        name: z.string(),
        dose: z.string().optional(),
        isTriptan: z.boolean(),
        archived: z.boolean(),
      }),
    ),
    medicationIntakes: z.array(
      z.object({
        ...recordFields,
        medicationId: z.string(),
        attackId: z.string().optional(),
        takenAt: z.number(),
        effectiveness: z.enum(['strong', 'slight', 'none', 'worse']).optional(),
      }),
    ),
    preventions: z.array(
      z.object({
        ...recordFields,
        name: z.string(),
        type: z.enum(['medication', 'lifestyle']),
        dose: z.string().optional(),
        startDate: z.string().regex(ISO_DATE),
        endDate: z.string().regex(ISO_DATE).optional(),
      }),
    ),
  }),
});

const versionSchema = z.object({
  app: z.literal('headly'),
  schemaVersion: z.number().int().min(1),
});

export function buildBackup(data: BackupData, now: number): Backup {
  return { app: 'headly', schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: now, data };
}

export function backupFileName(now: number): string {
  return `headly-backup-${toDayKey(now)}.json`;
}

type V1Attack = { painAtStart?: unknown; painMax?: unknown; [key: string]: unknown };

/** Version 1 stored start and maximum pain; version 2 keeps one pain level, like the database. */
function migrateV1(raw: { data?: { attacks?: unknown } }) {
  if (!Array.isArray(raw.data?.attacks)) return raw;
  const attacks = (raw.data.attacks as V1Attack[]).map(({ painAtStart, painMax, ...attack }) => {
    const painLevel = painMax ?? painAtStart;
    return painLevel === undefined ? attack : { ...attack, painLevel };
  });
  return { ...raw, data: { ...raw.data, attacks } };
}

/** Validates a backup file's text and migrates older schema versions. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new DomainError<BackupError>('invalidFile');
  }
  const version = versionSchema.safeParse(raw);
  if (!version.success) throw new DomainError<BackupError>('invalidFile');
  if (version.data.schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new DomainError<BackupError>('newerVersion');
  }
  const migrated = version.data.schemaVersion === 1 ? migrateV1(raw as object) : raw;
  const parsed = backupSchema.safeParse(migrated);
  if (!parsed.success) throw new DomainError<BackupError>('invalidFile');
  return { ...parsed.data, schemaVersion: BACKUP_SCHEMA_VERSION };
}

/** Records that are new, or newer than the stored record with the same id. */
export function recordsToMerge<T extends { id: string; updatedAt: number }>(
  stored: (T | undefined)[],
  incoming: T[],
): T[] {
  return incoming.filter((record, index) => {
    const current = stored[index];
    return !current || current.updatedAt < record.updatedAt;
  });
}

/** Writes all records of a backup at once; counts the records that were written. */
export function importBackup(backup: Backup, mode: ImportMode): Promise<ImportSummary> {
  return db.transaction('rw', [...TABLE_NAMES], async () => {
    const summary = { attacks: 0, medications: 0, medicationIntakes: 0, preventions: 0 };
    for (const name of TABLE_NAMES) {
      const table = db.table<BackupData[typeof name][number], string>(name);
      const incoming = backup.data[name];
      if (mode === 'replace') {
        await table.clear();
        await table.bulkAdd(incoming);
        summary[name] = incoming.length;
      } else {
        const stored = await table.bulkGet(incoming.map((record) => record.id));
        const changed = recordsToMerge(stored, incoming);
        await table.bulkPut(changed);
        summary[name] = changed.length;
      }
    }
    return summary;
  });
}

/** Deletes every record; keeps language and reminder preferences. */
export async function deleteAllData() {
  await db.transaction('rw', [...TABLE_NAMES], () =>
    Promise.all(TABLE_NAMES.map((name) => db.table(name).clear())),
  );
  await updateSettings({ lastBackupAt: undefined, backupReminderSnoozedUntil: undefined });
}
