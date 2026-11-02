import type { ImportSummary as BackupCounts } from '../../data/backup';
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
    prevention: {
      endBeforeStart: 'Das Ende darf nicht vor dem Beginn liegen.',
      effectiveBeforeStart: 'Der Wirkbeginn darf nicht vor dem Beginn liegen.',
    },
  },
  insights: {
    migraineDaysDropped: (before: string, after: string) =>
      `Die Migränetage sind von ${before} auf ${after} pro Monat gesunken.`,
    migraineDaysRose: (before: string, after: string) =>
      `Die Migränetage sind von ${before} auf ${after} pro Monat gestiegen.`,
    migraineDaysDetail: (before: string, after: string) =>
      `Verglichen wird ${after} mit dem gleich langen Zeitraum davor (${before}). Gezählt werden Tage mit Migräne, umgerechnet auf 30 Tage.`,
    preventionMedicationDays: (name: string, before: string, after: string) =>
      `Seit ${name}: ${after} statt ${before} Medikamententage pro Monat.`,
    preventionDetail: (days: number, before: string, after: string) =>
      `Verglichen werden die ${days} Tage vor dem Beginn (${before}) mit ${days} Tagen ab dem erwarteten Wirkbeginn (${after}). Gezählt werden Tage mit mindestens einer Medikamenteneinnahme, umgerechnet auf 30 Tage. Den Wirkbeginn kannst du im Profil bei der Prophylaxe eintragen.`,
    medicationHelpedLess: (name: string, before: string, after: string) =>
      `${name} hat zuletzt weniger geholfen (${before} auf ${after}).`,
    medicationHelpedMore: (name: string, before: string, after: string) =>
      `${name} hat zuletzt besser geholfen (${before} auf ${after}).`,
    effectivenessDetail: (before: string, after: string) =>
      `Verglichen wird ${after} mit dem gleich langen Zeitraum davor (${before}). Gezählt wird der Anteil der bewerteten Einnahmen, die stark oder etwas geholfen haben.`,
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
      '1W': '1W',
      '1M': '1M',
      '3M': '3M',
      '6M': '6M',
      '1Y': '1J',
      '2Y': '2J',
      all: 'Alle',
    },
    painAxis: 'Intensität (0–10)',
    series: {
      migraine: 'Migräne',
      medication: 'Medikament',
    },
    chartLabel: 'Migränetage und Medikamententage pro Monat',
    howCalculated: 'So wird gerechnet',
    migraineDayCount: (n: number) => (n === 1 ? '1 Migränetag' : `${n} Migränetage`),
    medicationDayCount: (n: number) => (n === 1 ? '1 Medikamententag' : `${n} Medikamententage`),
    averageMigraineDays: 'Ø Migränetage / Monat',
    effectivenessRate: 'Ø Wirksamkeit',
    unrated: (n: number) => `${n} nicht bewertet`,
    averagePain: 'Ø Intensität',
    medicationDays: 'Medikamententage',
    overuseTitle: 'Möglicher Medikamentenübergebrauch',
    overuseText: (months: string, triptanDays: number, medicationDays: number) =>
      `${months}: ${triptanDays} oder mehr Triptantage oder ${medicationDays} oder mehr Medikamententage im Monat können Kopfschmerzen häufiger machen. Bitte ärztlich abklären.`,
    insights: 'Erkenntnisse',
    preventions: 'Prophylaxe im Zeitraum',
    since: (month: string) => `seit ${month}`,
    active: 'aktiv',
    preventionMigraineDays: (before: string, after: string) =>
      `Migränetage pro Monat: ${before} → ${after}`,
    preventionMedicationDays: (before: string, after: string) =>
      `Medikamententage pro Monat: ${before} → ${after}`,
    preventionEffectDetail: (days: number, before: string, after: string) =>
      `Verglichen werden die ${days} Tage vor dem Beginn (${before}) mit ${days} Tagen ab dem erwarteten Wirkbeginn (${after}). Gezählt werden Tage mit Migräne und Tage mit mindestens einer Medikamenteneinnahme, umgerechnet auf 30 Tage. Den Wirkbeginn kannst du im Profil bei der Prophylaxe eintragen.`,
    shortComparison: (days: number) => `Nur ${days} Tage verglichen, wenig aussagekräftig`,
    effectGap: {
      noData: 'Noch keine Daten',
      effectiveAfterEnd: 'Der Wirkbeginn liegt nach dem Ende.',
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'Vor dem Beginn sind keine Daten erfasst.'
          : `Nur ${days} Tage vor dem Beginn erfasst, mindestens ${min} nötig.`,
      shortAfter: (days: number, min: number) =>
        `Nur ${days} Tage zum Vergleich nach dem Beginn, mindestens ${min} nötig.`,
    },
  },
  profile: {
    title: 'Profil',
    backToProfile: 'Profil',
    medications: 'Medikamente',
    manageMedications: 'Medikamente verwalten',
    medicationCount: (n: number) => (n === 1 ? '1 Medikament' : `${n} Medikamente`),
    newMedication: 'Neues Medikament',
    editMedication: 'Medikament bearbeiten',
    name: 'Name',
    dose: 'Dosis (optional)',
    isTriptan: 'Triptan',
    archive: 'Archivieren',
    restore: 'Wiederherstellen',
    archived: 'Archiviert',
    preventions: 'Prophylaxe',
    managePreventions: 'Prophylaxe verwalten',
    preventionCount: (total: number, active: number) =>
      `${total === 1 ? '1 Prophylaxe' : `${total} Prophylaxen`} · ${active} aktiv`,
    newPrevention: 'Neue Prophylaxe',
    editPrevention: 'Prophylaxe bearbeiten',
    preventionType: 'Art',
    preventionTypes: {
      medication: 'Medikament',
      lifestyle: 'Lebensstil',
    },
    startDate: 'Beginn',
    effectiveFrom: 'Wirkt voraussichtlich ab (optional)',
    effectiveFromHint:
      'Viele Prophylaxen wirken erst nach 2–3 Monaten. Ohne Datum zählt der Beginn.',
    endDate: 'Ende (optional)',
    activePreventions: 'Aktiv',
    pastPreventions: 'Beendet',
    since: (date: string) => `seit ${date}`,
    active: 'aktiv',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    confirmDelete: 'Wirklich löschen?',
    data: 'Daten',
    exportData: 'Daten exportieren',
    lastBackup: (days: number | undefined) =>
      days === undefined
        ? 'Noch keine Sicherung'
        : days === 0
          ? 'Letzte Sicherung: heute'
          : days === 1
            ? 'Letzte Sicherung: vor 1 Tag'
            : `Letzte Sicherung: vor ${days} Tagen`,
    importData: 'Daten importieren',
    importHint: 'Sicherung wiederherstellen',
    backupReminder: 'Sicherungs-Erinnerung',
    backupReminderHint: 'Auf der Startseite, nach 30 Tagen',
    deleteAll: 'Alle Daten löschen',
    deleteAllHint: 'Nicht rückgängig machbar',
    app: 'App',
    language: 'Sprache',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    about: 'Über Headly',
    version: (version: string) => `Version ${version}`,
    aboutText:
      'Headly ist ein ruhiger Migräne-Tracker. Alle Daten bleiben in deinem Browser auf diesem Gerät: kein Konto, kein Server, kein Tracking.',
    disclaimer: 'Headly ist kein Medizinprodukt und ersetzt keine ärztliche Beratung.',
    comingSoon: 'Demnächst',
    pdfExport: 'PDF-Export',
    pdfExportHint: 'Für das Arztgespräch',
    notifications: 'Benachrichtigungen',
    notificationsHint: 'Erinnerungen und Checks',
  },
  backup: {
    importTitle: 'Sicherung importieren',
    fileContains: (counts: string) => `Diese Sicherung enthält ${counts}.`,
    counts: ({ attacks, medications, medicationIntakes, preventions }: BackupCounts) =>
      [
        attacks === 1 ? '1 Migräne' : `${attacks} Migränen`,
        medications === 1 ? '1 Medikament' : `${medications} Medikamente`,
        medicationIntakes === 1 ? '1 Einnahme' : `${medicationIntakes} Einnahmen`,
        preventions === 1 ? '1 Prophylaxe' : `${preventions} Prophylaxen`,
      ].join(', '),
    merge: 'Zusammenführen',
    mergeHint: 'Fügt neue Einträge hinzu und aktualisiert geänderte.',
    replace: 'Alles ersetzen',
    replaceHint: 'Löscht vorher alle aktuellen Einträge.',
    confirmReplace: 'Wirklich alles ersetzen?',
    imported: (counts: string) => `Importiert: ${counts}.`,
    done: 'Fertig',
    errors: {
      invalidFile:
        'Diese Datei ist keine Headly-Sicherung oder beschädigt. Es wurde nichts geändert.',
      newerVersion:
        'Diese Sicherung stammt aus einer neueren Headly-Version. Bitte zuerst die App aktualisieren. Es wurde nichts geändert.',
    },
    reminder: 'Deine Daten liegen nur auf diesem Handy. Jetzt sichern?',
    backUpNow: 'Jetzt sichern',
    later: 'Später',
    deleteAllTitle: 'Alle Daten löschen',
    deleteAllText:
      'Alle Migränen, Medikamente, Einnahmen und Prophylaxen werden von diesem Gerät gelöscht. Exportiere vorher eine Sicherung, wenn du sie behalten willst.',
    deleteAll: 'Alle Daten löschen',
    confirmDeleteAll: 'Wirklich alles löschen?',
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
