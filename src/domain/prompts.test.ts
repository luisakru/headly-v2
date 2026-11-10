import { at, makeAttack, makeIntake } from '../test/factories';
import { activeAttackPrompt, intakesAwaitingRating, shouldShowBackupReminder } from './prompts';
import type { Settings } from './types';

describe('intakesAwaitingRating', () => {
  const now = at(2026, 3, 5, 12);

  test('includes unrated intakes older than 2 hours', () => {
    const old = makeIntake({ medicationId: 'm', takenAt: at(2026, 3, 5, 10) });
    const recent = makeIntake({ medicationId: 'm', takenAt: at(2026, 3, 5, 10, 30) });
    const rated = makeIntake({
      medicationId: 'm',
      takenAt: at(2026, 3, 5, 8),
      effectiveness: 'strong',
    });
    expect(intakesAwaitingRating([old, recent, rated], now)).toEqual([old]);
  });
});

describe('activeAttackPrompt', () => {
  test('asks after 6 hours', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 9) });
    expect(activeAttackPrompt(attack, at(2026, 3, 5, 14, 59))).toBeUndefined();
    expect(activeAttackPrompt(attack, at(2026, 3, 5, 15))).toBe('stillRunning');
  });

  test('stays quiet outside 08:00–22:00', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 9) });
    expect(activeAttackPrompt(attack, at(2026, 3, 5, 22))).toBeUndefined();
    expect(activeAttackPrompt(attack, at(2026, 3, 6, 7, 59))).toBeUndefined();
  });

  test('asks about yesterday the next morning', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 23) });
    expect(activeAttackPrompt(attack, at(2026, 3, 6, 8))).toBe('stillRunningNextDay');
  });

  test('ignores ended attacks', () => {
    const attack = makeAttack({ startedAt: at(2026, 3, 5, 1), endedAt: at(2026, 3, 5, 2) });
    expect(activeAttackPrompt(attack, at(2026, 3, 5, 12))).toBeUndefined();
  });
});

describe('shouldShowBackupReminder', () => {
  const now = at(2026, 3, 5, 12);
  const settings: Settings = {
    language: 'en',
    theme: 'system',
    backupReminderEnabled: true,
    installHintDismissed: false,
  };

  test('never backed up: shows from 5 records on', () => {
    expect(shouldShowBackupReminder(settings, 4, false, now)).toBe(false);
    expect(shouldShowBackupReminder(settings, 5, false, now)).toBe(true);
  });

  test('shows when the last backup is older than 30 days', () => {
    expect(
      shouldShowBackupReminder({ ...settings, lastBackupAt: at(2026, 2, 5, 12) }, 1, false, now),
    ).toBe(false);
    expect(
      shouldShowBackupReminder({ ...settings, lastBackupAt: at(2026, 2, 3) }, 1, false, now),
    ).toBe(true);
  });

  test('is hidden during an active attack, when snoozed, disabled or empty', () => {
    expect(shouldShowBackupReminder(settings, 10, true, now)).toBe(false);
    expect(
      shouldShowBackupReminder(
        { ...settings, backupReminderSnoozedUntil: at(2026, 3, 6) },
        10,
        false,
        now,
      ),
    ).toBe(false);
    expect(
      shouldShowBackupReminder({ ...settings, backupReminderEnabled: false }, 10, false, now),
    ).toBe(false);
    expect(shouldShowBackupReminder(settings, 0, false, now)).toBe(false);
  });
});
