import { isSameDay } from 'date-fns';
import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { EffectivenessChips } from '../../components/EffectivenessChips';
import { ChevronRightIcon, MoreIcon, PlusIcon } from '../../components/icons';
import { PainScale } from '../../components/PainScale';
import { deleteAttack, endAttack, updateAttack } from '../../data/attackRepository';
import { deleteIntake, rateIntake } from '../../data/intakeRepository';
import { durationParts } from '../../domain/days';
import { activeAttackPrompt } from '../../domain/prompts';
import type { Attack, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatDateTime, formatTime } from '../../i18n/format';
import styles from './Home.module.css';
import { MedicationSheet } from './MedicationSheet';
import { RatingPromptCard } from './RatingPromptCard';
import { TimePickerSheet } from './TimePickerSheet';
import type { HomeData } from './useHomeData';

type Sheet = 'medication' | 'startTime' | 'endTime' | 'more' | 'pain' | { rate: MedicationIntake };

type ActiveAttackProps = HomeData & { attack: Attack; now: number };

export function ActiveAttack({ attack, intakes, medications, now }: ActiveAttackProps) {
  const { t, language } = useI18n();
  const [sheet, setSheet] = useState<Sheet>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const closeSheet = () => setSheet(undefined);
  const attackIntakes = intakes.filter((intake) => intake.attackId === attack.id);
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

      <button type="button" className={styles.painRow} onClick={() => setSheet('pain')}>
        <span className={styles.painValue}>
          <span className={styles.muted}>{t.activeAttack.pain}</span>
          <span className={styles.painNumber}>{attack.painLevel ?? '–'}</span>
          <span className={styles.muted}>{t.activeAttack.painOutOf}</span>
        </span>
        <ChevronRightIcon />
      </button>

      {attackIntakes.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>{t.activeAttack.medicationsDuring}</h2>
          <ul className={styles.intakeList}>
            {attackIntakes.map((intake) => (
              <li key={intake.id} className={styles.intakeRow}>
                <span className={styles.intakeText}>
                  <span className={styles.medicationName}>{medicationName(intake)}</span>
                  <span className={styles.muted}> · {formatTime(intake.takenAt, language)}</span>
                </span>
                <button
                  type="button"
                  className={styles.rateButton}
                  data-rated={intake.effectiveness !== undefined || undefined}
                  onClick={() => setSheet({ rate: intake })}
                >
                  {t.effectiveness[intake.effectiveness ?? 'pending']}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.pinnedActions}>
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
