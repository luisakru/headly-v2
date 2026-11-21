import { useId, useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { NewDayEventSheet } from '../../components/NewDayEventSheet';
import { deleteDayEventType, renameDayEventType } from '../../data/dayEventRepository';
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
    <BottomSheet open onClose={onClose} title={editing ? editing.name : t.dayEvents.title}>
      {editing ? (
        <DayEventTypeForm type={editing} onDone={() => setEditing(undefined)} />
      ) : (
        <div className={styles.sheetContent}>
          {types.length > 0 && (
            <>
              <p className={styles.muted}>{t.dayEvents.manageHint}</p>
              <ul className={styles.list}>
                {types.map((type) => (
                  <li key={type.id}>
                    <button
                      type="button"
                      className={styles.itemRow}
                      onClick={() => setEditing(type)}
                    >
                      <span className={styles.rowText}>
                        <span className={styles.itemName}>{type.name}</span>
                        <span className={styles.itemMeta}>
                          {t.dayEvents.count(events.filter((e) => e.typeId === type.id).length)}
                        </span>
                      </span>
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
    await renameDayEventType(type.id, name.trim());
    onDone();
  };

  return (
    <form className={styles.form} onSubmit={(event) => void save(event)}>
      <label htmlFor={nameId} className={styles.fieldLabel}>
        {t.dayEvents.rename}
      </label>
      <input
        id={nameId}
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
      />
      <div className={styles.buttonRow}>
        <Button variant="outline" onClick={onDone}>
          {t.profile.cancel}
        </Button>
        <Button type="submit" disabled={name.trim() === ''}>
          {t.profile.save}
        </Button>
      </div>
      {confirmingDelete && <p className={styles.muted}>{t.dayEvents.deleteWarning}</p>}
      <Button
        variant="outline"
        className={styles.deleteButton}
        onClick={() =>
          confirmingDelete
            ? void deleteDayEventType(type.id).then(onDone)
            : setConfirmingDelete(true)
        }
      >
        {confirmingDelete ? t.profile.confirmDelete : t.profile.delete}
      </Button>
    </form>
  );
}
