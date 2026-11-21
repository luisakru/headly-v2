import { useId, useState, type FormEvent } from 'react';
import { createDayEventType } from '../data/dayEventRepository';
import type { DayEventType } from '../domain/types';
import { useI18n } from '../i18n/context';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import styles from './NewDayEventSheet.module.css';

type NewDayEventSheetProps = {
  types: DayEventType[];
  onClose: () => void;
  onCreated?: (type: DayEventType) => void;
};

/** Adds a kind of small event, from a suggestion or with an own name. */
export function NewDayEventSheet({ types, onClose, onCreated }: NewDayEventSheetProps) {
  const { t } = useI18n();
  const nameId = useId();
  const [name, setName] = useState('');
  const taken = new Set(types.map((type) => type.name.trim().toLowerCase()));
  const hasPeriod = types.some((type) => type.kind === 'period');
  const suggestions = [
    ...(hasPeriod ? [] : [{ name: t.dayEvents.period, kind: 'period' as const }]),
    ...t.dayEvents.suggestions.map((suggestion) => ({ name: suggestion, kind: 'custom' as const })),
  ].filter((suggestion) => !taken.has(suggestion.name.toLowerCase()));

  const create = async (fields: Pick<DayEventType, 'name' | 'kind'>) => {
    const type = await createDayEventType(fields);
    onCreated?.(type);
    onClose();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void create({ name: name.trim(), kind: 'custom' });
  };

  return (
    <BottomSheet open onClose={onClose} title={t.dayEvents.newTitle}>
      <div className={styles.content}>
        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.name}
                type="button"
                className={styles.suggestion}
                onClick={() => void create(suggestion)}
              >
                {suggestion.name}
              </button>
            ))}
          </div>
        )}
        {!hasPeriod && <p className={styles.hint}>{t.dayEvents.periodHint}</p>}
        <form className={styles.form} onSubmit={submit}>
          <label htmlFor={nameId} className={styles.label}>
            {t.dayEvents.ownName}
          </label>
          <input
            id={nameId}
            className={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={name.trim() === '' || taken.has(name.trim().toLowerCase())}
          >
            {t.dayEvents.addOwn}
          </Button>
        </form>
      </div>
    </BottomSheet>
  );
}
