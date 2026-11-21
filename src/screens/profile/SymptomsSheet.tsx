import { useId, useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { ToggleChip } from '../../components/ToggleChip';
import { createSymptom, deleteSymptom, updateSymptom } from '../../data/symptomRepository';
import type { Symptom } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { symptomName } from '../../i18n/symptoms';
import styles from './Profile.module.css';

export function SymptomsSheet({ symptoms, onClose }: { symptoms: Symptom[]; onClose: () => void }) {
  const { t } = useI18n();
  // Undefined = list, null = new symptom.
  const [editing, setEditing] = useState<Symptom | null>();

  const title =
    editing === undefined
      ? t.symptoms.title
      : editing
        ? symptomName(editing, t)
        : t.symptoms.newSymptom;

  return (
    <BottomSheet open onClose={onClose} title={title}>
      {editing === undefined ? (
        <div className={styles.sheetContent}>
          <p className={styles.muted}>{t.symptoms.manageHint}</p>
          <ul className={styles.list}>
            {symptoms.map((symptom) => (
              <li key={symptom.id}>
                <button
                  type="button"
                  className={styles.itemRow}
                  onClick={() => setEditing(symptom)}
                >
                  <span className={styles.rowText}>
                    <span className={styles.itemName}>{symptomName(symptom, t)}</span>
                    {(!symptom.enabled || symptom.builtIn === 'aura') && (
                      <span className={styles.itemMeta}>
                        {symptom.enabled ? t.symptoms.auraHint : t.symptoms.off}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.textButton} onClick={() => setEditing(null)}>
            <PlusIcon />
            {t.symptoms.newSymptom}
          </button>
        </div>
      ) : (
        <SymptomForm symptom={editing ?? undefined} onDone={() => setEditing(undefined)} />
      )}
    </BottomSheet>
  );
}

function SymptomForm({ symptom, onDone }: { symptom?: Symptom; onDone: () => void }) {
  const { t } = useI18n();
  const nameId = useId();
  const [name, setName] = useState(symptom ? symptomName(symptom, t) : '');
  const [enabled, setEnabled] = useState(symptom?.enabled ?? true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!symptom) await createSymptom(trimmed);
    else {
      // A built-in symptom keeps following the language until it gets an own name.
      const ownName =
        symptom.builtIn && trimmed === t.symptoms.builtIn[symptom.builtIn] ? undefined : trimmed;
      await updateSymptom(symptom, { name: ownName, enabled });
    }
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
      {symptom && (
        <div>
          <ToggleChip label={t.symptoms.shown} pressed={enabled} onChange={setEnabled} />
        </div>
      )}
      <div className={styles.buttonRow}>
        <Button variant="outline" onClick={onDone}>
          {t.profile.cancel}
        </Button>
        <Button type="submit" disabled={name.trim() === ''}>
          {t.profile.save}
        </Button>
      </div>
      {symptom && !symptom.builtIn && (
        <Button
          variant="outline"
          className={styles.deleteButton}
          onClick={() =>
            confirmingDelete
              ? void deleteSymptom(symptom.id).then(onDone)
              : setConfirmingDelete(true)
          }
        >
          {confirmingDelete ? t.profile.confirmDelete : t.profile.delete}
        </Button>
      )}
    </form>
  );
}
