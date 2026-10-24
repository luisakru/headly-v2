import { differenceInCalendarDays, getHours } from 'date-fns';
import {
  BACKUP_REMINDER_AFTER_MS,
  BACKUP_REMINDER_MIN_RECORDS,
  PROMPT_HOURS_END,
  PROMPT_HOURS_START,
  RATING_PROMPT_DELAY_MS,
  STILL_RUNNING_PROMPT_AFTER_MS,
} from './constants';
import type { Attack, MedicationIntake, Settings } from './types';

export type AttackPrompt = 'stillRunning' | 'stillRunningNextDay';

export function intakesAwaitingRating(intakes: MedicationIntake[], now: number) {
  return intakes.filter(
    (intake) =>
      intake.effectiveness === undefined && now - intake.takenAt >= RATING_PROMPT_DELAY_MS,
  );
}

export function activeAttackPrompt(
  attack: Attack | undefined,
  now: number,
): AttackPrompt | undefined {
  if (!attack || attack.endedAt !== undefined) return undefined;
  const hour = getHours(now);
  if (hour < PROMPT_HOURS_START || hour >= PROMPT_HOURS_END) return undefined;
  if (differenceInCalendarDays(now, attack.startedAt) >= 1) return 'stillRunningNextDay';
  if (now - attack.startedAt >= STILL_RUNNING_PROMPT_AFTER_MS) return 'stillRunning';
  return undefined;
}

export function shouldShowBackupReminder(
  settings: Settings,
  recordCount: number,
  hasActiveAttack: boolean,
  now: number,
): boolean {
  if (!settings.backupReminderEnabled || hasActiveAttack || recordCount === 0) return false;
  if (
    settings.backupReminderSnoozedUntil !== undefined &&
    now < settings.backupReminderSnoozedUntil
  ) {
    return false;
  }
  if (settings.lastBackupAt === undefined) return recordCount >= BACKUP_REMINDER_MIN_RECORDS;
  return now - settings.lastBackupAt > BACKUP_REMINDER_AFTER_MS;
}
