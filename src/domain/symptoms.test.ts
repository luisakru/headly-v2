import { makeAttack } from '../test/factories';
import { mergeSymptoms, symptomCounts } from './symptoms';
import type { Symptom } from './types';

const own: Symptom = { id: 'own', name: 'Neck pain', enabled: true, createdAt: 5, updatedAt: 5 };

test('keeps built-in defaults until changed and adds own symptoms after them', () => {
  const renamedAura: Symptom = { ...mergeSymptoms([])[0]!, name: 'Flicker', updatedAt: 1 };
  const symptoms = mergeSymptoms([own, renamedAura]);
  expect(symptoms.map((s) => s.id)).toEqual([
    'aura',
    'nausea',
    'vomiting',
    'light',
    'noise',
    'own',
  ]);
  expect(symptoms[0]?.name).toBe('Flicker');
  expect(symptoms.find((s) => s.id === 'noise')?.enabled).toBe(false);
});

test('counts attacks per symptom, most common first', () => {
  const attacks = [
    makeAttack({ startedAt: 1, symptomIds: ['aura', 'nausea'] }),
    makeAttack({ startedAt: 2, symptomIds: ['nausea'] }),
    makeAttack({ startedAt: 3 }),
  ];
  expect(
    symptomCounts(attacks, mergeSymptoms([])).map(({ symptom, count }) => [symptom.id, count]),
  ).toEqual([
    ['nausea', 2],
    ['aura', 1],
  ]);
});
