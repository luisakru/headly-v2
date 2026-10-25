import { useState } from 'react';
import { DayDetailCard } from '../../components/DayDetailCard';
import { dayKind, recentWeekDays } from '../../domain/calendar';
import { medicationDays, migraineDays, toDayKey } from '../../domain/days';
import type { Attack, Medication, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatDate, formatWeekday } from '../../i18n/format';
import styles from './Home.module.css';

const WEEKS = 4;

type RecentWeeksProps = {
  attacks: Attack[];
  intakes: MedicationIntake[];
  medications: Medication[];
  now: number;
};

export function RecentWeeks({ attacks, intakes, medications, now }: RecentWeeksProps) {
  const { t, language } = useI18n();
  const [selectedDay, setSelectedDay] = useState<Date>();
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
          const isSelected = selectedDay !== undefined && toDayKey(selectedDay) === dayKey;
          return (
            <button
              key={dayKey}
              type="button"
              className={styles.dayCell}
              data-kind={dayKind(dayKey, migraine, medication)}
              data-today={dayKey === todayKey || undefined}
              data-future={dayKey > todayKey || undefined}
              disabled={dayKey > todayKey}
              aria-pressed={isSelected}
              aria-label={formatDate(day, language)}
              onClick={() => setSelectedDay(isSelected ? undefined : day)}
            >
              {day.getDate()}
            </button>
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
      {selectedDay && (
        <DayDetailCard
          day={selectedDay}
          attacks={attacks}
          intakes={intakes}
          medications={medications}
          now={now}
        />
      )}
    </section>
  );
}
