import { useState } from 'react';
import { InfoButton } from '../../components/InfoButton';
import type { PreventionEffect } from '../../domain/prevention';
import type { Prevention } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatNumber } from '../../i18n/format';
import { formatPreventionWindows } from '../../i18n/insights';
import styles from './Stats.module.css';

type PreventionItemProps = {
  prevention: Prevention;
  period: string;
  active: boolean;
  effect?: PreventionEffect;
};

export function PreventionItem({ prevention, period, active, effect }: PreventionItemProps) {
  const { t, language } = useI18n();
  const [showDetail, setShowDetail] = useState(false);
  const number = (value: number) => formatNumber(value, language);
  const windows = effect && formatPreventionWindows(effect, language);

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
          <p className={styles.preventionMeta}>{t.stats.notEnoughData}</p>
        )}
        {showDetail && windows && (
          <p className={styles.preventionDetail}>
            {t.stats.preventionEffectDetail(effect.windowDays, windows.before, windows.after)}
          </p>
        )}
      </div>
      {effect && (
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
