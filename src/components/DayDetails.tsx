import { attacksOnDay, durationParts, intakesOnDay, toDayKey } from '../domain/days';
import type { Attack, Medication, MedicationIntake } from '../domain/types';
import { useI18n } from '../i18n/context';
import { formatDate, formatDateTime, formatTime } from '../i18n/format';
import { Card } from './Card';
import styles from './DayDetails.module.css';

type DayDetailsProps = {
  day: Date;
  attacks: Attack[];
  intakes: MedicationIntake[];
  medications: Medication[];
  now: number;
  onEditAttack?: (attack: Attack) => void;
  /** Render nothing instead of the date and "no entry" on an empty day. */
  hideEmpty?: boolean;
};

/** The selected day's attacks, one card each with the medication taken for it. */
export function DayDetails({
  day,
  attacks,
  intakes,
  medications,
  now,
  onEditAttack,
  hideEmpty,
}: DayDetailsProps) {
  const { t, language } = useI18n();
  const dayKey = toDayKey(day);
  const dayAttacks = attacksOnDay(attacks, dayKey, now);
  const unlinkedIntakes = intakesOnDay(intakes, dayKey).filter(
    (intake) => !dayAttacks.some((attack) => attack.id === intake.attackId),
  );
  // Times on another day than the selected one need their date.
  const formatMoment = (time: number) =>
    toDayKey(time) === dayKey ? formatTime(time, language) : formatDateTime(time, language);

  const intakeRows = (rows: MedicationIntake[]) =>
    rows.length > 0 && (
      <dl className={styles.rows}>
        {rows.map((intake) => (
          <Row
            key={intake.id}
            label={`${medications.find((m) => m.id === intake.medicationId)?.name ?? ''} · ${formatMoment(intake.takenAt)}`}
            value={t.effectiveness[intake.effectiveness ?? 'pending']}
          />
        ))}
      </dl>
    );

  const isEmpty = dayAttacks.length === 0 && unlinkedIntakes.length === 0;
  if (isEmpty && hideEmpty) return null;

  return (
    <div className={styles.details} aria-live="polite">
      <h3 className={styles.date}>{formatDate(day, language)}</h3>
      {isEmpty && <Card className={styles.empty}>{t.dayDetail.noEntry}</Card>}
      {dayAttacks.map((attack) => (
        <Card
          key={attack.id}
          {...(onEditAttack && {
            role: 'button',
            tabIndex: 0,
            className: styles.editable,
            onClick: () => onEditAttack(attack),
            onKeyDown: (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onEditAttack(attack);
            },
          })}
        >
          <dl className={styles.rows}>
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
            {attack.painLevel !== undefined && (
              <Row label={t.dayDetail.pain} value={t.dayDetail.painOutOfTen(attack.painLevel)} />
            )}
          </dl>
          {intakeRows(intakes.filter((intake) => intake.attackId === attack.id))}
        </Card>
      ))}
      {unlinkedIntakes.length > 0 && (
        <Card>
          <h4 className={styles.cardTitle}>{t.dayDetail.medications}</h4>
          {intakeRows(unlinkedIntakes)}
        </Card>
      )}
    </div>
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
