import { useId, useState } from 'react';
import { deleteAttack, saveAttackWithIntakes } from '../data/attackRepository';
import type { Attack, Effectiveness, Medication, MedicationIntake } from '../domain/types';
import { useI18n } from '../i18n/context';
import { formatDateTime } from '../i18n/format';
import { errorMessage, fromInputValue, toInputValue } from './attackForm';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { EffectivenessChips } from './EffectivenessChips';
import styles from './EditAttackSheet.module.css';
import { PlusIcon, TrashIcon } from './icons';
import { PainScale } from './PainScale';

const HOUR_MS = 60 * 60 * 1000;

type DraftIntake = {
  /** Undefined for an intake added in this sheet. */
  id?: string;
  key: string;
  medicationId: string;
  takenAt?: number;
  effectiveness?: Effectiveness;
};

type EditAttackSheetProps = {
  /** Undefined to add a new attack. */
  attack?: Attack;
  /** Prefilled start of a new attack. */
  defaultStartedAt?: number;
  intakes: MedicationIntake[];
  medications: Medication[];
  onClose: () => void;
};

/** Changes stay in the sheet until Save. */
export function EditAttackSheet({
  attack,
  defaultStartedAt,
  intakes,
  medications,
  onClose,
}: EditAttackSheetProps) {
  const { t, language } = useI18n();
  const startId = useId();
  const endId = useId();
  const [start, setStart] = useState(() =>
    toInputValue(attack?.startedAt ?? defaultStartedAt ?? Date.now()),
  );
  const [end, setEnd] = useState(() => (attack?.endedAt ? toInputValue(attack.endedAt) : ''));
  const [endTouched, setEndTouched] = useState(false);
  const [painLevel, setPainLevel] = useState(attack?.painLevel);
  const [draftIntakes, setDraftIntakes] = useState<DraftIntake[]>(() =>
    intakes
      .filter((intake) => attack && intake.attackId === attack.id)
      .map(({ id, medicationId, takenAt, effectiveness }) => ({
        id,
        key: id,
        medicationId,
        takenAt,
        effectiveness,
      })),
  );
  const [picking, setPicking] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string>();

  const startedAt = fromInputValue(start);
  const endedAt = end ? fromInputValue(end) : undefined;
  const medicationName = (id: string) => medications.find((m) => m.id === id)?.name ?? '';

  const updateDraft = (key: string, changes: Partial<DraftIntake>) =>
    setDraftIntakes((current) =>
      current.map((intake) => (intake.key === key ? { ...intake, ...changes } : intake)),
    );

  const save = async () => {
    try {
      await saveAttackWithIntakes(attack?.id, { startedAt, endedAt, painLevel }, draftIntakes);
    } catch (caught) {
      setError(errorMessage(caught, t.errors.attack));
      return;
    }
    onClose();
  };

  return (
    <BottomSheet open onClose={onClose} title={attack ? t.editAttack.title : t.editAttack.addTitle}>
      <div className={styles.form}>
        <label htmlFor={startId} className={styles.fieldLabel}>
          {t.editAttack.start}
        </label>
        <input
          id={startId}
          type="datetime-local"
          className={styles.input}
          value={start}
          onChange={(event) => {
            setStart(event.target.value);
            setError(undefined);
            // A new attack's end follows its start by one hour until the end is set by hand.
            const newStart = fromInputValue(event.target.value);
            if (!attack && !endTouched && !Number.isNaN(newStart)) {
              setEnd(toInputValue(newStart + HOUR_MS));
            }
          }}
        />
        <label htmlFor={endId} className={styles.fieldLabel}>
          {t.editAttack.end}
        </label>
        <input
          id={endId}
          type="datetime-local"
          className={styles.input}
          value={end}
          onChange={(event) => {
            setEnd(event.target.value);
            setEndTouched(true);
            setError(undefined);
          }}
        />

        <span className={styles.fieldLabel}>{t.editAttack.painLevel}</span>
        <PainScale value={painLevel} onChange={setPainLevel} />

        <span className={styles.fieldLabel}>{t.editAttack.medications}</span>
        {draftIntakes.map((intake) => {
          const name = medicationName(intake.medicationId);
          return (
            <div key={intake.key} className={styles.editIntake}>
              <div className={styles.editIntakeHeader}>
                <span className={styles.medicationName}>
                  {name}
                  {intake.takenAt !== undefined && (
                    <span className={styles.muted}>
                      {' '}
                      · {formatDateTime(intake.takenAt, language)}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={t.editAttack.removeIntake(name)}
                  onClick={() =>
                    setDraftIntakes((current) => current.filter(({ key }) => key !== intake.key))
                  }
                >
                  <TrashIcon />
                </button>
              </div>
              <EffectivenessChips
                label={t.effectiveness.sheetTitle(name)}
                value={intake.effectiveness}
                onChange={(effectiveness) => updateDraft(intake.key, { effectiveness })}
              />
            </div>
          );
        })}
        {picking ? (
          <ul className={styles.medicationList}>
            {medications
              .filter((medication) => !medication.archived)
              .map((medication) => (
                <li key={medication.id}>
                  <button
                    type="button"
                    className={styles.medicationRow}
                    onClick={() => {
                      setDraftIntakes((current) => [
                        ...current,
                        { key: `new-${Date.now()}`, medicationId: medication.id },
                      ]);
                      setPicking(false);
                    }}
                  >
                    <span className={styles.medicationName}>{medication.name}</span>
                    <span className={styles.medicationDose}>{medication.dose}</span>
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <button type="button" className={styles.textButton} onClick={() => setPicking(true)}>
            <PlusIcon />
            {t.editAttack.addMedication}
          </button>
        )}

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <Button
          large
          disabled={Number.isNaN(startedAt) || Number.isNaN(endedAt)}
          onClick={() => void save()}
        >
          {t.editAttack.save}
        </Button>
        {attack && (
          <Button
            variant="outline"
            className={styles.deleteButton}
            onClick={() =>
              confirmingDelete
                ? void deleteAttack(attack.id).then(onClose)
                : setConfirmingDelete(true)
            }
          >
            {confirmingDelete ? t.editAttack.confirmDelete : t.editAttack.delete}
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}
