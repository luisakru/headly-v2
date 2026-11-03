import { useState } from 'react';
import { DayDetails } from '../../components/DayDetails';
import { DayGrid, DayLegend } from '../../components/DayGrid';
import { EditAttackSheet } from '../../components/EditAttackSheet';
import { recentWeekDays } from '../../domain/calendar';
import type { Attack, Medication, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import styles from './Home.module.css';

const WEEKS = 4;

type RecentWeeksProps = {
  attacks: Attack[];
  intakes: MedicationIntake[];
  medications: Medication[];
  now: number;
};

export function RecentWeeks({ attacks, intakes, medications, now }: RecentWeeksProps) {
  const { t } = useI18n();
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [editingAttack, setEditingAttack] = useState<Attack>();

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionLabel}>{t.home.lastFourWeeks}</h2>
      <DayGrid
        days={recentWeekDays(now, WEEKS)}
        attacks={attacks}
        intakes={intakes}
        now={now}
        selectedDay={selectedDay}
        onSelect={setSelectedDay}
      />
      <DayLegend />
      {selectedDay && (
        <DayDetails
          day={selectedDay}
          attacks={attacks}
          intakes={intakes}
          medications={medications}
          now={now}
          onEditAttack={setEditingAttack}
          hideEmpty
        />
      )}
      {editingAttack && (
        <EditAttackSheet
          attack={editingAttack}
          intakes={intakes}
          medications={medications}
          onClose={() => setEditingAttack(undefined)}
        />
      )}
    </section>
  );
}
