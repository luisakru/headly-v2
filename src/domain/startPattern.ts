import {
  START_PATTERN_MIN_ATTACKS,
  START_PATTERN_MIN_DAY_PART_SHARE,
  START_PATTERN_MIN_SHOWN,
  START_PATTERN_MIN_WEEKDAY_COUNT,
  START_PATTERN_MIN_WEEKDAY_RATIO,
  START_PATTERN_MIN_WEEKEND_RATIO,
} from './constants';
import { isInRange } from './days';
import type { Attack, TimeRange } from './types';

/** Night 0–6, morning 6–12, afternoon 12–18, evening 18–24. */
export const DAY_PARTS = ['night', 'morning', 'afternoon', 'evening'] as const;
export type DayPart = (typeof DAY_PARTS)[number];

export type StartPattern = {
  /** Attack starts per weekday, Monday first. */
  weekdays: number[];
  /** Attack starts per part of the day, in `DAY_PARTS` order. */
  dayParts: number[];
  /** Indexes that stand out; empty when nothing does or there are too few attacks to tell. */
  notableWeekdays: number[];
  notableDayParts: number[];
};

/** When attacks in the range start, with the weekdays and parts of the day that stand out. */
export function startPattern(attacks: Attack[], range: TimeRange): StartPattern | undefined {
  const starts = attacks
    .map((attack) => new Date(attack.startedAt))
    .filter((date) => isInRange(date.getTime(), range));
  if (starts.length < START_PATTERN_MIN_SHOWN) return undefined;

  const weekdays = Array<number>(7).fill(0);
  const dayParts = Array<number>(DAY_PARTS.length).fill(0);
  for (const date of starts) {
    weekdays[(date.getDay() + 6) % 7]! += 1;
    dayParts[Math.floor(date.getHours() / 6)]! += 1;
  }

  const total = starts.length;
  if (total < START_PATTERN_MIN_ATTACKS) {
    return { weekdays, dayParts, notableWeekdays: [], notableDayParts: [] };
  }
  const notableWeekdays = weekdays.flatMap((count, index) =>
    count >= START_PATTERN_MIN_WEEKDAY_RATIO * (total / 7) &&
    count >= START_PATTERN_MIN_WEEKDAY_COUNT
      ? [index]
      : [],
  );
  const weekend = weekdays[5]! + weekdays[6]!;
  if (weekend >= START_PATTERN_MIN_WEEKEND_RATIO * ((2 * total) / 7)) {
    for (const index of [5, 6]) if (!notableWeekdays.includes(index)) notableWeekdays.push(index);
  }
  const notableDayParts = dayParts.flatMap((count, index) =>
    count >= START_PATTERN_MIN_DAY_PART_SHARE * total ? [index] : [],
  );

  return { weekdays, dayParts, notableWeekdays, notableDayParts };
}
