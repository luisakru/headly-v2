import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { listAttacks } from '../../data/attackRepository';
import { listDayEvents, listDayEventTypes } from '../../data/dayEventRepository';
import { listLifeEvents } from '../../data/lifeEventRepository';
import { listIntakes } from '../../data/intakeRepository';
import { listMedications } from '../../data/medicationRepository';
import { listPreventions } from '../../data/preventionRepository';
import { getSettings } from '../../data/settingsRepository';
import type {
  Attack,
  DayEvent,
  DayEventType,
  LifeEvent,
  Medication,
  MedicationIntake,
  Prevention,
  Settings,
} from '../../domain/types';

export type HomeData = {
  attacks: Attack[];
  intakes: MedicationIntake[];
  /** Includes archived medications so older intakes keep their names. */
  medications: Medication[];
  preventions: Prevention[];
  lifeEvents: LifeEvent[];
  dayEventTypes: DayEventType[];
  dayEvents: DayEvent[];
};

export function useHomeData(): HomeData | undefined {
  return useLiveQuery(async () => {
    const [attacks, intakes, medications, preventions, lifeEvents, dayEventTypes, dayEvents] =
      await Promise.all([
        listAttacks(),
        listIntakes(),
        listMedications({ includeArchived: true }),
        listPreventions(),
        listLifeEvents(),
        listDayEventTypes(),
        listDayEvents(),
      ]);
    return { attacks, intakes, medications, preventions, lifeEvents, dayEventTypes, dayEvents };
  });
}

export function useSettings(): Settings | undefined {
  return useLiveQuery(getSettings);
}

const TICK_MS = 15_000;

/** Current time, refreshed regularly and when the app comes back to the foreground. */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, TICK_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  return now;
}
