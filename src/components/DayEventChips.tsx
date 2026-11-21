import { useState } from 'react';
import { toggleDayEvent } from '../data/dayEventRepository';
import type { DayEvent, DayEventType } from '../domain/types';
import { useI18n } from '../i18n/context';
import styles from './DayEventChips.module.css';
import { NewDayEventSheet } from './NewDayEventSheet';
import { ToggleChip } from './ToggleChip';

type DayEventChipsProps = {
  types: DayEventType[];
  events: DayEvent[];
  /** YYYY-MM-DD */
  date: string;
};

/** One chip per small event on that day, plus a chip to add a new kind of event. */
export function DayEventChips({ types, events, date }: DayEventChipsProps) {
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const logged = new Set(events.filter((event) => event.date === date).map((e) => e.typeId));

  return (
    <div className={styles.chips}>
      {types.map((type) => (
        <ToggleChip
          key={type.id}
          label={type.name}
          pressed={logged.has(type.id)}
          onChange={() => void toggleDayEvent(type.id, date)}
        />
      ))}
      <button
        type="button"
        className={styles.addChip}
        aria-label={t.dayEvents.add}
        onClick={() => setAdding(true)}
      >
        +
      </button>
      {adding && (
        <NewDayEventSheet
          types={types}
          onClose={() => setAdding(false)}
          onCreated={(type) => void toggleDayEvent(type.id, date)}
        />
      )}
    </div>
  );
}
