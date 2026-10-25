import { attacksOnDay, durationParts, intakesOnDay, toDayKey } from '../domain/days';
import type { Attack, Medication, MedicationIntake } from '../domain/types';
import { useI18n } from '../i18n/context';
import { formatDate, formatDateTime, formatTime } from '../i18n/format';
import { Card } from './Card';
import styles from './DayDetailCard.module.css';

type DayDetailCardProps = {
  day: Date;
  attacks: Attack[];
  intakes: MedicationIntake[];
  medications: Medication[];
  now: number;
};

export function DayDetailCard({ day, attacks, intakes, medications, now }: DayDetailCardProps) {
  const { t, language } = useI18n();
  const dayKey = toDayKey(day);
  const dayAttacks = attacksOnDay(attacks, dayKey, now);
  const dayIntakes = intakesOnDay(intakes, dayKey);
  // Times on another day than the selected one need their date.
  const formatMoment = (time: number) =>
    toDayKey(time) === dayKey ? formatTime(time, language) : formatDateTime(time, language);

  return (
    <Card className={styles.card} aria-live="polite">
      <h3 className={styles.date}>{formatDate(day, language)}</h3>
      {dayAttacks.length === 0 && dayIntakes.length === 0 && (
        <p className={styles.empty}>{t.dayDetail.noEntry}</p>
      )}
      {dayAttacks.map((attack) => (
        <dl key={attack.id} className={styles.rows}>
          <Row label={t.dayDetail.start} value={formatMoment(attack.startedAt)} />
          <Row
            label={t.dayDetail.end}
            value={attack.endedAt ? formatMoment(attack.endedAt) : t.dayDetail.ongoing}
          />
          <Row
            label={t.dayDetail.duration}
            value={t.activeAttack.duration(
              durationParts((attack.endedAt ?? now) - attack.startedAt),
            )}
          />
          {attack.painMax !== undefined && (
            <Row label={t.dayDetail.maxPain} value={t.dayDetail.painOutOfTen(attack.painMax)} />
          )}
        </dl>
      ))}
      {dayIntakes.length > 0 && (
        <dl className={styles.rows}>
          {dayIntakes.map((intake) => (
            <Row
              key={intake.id}
              label={`${medications.find((m) => m.id === intake.medicationId)?.name ?? ''} · ${formatTime(intake.takenAt, language)}`}
              value={t.effectiveness[intake.effectiveness ?? 'pending']}
            />
          ))}
        </dl>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
