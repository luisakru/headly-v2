import { addMonths, isSameMonth, startOfMonth } from 'date-fns';
import { useRef, useState, type TouchEvent } from 'react';
import { Card } from '../../components/Card';
import { DayDetails } from '../../components/DayDetails';
import { DayGrid, DayLegend } from '../../components/DayGrid';
import { EditAttackSheet } from '../../components/EditAttackSheet';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../../components/icons';
import { monthGridDays } from '../../domain/calendar';
import { countDaysInRange, migraineDays, toDayKey } from '../../domain/days';
import type { Attack } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatMonthYear } from '../../i18n/format';
import { useHomeData, useNow } from '../home/useHomeData';
import styles from './Calendar.module.css';

const SWIPE_DISTANCE = 50;

/** `attack` is undefined while adding a new one. */
type Editing = { attack?: Attack };

export function CalendarScreen() {
  const { t, language } = useI18n();
  const data = useHomeData();
  const now = useNow();
  const [month, setMonth] = useState(() => startOfMonth(Date.now()));
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => new Date());
  const [editing, setEditing] = useState<Editing>();
  const swipeStart = useRef<{ x: number; y: number }>(undefined);

  if (!data) return null;
  const { attacks, intakes, medications } = data;

  const monthRange = { start: month.getTime(), end: addMonths(month, 1).getTime() };
  const migraineDayCount = countDaysInRange(migraineDays(attacks, now), monthRange);
  const isCurrentMonth = isSameMonth(month, now);
  const showMonth = (offset: number) => setMonth((current) => addMonths(current, offset));

  const startSwipe = (event: TouchEvent) => {
    const touch = event.touches[0];
    swipeStart.current = touch && { x: touch.clientX, y: touch.clientY };
  };
  const endSwipe = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    const start = swipeStart.current;
    swipeStart.current = undefined;
    if (!touch || !start) return;
    const dx = touch.clientX - start.x;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(touch.clientY - start.y)) return;
    showMonth(dx < 0 ? 1 : -1);
  };

  // A new attack on a past day starts at the current time of day.
  const defaultStartedAt = (day: Date) => {
    const start = new Date(day);
    start.setHours(new Date(now).getHours(), new Date(now).getMinutes(), 0, 0);
    return start.getTime();
  };

  return (
    <>
      <header className={styles.header}>
        {!isCurrentMonth && (
          <button
            type="button"
            className={styles.currentMonthLink}
            onClick={() => setMonth(startOfMonth(now))}
          >
            {t.calendar.backTo(formatMonthYear(now, language))}
          </button>
        )}
        <button
          type="button"
          className={styles.monthButton}
          aria-label={t.calendar.previousMonth}
          onClick={() => showMonth(-1)}
        >
          <ChevronLeftIcon />
        </button>
        <h1 className={styles.title} aria-live="polite">
          {formatMonthYear(month.getTime(), language)}
        </h1>
        <button
          type="button"
          className={styles.monthButton}
          aria-label={t.calendar.nextMonth}
          onClick={() => showMonth(1)}
        >
          <ChevronRightIcon />
        </button>
        <p className={styles.subtitle}>{t.calendar.migraineDays(migraineDayCount)}</p>
      </header>

      <section className={styles.section}>
        <div onTouchStart={startSwipe} onTouchEnd={endSwipe}>
          <DayGrid
            days={monthGridDays(month)}
            attacks={attacks}
            intakes={intakes}
            now={now}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />
        </div>
        <DayLegend />
      </section>

      {selectedDay ? (
        <section className={styles.section}>
          <DayDetails
            day={selectedDay}
            attacks={attacks}
            intakes={intakes}
            medications={medications}
            now={now}
            onEditAttack={(attack) => setEditing({ attack })}
            hideEmpty
          />
          {toDayKey(selectedDay) <= toDayKey(now) && (
            <button type="button" className={styles.textButton} onClick={() => setEditing({})}>
              <PlusIcon />
              {t.calendar.addMigraine}
            </button>
          )}
        </section>
      ) : (
        <Card className={styles.hint}>{t.calendar.tapADay}</Card>
      )}

      {editing && (
        <EditAttackSheet
          attack={editing.attack}
          defaultStartedAt={selectedDay && defaultStartedAt(selectedDay)}
          intakes={intakes}
          medications={medications}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
