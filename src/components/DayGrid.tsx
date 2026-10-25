import { dayKind, recentWeekDays } from '../domain/calendar';
import { medicationDays, migraineDays, toDayKey } from '../domain/days';
import type { Attack, MedicationIntake } from '../domain/types';
import { useI18n } from '../i18n/context';
import { formatDate, formatWeekday } from '../i18n/format';
import styles from './DayGrid.module.css';

type DayGridProps = {
  /** Monday first; `undefined` leaves an empty cell. */
  days: (Date | undefined)[];
  attacks: Attack[];
  intakes: MedicationIntake[];
  now: number;
  selectedDay?: Date;
  onSelect: (day: Date | undefined) => void;
};

/** Days colored by migraine and medication. Tapping the selected day again clears the selection. */
export function DayGrid({ days, attacks, intakes, now, selectedDay, onSelect }: DayGridProps) {
  const { language } = useI18n();
  const migraine = migraineDays(attacks, now);
  const medication = medicationDays(intakes);
  const todayKey = toDayKey(now);
  const selectedKey = selectedDay && toDayKey(selectedDay);

  return (
    <div className={styles.grid}>
      {recentWeekDays(now, 1).map((day) => (
        <span key={day.getDay()} className={styles.weekday}>
          {formatWeekday(day, language)}
        </span>
      ))}
      {days.map((day, index) => {
        if (!day) {
          return (
            <span key={`empty-${index}`} className={`${styles.dayCell} ${styles.emptyCell}`} />
          );
        }
        const dayKey = toDayKey(day);
        const isSelected = dayKey === selectedKey;
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
            onClick={() => onSelect(isSelected ? undefined : day)}
          >
            {day.getDate()}
          </button>
        );
      })}
    </div>
  );
}

export function DayLegend({ withSelected = false }: { withSelected?: boolean }) {
  const { t } = useI18n();
  return (
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
      {withSelected && (
        <span className={styles.legendItem}>
          <span className={styles.legendSelected} />
          {t.dayLegend.selected}
        </span>
      )}
    </div>
  );
}
