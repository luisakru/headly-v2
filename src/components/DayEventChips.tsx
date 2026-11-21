import { toggleDayEvent } from '../data/dayEventRepository';
import type { DayEvent, DayEventType } from '../domain/types';
import styles from './DayEventChips.module.css';
import { ToggleChip } from './ToggleChip';

type DayEventChipsProps = {
  types: DayEventType[];
  events: DayEvent[];
  /** YYYY-MM-DD */
  date: string;
};

/** One chip per kind of event, toggled for that day. New kinds are added in Profile. */
export function DayEventChips({ types, events, date }: DayEventChipsProps) {
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
    </div>
  );
}
