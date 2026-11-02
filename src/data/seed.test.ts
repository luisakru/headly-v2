import { validateAttack } from '../domain/attacks';
import { generateInsights } from '../domain/insights';
import { lookbackRange } from '../domain/dateRange';
import { at } from '../test/factories';
import { generateSeedData } from './seed';

const now = at(2026, 10, 24, 12);
const data = generateSeedData(now);

test('is deterministic', () => {
  expect(generateSeedData(now)).toEqual(data);
});

test('contains valid, non-overlapping attacks', () => {
  expect(data.attacks.length).toBeGreaterThan(50);
  for (const attack of data.attacks) {
    expect(validateAttack(attack, data.attacks, now)).toBeUndefined();
  }
});

test('intakes reference existing medications and attacks', () => {
  const medicationIds = new Set(data.medications.map((m) => m.id));
  const attackIds = new Set(data.attacks.map((a) => a.id));
  for (const intake of data.medicationIntakes) {
    expect(medicationIds).toContain(intake.medicationId);
    if (intake.attackId) expect(attackIds).toContain(intake.attackId);
  }
});

test('produces insights for the default range', () => {
  const insights = generateInsights({
    ...data,
    intakes: data.medicationIntakes,
    range: lookbackRange('3M', now, undefined),
    now,
  });
  expect(insights.length).toBeGreaterThan(0);
});
