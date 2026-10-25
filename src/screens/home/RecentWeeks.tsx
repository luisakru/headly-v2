import { dayKind, recentWeekDays } from '../../domain/calendar';
import { medicationDays, migraineDays, toDayKey } from '../../domain/days';
import type { Attack, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatWeekday } from '../../i18n/format';
import styles from './Home.module.css';

const WEEKS = 4;

type RecentWeeksProps = {
  attacks: Attack[];
  intakes: MedicationIntake[];
  now: number;
};

export function RecentWeeks({ attacks, intakes, now }: RecentWeeksProps) {
  const { t, language } = useI18n();
  const days = recentWeekDays(now, WEEKS);
  const migraine = migraineDays(attacks, now);
  const medication = medicationDays(intakes);
  const todayKey = toDayKey(now);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionLabel}>{t.home.lastFourWeeks}</h2>
      <div className={styles.weekGrid}>
        {days.slice(0, 7).map((day) => (
          <span key={day.getDay()} className={styles.weekday}>
            {formatWeekday(day, language)}
          </span>
        ))}
        {days.map((day) => {
          const dayKey = toDayKey(day);
          return (
            <span
              key={dayKey}
              className={styles.dayCell}
              data-kind={dayKind(dayKey, migraine, medication)}
              data-today={dayKey === todayKey || undefined}
              data-future={dayKey > todayKey || undefined}
            >
              {day.getDate()}
            </span>
          );
        })}
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} data-kind="migraine" />
          {t.dayLegend.migraine}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} data-kind="migraineWithMedication" />
          {t.dayLegend.withMedication}
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} />
          {t.dayLegend.today}
        </span>
      </div>
    </section>
  );
}
