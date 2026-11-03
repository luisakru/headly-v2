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
import { useI18n } from '../../i18n/context';
import { formatNumber } from '../../i18n/format';
import { formatPreventionWindows } from '../../i18n/insights';
import { PreventionChart } from './PreventionChart';
import styles from './Stats.module.css';

// Fewer blocks say little more than the numbers above.
const MIN_CHART_BLOCKS = 3;

function trendArrow(before: string, after: string, beforeValue: number, afterValue: number) {
  if (before === after) return '→';
  return afterValue > beforeValue ? '↗' : '↘';
}

type EffectItemProps = {
  kind: 'prevention' | 'lifeEvent';
  title: string;
  meta: string;
  active: boolean;
  effect?: PreventionEffect;
  gap?: PreventionEffectGap;
  chart?: PreventionChartData;
};

/** A prevention or life event with its before/after effect and chart. */
export function EffectItem({ kind, title, meta, active, effect, gap, chart }: EffectItemProps) {
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
        return (kind === 'lifeEvent' ? t.stats.lifeEventGap : t.stats.effectGap)[gap.reason](
          gap.days,
          PREVENTION_WINDOW_MIN_DAYS,
        );
      case 'shortAfterEffective':
        return t.stats.effectGap[gap.reason](gap.days, PREVENTION_WINDOW_MIN_DAYS);
    }
  };

  return (
    <div className={styles.prevention}>
      <span className={styles.dot} data-active={active} />
      <div className={styles.preventionText}>
        <p className={styles.preventionName}>{title}</p>
        <p className={styles.preventionMeta}>{meta}</p>
        {effect ? (
          <>
            <p className={styles.preventionMeta}>
              {t.stats.preventionMigraineDays(
                number(effect.migraineDaysPer30.before),
                number(effect.migraineDaysPer30.after),
                trendArrow(
                  number(effect.migraineDaysPer30.before),
                  number(effect.migraineDaysPer30.after),
                  effect.migraineDaysPer30.before,
                  effect.migraineDaysPer30.after,
                ),
              )}
            </p>
            <p className={styles.preventionMeta}>
              {t.stats.preventionMedicationDays(
                number(effect.medicationDaysPer30.before),
                number(effect.medicationDaysPer30.after),
                trendArrow(
                  number(effect.medicationDaysPer30.before),
                  number(effect.medicationDaysPer30.after),
                  effect.medicationDaysPer30.before,
                  effect.medicationDaysPer30.after,
                ),
              )}
            </p>
          </>
        ) : (
          gap && <p className={styles.preventionMeta}>{gapText(gap)}</p>
        )}
        {effect && effect.windowDays < PREVENTION_WINDOW_RELIABLE_DAYS && (
          <p className={styles.preventionMeta}>{t.stats.shortComparison(effect.windowDays)}</p>
        )}
        {showChart && (
          <PreventionChart
            chart={chart}
            {...(kind === 'lifeEvent' && {
              label: t.stats.lifeEventChartLabel,
              startLabel: t.stats.chartMarkers.lifeEvent,
            })}
          />
        )}
        {showDetail && (
          <p className={styles.preventionDetail}>
            {[
              ...(windows
                ? [
                    (kind === 'lifeEvent'
                      ? t.stats.lifeEventEffectDetail
                      : t.stats.preventionEffectDetail)(
                      effect.windowDays,
                      windows.before,
                      windows.after,
                    ),
                  ]
                : []),
              ...(showChart
                ? [kind === 'lifeEvent' ? t.stats.lifeEventChartDetail : t.stats.chartDetail]
                : []),
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
