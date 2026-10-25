import { isSameDay } from 'date-fns';
import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EffectivenessChips } from '../../components/EffectivenessChips';
import { PlusIcon, TrashIcon } from '../../components/icons';
import { PainScale } from '../../components/PainScale';
import { endAttack, recordPainLevel, updateAttack } from '../../data/attackRepository';
import { deleteIntake, rateIntake } from '../../data/intakeRepository';
import { durationParts } from '../../domain/days';
import { activeAttackPrompt } from '../../domain/prompts';
import type { Attack, Medication, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatDateTime, formatTime } from '../../i18n/format';
import styles from './Home.module.css';
import { MedicationSheet } from './MedicationSheet';
import { RatingPromptCard } from './RatingPromptCard';
import { TimePickerSheet } from './TimePickerSheet';
import type { HomeData } from './useHomeData';

type Sheet = 'medication' | 'startTime' | 'endTime' | { rate: MedicationIntake };

type ActiveAttackProps = HomeData & { attack: Attack; now: number };

export function ActiveAttack({ attack, intakes, medications, now }: ActiveAttackProps) {
  const { t, language } = useI18n();
  const [sheet, setSheet] = useState<Sheet>();
  const closeSheet = () => setSheet(undefined);
  const attackIntakes = intakes.filter((intake) => intake.attackId === attack.id);
  const medicationName = (intake: MedicationIntake) =>
    medications.find((medication) => medication.id === intake.medicationId)?.name ?? '';

  return (
    <>
      <p className={styles.activeLabel}>
        <span className={styles.pulseDot} aria-hidden="true" />
        {t.activeAttack.label}
      </p>
      <p className={styles.runningFor}>{t.activeAttack.runningFor}</p>
      <p className={styles.elapsed}>
        {t.activeAttack.duration(durationParts(now - attack.startedAt))}
      </p>
      <button type="button" className={styles.startTime} onClick={() => setSheet('startTime')}>
        {isSameDay(attack.startedAt, now)
          ? t.activeAttack.startedToday(formatTime(attack.startedAt, language))
          : t.activeAttack.startedOn(formatDateTime(attack.startedAt, language))}
      </button>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.activeAttack.painNow}</h2>
        <PainScale
          value={attack.painMax}
          onChange={(level) => void recordPainLevel(attack.id, level)}
        />
      </section>

      {attackIntakes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.activeAttack.medicationsDuring}</h2>
          <ul className={styles.intakeList}>
            {attackIntakes.map((intake) => (
              <IntakeRow
                key={intake.id}
                intake={intake}
                medication={medications.find((m) => m.id === intake.medicationId)}
                onRate={() => setSheet({ rate: intake })}
              />
            ))}
          </ul>
        </section>
      )}

      <div className={styles.actions}>
        <AttackPromptCard attack={attack} now={now} onEndEarlier={() => setSheet('endTime')} />
        <RatingPromptCard intakes={intakes} medications={medications} now={now} />
        <Button large variant="secondary" onClick={() => setSheet('medication')}>
          <PlusIcon />
          {t.activeAttack.logMedication}
        </Button>
        <Button large variant="outline" onClick={() => void endAttack(attack.id)}>
          {t.activeAttack.endMigraine}
        </Button>
        <button type="button" className={styles.link} onClick={() => setSheet('endTime')}>
          {t.activeAttack.endedEarlier}
        </button>
      </div>

      {sheet === 'medication' && (
        <MedicationSheet medications={medications} attackId={attack.id} onClose={closeSheet} />
      )}
      {sheet === 'startTime' && (
        <TimePickerSheet
          title={t.timePicker.startTitle}
          initialTime={attack.startedAt}
          onClose={closeSheet}
          onConfirm={(startedAt) => updateAttack(attack.id, { startedAt })}
        />
      )}
      {sheet === 'endTime' && (
        <TimePickerSheet
          title={t.timePicker.endTitle}
          initialTime={now}
          onClose={closeSheet}
          onConfirm={(endedAt) => endAttack(attack.id, endedAt)}
        />
      )}
      {typeof sheet === 'object' && (
        <BottomSheet
          open
          onClose={closeSheet}
          title={t.effectiveness.sheetTitle(medicationName(sheet.rate))}
        >
          <EffectivenessChips
            label={t.effectiveness.sheetTitle(medicationName(sheet.rate))}
            value={sheet.rate.effectiveness}
            onChange={(effectiveness) => {
              void rateIntake(sheet.rate.id, effectiveness);
              closeSheet();
            }}
          />
        </BottomSheet>
      )}
    </>
  );
}

type IntakeRowProps = {
  intake: MedicationIntake;
  medication?: Medication;
  onRate: () => void;
};

function IntakeRow({ intake, medication, onRate }: IntakeRowProps) {
  const { t, language } = useI18n();
  const name = medication?.name ?? '';
  const details = [medication?.dose, formatTime(intake.takenAt, language)].filter(Boolean);

  return (
    <li>
      <Card className={styles.intakeRow}>
        <div className={styles.intakeText}>
          <span className={styles.medicationName}>{name}</span>
          <span className={styles.muted}>{details.join(' · ')}</span>
        </div>
        <button
          type="button"
          className={styles.statusChip}
          data-rated={intake.effectiveness !== undefined || undefined}
          onClick={onRate}
        >
          {t.effectiveness[intake.effectiveness ?? 'pending']}
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={t.activeAttack.deleteIntake(name)}
          onClick={() => void deleteIntake(intake.id)}
        >
          <TrashIcon />
        </button>
      </Card>
    </li>
  );
}

const DISMISSED_PROMPT_KEY = 'headly.dismissedAttackPrompt';

function readDismissedPrompt(): string | null {
  try {
    return localStorage.getItem(DISMISSED_PROMPT_KEY);
  } catch {
    return null;
  }
}

type AttackPromptCardProps = {
  attack: Attack;
  now: number;
  onEndEarlier: () => void;
};

function AttackPromptCard({ attack, now, onEndEarlier }: AttackPromptCardProps) {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(readDismissedPrompt);
  const prompt = activeAttackPrompt(attack, now);
  const promptKey = `${attack.id}:${prompt}`;
  if (!prompt || dismissed === promptKey) return null;

  const dismiss = () => {
    setDismissed(promptKey);
    try {
      localStorage.setItem(DISMISSED_PROMPT_KEY, promptKey);
    } catch {
      // Without storage the card simply comes back after a reload.
    }
  };

  return (
    <Card className={styles.promptCard}>
      {prompt === 'stillRunning' ? (
        <p className={styles.promptTitle}>{t.prompts.stillRunning}</p>
      ) : (
        <>
          <p className={styles.promptTitle}>{t.prompts.stillRunningNextDay}</p>
          <p className={styles.muted}>{t.prompts.stillRunningNextDayHint}</p>
        </>
      )}
      <div className={styles.promptActions}>
        <Button variant="outline" onClick={dismiss}>
          {t.prompts.stillGoing}
        </Button>
        {prompt === 'stillRunning' ? (
          <Button onClick={() => void endAttack(attack.id)}>{t.prompts.itIsOver}</Button>
        ) : (
          <Button onClick={onEndEarlier}>{t.prompts.endAtTime}</Button>
        )}
      </div>
    </Card>
  );
}
