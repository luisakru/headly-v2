import { useId, useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { ToggleChip } from '../../components/ToggleChip';
import {
  archiveMedication,
  createMedication,
  updateMedication,
} from '../../data/medicationRepository';
import type { Medication } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import styles from './Profile.module.css';

type MedicationsSheetProps = {
  medications: Medication[];
  onClose: () => void;
};

/** Tapping a medication edits it; archived ones stay listed so they can be restored. */
export function MedicationsSheet({ medications, onClose }: MedicationsSheetProps) {
  const { t } = useI18n();
  // Undefined = list, null = new medication.
  const [editing, setEditing] = useState<Medication | null>();
  const sorted = [...medications].sort((a, b) => a.name.localeCompare(b.name));
  const current = sorted.filter((medication) => !medication.archived);
  const archived = sorted.filter((medication) => medication.archived);

  const title =
    editing === undefined
      ? t.profile.manageMedications
      : editing
        ? t.profile.editMedication
        : t.profile.newMedication;

  const renderList = (list: Medication[], muted = false) => (
    <ul className={styles.list}>
      {list.map((medication) => (
        <li key={medication.id}>
          <button
            type="button"
            className={styles.itemRow}
            data-muted={muted || undefined}
            onClick={() => setEditing(medication)}
          >
            <span className={styles.rowText}>
              <span className={styles.itemName}>{medication.name}</span>
              <span className={styles.itemMeta}>
                {[medication.dose, medication.isTriptan && t.profile.isTriptan]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <BottomSheet open onClose={onClose} title={title}>
      {editing === undefined ? (
        <div className={styles.sheetContent}>
          {renderList(current)}
          <button type="button" className={styles.textButton} onClick={() => setEditing(null)}>
            <PlusIcon />
            {t.profile.newMedication}
          </button>
          {archived.length > 0 && (
            <>
              <h3 className={styles.groupLabel}>{t.profile.archived}</h3>
              {renderList(archived, true)}
            </>
          )}
        </div>
      ) : (
        <MedicationForm medication={editing ?? undefined} onDone={() => setEditing(undefined)} />
      )}
    </BottomSheet>
  );
}

function MedicationForm({ medication, onDone }: { medication?: Medication; onDone: () => void }) {
  const { t } = useI18n();
  const nameId = useId();
  const doseId = useId();
  const [name, setName] = useState(medication?.name ?? '');
  const [dose, setDose] = useState(medication?.dose ?? '');
  const [isTriptan, setIsTriptan] = useState(medication?.isTriptan ?? false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const fields = { name: name.trim(), dose: dose.trim() || undefined, isTriptan };
    if (medication) await updateMedication(medication.id, fields);
    else await createMedication(fields);
    onDone();
  };

  return (
    <form className={styles.form} onSubmit={(event) => void save(event)}>
      <label htmlFor={nameId} className={styles.fieldLabel}>
        {t.profile.name}
      </label>
      <input
        id={nameId}
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
      />
      <label htmlFor={doseId} className={styles.fieldLabel}>
        {t.profile.dose}
      </label>
      <input
        id={doseId}
        className={styles.input}
        value={dose}
        onChange={(event) => setDose(event.target.value)}
        autoComplete="off"
      />
      <div>
        <ToggleChip label={t.profile.isTriptan} pressed={isTriptan} onChange={setIsTriptan} />
      </div>
      <div className={styles.buttonRow}>
        <Button variant="outline" onClick={onDone}>
          {t.profile.cancel}
        </Button>
        <Button type="submit" disabled={name.trim() === ''}>
          {t.profile.save}
        </Button>
      </div>
      {medication && (
        <Button
          variant="outline"
          className={styles.deleteButton}
          onClick={() => void archiveMedication(medication.id, !medication.archived).then(onDone)}
        >
          {medication.archived ? t.profile.restore : t.profile.archive}
        </Button>
      )}
    </form>
  );
}
