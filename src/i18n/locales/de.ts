import type { DurationParts } from '../../domain/days';
import type { Dictionary } from './en';

export const de: Dictionary = {
  languages: {
    de: 'Deutsch',
    en: 'English',
  },
  common: {
    close: 'Schließen',
    soon: 'Bald',
  },
  tabs: {
    label: 'Hauptnavigation',
    home: 'Start',
    calendar: 'Kalender',
    stats: 'Statistik',
    profile: 'Profil',
  },
  home: {
    title: 'Guten Tag',
    migraineDaysThisMonth: (n: number) =>
      n === 1 ? '1 Migränetag in diesem Monat' : `${n} Migränetage in diesem Monat`,
    activePreventions: 'Aktive Prophylaxe',
    startMigraine: 'Migräne starten',
    lastFourWeeks: 'Letzte 4 Wochen',
    insight: 'Erkenntnis',
  },
  dayLegend: {
    migraine: 'Migräne',
    withMedication: '+ Medikament',
    today: 'Heute',
  },
  dayDetail: {
    start: 'Beginn',
    end: 'Ende',
    ongoing: 'läuft noch',
    duration: 'Dauer',
    pain: 'Intensität',
    painOutOfTen: (n: number) => `${n}/10`,
    medications: 'Medikamente',
    noEntry: 'Kein Eintrag an diesem Tag',
  },
  editAttack: {
    title: 'Migräne bearbeiten',
    addTitle: 'Migräne nachtragen',
    start: 'Beginn',
    end: 'Ende',
    painLevel: 'Schmerzintensität',
    medications: 'Medikamente',
    addMedication: 'Medikament hinzufügen',
    removeIntake: (name: string) => `${name} entfernen`,
    save: 'Speichern',
    delete: 'Migräne löschen',
    confirmDelete: 'Wirklich löschen?',
  },
  activeAttack: {
    label: 'Migräne aktiv',
    runningFor: 'läuft seit',
    duration: ({ days, hours, minutes }: DurationParts) =>
      days > 0 ? `${days}T ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    startedToday: (time: string) => `gestartet um ${time} Uhr heute`,
    startedOn: (dateTime: string) => `gestartet am ${dateTime} Uhr`,
    painNow: 'Schmerzintensität jetzt',
    medicationsDuring: 'Medikamente in dieser Migräne',
    logMedication: 'Medikament eintragen',
    endMigraine: 'Migräne beenden',
    endedEarlier: 'Früher beendet?',
    deleteIntake: (name: string) => `${name} löschen`,
  },
  medicationSheet: {
    title: 'Welches Medikament?',
    empty: 'Noch keine Medikamente gespeichert.',
    newMedication: 'Neues Medikament',
    name: 'Name',
    dose: 'Dosis (optional)',
    isTriptan: 'Triptan',
    save: 'Speichern',
    done: 'Fertig',
  },
  timePicker: {
    startTitle: 'Wann hat sie begonnen?',
    endTitle: 'Wann hat sie aufgehört?',
    label: 'Datum und Uhrzeit',
    save: 'Speichern',
  },
  effectiveness: {
    strong: 'Stark verbessert',
    slight: 'Leicht verbessert',
    none: 'Keine Wirkung',
    worse: 'Verschlechtert',
    pending: 'Wirkung ausstehend',
    sheetTitle: (name: string) => `Wirkung · ${name}`,
  },
  prompts: {
    rateIntake: (name: string) => `Hat ${name} geholfen?`,
    takenAt: (time: string) => `Genommen ${time}`,
    stillRunning: 'Hält die Migräne noch an?',
    stillRunningNextDay: 'War gestern noch ein Migränetag?',
    stillRunningNextDayHint: 'Die Migräne ist noch als aktiv markiert.',
    stillGoing: 'Hält noch an',
    itIsOver: 'Sie ist vorbei',
    endAtTime: 'Sie hat früher aufgehört',
  },
  errors: {
    attack: {
      startInFuture: 'Dieser Zeitpunkt liegt in der Zukunft.',
      endBeforeStart: 'Das Ende muss nach dem Beginn liegen.',
      invalidPainLevel: 'Die Schmerzintensität muss zwischen 0 und 10 liegen.',
      overlap: 'Das überschneidet sich mit einer anderen Migräne.',
      activeAttackExists: 'Es ist bereits eine Migräne aktiv.',
      notFound: 'Diese Migräne gibt es nicht mehr.',
    },
  },
  insights: {
    migraineDaysDropped: (before: string, after: string) =>
      `Die Migränetage sind von ${before} auf ${after} pro Monat gesunken.`,
    migraineDaysRose: (before: string, after: string) =>
      `Die Migränetage sind von ${before} auf ${after} pro Monat gestiegen.`,
    preventionFewerMedicationDays: (name: string, percent: string) =>
      `Seit Beginn von ${name}: ${percent} weniger Medikamententage.`,
    preventionMoreMedicationDays: (name: string, percent: string) =>
      `Seit Beginn von ${name}: ${percent} mehr Medikamententage.`,
    medicationHelpedLess: (name: string, months: number, before: string, after: string) =>
      `${name} hat in den letzten ${months} Monaten weniger geholfen (${before} auf ${after}).`,
    medicationHelpedMore: (name: string, months: number, before: string, after: string) =>
      `${name} hat in den letzten ${months} Monaten besser geholfen (${before} auf ${after}).`,
    fewerButStronger: (points: string) =>
      `Weniger Attacken, aber im Schnitt ${points} Punkte stärker.`,
  },
  calendar: {
    title: 'Kalender',
    migraineDays: (n: number) => (n === 1 ? '1 Migränetag' : `${n} Migränetage`),
    backTo: (month: string) => `← ${month}`,
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    tapADay: 'Tippe auf einen Tag für Details',
    addMigraine: 'Migräne nachtragen',
  },
  stats: {
    title: 'Statistik',
    range: {
      label: 'Zeitraum',
      '1M': '1M',
      '3M': '3M',
      '6M': '6M',
      '1Y': '1J',
      custom: 'Eigene',
    },
    series: {
      migraine: 'Migräne',
      medication: 'Medikament',
    },
  },
  profile: {
    title: 'Profil',
    language: 'Sprache',
  },
  painScale: {
    label: 'Schmerzintensität',
    low: 'kein Schmerz',
    high: 'unerträglich',
    question: 'Wie stark sind die Schmerzen?',
  },
  dev: {
    title: 'Komponenten',
    buttons: 'Buttons',
    card: 'Karte',
    cardText: 'Karten gruppieren zusammengehörige Inhalte auf der Flächenfarbe.',
    painScale: 'Schmerzskala',
    segmentedControl: 'Segmentauswahl',
    toggleChips: 'Umschalt-Chips',
    bottomSheet: 'Bottom Sheet',
    openSheet: 'Sheet öffnen',
    migraineDays: (n: number) => (n === 1 ? '1 Migränetag' : `${n} Migränetage`),
  },
};
