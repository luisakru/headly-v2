import { addMonths, parseISO, startOfMonth } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ChevronLeftIcon } from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { chartBuckets } from '../../domain/chart';
import {
  OVERUSE_MEDICATION_DAYS_PER_MONTH,
  OVERUSE_TRIPTAN_DAYS_PER_MONTH,
} from '../../domain/constants';
import { PRESET_MONTHS, reportRange } from '../../domain/dateRange';
import {
  countDaysInRange,
  durationParts,
  isInRange,
  migraineDays,
  triptanDays,
} from '../../domain/days';
import {
  lifeEventPeriod,
  preventionEffect,
  preventionOverlapsRange,
} from '../../domain/prevention';
import {
  averageMigraineDaysPerMonth,
  averagePain,
  effectivenessSummary,
  overuseMonths,
  totalMedicationDays,
} from '../../domain/stats';
import type { Attack, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatDayRange,
  formatMonthYear,
  formatNumber,
  formatPercent,
} from '../../i18n/format';
import { useHomeData, useNow } from '../home/useHomeData';
import { StatsChart } from '../stats/StatsChart';
import profileStyles from './Profile.module.css';
import styles from './Report.module.css';

const PRESETS = ['3M', '6M'] as const;
type ReportPreset = (typeof PRESETS)[number];
const NO_VALUE = '–';

type Row =
  | { kind: 'attack'; time: number; attack: Attack }
  | { kind: 'intake'; time: number; intake: MedicationIntake };

/** A printable summary for the doctor; "Create PDF" opens the browser's print menu. */
export function ReportPage() {
  const { t, language } = useI18n();
  const data = useHomeData();
  const now = useNow();
  const [preset, setPreset] = useState<ReportPreset>('3M');

  if (!data) return null;
  const { attacks, intakes, medications, preventions, lifeEvents } = data;
  const range = reportRange(PRESET_MONTHS[preset], now);
  const chartPage = { start: range.start, end: addMonths(startOfMonth(now), 1).getTime() };
  const buckets = chartBuckets([chartPage], 'month', attacks, intakes, now);
  const effectiveness = effectivenessSummary(intakes, range);
  const pain = averagePain(attacks, range);
  const overuse = overuseMonths(intakes, medications, range);
  const number = (value: number) => formatNumber(value, language);
  const medicationName = (id: string) => medications.find((m) => m.id === id)?.name ?? '';
  const intakeText = (intake: MedicationIntake) =>
    `${medicationName(intake.medicationId)} · ${t.effectiveness[intake.effectiveness ?? 'pending']}`;

  const rows: Row[] = [
    ...attacks
      .filter((attack) => isInRange(attack.startedAt, range))
      .map((attack) => ({ kind: 'attack' as const, time: attack.startedAt, attack })),
    ...intakes
      .filter((intake) => !intake.attackId && isInRange(intake.takenAt, range))
      .map((intake) => ({ kind: 'intake' as const, time: intake.takenAt, intake })),
  ].sort((a, b) => a.time - b.time);

  const preventionsInRange = preventions
    .filter((prevention) => preventionOverlapsRange(prevention, range))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const lifeEventsInRange = lifeEvents
    .filter((lifeEvent) => isInRange(parseISO(lifeEvent.date).getTime(), range))
    .sort((a, b) => a.date.localeCompare(b.date));
  const effectLines = (effect: ReturnType<typeof preventionEffect>) =>
    effect && (
      <>
        <p className={styles.meta}>
          {t.stats.preventionMigraineDays(
            number(effect.migraineDaysPer30.before),
            number(effect.migraineDaysPer30.after),
          )}
        </p>
        <p className={styles.meta}>
          {t.stats.preventionMedicationDays(
            number(effect.medicationDaysPer30.before),
            number(effect.medicationDaysPer30.after),
          )}
        </p>
      </>
    );
  const day = (isoDate: string) => formatDateShort(parseISO(isoDate).getTime(), language);

  const overview: [string, string][] = [
    [t.report.migraineDays, String(countDaysInRange(migraineDays(attacks, now), range))],
    [t.report.migraineDaysPerMonth, number(averageMigraineDaysPerMonth(attacks, range, now))],
    [t.report.medicationDays, String(totalMedicationDays(intakes, range))],
    [t.report.triptanDays, String(countDaysInRange(triptanDays(intakes, medications), range))],
    [t.stats.averagePain, pain === undefined ? NO_VALUE : number(pain)],
    [
      t.stats.effectivenessRate,
      effectiveness.rate === undefined
        ? NO_VALUE
        : [
            formatPercent(effectiveness.rate, language),
            ...(effectiveness.unrated > 0 ? [t.stats.unrated(effectiveness.unrated)] : []),
          ].join(' · '),
    ],
  ];

  return (
    <>
      <div className={styles.controls}>
        <Link to="/profile" className={profileStyles.backLink}>
          <ChevronLeftIcon />
          {t.profile.backToProfile}
        </Link>
        <ScreenTitle>{t.profile.pdfExport}</ScreenTitle>
        <SegmentedControl
          label={t.report.rangeLabel}
          options={PRESETS.map((value) => ({ value, label: t.report.months[value] }))}
          value={preset}
          onChange={setPreset}
        />
        <p className={styles.hint}>{t.report.hint}</p>
        <Button large onClick={() => window.print()}>
          {t.report.create}
        </Button>
      </div>

      <article className={styles.report}>
        <header>
          <h1 className={styles.heading}>{t.report.heading}</h1>
          <p className={styles.meta}>{t.report.period(formatDayRange(range, language))}</p>
          <p className={styles.meta}>{t.report.createdOn(formatDate(now, language))}</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.report.overview}</h2>
          <dl className={styles.overview}>
            {overview.map(([label, value]) => (
              <div key={label} className={styles.overviewRow}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {overuse.length > 0 && (
            <div className={styles.warning}>
              <p className={styles.warningTitle}>{t.stats.overuseTitle}</p>
              <p className={styles.warningText}>
                {t.stats.overuseText(
                  overuse
                    .map((month) =>
                      formatMonthYear(parseISO(`${month.month}-01`).getTime(), language),
                    )
                    .join(', '),
                  OVERUSE_TRIPTAN_DAYS_PER_MONTH,
                  OVERUSE_MEDICATION_DAYS_PER_MONTH,
                )}
              </p>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.migraineSwatch} />
              {t.stats.series.migraine}
            </span>
            <span className={styles.legendItem}>
              <span className={styles.medicationSwatch} />
              {t.stats.series.medication}
            </span>
          </div>
          <StatsChart
            pages={buckets}
            size="month"
            lifeEvents={[]}
            showMigraine
            showMedication
            onPageChange={() => {}}
          />
        </section>

        {preventionsInRange.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>{t.stats.preventions}</h2>
            {preventionsInRange.map((prevention) => (
              <div key={prevention.id} className={styles.item}>
                <p className={styles.itemName}>
                  {[prevention.name, prevention.dose].filter(Boolean).join(' ')}
                </p>
                <p className={styles.meta}>
                  {prevention.endDate
                    ? `${day(prevention.startDate)} – ${day(prevention.endDate)}`
                    : t.profile.since(day(prevention.startDate))}
                </p>
                {effectLines(preventionEffect(prevention, attacks, intakes, now))}
              </div>
            ))}
          </section>
        )}

        {lifeEventsInRange.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>{t.stats.lifeEvents}</h2>
            {lifeEventsInRange.map((lifeEvent) => (
              <div key={lifeEvent.id} className={styles.item}>
                <p className={styles.itemName}>{lifeEvent.name}</p>
                <p className={styles.meta}>{day(lifeEvent.date)}</p>
                {effectLines(preventionEffect(lifeEventPeriod(lifeEvent), attacks, intakes, now))}
              </div>
            ))}
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.report.attacks}</h2>
          {rows.length === 0 ? (
            <p className={styles.meta}>{t.report.noAttacks}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.dateColumn}>{t.report.date}</th>
                  <th>{t.dayDetail.duration}</th>
                  <th>{t.dayDetail.pain}</th>
                  <th className={styles.medicationColumn}>{t.dayDetail.medications}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) =>
                  row.kind === 'attack' ? (
                    <tr key={row.attack.id}>
                      <td>{formatDateTime(row.time, language)}</td>
                      <td>
                        {t.activeAttack.duration(
                          durationParts((row.attack.endedAt ?? now) - row.attack.startedAt),
                        )}
                      </td>
                      <td>
                        {row.attack.painLevel === undefined
                          ? NO_VALUE
                          : t.dayDetail.painOutOfTen(row.attack.painLevel)}
                      </td>
                      <td>
                        {intakes
                          .filter((intake) => intake.attackId === row.attack.id)
                          .map((intake) => (
                            <span key={intake.id} className={styles.intake}>
                              {intakeText(intake)}
                            </span>
                          ))}
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.intake.id}>
                      <td>{formatDateTime(row.time, language)}</td>
                      <td>{NO_VALUE}</td>
                      <td>{NO_VALUE}</td>
                      <td>{intakeText(row.intake)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </section>

        <p className={styles.meta}>{t.profile.disclaimer}</p>
      </article>
    </>
  );
}
