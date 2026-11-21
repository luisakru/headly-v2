import type { ImportSummary as BackupCounts } from '../../data/backup';
import type { DurationParts } from '../../domain/days';
import type { Dictionary } from './en';

export const de: Dictionary = {
  languages: {
    de: 'Deutsch',
    en: 'English',
  },
  themes: {
    system: 'System',
    light: 'Hell',
    dark: 'Dunkel',
  },
  common: {
    done: 'Fertig',
    close: 'Schließen',
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
    migraineDaysLastFourWeeks: (n: number) =>
      n === 1 ? '1 Migränetag in den letzten 4 Wochen' : `${n} Migränetage in den letzten 4 Wochen`,
    startMigraine: 'Migräne starten',
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
    takenAt: 'Genommen um',
    removeIntake: (name: string) => `${name} entfernen`,
    save: 'Speichern',
    delete: 'Migräne löschen',
    confirmDelete: 'Wirklich löschen?',
  },
  activeAttack: {
    label: 'Migräne aktiv',
    duration: ({ days, hours, minutes }: DurationParts) =>
      days > 0 ? `${days}T ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    sinceToday: (time: string) => `seit ${time} Uhr`,
    sinceOn: (dateTime: string) => `seit ${dateTime} Uhr`,
    pain: 'Schmerz',
    painOutOf: 'von 10',
    painNow: 'Schmerzintensität jetzt',
    medicationsDuring: 'Medikamente',
    logMedication: 'Medikament eintragen',
    endMigraine: 'Migräne beenden',
    endedEarlier: 'Früher beendet?',
    moreActions: 'Weitere Aktionen',
    deleteIntake: (name: string) => `${name} löschen`,
  },
  medicationSheet: {
    notBefore: (time: string) => `ab ${time}`,
    title: 'Welches Medikament?',
    takenAt: 'Genommen um',
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
    tone: {
      good: 'Gute Entwicklung',
      bad: 'Schlechte Entwicklung',
      mixed: 'Gemischte Entwicklung',
    },
    migraineDaysDropped: (before: string, after: string) =>
      `Die Migränetage sind von ${before} auf ${after} pro Monat gesunken.`,
    migraineDaysRose: (before: string, after: string) =>
      `Die Migränetage sind von ${before} auf ${after} pro Monat gestiegen.`,
    migraineDaysDetail: (before: string, after: string) =>
      `Verglichen wird ${after} mit dem gleich langen Zeitraum davor (${before}). Gezählt werden Tage mit Migräne, umgerechnet auf 30 Tage.`,
    preventionMedicationDays: (name: string, before: string, after: string) =>
      `Seit ${name}: ${after} statt ${before} Medikamententage pro Monat.`,
    preventionWeaker: (name: string, early: string, recent: string, before?: string) =>
      `${name} wirkt schwächer als am Anfang: zuerst ${early}, zuletzt ${recent} Migränetage pro Monat${before ? ` (vorher ${before})` : ''}.`,
    preventionStronger: (name: string, early: string, recent: string, before?: string) =>
      `${name} wirkt besser als am Anfang: zuerst ${early}, zuletzt ${recent} Migränetage pro Monat${before ? ` (vorher ${before})` : ''}.`,
    preventionChangeDetail: (early: string, recent: string, before?: string) =>
      `Verglichen werden die ersten 90 Tage ab dem Wirkbeginn (${early}) mit den letzten 90 Tagen (${recent}). Gezählt werden Tage mit Migräne, umgerechnet auf 30 Tage.${before ? ` „Vorher" sind die bis zu 90 Tage vor dem Beginn (${before}).` : ''}`,
    preventionDetail: (days: number, before: string, after: string) =>
      `Verglichen werden die ${days} Tage vor dem Beginn (${before}) mit ${days} Tagen ab dem erwarteten Wirkbeginn (${after}). Gezählt werden Tage mit mindestens einer Medikamenteneinnahme, umgerechnet auf 30 Tage. Den Wirkbeginn kannst du im Profil bei der Prophylaxe eintragen.`,
    lifeEventMigraineDays: (name: string, before: string, after: string) =>
      `Seit „${name}“: ${after} statt ${before} Migränetage pro Monat.`,
    lifeEventDetail: (days: number, before: string, after: string) =>
      `Verglichen werden die ${days} Tage vor der Veränderung (${before}) mit den ${days} Tagen ab der Veränderung (${after}). Gezählt werden Tage mit Migräne, umgerechnet auf 30 Tage.`,
    medicationHelpedLess: (name: string, before: string, after: string) =>
      `${name} hat zuletzt weniger geholfen (${before} auf ${after}).`,
    medicationHelpedMore: (name: string, before: string, after: string) =>
      `${name} hat zuletzt besser geholfen (${before} auf ${after}).`,
    effectivenessDetail: (before: string, after: string) =>
      `Verglichen wird ${after} mit dem gleich langen Zeitraum davor (${before}). Gezählt wird der Anteil der bewerteten Einnahmen, die stark oder etwas geholfen haben.`,
    dayEventRelated: (name: string, hits: number, count: number, baseline: string) =>
      `Nach „${name}“ hattest du in ${hits} von ${count} Fällen am selben oder nächsten Tag Migräne. An anderen Tagen: ${baseline}.`,
    dayEventUnrelated: (name: string) => `Nach „${name}“ hattest du nicht öfter Migräne als sonst.`,
    dayEventDetail: (name: string) =>
      `Gezählt wird, ob am Tag von „${name}“ oder am Tag danach eine Migräne begann, verglichen mit allen anderen Tagen seit deinem ersten Eintrag. Das zeigt ein Muster, keine Ursache.`,
    menstrualPattern: (hits: number, cycles: number) =>
      `In ${hits} von ${cycles} Zyklen hattest du Migräne rund um den Periodenbeginn. Das passt zu menstruationsbezogener Migräne, sprich mit deiner Ärztin darüber.`,
    menstrualDetail:
      'Geprüft werden die zwei Tage vor bis zwei Tage nach dem ersten Tag der Periode, wie in der internationalen Kopfschmerz-Klassifikation (ICHD-3). Der Hinweis erscheint ab zwei von drei Zyklen, wenn Migräne dann deutlich häufiger ist als im Rest des Zyklus.',
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
    startPattern: {
      title: 'Wann sie beginnt',
      dayParts: { night: 'Nacht', morning: 'Morgen', afternoon: 'Nachmittag', evening: 'Abend' },
    },
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
    averageMigraineDays: 'Ø Migränetage/Monat',
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
    preventionMigraineDays: (before: string, after: string, arrow: string) =>
      `Migränetage/Monat: ${before} ${arrow} ${after}`,
    preventionMedicationDays: (before: string, after: string, arrow: string) =>
      `Medikamententage/Monat: ${before} ${arrow} ${after}`,
    preventionEffectDetail: (days: number, before: string, after: string) =>
      `${days} Tage vor dem Beginn (${before}) gegen ${days} Tage ab Wirkbeginn (${after}), umgerechnet auf 30 Tage. Gezählt werden Migränetage und Tage mit Medikament. Den Wirkbeginn trägst du im Profil bei der Prophylaxe ein.`,
    preventionChartLabel: 'Migränetage je 30 Tage vor, während und nach der Prophylaxe',
    chartMarkers: {
      start: 'Beginn',
      effective: 'Wirkbeginn',
      end: 'Ende',
      lifeEvent: 'Veränderung',
    },
    migraineDaysPerMonth: (value: string) => `${value} Migränetage/Monat`,
    chartDetail:
      'Migränetage je 30 Tage. Blass: vor dem Beginn und nach dem Ende. Kräftig: während der Prophylaxe. Gestrichelt: Durchschnitt vor dem Beginn. Tippe auf einen Balken für den Zeitraum.',
    lifeEvents: 'Veränderungen im Zeitraum',
    lifeEventEffectDetail: (days: number, before: string, after: string) =>
      `${days} Tage vor der Veränderung (${before}) gegen ${days} Tage danach (${after}), umgerechnet auf 30 Tage. Gezählt werden Migränetage und Tage mit Medikament.`,
    lifeEventChartLabel: 'Migränetage je 30 Tage vor und nach der Veränderung',
    lifeEventChartDetail:
      'Migränetage je 30 Tage. Blass: vor der Veränderung. Kräftig: danach. Gestrichelt: Durchschnitt vor der Veränderung. Tippe auf einen Balken für den Zeitraum.',
    lifeEventGap: {
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'Vor der Veränderung sind keine Daten erfasst.'
          : `Nur ${days} Tage vor der Veränderung erfasst, mindestens ${min} nötig.`,
      shortAfter: (days: number, min: number) =>
        `Nur ${days} Tage seit der Veränderung, mindestens ${min} nötig.`,
    },
    shortComparison: (days: number) => `Nur ${days} Tage verglichen, daher wenig aussagekräftig.`,
    detailLabels: { comparison: 'Vergleich', note: 'Hinweis', chart: 'Diagramm' },
    endReason: (reason: string) => `Grund für das Absetzen: ${reason}`,
    effectGap: {
      noData: 'Noch keine Daten',
      effectiveAfterEnd: 'Der Wirkbeginn liegt nach dem Ende.',
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'Vor dem Beginn sind keine Daten erfasst.'
          : `Nur ${days} Tage vor dem Beginn erfasst, mindestens ${min} nötig.`,
      shortAfter: (days: number, min: number) =>
        `Nur ${days} Tage zum Vergleich nach dem Beginn, mindestens ${min} nötig.`,
      shortAfterEffective: (days: number, min: number) =>
        `Nur ${days} Tage zum Vergleich ab dem Wirkbeginn, mindestens ${min} nötig.`,
    },
  },
  intro: {
    next: 'Weiter',
    skip: 'Überspringen',
    start: "Los geht's",
    openGuide: 'Anleitung öffnen',
    pages: [
      {
        title: 'Willkommen bei Headly',
        text: 'Ein ruhiger Migräne-Tracker.',
        items: [
          [
            '🌀',
            'Ein Tipp genügt',
            'Tippe auf „Migräne starten“, wenn es losgeht. Details später.',
          ],
          ['🔒', 'Nur auf diesem Gerät', 'Kein Konto, keine Cloud. Sichere ab und zu im Profil.'],
        ],
      },
      {
        title: 'Zum Home-Bildschirm',
        text: 'Öffnet sich wie eine App, auch offline.',
        install: true,
        items: [
          [
            '⬆️',
            'iPhone',
            'In Safari auf Teilen tippen (ggf. hinter ⋯), dann „Zum Home-Bildschirm“.',
          ],
          ['🤖', 'Android', 'In Chrome auf ⋮, dann „App installieren“.'],
        ],
      },
      {
        title: 'Daten in anderen Apps?',
        text: 'Aus einer App, einer Tabelle, einem PDF oder von Fotos: Ein KI-Assistent kann sie für Headly umwandeln. Wir haben einen Prompt dafür vorbereitet.',
        guide: true,
        items: [
          ['📋', 'Prompt kopieren', 'Im Profil unter „Daten aus anderen Apps“.'],
          ['🤝', 'Du teilst Gesundheitsdaten', 'Mit der Firma hinter dem Assistenten.'],
        ],
      },
    ],
  },
  importGuide: {
    title: 'Daten aus anderen Apps',
    rowHint: 'Mit einem KI-Assistenten umwandeln',
    intro:
      'Du hast ältere Einträge in einer anderen App, einer Tabelle, einem PDF vom Arzt oder auf Fotos von einem Papier-Tagebuch? Ein KI-Assistent wie ChatGPT oder Claude kann daraus eine Datei machen, die Headly importieren kann.',
    warningTitle: 'Du teilst Gesundheitsdaten',
    warning:
      'Alles, was du hochlädst, geht an die Firma hinter dem Assistenten, außerhalb von Headly. Prüfe, was du teilst, und entferne, was nicht nötig ist, zum Beispiel Namen oder Adressen. Headly selbst sendet nie etwas.',
    stepsTitle: "So geht's",
    steps: [
      'Kopiere den Prompt unten.',
      'Öffne deinen Assistenten, füge den Prompt ein und hänge deine Daten an: eine Export-Datei, eine Tabelle, ein PDF, Screenshots oder Fotos.',
      'Lade die Datei headly-import.json herunter, die der Assistent erstellt.',
      'Tippe im Profil auf „Daten importieren“, wähle die Datei und dann „Zusammenführen“. Prüfe danach die Zusammenfassung.',
    ],
    promptTitle: 'Prompt',
    copy: 'Prompt kopieren',
    copied: 'Kopiert',
    prompt: (timeZone: string) =>
      `Wandle meine angehängten Migräne-Daten in eine Import-Datei für die App Headly um. Erstelle eine herunterladbare Datei namens headly-import.json mit genau dieser Struktur:

{
  "app": "headly",
  "schemaVersion": 3,
  "exportedAt": <jetzt als Unix-Zeit in Millisekunden>,
  "data": {
    "attacks": [{ "id", "createdAt", "updatedAt", "startedAt", "endedAt", "painLevel"? }],
    "medications": [{ "id", "createdAt", "updatedAt", "name", "dose"?, "isTriptan", "archived": false }],
    "medicationIntakes": [{ "id", "createdAt", "updatedAt", "medicationId", "attackId"?, "takenAt", "effectiveness"? }],
    "preventions": [{ "id", "createdAt", "updatedAt", "name", "type", "dose"?, "startDate", "endDate"? }],
    "lifeEvents": [{ "id", "createdAt", "updatedAt", "name", "date" }]
  }
}

Regeln:
- Alle Zeiten (startedAt, endedAt, takenAt, createdAt, updatedAt, exportedAt) sind Unix-Zeit in Millisekunden (13 Stellen) in meiner Zeitzone ${timeZone}. Setze createdAt und updatedAt auf die Zeit des Eintrags.
- id: ein eindeutiger Text pro Eintrag, z. B. "attack-1", "med-1", "intake-1".
- painLevel: ganze Zahl von 0 bis 10. Rechne andere Skalen um, z. B. leicht = 3, mittel = 6, stark = 9.
- Setze immer endedAt. Ist das Ende unbekannt, nimm das Ende des Tages. Migränen dürfen sich nicht überschneiden.
- Jedes Medikament nur einmal in medications. isTriptan ist true für Triptane wie Sumatriptan oder Rizatriptan.
- medicationId zeigt auf ein Medikament, attackId auf die Migräne, während der es genommen wurde, falls es eine gibt.
- effectiveness nur, wenn bekannt: "strong" (stark gebessert), "slight" (etwas gebessert), "none" (keine Wirkung), "worse" (verschlimmert).
- preventions: type ist "medication" oder "lifestyle", Daten als "YYYY-MM-DD". lifeEvents sind Dinge wie ein neuer Job oder ein Umzug, mit "date" als "YYYY-MM-DD".
- Lass Felder weg, die du nicht kennst. Schreib nie null und erfinde nichts.
- Liste nach der Datei kurz auf, was du nicht umwandeln konntest.`,
  },
  symptoms: {
    title: 'Symptome',
    builtIn: {
      aura: 'Aura',
      nausea: 'Übelkeit',
      vomiting: 'Erbrechen',
      light: 'Lichtempfindlich',
      noise: 'Lärmempfindlich',
    },
    auraHint: 'Sehstörungen oder Kribbeln vorher',
    done: 'Fertig',
    newSymptom: 'Eigenes Symptom',
    manageHint:
      'Schalte aus, was du nicht brauchst. Tippe auf einen Namen, um ihn umzubenennen oder zu löschen.',
    count: (shown: number) => (shown === 1 ? '1 angezeigt' : `${shown} angezeigt`),
    reportSummary: (items: string, total: number) => `Symptome bei ${total} Migränen: ${items}`,
    reportItem: (name: string, count: number) => `${name} ${count}`,
  },
  dayEvents: {
    hint: 'Kleines am Tag, z. B. Flug oder Periode',
    title: 'Ereignisse',
    today: 'Heute',
    label: 'Ereignisse',
    add: 'Ereignis hinzufügen',
    newTitle: 'Neues Ereignis',
    period: 'Periode',
    periodHint:
      'Bei „Periode“ reicht ein Tipp am ersten Tag. Headly prüft dann auf menstruelle Migräne.',
    suggestions: ['Flug', 'Früh aufgestanden', 'Wenig Schlaf', 'Alkohol', 'Stress'],
    ownName: 'Oder ein eigenes',
    addOwn: 'Hinzufügen',
    count: (n: number) => (n === 1 ? '1 Ereignis' : `${n} Ereignisse`),
    manageHint: 'Tippe auf eines, um es umzubenennen oder zu entfernen.',
    rename: 'Name',
    deleteWarning: 'Entfernt auch alle Tage, an denen es eingetragen ist.',
  },
  knowledge: {
    title: 'Wissen',
    articleCount: (n: number) => (n === 1 ? '1 Artikel' : `${n} Artikel`),
    disclaimer:
      'Keine ärztliche Beratung. Sprich Änderungen an Medikamenten immer mit deiner Ärztin oder deinem Arzt ab.',
    groups: {
      basics: 'Grundlagen',
      lesserKnown: 'Weniger bekannt',
    },
  },
  profile: {
    minInterval: 'Mindestabstand in Stunden (optional)',
    minIntervalHint:
      'Aus dem Beipackzettel oder von deiner Ärztin. Headly zeigt dann, ab wann du es wieder nehmen darfst.',
    lifeEventsHint: 'Große Einschnitte, z. B. neuer Job oder Umzug',
    tracking: 'Was ich erfasse',
    help: 'Hilfe und Infos',
    display: 'Darstellung',
    backupAndRestore: 'Sichern und wiederherstellen',
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
    manageLifeEvents: 'Veränderungen',
    newLifeEvent: 'Neue Veränderung',
    editLifeEvent: 'Veränderung bearbeiten',
    lifeEventHint: 'Zum Beispiel neuer Job, Umzug oder Pille abgesetzt',
    lifeEventDate: 'Datum',
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
    endReason: 'Grund für das Absetzen (optional)',
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
    exported: 'Sicherung gespeichert',
    removeAppHint: 'Beim Entfernen der App vom Home-Bildschirm werden alle Daten gelöscht.',
    importData: 'Daten importieren',
    importHint: 'Sicherung wiederherstellen',
    backupReminder: 'Sicherungs-Erinnerung',
    backupReminderHint: 'Auf der Startseite, nach 30 Tagen',
    deleteAll: 'Alle Daten löschen',
    deleteAllHint: 'Nicht rückgängig machbar',
    intro: 'Einführung',
    introHint: 'So funktioniert Headly',
    language: 'Sprache',
    theme: 'Darstellung',
    privacy: 'Datenschutz',
    feedback: 'Feedback und Fehler',
    feedbackSubject: (version: string) => `Headly ${version}: Feedback`,
    about: 'Über Headly',
    version: (version: string) => `Version ${version}`,
    aboutText:
      'Headly ist ein ruhiger Migräne-Tracker. Alle Daten bleiben in deinem Browser auf diesem Gerät: kein Konto, kein Server, kein Tracking.',
    disclaimer: 'Headly ist kein Medizinprodukt und ersetzt keine ärztliche Beratung.',
    pdfExport: 'PDF-Export',
    pdfExportHint: 'Für das Arztgespräch',
  },
  backup: {
    importTitle: 'Sicherung importieren',
    fileContains: (counts: string) => `Diese Sicherung enthält ${counts}.`,
    counts: ({
      attacks,
      medications,
      medicationIntakes,
      preventions,
      lifeEvents,
      dayEvents,
    }: BackupCounts) =>
      [
        attacks === 1 ? '1 Migräne' : `${attacks} Migränen`,
        medications === 1 ? '1 Medikament' : `${medications} Medikamente`,
        medicationIntakes === 1 ? '1 Einnahme' : `${medicationIntakes} Einnahmen`,
        preventions === 1 ? '1 Prophylaxe' : `${preventions} Prophylaxen`,
        lifeEvents === 1 ? '1 Veränderung' : `${lifeEvents} Veränderungen`,
        dayEvents === 1 ? '1 Ereignis' : `${dayEvents} Ereignisse`,
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
    reminder: 'Deine Daten liegen nur lokal auf deinem Gerät.',
    backUpNow: 'Jetzt sichern',
    later: 'Später',
    deleteAllTitle: 'Alle Daten löschen',
    deleteAllText:
      'Alle Migränen, Medikamente, Einnahmen und Prophylaxen werden von diesem Gerät gelöscht. Exportiere vorher eine Sicherung, wenn du sie behalten willst.',
    deleteAll: 'Alle Daten löschen',
    confirmDeleteAll: 'Wirklich alles löschen?',
  },
  report: {
    months: { '3M': '3 Monate', '6M': '6 Monate' },
    rangeLabel: 'Zeitraum',
    hint: 'Erstellt eine Tabelle mit einer Zeile pro Tag und öffnet das Drucken-Menü. Dort kannst du sie als PDF sichern oder teilen.',
    create: 'PDF erstellen',
    heading: 'Migränebericht',
    period: (range: string) => `Zeitraum: ${range}`,
    month: 'Monat',
    attacks: 'Migränen',
    intakes: 'Medikamenten-Einnahmen',
    date: 'Datum',
    migraine: 'Migräne',
    yes: 'Ja',
    helped: 'Geholfen',
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
