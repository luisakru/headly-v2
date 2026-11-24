import { useId, useState } from 'react';
import { deleteAttack, saveAttackWithIntakes } from '../data/attackRepository';
import { attackLabel } from '../domain/attacks';
import type {
  Attack,
  AttackKind,
  Effectiveness,
  Medication,
  MedicationIntake,
  Symptom,
} from '../domain/types';
import { useI18n } from '../i18n/context';
import { formatDateTime, formatTime } from '../i18n/format';
import { symptomName } from '../i18n/symptoms';
import { errorMessage, fromInputValue, toInputValue } from './attackForm';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { EffectivenessChips } from './EffectivenessChips';
import styles from './EditAttackSheet.module.css';
import { MoreIcon, PlusIcon } from './icons';
import { IntakeRows } from './IntakeRows';
import { PainScale } from './PainScale';
import { SegmentedControl } from './SegmentedControl';
import { SymptomChips } from './SymptomChips';
import { ValueRow } from './ValueRow';

const HOUR_MS = 60 * 60 * 1000;

/** What the sheet shows: the overview, or one value being changed. */
type View = 'main' | 'start' | 'end' | 'pain' | 'symptoms' | 'pick' | 'more' | { intake: string };

type DraftIntake = {
  /** Undefined for an intake added in this sheet. */
  id?: string;
  key: string;
  medicationId: string;
  /** Value of the `datetime-local` input. */
  takenAt: string;
  effectiveness?: Effectiveness;
};

type EditAttackSheetProps = {
  /** Undefined to add a new attack. */
  attack?: Attack;
  /** Prefilled start of a new attack. */
  defaultStartedAt?: number;
  intakes: MedicationIntake[];
  medications: Medication[];
  symptoms: Symptom[];
  /** Shows the choice between migraine and other headache. */
  trackOtherHeadaches: boolean;
  onClose: () => void;
};

/** Changes stay in the sheet until Save. */
export function EditAttackSheet({
  attack,
  defaultStartedAt,
  intakes,
  medications,
  symptoms,
  trackOtherHeadaches,
  onClose,
}: EditAttackSheetProps) {
  const { t, language } = useI18n();
  const inputId = useId();
  const [start, setStart] = useState(() =>
    toInputValue(attack?.startedAt ?? defaultStartedAt ?? Date.now()),
  );
  const [end, setEnd] = useState(() => (attack?.endedAt ? toInputValue(attack.endedAt) : ''));
  const [endTouched, setEndTouched] = useState(false);
  const [painLevel, setPainLevel] = useState(attack?.painLevel);
  const [kind, setKind] = useState<AttackKind | undefined>(
    attack?.kind ?? (trackOtherHeadaches ? 'migraine' : undefined),
  );
  const label = attackLabel(kind, trackOtherHeadaches);
  const [symptomIds, setSymptomIds] = useState(attack?.symptomIds ?? []);
  const shownSymptoms = symptoms.filter((symptom) => symptom.enabled);
  const [draftIntakes, setDraftIntakes] = useState<DraftIntake[]>(() =>
    intakes
      .filter((intake) => attack && intake.attackId === attack.id)
      .map(({ id, medicationId, takenAt, effectiveness }) => ({
        id,
        key: id,
        medicationId,
        takenAt: toInputValue(takenAt),
        effectiveness,
      })),
  );
  const [view, setView] = useState<View>('main');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string>();

  const startedAt = fromInputValue(start);
  const endedAt = end ? fromInputValue(end) : undefined;
  const intakeTimes = draftIntakes.map((intake) => fromInputValue(intake.takenAt));
  const medicationName = (id: string) => medications.find((m) => m.id === id)?.name ?? '';
  const back = () => setView('main');
  const moment = (time: number) => (Number.isNaN(time) ? '–' : formatDateTime(time, language));

  const updateDraft = (key: string, changes: Partial<DraftIntake>) =>
    setDraftIntakes((current) =>
      current.map((intake) => (intake.key === key ? { ...intake, ...changes } : intake)),
    );

  const save = async () => {
    try {
      await saveAttackWithIntakes(
        attack?.id,
        { startedAt, endedAt, painLevel, symptomIds, ...(kind && { kind }) },
        draftIntakes.map((intake) => ({ ...intake, takenAt: fromInputValue(intake.takenAt) })),
      );
    } catch (caught) {
      setError(errorMessage(caught, t.errors.attack));
      return;
    }
    onClose();
  };

  const doneButton = (
    <Button variant="outline" onClick={back}>
      {t.common.done}
    </Button>
  );

  const timeField = (label: string, value: string, onChange: (value: string) => void) => (
    <div className={styles.form}>
      <label htmlFor={inputId} className={styles.fieldLabel}>
        {label}
      </label>
      <input
        id={inputId}
        type="datetime-local"
        className={styles.input}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setError(undefined);
        }}
      />
      {doneButton}
    </div>
  );

  const editedIntake =
    typeof view === 'object'
      ? draftIntakes.find((intake) => intake.key === view.intake)
      : undefined;

  const title =
    view === 'start'
      ? t.editAttack.start
      : view === 'end'
        ? t.editAttack.end
        : view === 'pain'
          ? t.editAttack.painLevel
          : view === 'symptoms'
            ? t.symptoms.title
            : view === 'pick'
              ? t.editAttack.addMedication
              : view === 'more'
                ? t.activeAttack.moreActions
                : editedIntake
                  ? medicationName(editedIntake.medicationId)
                  : attack
                    ? t.editAttack.title[label]
                    : t.editAttack.addTitle;

  const moreButton = attack && view === 'main' && (
    <button
      type="button"
      className={styles.moreButton}
      aria-label={t.activeAttack.moreActions}
      onClick={() => setView('more')}
    >
      <MoreIcon />
    </button>
  );

  return (
    <BottomSheet open onClose={onClose} title={title} action={moreButton}>
      {view === 'start' &&
        timeField(t.editAttack.start, start, (value) => {
          setStart(value);
          // A new attack's end follows its start by one hour until the end is set by hand.
          const newStart = fromInputValue(value);
          if (!attack && !endTouched && !Number.isNaN(newStart)) {
            setEnd(toInputValue(newStart + HOUR_MS));
          }
        })}
      {view === 'end' &&
        timeField(t.editAttack.end, end, (value) => {
          setEnd(value);
          setEndTouched(true);
        })}
      {view === 'pain' && (
        <PainScale
          value={painLevel}
          onChange={(level) => {
            setPainLevel(level);
            back();
          }}
        />
      )}
      {view === 'symptoms' && (
        <div className={styles.form}>
          <SymptomChips symptoms={shownSymptoms} selected={symptomIds} onChange={setSymptomIds} />
          {doneButton}
        </div>
      )}
      {view === 'pick' && (
        <ul className={styles.medicationList}>
          {medications
            .filter((medication) => !medication.archived)
            .map((medication) => (
              <li key={medication.id}>
                <button
                  type="button"
                  className={styles.medicationRow}
                  onClick={() => {
                    const key = `new-${Date.now()}`;
                    setDraftIntakes((current) => [
                      ...current,
                      {
                        key,
                        medicationId: medication.id,
                        takenAt: Number.isNaN(startedAt) ? toInputValue(Date.now()) : start,
                      },
                    ]);
                    // Straight to its time and effect, which often differ from the attack's start.
                    setView({ intake: key });
                  }}
                >
                  <span className={styles.medicationName}>{medication.name}</span>
                  <span className={styles.medicationDose}>{medication.dose}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
      {editedIntake && (
        <div className={styles.form}>
          <label htmlFor={inputId} className={styles.fieldLabel}>
            {t.editAttack.takenAt}
          </label>
          <input
            id={inputId}
            type="datetime-local"
            className={styles.input}
            value={editedIntake.takenAt}
            onChange={(event) => updateDraft(editedIntake.key, { takenAt: event.target.value })}
          />
          <EffectivenessChips
            label={t.effectiveness.sheetTitle(medicationName(editedIntake.medicationId))}
            value={editedIntake.effectiveness}
            onChange={(effectiveness) => updateDraft(editedIntake.key, { effectiveness })}
          />
          {doneButton}
          <Button
            variant="outline"
            onClick={() => {
              setDraftIntakes((current) => current.filter(({ key }) => key !== editedIntake.key));
              back();
            }}
          >
            {t.editAttack.removeIntake(medicationName(editedIntake.medicationId))}
          </Button>
        </div>
      )}
      {view === 'more' && attack && (
        <div className={styles.form}>
          <Button
            variant="outline"
            onClick={() =>
              confirmingDelete
                ? void deleteAttack(attack.id).then(onClose)
                : setConfirmingDelete(true)
            }
          >
            {confirmingDelete ? t.editAttack.confirmDelete : t.editAttack.delete[label]}
          </Button>
          {doneButton}
        </div>
      )}
      {view === 'main' && (
        <div className={styles.form}>
          {label !== 'attack' && (
            <SegmentedControl<AttackKind>
              label={t.editAttack.kind}
              options={(['migraine', 'headache'] as const).map((value) => ({
                value,
                label: t.attackKind[value],
              }))}
              value={kind ?? 'migraine'}
              onChange={setKind}
            />
          )}
          <ValueRow
            label={t.editAttack.start}
            value={moment(startedAt)}
            onClick={() => setView('start')}
          />
          <ValueRow
            label={t.editAttack.end}
            value={endedAt === undefined ? '–' : moment(endedAt)}
            onClick={() => setView('end')}
          />
          <ValueRow
            label={t.activeAttack.pain}
            value={painLevel === undefined ? '–' : `${painLevel} ${t.activeAttack.painOutOf}`}
            onClick={() => setView('pain')}
          />
          {shownSymptoms.length > 0 && (
            <ValueRow
              label={t.symptoms.title}
              value={
                shownSymptoms
                  .filter((symptom) => symptomIds.includes(symptom.id))
                  .map((symptom) => symptomName(symptom, t))
                  .join(', ') || '–'
              }
              onClick={() => setView('symptoms')}
            />
          )}

          {draftIntakes.length > 0 && (
            <section>
              <h3 className={styles.sectionLabel}>{t.editAttack.medications}</h3>
              <IntakeRows
                rows={draftIntakes.map((intake) => ({
                  key: intake.key,
                  name: medicationName(intake.medicationId),
                  time: Number.isNaN(fromInputValue(intake.takenAt))
                    ? '–'
                    : formatTime(fromInputValue(intake.takenAt), language),
                  effectiveness: intake.effectiveness,
                }))}
                onOpen={(key) => setView({ intake: key })}
              />
            </section>
          )}
          <Button variant="outline" onClick={() => setView('pick')}>
            <PlusIcon />
            {t.editAttack.addMedication}
          </Button>

          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <Button
            large
            disabled={
              Number.isNaN(startedAt) || Number.isNaN(endedAt) || intakeTimes.some(Number.isNaN)
            }
            onClick={() => void save()}
          >
            {t.editAttack.save}
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}
