import { useId, useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { NewDayEventSheet } from '../../components/NewDayEventSheet';
import { deleteDayEventType, updateDayEventType } from '../../data/dayEventRepository';
import type { DayEvent, DayEventType } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import styles from './Profile.module.css';

type DayEventTypesSheetProps = {
  types: DayEventType[];
  events: DayEvent[];
  onClose: () => void;
};

export function DayEventTypesSheet({ types, events, onClose }: DayEventTypesSheetProps) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<DayEventType>();
  const [adding, setAdding] = useState(false);

  if (adding) return <NewDayEventSheet types={types} onClose={() => setAdding(false)} />;

  return (
    <BottomSheet open onClose={onClose} title={editing ? t.dayEvents.editTitle : t.dayEvents.title}>
      {editing ? (
        <DayEventTypeForm type={editing} onDone={() => setEditing(undefined)} />
      ) : (
        <div className={styles.sheetContent}>
          {types.length > 0 && (
            <>
              <p className={styles.muted}>{t.dayEvents.manageHint}</p>
              <ul className={styles.list}>
                {types.map((type) => (
                  <li key={type.id} className={styles.symptomRow}>
                    <button
                      type="button"
                      className={styles.itemRow}
                      data-muted={type.hidden || undefined}
                      onClick={() => setEditing(type)}
                    >
                      <span className={styles.rowText}>
                        <span className={styles.itemName}>{type.name}</span>
                        <span className={styles.itemMeta}>
                          {t.dayEvents.count(events.filter((e) => e.typeId === type.id).length)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!type.hidden}
                      aria-label={type.name}
                      className={styles.switchButton}
                      onClick={() => void updateDayEventType(type.id, { hidden: !type.hidden })}
                    >
                      <span className={styles.switch} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Button variant="outline" onClick={() => setAdding(true)}>
            <PlusIcon />
            {t.dayEvents.newTitle}
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}

function DayEventTypeForm({ type, onDone }: { type: DayEventType; onDone: () => void }) {
  const { t } = useI18n();
  const nameId = useId();
  const [name, setName] = useState(type.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    await updateDayEventType(type.id, { name: name.trim() });
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
      <Button type="submit" large disabled={name.trim() === ''}>
        {t.profile.save}
      </Button>
      {confirmingDelete && <p className={styles.muted}>{t.dayEvents.deleteWarning}</p>}
      <button
        type="button"
        className={styles.quietDelete}
        onClick={() =>
          confirmingDelete
            ? void deleteDayEventType(type.id).then(onDone)
            : setConfirmingDelete(true)
        }
      >
        {confirmingDelete ? t.profile.confirmDelete : t.profile.delete}
      </button>
    </form>
  );
}
