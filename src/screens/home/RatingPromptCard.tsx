import { Card } from '../../components/Card';
import { EffectivenessChips } from '../../components/EffectivenessChips';
import { rateIntake } from '../../data/intakeRepository';
import { intakesAwaitingRating } from '../../domain/prompts';
import type { Medication, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatDateTime } from '../../i18n/format';
import styles from './Home.module.css';

type RatingPromptCardProps = {
  intakes: MedicationIntake[];
  medications: Medication[];
  now: number;
};

/** Asks about the most recent unrated intake, one at a time. */
export function RatingPromptCard({ intakes, medications, now }: RatingPromptCardProps) {
  const { t, language } = useI18n();
  const intake = intakesAwaitingRating(intakes, now).at(-1);
  if (!intake) return null;

  const name = medications.find((m) => m.id === intake.medicationId)?.name ?? '';
  const question = t.prompts.rateIntake(name);

  return (
    <Card className={styles.promptCard}>
      <p className={styles.promptTitle}>{question}</p>
      <p className={styles.muted}>{t.prompts.takenAt(formatDateTime(intake.takenAt, language))}</p>
      <EffectivenessChips
        label={question}
        onChange={(effectiveness) => void rateIntake(intake.id, effectiveness)}
      />
    </Card>
  );
}
