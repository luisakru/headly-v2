export type Attack = {
  id: string;
  startedAt: number;
  endedAt?: number;
  painAtStart?: number;
  painMax?: number;
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
  /** ISO date, YYYY-MM-DD */
  endDate?: string;
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
