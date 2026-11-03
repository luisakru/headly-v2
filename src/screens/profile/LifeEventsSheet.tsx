import { parseISO } from 'date-fns';
import { useId, useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { createLifeEvent, deleteLifeEvent, updateLifeEvent } from '../../data/lifeEventRepository';
import { toDayKey } from '../../domain/days';
import type { LifeEvent } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatDateShort } from '../../i18n/format';
import styles from './Profile.module.css';

type LifeEventsSheetProps = {
  lifeEvents: LifeEvent[];
  now: number;
  onClose: () => void;
};

export function LifeEventsSheet({ lifeEvents, now, onClose }: LifeEventsSheetProps) {
  const { t, language } = useI18n();
  // Undefined = list, null = new life event.
  const [editing, setEditing] = useState<LifeEvent | null>();
  const sorted = [...lifeEvents].sort((a, b) => b.date.localeCompare(a.date));

  const title =
    editing === undefined
      ? t.profile.manageLifeEvents
      : editing
        ? t.profile.editLifeEvent
        : t.profile.newLifeEvent;

  return (
    <BottomSheet open onClose={onClose} title={title}>
      {editing === undefined ? (
        <div className={styles.sheetContent}>
          {sorted.length > 0 && (
            <ul className={styles.list}>
              {sorted.map((lifeEvent) => (
                <li key={lifeEvent.id}>
                  <button
                    type="button"
                    className={styles.itemRow}
                    onClick={() => setEditing(lifeEvent)}
                  >
                    <span className={styles.rowText}>
                      <span className={styles.itemName}>{lifeEvent.name}</span>
                      <span className={styles.itemMeta}>
                        {formatDateShort(parseISO(lifeEvent.date).getTime(), language)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className={styles.textButton} onClick={() => setEditing(null)}>
            <PlusIcon />
            {t.profile.newLifeEvent}
          </button>
        </div>
      ) : (
        <LifeEventForm
          lifeEvent={editing ?? undefined}
          now={now}
          onDone={() => setEditing(undefined)}
        />
      )}
    </BottomSheet>
  );
}

type LifeEventFormProps = {
  lifeEvent?: LifeEvent;
  now: number;
  onDone: () => void;
};

function LifeEventForm({ lifeEvent, now, onDone }: LifeEventFormProps) {
  const { t } = useI18n();
  const nameId = useId();
  const dateId = useId();
  const [name, setName] = useState(lifeEvent?.name ?? '');
  const [date, setDate] = useState(lifeEvent?.date ?? toDayKey(now));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const fields = { name: name.trim(), date };
    if (lifeEvent) await updateLifeEvent(lifeEvent.id, fields);
    else await createLifeEvent(fields);
    onDone();
  };

  return (
    <form className={styles.form} onSubmit={(event) => void save(event)}>
      <label htmlFor={nameId} className={styles.fieldLabel}>
        {t.profile.name}
      </label>
      <p className={styles.fieldHint}>{t.profile.lifeEventHint}</p>
      <input
        id={nameId}
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
      />
      <label htmlFor={dateId} className={styles.fieldLabel}>
        {t.profile.lifeEventDate}
      </label>
      <input
        id={dateId}
        type="date"
        className={styles.input}
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
      <div className={styles.buttonRow}>
        <Button variant="outline" onClick={onDone}>
          {t.profile.cancel}
        </Button>
        <Button type="submit" disabled={name.trim() === '' || date === ''}>
          {t.profile.save}
        </Button>
      </div>
      {lifeEvent && (
        <Button
          variant="outline"
          className={styles.deleteButton}
          onClick={() =>
            confirmingDelete
              ? void deleteLifeEvent(lifeEvent.id).then(onDone)
              : setConfirmingDelete(true)
          }
        >
          {confirmingDelete ? t.profile.confirmDelete : t.profile.delete}
        </Button>
      )}
    </form>
  );
}
