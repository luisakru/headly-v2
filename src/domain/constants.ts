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

/** A small event needs this many occurrences before Headly says it is followed by migraine. */
export const DAY_EVENT_MIN_COUNT = 4;
export const DAY_EVENT_MIN_RATE = 0.5;
/** How many times the usual rate counts as clearly more often. */
export const DAY_EVENT_MIN_RATIO = 2;
/** Saying an event is unrelated needs more occurrences than saying it is related. */
export const DAY_EVENT_UNRELATED_MIN_COUNT = 8;
export const DAY_EVENT_UNRELATED_MAX_RATIO = 1.25;
/** Days needed to know the usual rate. */
export const DAY_EVENT_MIN_BASELINE_DAYS = 14;

/** ICHD-3 A1.1: day 1 ± 2 of menstruation, i.e. from two days before to two days after the first day. */
export const MENSTRUAL_WINDOW_DAYS_BEFORE = 2;
export const MENSTRUAL_WINDOW_DAYS_AFTER = 2;
export const MENSTRUAL_MIN_CYCLES = 3;
/** ICHD-3: in at least two out of three cycles. */
export const MENSTRUAL_MIN_SHARE = 2 / 3;
/** Period days within this many days of an earlier one belong to the same period. */
export const PERIOD_MIN_GAP_DAYS = 10;
