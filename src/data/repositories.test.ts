import { at } from '../test/factories';
import {
  createAttack,
  deleteAttack,
  endAttack,
  getActiveAttack,
  listAttacks,
  startAttack,
  updateAttack,
} from './attackRepository';
import { db, DomainError } from './db';
import { listIntakes, listIntakesForAttack, logIntake, rateIntake } from './intakeRepository';
import { archiveMedication, createMedication, listMedications } from './medicationRepository';
import { createPrevention, listPreventions, updatePrevention } from './preventionRepository';
import { deviceLanguage, getSettings, updateSettings } from './settingsRepository';
import { seedDatabase } from './seed';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('attackRepository', () => {
  test('starts, finds and ends the active attack', async () => {
    const attack = await startAttack(at(2026, 3, 5, 9));
    expect(await getActiveAttack()).toEqual(attack);

    await endAttack(attack.id, at(2026, 3, 5, 15));
    expect(await getActiveAttack()).toBeUndefined();
    expect((await listAttacks())[0]?.endedAt).toBe(at(2026, 3, 5, 15));
  });

  test('rejects a second active attack and saves nothing', async () => {
    await startAttack(at(2026, 3, 5, 9));
    await expect(startAttack(at(2026, 3, 5, 10))).rejects.toEqual(
      new DomainError('activeAttackExists'),
    );
    expect(await listAttacks()).toHaveLength(1);
  });

  test('rejects an overlapping edit and keeps the old values', async () => {
    await createAttack({ startedAt: at(2026, 3, 5, 9), endedAt: at(2026, 3, 5, 12) });
    const second = await createAttack({
      startedAt: at(2026, 3, 6, 9),
      endedAt: at(2026, 3, 6, 12),
    });

    await expect(updateAttack(second.id, { startedAt: at(2026, 3, 5, 11) })).rejects.toEqual(
      new DomainError('overlap'),
    );
    expect((await db.attacks.get(second.id))?.startedAt).toBe(at(2026, 3, 6, 9));
  });

  test('rejects editing a missing attack', async () => {
    await expect(updateAttack('missing', { painLevel: 5 })).rejects.toEqual(
      new DomainError('notFound'),
    );
  });

  test('lists attacks by start time', async () => {
    await createAttack({ startedAt: at(2026, 3, 6, 9), endedAt: at(2026, 3, 6, 12) });
    await createAttack({ startedAt: at(2026, 3, 5, 9), endedAt: at(2026, 3, 5, 12) });
    expect((await listAttacks()).map((a) => a.startedAt)).toEqual([
      at(2026, 3, 5, 9),
      at(2026, 3, 6, 9),
    ]);
  });

  test('deleting an attack deletes its intakes only', async () => {
    const medication = await createMedication({ name: 'Ibuprofen', isTriptan: false });
    const attack = await createAttack({
      startedAt: at(2026, 3, 5, 9),
      endedAt: at(2026, 3, 5, 12),
    });
    await logIntake(medication.id, { takenAt: at(2026, 3, 5, 10), attackId: attack.id });
    const unrelated = await logIntake(medication.id, { takenAt: at(2026, 3, 7, 10) });

    await deleteAttack(attack.id);
    expect(await listAttacks()).toEqual([]);
    expect(await listIntakes()).toEqual([unrelated]);
  });
});

describe('intakeRepository', () => {
  test('logs, lists per attack and rates intakes', async () => {
    const attack = await startAttack(at(2026, 3, 5, 9));
    const intake = await logIntake('med', { takenAt: at(2026, 3, 5, 10), attackId: attack.id });
    await logIntake('med', { takenAt: at(2026, 3, 4, 10) });

    await rateIntake(intake.id, 'slight');
    const forAttack = await listIntakesForAttack(attack.id);
    expect(forAttack).toHaveLength(1);
    expect(forAttack[0]?.effectiveness).toBe('slight');
  });
});

describe('medicationRepository', () => {
  test('hides archived medications unless asked', async () => {
    const ibuprofen = await createMedication({ name: 'Ibuprofen', isTriptan: false });
    await createMedication({ name: 'Almotriptan', isTriptan: true });
    await archiveMedication(ibuprofen.id);

    expect((await listMedications()).map((m) => m.name)).toEqual(['Almotriptan']);
    expect((await listMedications({ includeArchived: true })).map((m) => m.name)).toEqual([
      'Almotriptan',
      'Ibuprofen',
    ]);
  });
});

describe('preventionRepository', () => {
  test('creates and ends a prevention', async () => {
    const prevention = await createPrevention({
      name: 'Magnesium',
      type: 'lifestyle',
      startDate: '2026-01-01',
    });
    await updatePrevention(prevention.id, { endDate: '2026-03-01' });
    expect((await listPreventions())[0]?.endDate).toBe('2026-03-01');
  });
});

describe('settingsRepository', () => {
  test('returns defaults before anything is stored', async () => {
    expect(await getSettings()).toEqual({
      language: deviceLanguage(),
      backupReminderEnabled: true,
      installHintDismissed: false,
    });
  });

  test('stores changes on top of the defaults', async () => {
    await updateSettings({ language: 'de', lastBackupAt: 123 });
    expect(await getSettings()).toMatchObject({
      language: 'de',
      lastBackupAt: 123,
      backupReminderEnabled: true,
    });
  });

  test('deviceLanguage picks German for any German locale', () => {
    expect(deviceLanguage('de-AT')).toBe('de');
    expect(deviceLanguage('en-US')).toBe('en');
    expect(deviceLanguage('fr-FR')).toBe('en');
  });
});

test('seedDatabase replaces existing records with demo data', async () => {
  await createAttack({ startedAt: at(2020, 1, 1), endedAt: at(2020, 1, 2) });
  const data = await seedDatabase(at(2026, 10, 24, 12));
  expect(await db.attacks.count()).toBe(data.attacks.length);
  expect(await db.medicationIntakes.count()).toBe(data.medicationIntakes.length);
});
