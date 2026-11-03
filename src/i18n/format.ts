import { addDays } from 'date-fns';
import type { Language, TimeRange } from '../domain/types';

export function formatTime(time: number, language: Language): string {
  return new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit' }).format(time);
}

export function formatDateTime(time: number, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(time);
}

export function formatDate(time: number | Date, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(time);
}

export function formatMonthYear(time: number, language: Language): string {
  return new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(time);
}

/** Short weekday without the trailing period German adds ("Mo." → "Mo"). */
export function formatWeekday(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(language, { weekday: 'short' }).format(date).replace('.', '');
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(share: number, language: Language): string {
  return new Intl.NumberFormat(language, { style: 'percent' }).format(share);
}

/** Compact month label for chart axes, e.g. "Nov 25". */
export function formatMonthShort(time: number, language: Language): string {
  return new Intl.DateTimeFormat(language, { month: 'short', year: '2-digit' })
    .format(time)
    .replace('.', '');
}

/** Month without the year for chart axes, e.g. "Nov" or "N". */
export function formatMonthAxis(
  time: number,
  language: Language,
  width: 'short' | 'narrow',
): string {
  return new Intl.DateTimeFormat(language, { month: width }).format(time).replace('.', '');
}

export function formatMonthYearShort(time: number, language: Language): string {
  return new Intl.DateTimeFormat(language, { month: 'short', year: 'numeric' })
    .format(time)
    .replace('.', '');
}

export function formatDateShort(time: number, language: Language): string {
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(time);
}

export function formatDayMonth(time: number, language: Language): string {
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).format(time);
}

/** First to last day of a range whose end is exclusive. */
export function formatDayRange(range: TimeRange, language: Language): string {
  const lastDay = addDays(range.end, -1).getTime();
  return `${formatDateShort(range.start, language)} – ${formatDateShort(lastDay, language)}`;
}
