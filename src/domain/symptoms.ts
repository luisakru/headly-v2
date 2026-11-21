import type { Attack, BuiltInSymptom, Symptom } from './types';

const BUILT_IN: [BuiltInSymptom, boolean][] = [
  ['aura', true],
  ['nausea', true],
  ['vomiting', true],
  ['light', true],
  ['noise', false],
];

/** Built-in symptoms first, as stored or with their defaults, then the user's own. */
export function mergeSymptoms(stored: Symptom[]): Symptom[] {
  const builtIn = BUILT_IN.map(
    ([id, enabled]): Symptom =>
      stored.find((symptom) => symptom.id === id) ?? {
        id,
        builtIn: id,
        enabled,
        createdAt: 0,
        updatedAt: 0,
      },
  );
  const own = stored
    .filter((symptom) => !symptom.builtIn)
    .sort((a, b) => a.createdAt - b.createdAt);
  return [...builtIn, ...own].filter((symptom) => !symptom.deleted);
}

/** How many of the attacks had each symptom, most common first; symptoms nobody had are left out. */
export function symptomCounts(
  attacks: Attack[],
  symptoms: Symptom[],
): { symptom: Symptom; count: number }[] {
  return symptoms
    .map((symptom) => ({
      symptom,
      count: attacks.filter((attack) => attack.symptomIds?.includes(symptom.id)).length,
    }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);
}
