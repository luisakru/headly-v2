export type Attack = {
  id: string;
  startedAt: number;
  endedAt?: number;
  painLevel?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export type Medication = {
  id: string;
  name: string;
  dose?: string;
  isTriptan: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Effectiveness = 'strong' | 'slight' | 'none' | 'worse';

export type MedicationIntake = {
  id: string;
  medicationId: string;
  attackId?: string;
  takenAt: number;
  effectiveness?: Effectiveness;
  createdAt: number;
  updatedAt: number;
};

export type PreventionType = 'medication' | 'lifestyle';

export type Prevention = {
  id: string;
  name: string;
  type: PreventionType;
  dose?: string;
  /** ISO date, YYYY-MM-DD */
  startDate: string;
  /** ISO date, YYYY-MM-DD. When the prevention is expected to work; defaults to `startDate`. */
  effectiveFrom?: string;
  /** ISO date, YYYY-MM-DD */
  endDate?: string;
  createdAt: number;
  updatedAt: number;
};

/** Something that happened in life and may affect migraine, like a new job. */
export type LifeEvent = {
  id: string;
  name: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  createdAt: number;
  updatedAt: number;
};

export type Language = 'de' | 'en';

export type Settings = {
  language: Language;
  lastBackupAt?: number;
  backupReminderEnabled: boolean;
  backupReminderSnoozedUntil?: number;
  installHintDismissed: boolean;
};

/** Half-open interval [start, end) in epoch milliseconds. */
export type TimeRange = {
  start: number;
  end: number;
};
