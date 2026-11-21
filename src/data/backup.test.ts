import { at } from '../test/factories';
import { createAttack, listAttacks } from './attackRepository';
import {
  BACKUP_SCHEMA_VERSION,
  backupFileName,
  buildBackup,
  deleteAllData,
  importBackup,
  parseBackup,
  recordsToMerge,
  type BackupData,
} from './backup';
import { db, DomainError } from './db';
import { createDayEventType, toggleDayEvent } from './dayEventRepository';
import { logIntake } from './intakeRepository';
import { createLifeEvent } from './lifeEventRepository';
import { createMedication, listMedications } from './medicationRepository';
import { createPrevention } from './preventionRepository';
import { createSymptom, listSymptoms, updateSymptom } from './symptomRepository';
import { getSettings, updateSettings } from './settingsRepository';

const now = at(2026, 10, 25, 12);

const data: BackupData = {
  attacks: [
    {
      id: 'a1',
      startedAt: at(2026, 10, 1, 9),
      endedAt: at(2026, 10, 1, 15),
      painLevel: 6,
      createdAt: 1,
      updatedAt: 1,
    },
  ],
  medications: [
    { id: 'm1', name: 'Sumatriptan', isTriptan: true, archived: false, createdAt: 1, updatedAt: 1 },
  ],
  medicationIntakes: [
    {
      id: 'i1',
      medicationId: 'm1',
      attackId: 'a1',
      takenAt: at(2026, 10, 1, 10),
      effectiveness: 'strong',
      createdAt: 1,
      updatedAt: 1,
    },
  ],
  preventions: [
    {
      id: 'p1',
      name: 'Magnesium',
      type: 'lifestyle',
      startDate: '2026-01-01',
      createdAt: 1,
      updatedAt: 1,
    },
  ],
  lifeEvents: [{ id: 'e1', name: 'New job', date: '2026-05-01', createdAt: 1, updatedAt: 1 }],
  dayEventTypes: [{ id: 't1', name: 'Flight', kind: 'custom', createdAt: 1, updatedAt: 1 }],
  dayEvents: [{ id: 'd1', typeId: 't1', date: '2026-05-02', createdAt: 1, updatedAt: 1 }],
  symptoms: [],
};

const exported = () => JSON.stringify(buildBackup(data, now));

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('parseBackup', () => {
  test('reads back an exported backup', () => {
    expect(parseBackup(exported())).toEqual({
      app: 'headly',
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: now,
      data,
    });
  });

  test('rejects text that is not JSON', () => {
    expect(() => parseBackup('not json')).toThrow(new DomainError('invalidFile'));
  });

  test('rejects JSON from another app', () => {
    expect(() => parseBackup('{"app":"other","schemaVersion":2}')).toThrow(
      new DomainError('invalidFile'),
    );
  });

  test('rejects invalid records', () => {
    const backup = buildBackup(data, now);
    const broken = {
      ...backup,
      data: { ...data, attacks: [{ ...data.attacks[0], painLevel: 11 }] },
    };
    expect(() => parseBackup(JSON.stringify(broken))).toThrow(new DomainError('invalidFile'));
  });

  test('rejects a backup from a newer app version', () => {
    const backup = { ...buildBackup(data, now), schemaVersion: BACKUP_SCHEMA_VERSION + 1 };
    expect(() => parseBackup(JSON.stringify(backup))).toThrow(new DomainError('newerVersion'));
  });

  test('migrates version 1 start and maximum pain into one pain level', () => {
    const { painLevel: _, ...attack } = data.attacks[0]!;
    const v1 = {
      ...buildBackup(data, now),
      schemaVersion: 1,
      data: {
        ...data,
        attacks: [
          { ...attack, id: 'a', painAtStart: 4, painMax: 7 },
          { ...attack, id: 'b', painAtStart: 5 },
          { ...attack, id: 'c' },
        ],
      },
    };
    const backup = parseBackup(JSON.stringify(v1));
    expect(backup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(backup.data.attacks.map((a) => [a.id, a.painLevel])).toEqual([
      ['a', 7],
      ['b', 5],
      ['c', undefined],
    ]);
  });
});

test('a version 2 backup has no life events yet', () => {
  const { lifeEvents: _, ...v2Data } = data;
  const v2 = { ...buildBackup(data, now), schemaVersion: 2, data: v2Data };
  expect(parseBackup(JSON.stringify(v2)).data.lifeEvents).toEqual([]);
});

test('backupFileName contains the local date', () => {
  expect(backupFileName(now)).toBe('headly-backup-2026-10-25.json');
});

test('recordsToMerge keeps new and newer records only', () => {
  const stored = [undefined, { id: 'b', updatedAt: 5 }, { id: 'c', updatedAt: 5 }];
  const incoming = [
    { id: 'a', updatedAt: 1 },
    { id: 'b', updatedAt: 6 },
    { id: 'c', updatedAt: 5 },
  ];
  expect(recordsToMerge(stored, incoming).map((record) => record.id)).toEqual(['a', 'b']);
});

describe('importBackup', () => {
  test('replace restores exactly the backup', async () => {
    await createMedication({ name: 'Ibuprofen', isTriptan: false });
    const summary = await importBackup(parseBackup(exported()), 'replace');
    expect(summary).toEqual({
      attacks: 1,
      medications: 1,
      medicationIntakes: 1,
      preventions: 1,
      lifeEvents: 1,
      dayEventTypes: 1,
      dayEvents: 1,
      symptoms: 0,
    });
    expect(await listMedications()).toEqual(data.medications);
    expect(await db.medicationIntakes.toArray()).toEqual(data.medicationIntakes);
  });

  test('merge adds new records and updates older ones only', async () => {
    const ibuprofen = await createMedication({ name: 'Ibuprofen', isTriptan: false });
    await db.attacks.put({ ...data.attacks[0]!, painLevel: 3, updatedAt: 99 });
    await db.medications.put({ ...data.medications[0]!, name: 'Old name', updatedAt: 0 });

    const summary = await importBackup(parseBackup(exported()), 'merge');

    expect(summary).toEqual({
      attacks: 0,
      medications: 1,
      medicationIntakes: 1,
      preventions: 1,
      lifeEvents: 1,
      dayEventTypes: 1,
      dayEvents: 1,
      symptoms: 0,
    });
    expect((await listAttacks())[0]?.painLevel).toBe(3);
    expect((await listMedications()).map((m) => m.name)).toEqual(['Ibuprofen', 'Sumatriptan']);
    expect(await db.medications.get(ibuprofen.id)).toEqual(ibuprofen);
  });
});

test('deleteAllData removes records and backup dates but keeps preferences', async () => {
  await createAttack({ startedAt: at(2026, 10, 1, 9), endedAt: at(2026, 10, 1, 12) });
  await updateSettings({ language: 'de', backupReminderEnabled: false, lastBackupAt: 1 });

  await deleteAllData();

  expect(await listAttacks()).toEqual([]);
  expect(await getSettings()).toMatchObject({ language: 'de', backupReminderEnabled: false });
  expect((await getSettings()).lastBackupAt).toBeUndefined();
});

test('imports a file written by an assistant from the import prompt', () => {
  const file = {
    app: 'headly',
    schemaVersion: 5,
    exportedAt: now,
    data: {
      attacks: [
        {
          id: 'attack-1',
          createdAt: 1,
          updatedAt: 1,
          startedAt: at(2026, 9, 1, 8),
          endedAt: at(2026, 9, 1, 18),
          painLevel: 6,
          symptomIds: ['aura', 'nausea'],
        },
      ],
      medications: [
        {
          id: 'med-1',
          createdAt: 1,
          updatedAt: 1,
          name: 'Sumatriptan',
          isTriptan: true,
          minIntervalHours: 2,
          archived: false,
        },
      ],
      medicationIntakes: [],
      preventions: [],
      lifeEvents: [],
      dayEventTypes: [
        { id: 'period', createdAt: 1, updatedAt: 1, name: 'Periode', kind: 'period' },
      ],
      dayEvents: [
        { id: 'day-1', createdAt: 1, updatedAt: 1, typeId: 'period', date: '2026-09-02' },
      ],
      symptoms: [],
    },
  };
  const backup = parseBackup(JSON.stringify(file));
  expect(backup.data.attacks[0]?.symptomIds).toEqual(['aura', 'nausea']);
  expect(backup.data.dayEvents).toHaveLength(1);
});

test('a full export and import keeps every kind of record, including symptoms, gaps and events', async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  const sumatriptan = await createMedication({
    name: 'Sumatriptan',
    isTriptan: true,
    minIntervalHours: 2,
  });
  const attack = await createAttack({
    startedAt: at(2026, 9, 1, 8),
    endedAt: at(2026, 9, 1, 18),
    painLevel: 6,
    symptomIds: ['aura', 'own-symptom'],
  });
  await logIntake(sumatriptan.id, { takenAt: at(2026, 9, 1, 9), attackId: attack.id });
  await createPrevention({ name: 'Aquipta', type: 'medication', startDate: '2026-06-01' });
  await createLifeEvent({ name: 'New job', date: '2026-05-01' });
  const period = await createDayEventType({ name: 'Period', kind: 'period' });
  await toggleDayEvent(period.id, '2026-09-02');
  const own = await createSymptom('Neck pain');
  const [aura] = await listSymptoms();
  await updateSymptom(aura!, { name: 'Flicker' });

  const tables = async (): Promise<BackupData> => ({
    attacks: await db.attacks.toArray(),
    medications: await db.medications.toArray(),
    medicationIntakes: await db.medicationIntakes.toArray(),
    preventions: await db.preventions.toArray(),
    lifeEvents: await db.lifeEvents.toArray(),
    dayEventTypes: await db.dayEventTypes.toArray(),
    dayEvents: await db.dayEvents.toArray(),
    symptoms: await db.symptoms.toArray(),
  });
  const before = await tables();
  const file = JSON.stringify(buildBackup(before, now));

  await deleteAllData();
  await db.symptoms.clear();
  await importBackup(parseBackup(file), 'replace');

  expect(await tables()).toEqual(before);
  expect(before.symptoms.map((symptom) => symptom.id)).toEqual(
    expect.arrayContaining(['aura', own.id]),
  );
});
