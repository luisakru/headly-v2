const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const PAIN_LEVEL_MIN = 0;
export const PAIN_LEVEL_MAX = 10;

export const OVERUSE_TRIPTAN_DAYS_PER_MONTH = 10;
export const OVERUSE_MEDICATION_DAYS_PER_MONTH = 15;

export const RATING_PROMPT_DELAY_MS = 2 * HOUR_MS;
export const STILL_RUNNING_PROMPT_AFTER_MS = 6 * HOUR_MS;
export const PROMPT_HOURS_START = 8;
export const PROMPT_HOURS_END = 22;

export const PREVENTION_WINDOW_MAX_DAYS = 90;
export const PREVENTION_WINDOW_MIN_DAYS = 14;
/** Shorter comparisons are shown but marked as not very meaningful. */
export const PREVENTION_WINDOW_RELIABLE_DAYS = 30;
export const PREVENTION_TREND_BLOCK_DAYS = 30;
/** Blocks compared at the start and lately, i.e. 90 days each. */
export const PREVENTION_CHANGE_BLOCKS = 3;
/** Beyond this many 30-day blocks the prevention chart uses 60-day blocks. */
export const PREVENTION_CHART_MAX_BLOCKS = 24;

export const BACKUP_REMINDER_AFTER_MS = 30 * DAY_MS;
export const BACKUP_REMINDER_MIN_RECORDS = 5;
export const BACKUP_REMINDER_SNOOZE_MS = 7 * DAY_MS;

export const INSIGHT_MIN_MIGRAINE_DAYS_CHANGE = 1;
export const INSIGHT_MIN_PAIN_INCREASE = 0.5;
export const INSIGHT_MIN_PREVENTION_CHANGE = 0.1;
export const INSIGHT_MIN_RATED_INTAKES = 5;
export const INSIGHT_MIN_EFFECTIVENESS_CHANGE = 0.1;
