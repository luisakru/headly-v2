import { addDays, eachDayOfInterval } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ChevronLeftIcon } from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { monthsInRange, PRESET_MONTHS, reportRange } from '../../domain/dateRange';
import { countAttacksStartedIn } from '../../domain/stats';
import { attacksOnDay, intakesOnDay, isInRange, toDayKey } from '../../domain/days';
import { useI18n } from '../../i18n/context';
import { formatDateShort, formatDayRange, formatMonthYear } from '../../i18n/format';
import { useHomeData, useNow } from '../home/useHomeData';
import profileStyles from './Profile.module.css';
import styles from './Report.module.css';

const PRESETS = ['3M', '6M'] as const;
type ReportPreset = (typeof PRESETS)[number];
const NO_VALUE = '–';

/** A monthly overview and one row per day for the doctor, only rendered when printing; "Create PDF" opens the print menu. */
export function ReportPage() {
  const { t, language } = useI18n();
  const data = useHomeData();
  const now = useNow();
  const [preset, setPreset] = useState<ReportPreset>('3M');

  if (!data) return null;
  const { attacks, intakes, medications } = data;
  const range = reportRange(PRESET_MONTHS[preset], now);
  const months = monthsInRange(range);
  const days = eachDayOfInterval({ start: range.start, end: addDays(range.end, -1) });
  const medicationName = (id: string) => medications.find((m) => m.id === id)?.name ?? '';

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
        <h1 className={styles.heading}>{t.report.heading}</h1>
        <p className={styles.meta}>{t.report.period(formatDayRange(range, language))}</p>
        <table className={`${styles.table} ${styles.month}`}>
          <thead>
            <tr>
              <th>{t.report.month}</th>
              <th className={styles.number}>{t.report.attacks}</th>
              <th className={styles.number}>{t.report.intakes}</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.start}>
                <td>{formatMonthYear(month.start, language)}</td>
                <td className={styles.number}>{countAttacksStartedIn(attacks, month)}</td>
                <td className={styles.number}>
                  {intakes.filter((intake) => isInRange(intake.takenAt, month)).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {months.map((month) => (
          <section key={month.start} className={styles.month}>
            <h2 className={styles.monthHeading}>{formatMonthYear(month.start, language)}</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.report.date}</th>
                  <th>{t.report.migraine}</th>
                  <th>{t.dayDetail.pain}</th>
                  <th>{t.dayDetail.medications}</th>
                  <th>{t.report.helped}</th>
                </tr>
              </thead>
              <tbody>
                {days
                  .filter((day) => isInRange(day.getTime(), month))
                  .map((day) => {
                    const dayKey = toDayKey(day);
                    const dayAttacks = attacksOnDay(attacks, dayKey, now);
                    const dayIntakes = intakesOnDay(intakes, dayKey);
                    const pains = dayAttacks.flatMap((attack) =>
                      attack.painLevel === undefined ? [] : [attack.painLevel],
                    );
                    return (
                      <tr key={dayKey}>
                        <td>{formatDateShort(day.getTime(), language)}</td>
                        <td>{dayAttacks.length > 0 ? t.report.yes : ''}</td>
                        <td>
                          {pains.length > 0
                            ? t.dayDetail.painOutOfTen(Math.max(...pains))
                            : dayAttacks.length > 0
                              ? NO_VALUE
                              : ''}
                        </td>
                        <td>
                          {dayIntakes.map((intake) => (
                            <span key={intake.id} className={styles.line}>
                              {medicationName(intake.medicationId)}
                            </span>
                          ))}
                        </td>
                        <td>
                          {dayIntakes.map((intake) => (
                            <span key={intake.id} className={styles.line}>
                              {intake.effectiveness
                                ? t.effectiveness[intake.effectiveness]
                                : NO_VALUE}
                            </span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </section>
        ))}
      </article>
    </>
  );
}
