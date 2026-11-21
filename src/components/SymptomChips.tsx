import type { Symptom } from '../domain/types';
import { useI18n } from '../i18n/context';
import { symptomName } from '../i18n/symptoms';
import styles from './DayEventChips.module.css';
import { ToggleChip } from './ToggleChip';

type SymptomChipsProps = {
  /** Only turned-on symptoms. */
  symptoms: Symptom[];
  selected: string[];
  onChange: (symptomIds: string[]) => void;
};

export function SymptomChips({ symptoms, selected, onChange }: SymptomChipsProps) {
  const { t } = useI18n();
  return (
    <div className={styles.chips} role="group" aria-label={t.symptoms.title}>
      {symptoms.map((symptom) => (
        <ToggleChip
          key={symptom.id}
          label={symptomName(symptom, t)}
          pressed={selected.includes(symptom.id)}
          onChange={(pressed) =>
            onChange(
              pressed ? [...selected, symptom.id] : selected.filter((id) => id !== symptom.id),
            )
          }
        />
      ))}
    </div>
  );
}
