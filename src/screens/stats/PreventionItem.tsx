import { useState } from 'react';
import { InfoButton } from '../../components/InfoButton';
import {
  PREVENTION_WINDOW_MIN_DAYS,
  PREVENTION_WINDOW_RELIABLE_DAYS,
} from '../../domain/constants';
import type {
  PreventionChart as PreventionChartData,
  PreventionEffect,
  PreventionEffectGap,
} from '../../domain/prevention';
import type { Prevention } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatNumber } from '../../i18n/format';
import { formatPreventionWindows } from '../../i18n/insights';
import { PreventionChart } from './PreventionChart';
import styles from './Stats.module.css';

// Fewer blocks say little more than the numbers above.
const MIN_CHART_BLOCKS = 3;

type PreventionItemProps = {
  prevention: Prevention;
  period: string;
  active: boolean;
  effect?: PreventionEffect;
  gap?: PreventionEffectGap;
  chart?: PreventionChartData;
};

export function PreventionItem({
  prevention,
  period,
  active,
  effect,
  gap,
  chart,
}: PreventionItemProps) {
  const { t, language } = useI18n();
  const [showDetail, setShowDetail] = useState(false);
  const number = (value: number) => formatNumber(value, language);
  const windows = effect && formatPreventionWindows(effect, language);
  const showChart =
    chart !== undefined &&
    chart.blocks.length >= MIN_CHART_BLOCKS &&
    chart.blocks.some((block) => block.phase === 'buildUp' || block.phase === 'effective');
  const gapText = (gap: PreventionEffectGap) => {
    switch (gap.reason) {
      case 'noData':
      case 'effectiveAfterEnd':
        return t.stats.effectGap[gap.reason];
      case 'shortBefore':
      case 'shortAfter':
      case 'shortAfterEffective':
        return t.stats.effectGap[gap.reason](gap.days, PREVENTION_WINDOW_MIN_DAYS);
    }
  };

  return (
    <div className={styles.prevention}>
      <span className={styles.dot} data-active={active} />
      <div className={styles.preventionText}>
        <p className={styles.preventionName}>
          {[prevention.name, prevention.dose].filter(Boolean).join(' ')}
        </p>
        <p className={styles.preventionMeta}>{active ? `${period} · ${t.stats.active}` : period}</p>
        {effect ? (
          <>
            <p className={styles.preventionMeta}>
              {t.stats.preventionMigraineDays(
                number(effect.migraineDaysPer30.before),
                number(effect.migraineDaysPer30.after),
              )}
            </p>
            <p className={styles.preventionMeta}>
              {t.stats.preventionMedicationDays(
                number(effect.medicationDaysPer30.before),
                number(effect.medicationDaysPer30.after),
              )}
            </p>
          </>
        ) : (
          gap && <p className={styles.preventionMeta}>{gapText(gap)}</p>
        )}
        {effect && effect.windowDays < PREVENTION_WINDOW_RELIABLE_DAYS && (
          <p className={styles.preventionMeta}>{t.stats.shortComparison(effect.windowDays)}</p>
        )}
        {showChart && <PreventionChart chart={chart} />}
        {showDetail && (
          <p className={styles.preventionDetail}>
            {[
              ...(windows
                ? [t.stats.preventionEffectDetail(effect.windowDays, windows.before, windows.after)]
                : []),
              ...(showChart ? [t.stats.chartDetail] : []),
            ].join(' ')}
          </p>
        )}
      </div>
      {(effect || showChart) && (
        <span className={styles.preventionInfo}>
          <InfoButton
            label={t.stats.howCalculated}
            expanded={showDetail}
            onClick={() => setShowDetail(!showDetail)}
          />
        </span>
      )}
    </div>
  );
}
