import { at, makeAttack } from '../test/factories';
import { applyPainTap, validateAttack } from './attacks';

const now = at(2026, 3, 10, 12);
const existing = [makeAttack({ startedAt: at(2026, 3, 5, 10), endedAt: at(2026, 3, 5, 20) })];

describe('validateAttack', () => {
  test('accepts a valid attack', () => {
    const candidate = { id: 'new', startedAt: at(2026, 3, 6, 10), endedAt: at(2026, 3, 6, 12) };
    expect(validateAttack(candidate, existing, now)).toBeUndefined();
  });

  test('rejects an end before the start', () => {
    const candidate = { id: 'new', startedAt: at(2026, 3, 6, 10), endedAt: at(2026, 3, 6, 9) };
    expect(validateAttack(candidate, existing, now)).toBe('endBeforeStart');
  });

  test('rejects a start in the future', () => {
    expect(validateAttack({ id: 'new', startedAt: at(2026, 3, 11) }, [], now)).toBe(
      'startInFuture',
    );
  });

  test('rejects an overlap with another attack', () => {
    const candidate = { id: 'new', startedAt: at(2026, 3, 5, 19), endedAt: at(2026, 3, 5, 23) };
    expect(validateAttack(candidate, existing, now)).toBe('overlap');
  });

  test('rejects an attack that encloses another', () => {
    const candidate = { id: 'new', startedAt: at(2026, 3, 4), endedAt: at(2026, 3, 6) };
    expect(validateAttack(candidate, existing, now)).toBe('overlap');
  });

  test('allows an attack that starts exactly when another ends', () => {
    const candidate = { id: 'new', startedAt: at(2026, 3, 5, 20), endedAt: at(2026, 3, 5, 23) };
    expect(validateAttack(candidate, existing, now)).toBeUndefined();
  });

  test('ignores the attack itself when editing', () => {
    const edited = { ...existing[0]!, endedAt: at(2026, 3, 5, 22) };
    expect(validateAttack(edited, existing, now)).toBeUndefined();
  });

  test('rejects an active attack that starts before an ended one', () => {
    const candidate = { id: 'new', startedAt: at(2026, 3, 5, 12) };
    expect(validateAttack(candidate, existing, now)).toBe('overlap');
  });

  test('rejects a second active attack', () => {
    const active = makeAttack({ startedAt: at(2026, 3, 10, 8) });
    expect(validateAttack({ id: 'new', startedAt: at(2026, 3, 10, 9) }, [active], now)).toBe(
      'activeAttackExists',
    );
  });

  test('rejects painMax below painAtStart', () => {
    const candidate = {
      id: 'new',
      startedAt: at(2026, 3, 6),
      endedAt: at(2026, 3, 7),
      painAtStart: 6,
      painMax: 4,
    };
    expect(validateAttack(candidate, existing, now)).toBe('painMaxBelowStart');
  });

  test('rejects pain levels outside 1–10', () => {
    const candidate = {
      id: 'new',
      startedAt: at(2026, 3, 6),
      endedAt: at(2026, 3, 7),
      painMax: 11,
    };
    expect(validateAttack(candidate, existing, now)).toBe('invalidPainLevel');
  });
});

describe('applyPainTap', () => {
  test('first tap sets start and maximum', () => {
    expect(applyPainTap({}, 5)).toEqual({ painAtStart: 5, painMax: 5 });
  });

  test('a higher tap raises the maximum only', () => {
    expect(applyPainTap({ painAtStart: 5, painMax: 5 }, 8)).toEqual({ painAtStart: 5, painMax: 8 });
  });

  test('a lower tap lowers the maximum', () => {
    expect(applyPainTap({ painAtStart: 5, painMax: 8 }, 6)).toEqual({ painAtStart: 5, painMax: 6 });
  });

  test('a tap below the start pain keeps the maximum at the start pain', () => {
    expect(applyPainTap({ painAtStart: 5, painMax: 8 }, 3)).toEqual({ painAtStart: 5, painMax: 5 });
  });
});
