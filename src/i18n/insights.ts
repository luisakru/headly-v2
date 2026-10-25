import type { Insight } from '../domain/insights';
import type { Language } from '../domain/types';
import { formatNumber, formatPercent } from './format';
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
      const { preventionName, change } = insight;
      return change < 0
        ? templates.preventionFewerMedicationDays(preventionName, percent(-change))
        : templates.preventionMoreMedicationDays(preventionName, percent(change));
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
