import { isSameDay } from 'date-fns';
import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { EffectivenessChips } from '../../components/EffectivenessChips';
import { MoreIcon, PlusIcon } from '../../components/icons';
import { IntakeRows } from '../../components/IntakeRows';
import { PainScale } from '../../components/PainScale';
import { SymptomChips } from '../../components/SymptomChips';
import { ValueRow } from '../../components/ValueRow';
import { deleteAttack, endAttack, updateAttack } from '../../data/attackRepository';
import { deleteIntake, rateIntake } from '../../data/intakeRepository';
import { durationParts } from '../../domain/days';
import { activeAttackPrompt } from '../../domain/prompts';
import type { Attack, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatDateTime, formatTime } from '../../i18n/format';
import { symptomName } from '../../i18n/symptoms';
import styles from './Home.module.css';
import { MedicationSheet } from './MedicationSheet';
import { RatingPromptCard } from './RatingPromptCard';
import { TimePickerSheet } from './TimePickerSheet';
import type { HomeData } from './useHomeData';

type Sheet =
  | 'medication'
  | 'startTime'
  | 'endTime'
  | 'more'
  | 'pain'
  | 'symptoms'
  | { rate: MedicationIntake };

type ActiveAttackProps = HomeData & { attack: Attack; now: number };

export function ActiveAttack({ attack, intakes, medications, symptoms, now }: ActiveAttackProps) {
  const { t, language } = useI18n();
  const [sheet, setSheet] = useState<Sheet>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const closeSheet = () => setSheet(undefined);
  const attackIntakes = intakes.filter((intake) => intake.attackId === attack.id);
  const shownSymptoms = symptoms.filter((symptom) => symptom.enabled);
  const attackSymptoms = shownSymptoms.filter((symptom) => attack.symptomIds?.includes(symptom.id));
  const medicationName = (intake: MedicationIntake) =>
    medications.find((medication) => medication.id === intake.medicationId)?.name ?? '';

  return (
    <div className={styles.active}>
      <div className={styles.activeHeader}>
        <p className={styles.activeLabel}>
          <span className={styles.pulseDot} aria-hidden="true" />
          {t.activeAttack.label}
        </p>
        <button
          type="button"
          className={styles.moreButton}
          aria-label={t.activeAttack.moreActions}
          onClick={() => setSheet('more')}
        >
          <MoreIcon />
        </button>
      </div>

      <div>
        <p className={styles.elapsed}>
          {t.activeAttack.duration(durationParts(now - attack.startedAt))}
        </p>
        <button type="button" className={styles.since} onClick={() => setSheet('startTime')}>
          {isSameDay(attack.startedAt, now)
            ? t.activeAttack.sinceToday(formatTime(attack.startedAt, language))
            : t.activeAttack.sinceOn(formatDateTime(attack.startedAt, language))}
        </button>
      </div>

      <AttackPromptCard attack={attack} now={now} onEndEarlier={() => setSheet('endTime')} />
      <RatingPromptCard intakes={intakes} medications={medications} now={now} />

      <ValueRow
        label={t.activeAttack.pain}
        value={
          attack.painLevel === undefined ? '–' : `${attack.painLevel} ${t.activeAttack.painOutOf}`
        }
        onClick={() => setSheet('pain')}
      />

      {shownSymptoms.length > 0 && (
        <ValueRow
          label={t.symptoms.title}
          value={
            attackSymptoms.length > 0
              ? attackSymptoms.map((symptom) => symptomName(symptom, t)).join(', ')
              : '–'
          }
          onClick={() => setSheet('symptoms')}
        />
      )}

      {attackIntakes.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>{t.activeAttack.medicationsDuring}</h2>
          <IntakeRows
            rows={attackIntakes.map((intake) => ({
              key: intake.id,
              name: medicationName(intake),
              time: formatTime(intake.takenAt, language),
              effectiveness: intake.effectiveness,
            }))}
            onOpen={(id) => {
              const intake = attackIntakes.find((candidate) => candidate.id === id);
              if (intake) setSheet({ rate: intake });
            }}
          />
        </section>
      )}

      <div className={styles.pinnedActions} data-pinned-actions>
        <Button variant="outline" onClick={() => setSheet('medication')}>
          <PlusIcon />
          {t.activeAttack.logMedication}
        </Button>
        <Button large onClick={() => void endAttack(attack.id)}>
          {t.activeAttack.endMigraine}
        </Button>
      </div>

      {sheet === 'more' && (
        <BottomSheet open onClose={closeSheet} title={t.activeAttack.moreActions}>
          <div className={styles.sheetActions}>
            <Button variant="outline" onClick={() => setSheet('endTime')}>
              {t.activeAttack.endedEarlier}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                confirmingDelete ? void deleteAttack(attack.id) : setConfirmingDelete(true)
              }
            >
              {confirmingDelete ? t.editAttack.confirmDelete : t.editAttack.delete}
            </Button>
          </div>
        </BottomSheet>
      )}
      {sheet === 'pain' && (
        <BottomSheet open onClose={closeSheet} title={t.activeAttack.painNow}>
          <PainScale
            value={attack.painLevel}
            onChange={(painLevel) => {
              void updateAttack(attack.id, { painLevel });
              closeSheet();
            }}
          />
        </BottomSheet>
      )}
      {sheet === 'symptoms' && (
        <BottomSheet open onClose={closeSheet} title={t.symptoms.title}>
          <div className={styles.sheetActions}>
            <SymptomChips
              symptoms={shownSymptoms}
              selected={attack.symptomIds ?? []}
              onChange={(symptomIds) => void updateAttack(attack.id, { symptomIds })}
            />
            <Button variant="outline" onClick={closeSheet}>
              {t.symptoms.done}
            </Button>
          </div>
        </BottomSheet>
      )}
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
          <div className={styles.sheetActions}>
            <EffectivenessChips
              label={t.effectiveness.sheetTitle(medicationName(sheet.rate))}
              value={sheet.rate.effectiveness}
              onChange={(effectiveness) => {
                void rateIntake(sheet.rate.id, effectiveness);
                closeSheet();
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                void deleteIntake(sheet.rate.id);
                closeSheet();
              }}
            >
              {t.activeAttack.deleteIntake(medicationName(sheet.rate))}
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
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
    <div className={styles.banner} role="status">
      <p className={styles.bannerText}>
        {prompt === 'stillRunning' ? t.prompts.stillRunning : t.prompts.stillRunningNextDay}
      </p>
      {prompt !== 'stillRunning' && (
        <p className={styles.bannerHint}>{t.prompts.stillRunningNextDayHint}</p>
      )}
      <div className={styles.bannerActions}>
        {prompt === 'stillRunning' ? (
          <button
            type="button"
            className={styles.bannerButton}
            onClick={() => void endAttack(attack.id)}
          >
            {t.prompts.itIsOver}
          </button>
        ) : (
          <button type="button" className={styles.bannerButton} onClick={onEndEarlier}>
            {t.prompts.endAtTime}
          </button>
        )}
        <button type="button" className={styles.bannerButton} data-quiet onClick={dismiss}>
          {t.prompts.stillGoing}
        </button>
      </div>
    </div>
  );
}
