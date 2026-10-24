import type { Attack, Medication, MedicationIntake, Prevention } from '../domain/types';

let nextId = 0;
const id = () => `id-${++nextId}`;

/** Local time; month is 1-based. */
export function at(year: number, month: number, day: number, hour = 0, minute = 0): number {
  return new Date(year, month - 1, day, hour, minute).getTime();
}

export function makeAttack(fields: Partial<Attack> & Pick<Attack, 'startedAt'>): Attack {
  return { id: id(), createdAt: 0, updatedAt: 0, ...fields };
}

export function makeMedication(fields: Partial<Medication> = {}): Medication {
  return {
    id: id(),
    name: 'Ibuprofen',
    isTriptan: false,
    archived: false,
    createdAt: 0,
    updatedAt: 0,
    ...fields,
  };
}

export function makeIntake(
  fields: Partial<MedicationIntake> & Pick<MedicationIntake, 'medicationId' | 'takenAt'>,
): MedicationIntake {
  return { id: id(), createdAt: 0, updatedAt: 0, ...fields };
}

export function makePrevention(
  fields: Partial<Prevention> & Pick<Prevention, 'startDate'>,
): Prevention {
  return {
    id: id(),
    name: 'Amitriptyline',
    type: 'medication',
    createdAt: 0,
    updatedAt: 0,
    ...fields,
  };
}

/** One attack per listed day, 10:00–14:00. */
export function attacksOnDays(days: number[][]): Attack[] {
  return days.map(([y, m, d]) =>
    makeAttack({ startedAt: at(y!, m!, d!, 10), endedAt: at(y!, m!, d!, 14) }),
  );
}
