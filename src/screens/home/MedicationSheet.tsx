import { useId, useRef, useState, type FormEvent } from 'react';
import { fromInputValue, toInputValue } from '../../components/attackForm';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { CheckIcon, ClockIcon, PlusIcon } from '../../components/icons';
import { ToggleChip } from '../../components/ToggleChip';
import { deleteIntake, logIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
import { nextIntakeAt } from '../../domain/nextIntake';
import type { Medication, MedicationIntake } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatTime } from '../../i18n/format';
import styles from './Home.module.css';

type MedicationSheetProps = {
  medications: Medication[];
  /** Earlier intakes, to show when a medication with a minimum gap is allowed again. */
  intakes: MedicationIntake[];
  attackId?: string;
  onClose: () => void;
};

/** One tap logs an intake at the chosen time, now by default; tapping the same row again undoes it. */
export function MedicationSheet({ medications, intakes, attackId, onClose }: MedicationSheetProps) {
  const { t, language } = useI18n();
  const timeId = useId();
  const [time, setTime] = useState(() => toInputValue(Date.now()));
  const takenAt = fromInputValue(time);
  const [loggedIntakeIds, setLoggedIntakeIds] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const pendingIds = useRef(new Set<string>());
  const pickable = medications.filter((medication) => !medication.archived);

  const toggle = async (medicationId: string) => {
    // A shaky double tap must not log the same medication twice.
    if (pendingIds.current.has(medicationId)) return;
    pendingIds.current.add(medicationId);
    const intakeId = loggedIntakeIds[medicationId];
    if (intakeId) {
      await deleteIntake(intakeId);
      setLoggedIntakeIds(({ [medicationId]: _, ...rest }) => rest);
    } else {
      const intake = await logIntake(medicationId, { takenAt, attackId });
      setLoggedIntakeIds((current) => ({ ...current, [medicationId]: intake.id }));
    }
    pendingIds.current.delete(medicationId);
  };

  return (
    <BottomSheet open onClose={onClose} title={t.medicationSheet.title}>
      <div className={styles.sheetContent}>
        <label htmlFor={timeId} className={styles.fieldLabel}>
          {t.medicationSheet.takenAt}
        </label>
        <input
          id={timeId}
          type="datetime-local"
          className={styles.input}
          value={time}
          onChange={(event) => setTime(event.target.value)}
        />
        {pickable.length === 0 && !adding && (
          <p className={styles.muted}>{t.medicationSheet.empty}</p>
        )}
        {pickable.length > 0 && (
          <ul className={styles.medicationList}>
            {pickable.map((medication) => {
              const logged = medication.id in loggedIntakeIds;
              // Measured from the chosen time, so a back-dated intake shows the right answer.
              const next =
                logged || Number.isNaN(takenAt)
                  ? undefined
                  : nextIntakeAt(medication, intakes, takenAt);
              return (
                <li key={medication.id}>
                  <button
                    type="button"
                    aria-pressed={logged}
                    disabled={!logged && Number.isNaN(takenAt)}
                    className={styles.medicationRow}
                    onClick={() => void toggle(medication.id)}
                  >
                    <span className={styles.medicationText}>
                      <span className={styles.medicationName}>{medication.name}</span>
                      {next && (
                        <span className={styles.notYet}>
                          <ClockIcon />
                          {t.medicationSheet.notBefore(formatTime(next, language))}
                        </span>
                      )}
                    </span>
                    <span className={styles.medicationDose}>
                      {medication.dose}
                      {logged && <CheckIcon />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {adding ? (
          <NewMedicationForm onDone={() => setAdding(false)} />
        ) : (
          <Button variant="outline" onClick={() => setAdding(true)}>
            <PlusIcon />
            {t.medicationSheet.newMedication}
          </Button>
        )}
        <Button large onClick={onClose}>
          {t.medicationSheet.done}
        </Button>
      </div>
    </BottomSheet>
  );
}

function NewMedicationForm({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const nameId = useId();
  const doseId = useId();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [isTriptan, setIsTriptan] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    await createMedication({ name: name.trim(), dose: dose.trim() || undefined, isTriptan });
    onDone();
  };

  return (
    <form className={styles.form} onSubmit={(event) => void save(event)}>
      <label htmlFor={nameId} className={styles.fieldLabel}>
        {t.medicationSheet.name}
      </label>
      <input
        id={nameId}
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
      />
      <label htmlFor={doseId} className={styles.fieldLabel}>
        {t.medicationSheet.dose}
      </label>
      <input
        id={doseId}
        className={styles.input}
        value={dose}
        onChange={(event) => setDose(event.target.value)}
        autoComplete="off"
      />
      <div>
        <ToggleChip
          label={t.medicationSheet.isTriptan}
          pressed={isTriptan}
          onChange={setIsTriptan}
        />
      </div>
      <Button type="submit" disabled={name.trim() === ''}>
        {t.medicationSheet.save}
      </Button>
    </form>
  );
}
