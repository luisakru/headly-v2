import { validateAttack, type AttackValidationError } from '../domain/attacks';
import type { Attack, Effectiveness } from '../domain/types';
import { db, DomainError, newRecordFields } from './db';
import { logIntake, updateIntake } from './intakeRepository';

export type AttackFields = Omit<Attack, 'id' | 'createdAt' | 'updatedAt'>;

async function assertValid(candidate: Pick<Attack, 'id'> & AttackFields) {
  const error = validateAttack(candidate, await db.attacks.toArray(), Date.now());
  if (error) throw new DomainError<AttackValidationError>(error);
}

export function listAttacks(): Promise<Attack[]> {
  return db.attacks.orderBy('startedAt').toArray();
}

export function getActiveAttack(): Promise<Attack | undefined> {
  return db.attacks.filter((attack) => attack.endedAt === undefined).first();
}

export async function createAttack(fields: AttackFields): Promise<Attack> {
  const attack = { ...newRecordFields(), ...fields };
  return db.transaction('rw', db.attacks, async () => {
    await assertValid(attack);
    await db.attacks.add(attack);
    return attack;
  });
}

export function startAttack(startedAt = Date.now()): Promise<Attack> {
  return createAttack({ startedAt });
}

export async function updateAttack(id: string, changes: Partial<AttackFields>): Promise<Attack> {
  return db.transaction('rw', db.attacks, async () => {
    const current = await db.attacks.get(id);
    if (!current) throw new DomainError('notFound');
    const updated = { ...current, ...changes, updatedAt: Date.now() };
    await assertValid(updated);
    await db.attacks.put(updated);
    return updated;
  });
}

export function endAttack(id: string, endedAt = Date.now()): Promise<Attack> {
  return updateAttack(id, { endedAt });
}

/** Deletes the attack and the intakes logged during it. */
export function deleteAttack(id: string): Promise<void> {
  return db.transaction('rw', db.attacks, db.medicationIntakes, async () => {
    await db.medicationIntakes.where('attackId').equals(id).delete();
    await db.attacks.delete(id);
  });
}

export type IntakeDraft = {
  /** Undefined for an intake that does not exist yet. */
  id?: string;
  medicationId: string;
  effectiveness?: Effectiveness;
};

/**
 * Creates or updates an attack together with its intakes, all or nothing.
 * Intakes of the attack missing from `intakes` are deleted; new ones are logged at its start.
 */
export function saveAttackWithIntakes(
  id: string | undefined,
  fields: AttackFields,
  intakes: IntakeDraft[],
): Promise<Attack> {
  return db.transaction('rw', db.attacks, db.medicationIntakes, async () => {
    const attack = id ? await updateAttack(id, fields) : await createAttack(fields);
    const keptIds = intakes.flatMap((intake) => intake.id ?? []);
    await db.medicationIntakes
      .where('attackId')
      .equals(attack.id)
      .filter((intake) => !keptIds.includes(intake.id))
      .delete();
    for (const draft of intakes) {
      const intakeId =
        draft.id ??
        (await logIntake(draft.medicationId, { takenAt: attack.startedAt, attackId: attack.id }))
          .id;
      await updateIntake(intakeId, { effectiveness: draft.effectiveness });
    }
    return attack;
  });
}
