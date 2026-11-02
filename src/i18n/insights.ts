import type { Insight } from '../domain/insights';
import type { PreventionEffect } from '../domain/prevention';
import type { Language } from '../domain/types';
import { formatDayRange, formatNumber, formatPercent } from './format';
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
      const { medicationName, before, after } = insight;
      return after < before
        ? templates.medicationHelpedLess(medicationName, percent(before), percent(after))
        : templates.medicationHelpedMore(medicationName, percent(before), percent(after));
    }
    case 'preventionEffectChange': {
      const { preventionName, early, recent, baseline } = insight;
      const before = baseline && number(baseline.migraineDaysPer30);
      return recent > early
        ? templates.preventionWeaker(preventionName, number(early), number(recent), before)
        : templates.preventionStronger(preventionName, number(early), number(recent), before);
    }
    case 'fewerButStrongerAttacks':
      return templates.fewerButStronger(number(insight.painIncrease));
  }
}

/** Both compared windows of a prevention effect as date ranges. */
export function formatPreventionWindows(effect: PreventionEffect, language: Language) {
  return {
    before: formatDayRange(effect.before, language),
    after: formatDayRange(effect.after, language),
  };
}

/** How an insight was calculated, for insights that need explaining. */
export function formatInsightDetail(
  insight: Insight,
  t: Dictionary,
  language: Language,
): string | undefined {
  switch (insight.kind) {
    case 'migraineDaysChange':
      return t.insights.migraineDaysDetail(
        formatDayRange(insight.previousRange, language),
        formatDayRange(insight.range, language),
      );
    case 'medicationEffectivenessChange':
      return t.insights.effectivenessDetail(
        formatDayRange(insight.previousRange, language),
        formatDayRange(insight.range, language),
      );
    case 'preventionMedicationDaysChange': {
      const { before, after } = formatPreventionWindows(insight.effect, language);
      return t.insights.preventionDetail(insight.effect.windowDays, before, after);
    }
    case 'preventionEffectChange':
      return t.insights.preventionChangeDetail(
        formatDayRange(insight.earlyRange, language),
        formatDayRange(insight.recentRange, language),
        insight.baseline && formatDayRange(insight.baseline.range, language),
      );
    default:
      return undefined;
  }
}
