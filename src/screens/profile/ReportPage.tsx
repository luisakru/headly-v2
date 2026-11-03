import { parseISO } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ChevronLeftIcon } from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { monthsInRange, PRESET_MONTHS, reportRange } from '../../domain/dateRange';
import { countDaysInRange, medicationDays, migraineDays } from '../../domain/days';
import { preventionOverlapsRange } from '../../domain/prevention';
import { effectivenessSummary } from '../../domain/stats';
import { useI18n } from '../../i18n/context';
import {
  formatDate,
  formatDateShort,
  formatDayRange,
  formatMonthYear,
  formatPercent,
} from '../../i18n/format';
import { useHomeData, useNow } from '../home/useHomeData';
import profileStyles from './Profile.module.css';
import styles from './Report.module.css';

const PRESETS = ['3M', '6M'] as const;
type ReportPreset = (typeof PRESETS)[number];

/** A plain printable summary for the doctor; "Create PDF" opens the browser's print menu. */
export function ReportPage() {
  const { t, language } = useI18n();
  const data = useHomeData();
  const now = useNow();
  const [preset, setPreset] = useState<ReportPreset>('3M');

  if (!data) return null;
  const { attacks, intakes, medications, preventions } = data;
  const range = reportRange(PRESET_MONTHS[preset], now);
  const migraine = migraineDays(attacks, now);
  const medication = medicationDays(intakes);
  const day = (isoDate: string) => formatDateShort(parseISO(isoDate).getTime(), language);

  const preventionsInRange = preventions
    .filter((prevention) => preventionOverlapsRange(prevention, range))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const effectiveness = medications.flatMap((med) => {
    const summary = effectivenessSummary(
      intakes.filter((intake) => intake.medicationId === med.id),
      range,
    );
    return summary.rated + summary.unrated > 0 ? [{ name: med.name, summary }] : [];
  });

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
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.report.month}</th>
                <th className={styles.number}>{t.report.migraineDays}</th>
                <th className={styles.number}>{t.report.medicationDays}</th>
              </tr>
            </thead>
            <tbody>
              {monthsInRange(range).map((month) => (
                <tr key={month.start}>
                  <td>{formatMonthYear(month.start, language)}</td>
                  <td className={styles.number}>{countDaysInRange(migraine, month)}</td>
                  <td className={styles.number}>{countDaysInRange(medication, month)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.report.preventions}</h2>
          {preventionsInRange.length === 0 ? (
            <p className={styles.meta}>{t.report.none}</p>
          ) : (
            <ul className={styles.list}>
              {preventionsInRange.map((prevention) => (
                <li key={prevention.id}>
                  {[prevention.name, prevention.dose].filter(Boolean).join(' ')}:{' '}
                  {prevention.endDate
                    ? `${day(prevention.startDate)} – ${day(prevention.endDate)}`
                    : t.profile.since(day(prevention.startDate))}
                </li>
              ))}
            </ul>
          )}
        </section>

        {effectiveness.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>{t.report.effectiveness}</h2>
            <ul className={styles.list}>
              {effectiveness.map(({ name, summary }) => (
                <li key={name}>
                  {name}:{' '}
                  {summary.rate === undefined
                    ? t.report.notRated
                    : t.report.helped(
                        formatPercent(summary.rate, language),
                        Math.round(summary.rate * summary.rated),
                        summary.rated,
                      )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
