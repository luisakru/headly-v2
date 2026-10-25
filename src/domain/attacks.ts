import { PAIN_LEVEL_MAX, PAIN_LEVEL_MIN } from './constants';
import type { Attack } from './types';

export type AttackValidationError =
  'startInFuture' | 'endBeforeStart' | 'invalidPainLevel' | 'overlap' | 'activeAttackExists';

type AttackTimes = Pick<Attack, 'id' | 'startedAt' | 'endedAt' | 'painLevel'>;

export function findActiveAttack(attacks: Attack[]): Attack | undefined {
  return attacks.find((attack) => attack.endedAt === undefined);
}

function overlaps(a: AttackTimes, b: AttackTimes): boolean {
  const aEnd = a.endedAt ?? Infinity;
  const bEnd = b.endedAt ?? Infinity;
  return a.startedAt < bEnd && b.startedAt < aEnd;
}

export function findOverlappingAttack(
  candidate: AttackTimes,
  attacks: Attack[],
): Attack | undefined {
  return attacks.find((other) => other.id !== candidate.id && overlaps(candidate, other));
}

function isValidPainLevel(level: number | undefined): boolean {
  return (
    level === undefined ||
    (Number.isInteger(level) && level >= PAIN_LEVEL_MIN && level <= PAIN_LEVEL_MAX)
  );
}

/** Returns the first rule the candidate breaks, or undefined if it is valid. */
export function validateAttack(
  candidate: AttackTimes,
  existing: Attack[],
  now: number,
): AttackValidationError | undefined {
  if (candidate.startedAt > now) return 'startInFuture';
  if (candidate.endedAt !== undefined && candidate.endedAt <= candidate.startedAt) {
    return 'endBeforeStart';
  }
  if (!isValidPainLevel(candidate.painLevel)) return 'invalidPainLevel';
  if (candidate.endedAt === undefined) {
    const active = findActiveAttack(existing);
    if (active && active.id !== candidate.id) return 'activeAttackExists';
  }
  if (findOverlappingAttack(candidate, existing)) return 'overlap';
  return undefined;
}
