import type { Insight } from '../domain/insights';
import type { PreventionEffect } from '../domain/prevention';
import type { Language, TimeRange } from '../domain/types';
import { addDays } from 'date-fns';
import { countMonths } from '../domain/dateRange';
import { formatDateShort, formatMonthYear, formatNumber, formatPercent } from './format';
import type { Dictionary } from './locales/en';

export function formatInsight(insight: Insight, t: Dictionary, language: Language): string {
  const number = (value: number) => formatNumber(value, language);
  const percent = (share: number) => formatPercent(share, language);
  const templates = t.insights;

  switch (insight.kind) {
    case 'migraineDaysChange': {
      const { before, after } = insight;
      return after < before
        ? templates.migraineDaysDropped(number(before), number(after))
        : templates.migraineDaysRose(number(before), number(after));
    }
    case 'preventionMedicationDaysChange': {
      const { before, after } = insight.effect.medicationDaysPer30;
      return templates.preventionMedicationDays(
        insight.preventionName,
        number(before),
        number(after),
      );
    }
    case 'medicationEffectivenessChange': {
      const { medicationName, months, before, after } = insight;
      return after < before
        ? templates.medicationHelpedLess(medicationName, months, percent(before), percent(after))
        : templates.medicationHelpedMore(medicationName, months, percent(before), percent(after));
    }
    case 'fewerButStrongerAttacks':
      return templates.fewerButStronger(number(insight.painIncrease));
  }
}

const lastDay = (range: TimeRange) => addDays(range.end, -1).getTime();

/** Both compared windows of a prevention effect as date ranges. */
export function formatPreventionWindows(effect: PreventionEffect, language: Language) {
  const days = (range: TimeRange) =>
    `${formatDateShort(range.start, language)} – ${formatDateShort(lastDay(range), language)}`;
  return { before: days(effect.before), after: days(effect.after) };
}

/** How an insight was calculated, for insights that need explaining. */
export function formatInsightDetail(
  insight: Insight,
  t: Dictionary,
  language: Language,
): string | undefined {
  switch (insight.kind) {
    case 'migraineDaysChange': {
      const months = (range: TimeRange) =>
        countMonths(range) === 1
          ? formatMonthYear(range.start, language)
          : `${formatMonthYear(range.start, language)} – ${formatMonthYear(lastDay(range), language)}`;
      return t.insights.migraineDaysDetail(months(insight.previousRange), months(insight.range));
    }
    case 'preventionMedicationDaysChange': {
      const { before, after } = formatPreventionWindows(insight.effect, language);
      return t.insights.preventionDetail(insight.effect.windowDays, before, after);
    }
    default:
      return undefined;
  }
}
