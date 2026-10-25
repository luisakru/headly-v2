import { parseISO } from 'date-fns';
import { useState } from 'react';
import { Card } from '../../components/Card';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ToggleChip } from '../../components/ToggleChip';
import {
  OVERUSE_MEDICATION_DAYS_PER_MONTH,
  OVERUSE_TRIPTAN_DAYS_PER_MONTH,
} from '../../domain/constants';
import {
  resolveDateRange,
  toMonthKey,
  type DateRange,
  type DateRangePreset,
} from '../../domain/dateRange';
import { generateInsights } from '../../domain/insights';
import {
  isActivePrevention,
  preventionEffect,
  preventionOverlapsRange,
} from '../../domain/prevention';
import {
  averageMigraineDaysPerMonth,
  averagePain,
  effectivenessSummary,
  monthlyCounts,
  overuseMonths,
  totalMedicationDays,
} from '../../domain/stats';
import type { Prevention } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import {
  formatMonthYear,
  formatMonthYearShort,
  formatNumber,
  formatPercent,
} from '../../i18n/format';
import { formatInsight } from '../../i18n/insights';
import { useHomeData, useNow } from '../home/useHomeData';
import { MonthChart } from './MonthChart';
import styles from './Stats.module.css';

const PRESETS: DateRangePreset[] = ['1M', '3M', '6M', '1Y', 'custom'];
const MAX_INSIGHTS = 3;
const NO_VALUE = '–';

export function StatsScreen() {
  const { t, language } = useI18n();
  const data = useHomeData();
  const now = useNow();
  const [preset, setPreset] = useState<DateRangePreset>('3M');
  const [customMonths, setCustomMonths] = useState(() => {
    const defaultRange = resolveDateRange({ preset: '3M' }, Date.now());
    return { fromMonth: toMonthKey(defaultRange.start), toMonth: toMonthKey(Date.now()) };
  });
  const [showMigraine, setShowMigraine] = useState(true);
  const [showMedication, setShowMedication] = useState(true);

  if (!data) return null;
  const { attacks, intakes, medications, preventions } = data;

  const dateRange: DateRange = preset === 'custom' ? { preset, ...customMonths } : { preset };
  const range = resolveDateRange(dateRange, now);
  const effectiveness = effectivenessSummary(intakes, range);
  const pain = averagePain(attacks, range);
  const overuse = overuseMonths(intakes, medications, range);
  const insights = generateInsights({
    attacks,
    intakes,
    medications,
    preventions,
    range,
    now,
  }).slice(0, MAX_INSIGHTS);
  const preventionsInRange = preventions
    .filter((prevention) => preventionOverlapsRange(prevention, range))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const monthLabel = (month: string) =>
    formatMonthYear(parseISO(`${month}-01`).getTime(), language);
  const setCustomMonth = (key: 'fromMonth' | 'toMonth', value: string) => {
    // Clearing the native picker gives an empty value; keep the last month instead.
    if (value) setCustomMonths((current) => ({ ...current, [key]: value }));
  };

  const preventionPeriod = (prevention: Prevention) => {
    const start = formatMonthYearShort(parseISO(prevention.startDate).getTime(), language);
    return prevention.endDate
      ? `${start} – ${formatMonthYearShort(parseISO(prevention.endDate).getTime(), language)}`
      : t.stats.since(start);
  };
  const preventionEffectText = (prevention: Prevention) => {
    const effect = preventionEffect(prevention, attacks, intakes, now);
    if (!effect) return t.stats.notEnoughData;
    const { before, after } = effect.migraineDaysPer30;
    return t.stats.preventionEffect(formatNumber(before, language), formatNumber(after, language));
  };

  return (
    <>
      <ScreenTitle>{t.stats.title}</ScreenTitle>

      <div className={styles.controls}>
        <SegmentedControl
          label={t.stats.range.label}
          options={PRESETS.map((value) => ({ value, label: t.stats.range[value] }))}
          value={preset}
          onChange={setPreset}
        />

        {preset === 'custom' && (
          <div className={styles.monthPickers}>
            <label className={styles.monthPicker}>
              {t.stats.from}
              <input
                type="month"
                value={customMonths.fromMonth}
                onChange={(event) => setCustomMonth('fromMonth', event.target.value)}
              />
            </label>
            <label className={styles.monthPicker}>
              {t.stats.to}
              <input
                type="month"
                value={customMonths.toMonth}
                onChange={(event) => setCustomMonth('toMonth', event.target.value)}
              />
            </label>
          </div>
        )}

        <div className={styles.chips}>
          <ToggleChip
            label={t.stats.series.migraine}
            pressed={showMigraine}
            onChange={setShowMigraine}
            swatchColor="var(--color-primary-soft)"
          />
          <ToggleChip
            label={t.stats.series.medication}
            pressed={showMedication}
            onChange={setShowMedication}
            swatchColor="var(--color-primary)"
          />
        </div>
      </div>

      <Card className={styles.section}>
        <MonthChart
          months={monthlyCounts(attacks, intakes, range, now)}
          showMigraine={showMigraine}
          showMedication={showMedication}
        />
      </Card>

      <div className={`${styles.statCards} ${styles.section}`}>
        <Card>
          <p className={styles.statValue}>
            {formatNumber(averageMigraineDaysPerMonth(attacks, range, now), language)}
          </p>
          <p className={styles.statLabel}>{t.stats.averageMigraineDays}</p>
        </Card>
        <Card>
          <p className={styles.statValue}>
            {effectiveness.rate === undefined
              ? NO_VALUE
              : formatPercent(effectiveness.rate, language)}
          </p>
          <p className={styles.statLabel}>{t.stats.effectivenessRate}</p>
          {effectiveness.unrated > 0 && (
            <p className={styles.statLabel}>{t.stats.unrated(effectiveness.unrated)}</p>
          )}
        </Card>
        <Card>
          <p className={styles.statValue}>
            {pain === undefined ? NO_VALUE : formatNumber(pain, language)}
          </p>
          <p className={styles.statLabel}>{t.stats.averagePain}</p>
        </Card>
        <Card>
          <p className={styles.statValue}>{totalMedicationDays(intakes, range)}</p>
          <p className={styles.statLabel}>{t.stats.medicationDays}</p>
        </Card>
      </div>

      {overuse.length > 0 && (
        <div className={`${styles.warning} ${styles.section}`} role="alert">
          <p className={styles.warningTitle}>{t.stats.overuseTitle}</p>
          <p className={styles.warningText}>
            {t.stats.overuseText(
              overuse.map((month) => monthLabel(month.month)).join(', '),
              OVERUSE_TRIPTAN_DAYS_PER_MONTH,
              OVERUSE_MEDICATION_DAYS_PER_MONTH,
            )}
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <section className={styles.list}>
          <h2 className={styles.sectionLabel}>{t.stats.insights}</h2>
          {insights.map((insight, index) => (
            <Card key={index} className={styles.insight}>
              {formatInsight(insight, t, language)}
            </Card>
          ))}
        </section>
      )}

      {preventionsInRange.length > 0 && (
        <section className={styles.list}>
          <h2 className={styles.sectionLabel}>{t.stats.preventions}</h2>
          <Card className={styles.preventions}>
            {preventionsInRange.map((prevention) => {
              const active = isActivePrevention(prevention, now);
              return (
                <div key={prevention.id} className={styles.prevention}>
                  <span className={styles.dot} data-active={active} />
                  <div>
                    <p className={styles.preventionName}>
                      {[prevention.name, prevention.dose].filter(Boolean).join(' ')}
                    </p>
                    <p className={styles.preventionMeta}>
                      {active
                        ? `${preventionPeriod(prevention)} · ${t.stats.active}`
                        : preventionPeriod(prevention)}
                    </p>
                    <p className={styles.preventionMeta}>{preventionEffectText(prevention)}</p>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      )}
    </>
  );
}
