import { addDays, isSameMonth, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import { Card } from '../../components/Card';
import { InsightCard } from '../../components/InsightCard';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ToggleChip } from '../../components/ToggleChip';
import {
  OVERUSE_MEDICATION_DAYS_PER_MONTH,
  OVERUSE_TRIPTAN_DAYS_PER_MONTH,
} from '../../domain/constants';
import { bucketSize, chartBuckets, chartPages } from '../../domain/chart';
import { lookbackRange, type DateRangePreset } from '../../domain/dateRange';
import { generateInsights } from '../../domain/insights';
import {
  firstDataDay,
  isActivePrevention,
  preventionEffect,
  preventionEffectGap,
  preventionOverlapsRange,
  preventionTrend,
} from '../../domain/prevention';
import {
  averageMigraineDaysPerMonth,
  averagePain,
  effectivenessSummary,
  overuseMonths,
  totalMedicationDays,
} from '../../domain/stats';
import type { Prevention } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import {
  formatDayRange,
  formatMonthYear,
  formatMonthYearShort,
  formatNumber,
  formatPercent,
} from '../../i18n/format';
import { useHomeData, useNow } from '../home/useHomeData';
import { StatsChart } from './StatsChart';
import { PreventionItem } from './PreventionItem';
import styles from './Stats.module.css';

const PRESETS: DateRangePreset[] = ['1W', '1M', '3M', '6M', '1Y', '2Y', 'all'];
const MAX_INSIGHTS = 3;
const NO_VALUE = '–';

export function StatsScreen() {
  const { t, language } = useI18n();
  const data = useHomeData();
  const now = useNow();
  const [preset, setPreset] = useState<DateRangePreset>('3M');
  // Undefined = the page with today.
  const [pageIndex, setPageIndex] = useState<number>();
  const [showMigraine, setShowMigraine] = useState(true);
  const [showMedication, setShowMedication] = useState(true);
  const chart = useMemo(() => {
    if (!data) return undefined;
    const firstDay = firstDataDay(data.attacks, data.intakes);
    const size = bucketSize(preset, now, firstDay);
    const pages = chartPages(preset, now, firstDay);
    const buckets = chartBuckets(pages, size, data.attacks, data.intakes, now);
    return { firstDay, size, pages, buckets };
  }, [data, preset, now]);

  if (!data || !chart) return null;
  const { attacks, intakes, medications, preventions } = data;
  const { firstDay, size, pages, buckets } = chart;
  // Cards and lists follow the page visible in the chart.
  const range = pages[pageIndex ?? pages.length - 1] ?? pages[pages.length - 1]!;
  const effectiveness = effectivenessSummary(intakes, range);
  const pain = averagePain(attacks, range);
  const overuse = overuseMonths(intakes, medications, range);
  const insights = generateInsights({
    attacks,
    intakes,
    medications,
    preventions,
    range: lookbackRange(preset, now, firstDay),
    now,
  })
    // Preventions are covered by their own section below.
    .filter((insight) => insight.kind !== 'preventionMedicationDaysChange')
    .slice(0, MAX_INSIGHTS);
  const preventionsInRange = preventions
    .filter((prevention) => preventionOverlapsRange(prevention, range))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const monthLabel = (month: string) =>
    formatMonthYear(parseISO(`${month}-01`).getTime(), language);
  const changePreset = (value: DateRangePreset) => {
    setPreset(value);
    setPageIndex(undefined);
  };
  const lastDay = addDays(range.end, -1).getTime();
  const period =
    preset === '1M' || (size === 'month' && isSameMonth(range.start, lastDay))
      ? formatMonthYear(range.start, language)
      : size === 'year'
        ? `${new Date(range.start).getFullYear()} – ${new Date(lastDay).getFullYear()}`
        : size === 'month'
          ? `${formatMonthYearShort(range.start, language)} – ${formatMonthYearShort(lastDay, language)}`
          : formatDayRange(range, language);

  const preventionPeriod = (prevention: Prevention) => {
    const start = formatMonthYearShort(parseISO(prevention.startDate).getTime(), language);
    return prevention.endDate
      ? `${start} – ${formatMonthYearShort(parseISO(prevention.endDate).getTime(), language)}`
      : t.stats.since(start);
  };

  return (
    <>
      <ScreenTitle>{t.stats.title}</ScreenTitle>

      <div className={styles.controls}>
        <SegmentedControl
          label={t.stats.range.label}
          options={PRESETS.map((value) => ({ value, label: t.stats.range[value] }))}
          value={preset}
          onChange={changePreset}
          compact
        />

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
        <p className={styles.period}>
          {size === 'day' ? `${period} · ${t.stats.painAxis}` : period}
        </p>
        <StatsChart
          key={preset}
          pages={buckets}
          size={size}
          showMigraine={showMigraine}
          showMedication={showMedication}
          onPageChange={setPageIndex}
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
            <InsightCard key={index} insight={insight} />
          ))}
        </section>
      )}

      {preventionsInRange.length > 0 && (
        <section className={styles.list}>
          <h2 className={styles.sectionLabel}>{t.stats.preventions}</h2>
          <Card className={styles.preventions}>
            {preventionsInRange.map((prevention) => (
              <PreventionItem
                key={prevention.id}
                prevention={prevention}
                period={preventionPeriod(prevention)}
                active={isActivePrevention(prevention, now)}
                effect={preventionEffect(prevention, attacks, intakes, now)}
                gap={preventionEffectGap(prevention, attacks, intakes, now)}
                trend={preventionTrend(prevention, attacks, intakes, now)}
              />
            ))}
          </Card>
        </section>
      )}
    </>
  );
}
