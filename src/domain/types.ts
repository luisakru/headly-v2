export type Attack = {
  id: string;
  startedAt: number;
  endedAt?: number;
  painLevel?: number;
  /** Ids of `Symptom`s during this attack. */
  symptomIds?: string[];
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
  /** Why the prevention was stopped. Only kept with an `endDate`. */
  endReason?: string;
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

/** A small event the user defines, e.g. a flight; `period` marks the start of a period. */
export type DayEventType = {
  id: string;
  name: string;
  kind: 'custom' | 'period';
  createdAt: number;
  updatedAt: number;
};

/** One small event on one day. */
export type DayEvent = {
  id: string;
  typeId: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  createdAt: number;
  updatedAt: number;
};

export type BuiltInSymptom = 'aura' | 'nausea' | 'vomiting' | 'light' | 'noise';

/** A symptom the user can tick per attack; built-in ones are named by the locale unless renamed. */
export type Symptom = {
  id: string;
  builtIn?: BuiltInSymptom;
  /** Own name; for built-in symptoms only when renamed. */
  name?: string;
  enabled: boolean;
  /** Set when a built-in symptom is deleted, so it does not come back. */
  deleted?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Language = 'de' | 'en';

export type Theme = 'system' | 'light' | 'dark';

export type Settings = {
  language: Language;
  theme: Theme;
  lastBackupAt?: number;
  backupReminderEnabled: boolean;
  backupReminderSnoozedUntil?: number;
  installHintDismissed: boolean;
  introSeen: boolean;
};

/** Half-open interval [start, end) in epoch milliseconds. */
export type TimeRange = {
  start: number;
  end: number;
};
