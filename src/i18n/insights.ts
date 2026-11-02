import type { Insight } from '../domain/insights';
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

/** How an insight was calculated, for insights that need explaining. */
export function formatInsightDetail(
  insight: Insight,
  t: Dictionary,
  language: Language,
): string | undefined {
  const lastDay = (range: TimeRange) => addDays(range.end, -1).getTime();
  switch (insight.kind) {
    case 'migraineDaysChange': {
      const months = (range: TimeRange) =>
        countMonths(range) === 1
          ? formatMonthYear(range.start, language)
          : `${formatMonthYear(range.start, language)} – ${formatMonthYear(lastDay(range), language)}`;
      return t.insights.migraineDaysDetail(months(insight.previousRange), months(insight.range));
    }
    case 'preventionMedicationDaysChange': {
      const { windowDays, before, after } = insight.effect;
      const days = (range: TimeRange) =>
        `${formatDateShort(range.start, language)} – ${formatDateShort(lastDay(range), language)}`;
      return t.insights.preventionDetail(windowDays, days(before), days(after));
    }
    default:
      return undefined;
  }
}
