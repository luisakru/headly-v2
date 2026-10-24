import { addDays, addMonths, startOfDay } from 'date-fns';
import { toDayKey } from '../domain/days';
import type {
  Attack,
  Effectiveness,
  Medication,
  MedicationIntake,
  Prevention,
} from '../domain/types';
import { db } from './db';

export type SeedData = {
  attacks: Attack[];
  medications: Medication[];
  medicationIntakes: MedicationIntake[];
  preventions: Prevention[];
};

const HOUR_MS = 60 * 60 * 1000;
const SEED_MONTHS = 18;

/** Small deterministic PRNG (mulberry32) so demo data is reproducible. */
function createRandom(seed: number) {
  let state = seed;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(weighted: [T, number][]): T => {
      let roll = next() * weighted.reduce((sum, [, weight]) => sum + weight, 0);
      for (const [value, weight] of weighted) {
        roll -= weight;
        if (roll < 0) return value;
      }
      return weighted[weighted.length - 1]![0];
    },
  };
}

/**
 * 18 months of history: frequent attacks at first, fewer after starting a prevention
 * six months ago, one month with medication overuse, a triptan that has helped less
 * in the last four months, and some recent intakes left unrated.
 */
export function generateSeedData(now = Date.now(), seed = 42): SeedData {
  const random = createRandom(seed);
  let idCounter = 0;
  const record = (time: number) => ({
    id: `seed-${++idCounter}`,
    createdAt: time,
    updatedAt: time,
  });

  const historyStart = addMonths(startOfDay(now), -SEED_MONTHS).getTime();
  const metoprololEnd = addMonths(now, -9).getTime();
  const amitriptylineStart = addMonths(now, -6).getTime();
  const lowCarbStart = addMonths(now, -3).getTime();
  const triptanWorseSince = addMonths(now, -4).getTime();
  const overuseMonthStart = addMonths(now, -10).getTime();
  const overuseMonthEnd = addMonths(now, -9).getTime();

  const medications: Medication[] = [
    {
      ...record(historyStart),
      name: 'Sumatriptan',
      dose: '50 mg',
      isTriptan: true,
      archived: false,
    },
    {
      ...record(historyStart),
      name: 'Ibuprofen',
      dose: '400 mg',
      isTriptan: false,
      archived: false,
    },
    {
      ...record(historyStart),
      name: 'Paracetamol',
      dose: '500 mg',
      isTriptan: false,
      archived: false,
    },
    { ...record(historyStart), name: 'Naproxen', dose: '500 mg', isTriptan: false, archived: true },
  ];
  const [sumatriptan, ibuprofen, paracetamol, naproxen] = medications as [
    Medication,
    Medication,
    Medication,
    Medication,
  ];

  const preventions: Prevention[] = [
    {
      ...record(historyStart),
      name: 'Metoprolol',
      type: 'medication',
      dose: '47.5 mg',
      startDate: toDayKey(historyStart),
      endDate: toDayKey(metoprololEnd),
    },
    {
      ...record(amitriptylineStart),
      name: 'Amitriptyline',
      type: 'medication',
      dose: '10 mg',
      startDate: toDayKey(amitriptylineStart),
    },
    {
      ...record(lowCarbStart),
      name: 'Low carb',
      type: 'lifestyle',
      startDate: toDayKey(lowCarbStart),
    },
  ];

  const attacks: Attack[] = [];
  const medicationIntakes: MedicationIntake[] = [];

  const rateIntake = (medication: Medication, takenAt: number): Effectiveness | undefined => {
    if (now - takenAt < 14 * 24 * HOUR_MS && random.next() < 0.5) return undefined;
    const worse = medication === sumatriptan && takenAt >= triptanWorseSince;
    return random.pick<Effectiveness>(
      worse
        ? [
            ['strong', 1],
            ['slight', 2],
            ['none', 4],
            ['worse', 1],
          ]
        : [
            ['strong', 6],
            ['slight', 3],
            ['none', 1],
            ['worse', 0.2],
          ],
    );
  };

  const addIntake = (medication: Medication, takenAt: number, attackId?: string) => {
    medicationIntakes.push({
      ...record(takenAt),
      medicationId: medication.id,
      attackId,
      takenAt,
      effectiveness: rateIntake(medication, takenAt),
    });
  };

  let nextFreeTime = historyStart;
  for (let day = historyStart; day < startOfDay(now).getTime(); day = addDays(day, 1).getTime()) {
    const isOveruseMonth = day >= overuseMonthStart && day < overuseMonthEnd;
    const attackChance = isOveruseMonth ? 0.6 : day < amitriptylineStart ? 0.15 : 0.08;
    const startedAt = day + random.int(5, 20) * HOUR_MS + random.int(0, 59) * 60_000;

    if (startedAt >= nextFreeTime && random.next() < attackChance) {
      const endedAt = Math.min(startedAt + random.int(4, 24) * HOUR_MS, now - HOUR_MS);
      const painAtStart = random.int(3, 7);
      const attack: Attack = {
        ...record(startedAt),
        startedAt,
        endedAt,
        painAtStart,
        painMax: Math.min(10, painAtStart + random.int(0, 3)),
      };
      attacks.push(attack);
      nextFreeTime = endedAt + (isOveruseMonth ? 2 : 12) * HOUR_MS;

      if (isOveruseMonth) {
        addIntake(sumatriptan, startedAt + random.int(10, 60) * 60_000, attack.id);
      } else if (random.next() < 0.85) {
        const firstChoice = random.pick<Medication>([
          [sumatriptan, 6],
          [ibuprofen, 3],
          [day < metoprololEnd ? naproxen : paracetamol, 1],
        ]);
        addIntake(firstChoice, startedAt + random.int(10, 120) * 60_000, attack.id);
        if (random.next() < 0.25) {
          addIntake(ibuprofen, startedAt + random.int(3, 5) * HOUR_MS, attack.id);
        }
      }
    } else if (random.next() < 0.03) {
      addIntake(paracetamol, day + random.int(8, 20) * HOUR_MS);
    }
  }

  return {
    attacks,
    medications,
    medicationIntakes: medicationIntakes.filter((intake) => intake.takenAt < now),
    preventions,
  };
}

/** Replaces all records with demo data. Development only. */
export async function seedDatabase(now = Date.now()) {
  const data = generateSeedData(now);
  await db.transaction(
    'rw',
    [db.attacks, db.medications, db.medicationIntakes, db.preventions],
    async () => {
      await Promise.all([
        db.attacks.clear(),
        db.medications.clear(),
        db.medicationIntakes.clear(),
        db.preventions.clear(),
      ]);
      await db.attacks.bulkAdd(data.attacks);
      await db.medications.bulkAdd(data.medications);
      await db.medicationIntakes.bulkAdd(data.medicationIntakes);
      await db.preventions.bulkAdd(data.preventions);
    },
  );
  return data;
}
