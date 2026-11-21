import type { ImportSummary as BackupCounts } from '../../data/backup';
import type { DurationParts } from '../../domain/days';

export const en = {
  languages: {
    de: 'Deutsch',
    en: 'English',
  },
  themes: {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  common: {
    close: 'Close',
    soon: 'Soon',
  },
  tabs: {
    label: 'Main navigation',
    home: 'Home',
    calendar: 'Calendar',
    stats: 'Statistics',
    profile: 'Profile',
  },
  home: {
    title: 'Hello',
    migraineDaysLastFourWeeks: (n: number) =>
      n === 1
        ? '1 migraine day during the last 4 weeks'
        : `${n} migraine days during the last 4 weeks`,
    startMigraine: 'Start migraine',
    lastFourWeeks: 'Last 4 weeks',
    insight: 'Insight',
  },
  dayLegend: {
    migraine: 'Migraine',
    withMedication: '+ Medication',
    today: 'Today',
  },
  dayDetail: {
    start: 'Start',
    end: 'End',
    ongoing: 'ongoing',
    duration: 'Duration',
    pain: 'Pain',
    painOutOfTen: (n: number) => `${n}/10`,
    medications: 'Medication',
    noEntry: 'No entry on this day',
  },
  editAttack: {
    title: 'Edit migraine',
    addTitle: 'Add migraine',
    start: 'Start',
    end: 'End',
    painLevel: 'Pain level',
    medications: 'Medication',
    addMedication: 'Add medication',
    takenAt: 'Taken at',
    removeIntake: (name: string) => `Remove ${name}`,
    save: 'Save',
    delete: 'Delete migraine',
    confirmDelete: 'Really delete?',
  },
  activeAttack: {
    label: 'Migraine active',
    duration: ({ days, hours, minutes }: DurationParts) =>
      days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    sinceToday: (time: string) => `since ${time}`,
    sinceOn: (dateTime: string) => `since ${dateTime}`,
    pain: 'Pain',
    painOutOf: 'of 10',
    painNow: 'Pain level now',
    medicationsDuring: 'Medication',
    logMedication: 'Log medication',
    endMigraine: 'End migraine',
    endedEarlier: 'Ended earlier?',
    moreActions: 'More actions',
    deleteIntake: (name: string) => `Delete ${name}`,
  },
  medicationSheet: {
    title: 'Which medication?',
    takenAt: 'Taken at',
    empty: 'No medications saved yet.',
    newMedication: 'New medication',
    name: 'Name',
    dose: 'Dose (optional)',
    isTriptan: 'Triptan',
    save: 'Save',
    done: 'Done',
  },
  timePicker: {
    startTitle: 'When did it start?',
    endTitle: 'When did it end?',
    label: 'Date and time',
    save: 'Save',
  },
  effectiveness: {
    strong: 'Strongly improved',
    slight: 'Slightly improved',
    none: 'No effect',
    worse: 'Got worse',
    pending: 'Effect pending',
    sheetTitle: (name: string) => `Effect · ${name}`,
  },
  prompts: {
    rateIntake: (name: string) => `Did ${name} help?`,
    takenAt: (time: string) => `Taken ${time}`,
    stillRunning: 'Is the migraine still going?',
    stillRunningNextDay: 'Was yesterday still a migraine day?',
    stillRunningNextDayHint: 'The migraine is still marked as active.',
    stillGoing: 'Still going',
    itIsOver: 'It is over',
    endAtTime: 'It ended earlier',
  },
  errors: {
    attack: {
      startInFuture: 'This time is in the future.',
      endBeforeStart: 'The end has to be after the start.',
      invalidPainLevel: 'Pain level has to be between 0 and 10.',
      overlap: 'This overlaps with another migraine.',
      activeAttackExists: 'A migraine is already active.',
      notFound: 'This migraine no longer exists.',
    },
    prevention: {
      endBeforeStart: 'The end date cannot be before the start date.',
      effectiveBeforeStart: 'It cannot start working before the start date.',
    },
  },
  insights: {
    tone: { good: 'Good trend', bad: 'Bad trend', mixed: 'Mixed trend' },
    migraineDaysDropped: (before: string, after: string) =>
      `Migraine days dropped from ${before} to ${after} per month.`,
    migraineDaysRose: (before: string, after: string) =>
      `Migraine days rose from ${before} to ${after} per month.`,
    migraineDaysDetail: (before: string, after: string) =>
      `Compares ${after} with the same-length period before (${before}). Counted are days with a migraine, scaled to 30 days.`,
    preventionMedicationDays: (name: string, before: string, after: string) =>
      `Since ${name}: ${after} instead of ${before} medication days per month.`,
    preventionWeaker: (name: string, early: string, recent: string, before?: string) =>
      `${name} works less well than at first: ${early} at first, ${recent} migraine days per month lately${before ? ` (before: ${before})` : ''}.`,
    preventionStronger: (name: string, early: string, recent: string, before?: string) =>
      `${name} works better than at first: ${early} at first, ${recent} migraine days per month lately${before ? ` (before: ${before})` : ''}.`,
    preventionChangeDetail: (early: string, recent: string, before?: string) =>
      `Compares the first 90 days from when it is expected to work (${early}) with the latest 90 days (${recent}). Counted are days with a migraine, scaled to 30 days.${before ? ` "Before" is up to 90 days before the start (${before}).` : ''}`,
    preventionDetail: (days: number, before: string, after: string) =>
      `Compares the ${days} days before the start (${before}) with ${days} days from when it is expected to work (${after}). Counted are days with at least one medication intake, scaled to 30 days. You can set when it is expected to work under Profile → Prevention.`,
    lifeEventMigraineDays: (name: string, before: string, after: string) =>
      `Since “${name}”: ${after} instead of ${before} migraine days per month.`,
    lifeEventDetail: (days: number, before: string, after: string) =>
      `Compares the ${days} days before the event (${before}) with the ${days} days from the event (${after}). Counted are days with a migraine, scaled to 30 days.`,
    medicationHelpedLess: (name: string, before: string, after: string) =>
      `${name} has helped less recently (${before} to ${after}).`,
    medicationHelpedMore: (name: string, before: string, after: string) =>
      `${name} has helped more recently (${before} to ${after}).`,
    effectivenessDetail: (before: string, after: string) =>
      `Compares ${after} with the same-length period before (${before}). Counted is the share of rated intakes that helped strongly or slightly.`,
    dayEventRelated: (name: string, hits: number, count: number, baseline: string) =>
      `After “${name}” you had migraine the same or the next day ${hits} out of ${count} times. On other days: ${baseline}.`,
    dayEventUnrelated: (name: string) =>
      `After “${name}” you did not have migraine more often than usual.`,
    dayEventDetail: (name: string) =>
      `Counted is whether a migraine started on the day of “${name}” or the day after, compared with all other days since your first entry. It shows a pattern, not a cause.`,
    menstrualPattern: (hits: number, cycles: number) =>
      `In ${hits} out of ${cycles} cycles you had migraine around the start of your period. This fits menstrually related migraine; talk to your doctor about it.`,
    menstrualDetail:
      'Checked are the two days before to two days after the first day of your period, as in the international headache classification (ICHD-3). The note appears from two out of three cycles, if migraine is clearly more common then than in the rest of the cycle.',
    fewerButStronger: (points: string) =>
      `Fewer attacks, but on average ${points} points stronger.`,
  },
  calendar: {
    title: 'Calendar',
    migraineDays: (n: number) => (n === 1 ? '1 migraine day' : `${n} migraine days`),
    backTo: (month: string) => `← ${month}`,
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    tapADay: 'Tap a day for details',
    addMigraine: 'Add migraine',
  },
  stats: {
    startPattern: {
      title: 'When it starts',
      dayParts: { night: 'Night', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
    },
    title: 'Statistics',
    range: {
      label: 'Time range',
      '1W': '1W',
      '1M': '1M',
      '3M': '3M',
      '6M': '6M',
      '1Y': '1Y',
      '2Y': '2Y',
      all: 'All',
    },
    painAxis: 'Intensity (0–10)',
    series: {
      migraine: 'Migraine',
      medication: 'Medication',
    },
    chartLabel: 'Migraine days and medication days per month',
    howCalculated: 'How this is calculated',
    migraineDayCount: (n: number) => (n === 1 ? '1 migraine day' : `${n} migraine days`),
    medicationDayCount: (n: number) => (n === 1 ? '1 medication day' : `${n} medication days`),
    averageMigraineDays: 'Avg. migraine days/month',
    effectivenessRate: 'Effectiveness',
    unrated: (n: number) => `${n} not rated`,
    averagePain: 'Avg. pain',
    medicationDays: 'Medication days',
    overuseTitle: 'Possible medication overuse',
    overuseText: (months: string, triptanDays: number, medicationDays: number) =>
      `${months}: ${triptanDays} or more triptan days or ${medicationDays} or more medication days in a month can make headaches more frequent. Please talk to your doctor.`,
    insights: 'Insights',
    preventions: 'Prevention in this period',
    since: (month: string) => `since ${month}`,
    active: 'active',
    preventionMigraineDays: (before: string, after: string, arrow: string) =>
      `Migraine days/month: ${before} ${arrow} ${after}`,
    preventionMedicationDays: (before: string, after: string, arrow: string) =>
      `Medication days/month: ${before} ${arrow} ${after}`,
    preventionEffectDetail: (days: number, before: string, after: string) =>
      `${days} days before the start (${before}) vs. ${days} days from the expected effect (${after}), scaled to 30 days. Counts migraine days and days with medication. Set the expected effect under Profile → Prevention.`,
    preventionChartLabel: 'Migraine days per 30 days before, during and after the prevention',
    chartMarkers: { start: 'Start', effective: 'Effect', end: 'End', lifeEvent: 'Event' },
    migraineDaysPerMonth: (value: string) => `${value} migraine days/month`,
    chartDetail:
      'Migraine days per 30 days. Faint: before the start and after the end. Strong: during the prevention. Dashed: average before the start. Tap a bar to see its period.',
    lifeEvents: 'Life events in this period',
    lifeEventEffectDetail: (days: number, before: string, after: string) =>
      `${days} days before the event (${before}) vs. ${days} days after (${after}), scaled to 30 days. Counts migraine days and days with medication.`,
    lifeEventChartLabel: 'Migraine days per 30 days before and after the event',
    lifeEventChartDetail:
      'Migraine days per 30 days. Faint: before the event. Strong: after it. Dashed: average before the event. Tap a bar to see its period.',
    lifeEventGap: {
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'No data recorded before the event.'
          : `Only ${days} days recorded before the event, at least ${min} needed.`,
      shortAfter: (days: number, min: number) =>
        `Only ${days} days since the event, at least ${min} needed.`,
    },
    shortComparison: (days: number) => `Only ${days} days compared, so not very meaningful.`,
    detailLabels: { comparison: 'Comparison', note: 'Note', chart: 'Chart' },
    endReason: (reason: string) => `Reason for stopping: ${reason}`,
    effectGap: {
      noData: 'No data yet',
      effectiveAfterEnd: 'The expected effect date is after the end date.',
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'No data recorded before the start.'
          : `Only ${days} days recorded before the start, at least ${min} needed.`,
      shortAfter: (days: number, min: number) =>
        `Only ${days} days to compare after the start, at least ${min} needed.`,
      shortAfterEffective: (days: number, min: number) =>
        `Only ${days} days to compare from when it is expected to work, at least ${min} needed.`,
    },
  },
  intro: {
    next: 'Next',
    skip: 'Skip',
    start: "Let's start",
    openGuide: 'Open the guide',
    pages: [
      {
        title: 'Welcome to Headly',
        text: 'A calm migraine tracker.',
        items: [
          ['🌀', 'One tap is enough', 'Tap “Start migraine” when it begins. Add details later.'],
          ['🔒', 'Only on this device', 'No account, no cloud. Back up now and then in Profile.'],
        ],
      },
      {
        title: 'Add to Home Screen',
        text: 'Opens like an app, even offline.',
        install: true,
        items: [
          ['⬆️', 'iPhone', 'In Safari, tap Share (behind ⋯ if hidden), then “Add to Home Screen”.'],
          ['🤖', 'Android', 'In Chrome, tap ⋮, then “Install app”.'],
        ],
      },
      {
        title: 'Data in other apps?',
        text: 'From an app, a spreadsheet, a PDF or photos: an AI assistant can convert it for Headly. We prepared a prompt for that.',
        guide: true,
        items: [
          ['📋', 'Copy the prompt', 'In Profile under “Data from other apps”.'],
          ['🤝', 'You share health data', 'With the company behind the assistant.'],
        ],
      },
    ] as {
      title: string;
      text: string;
      install?: boolean;
      guide?: boolean;
      items: [string, string, string][];
    }[],
  },
  importGuide: {
    title: 'Data from other apps',
    rowHint: 'Convert with an AI assistant',
    intro:
      'Do you have older entries in another app, a spreadsheet, a PDF from your doctor or photos of a paper diary? An AI assistant such as ChatGPT or Claude can turn them into a file that Headly can import.',
    warningTitle: 'You are sharing health data',
    warning:
      'Everything you upload goes to the company behind the assistant, outside of Headly. Check what you share and remove what is not needed, such as names or addresses. Headly itself never sends anything.',
    stepsTitle: 'How it works',
    steps: [
      'Copy the prompt below.',
      'Open your assistant, paste the prompt and attach your data: an export file, a spreadsheet, a PDF, screenshots or photos.',
      'Download the file headly-import.json that the assistant creates.',
      'In Profile, tap "Import data", choose the file and then "Merge". Check the summary afterwards.',
    ],
    promptTitle: 'Prompt',
    copy: 'Copy prompt',
    copied: 'Copied',
    prompt: (timeZone: string) =>
      `Convert my attached migraine data into an import file for the app Headly. Create a downloadable file named headly-import.json with exactly this structure:

{
  "app": "headly",
  "schemaVersion": 3,
  "exportedAt": <now as Unix time in milliseconds>,
  "data": {
    "attacks": [{ "id", "createdAt", "updatedAt", "startedAt", "endedAt", "painLevel"? }],
    "medications": [{ "id", "createdAt", "updatedAt", "name", "dose"?, "isTriptan", "archived": false }],
    "medicationIntakes": [{ "id", "createdAt", "updatedAt", "medicationId", "attackId"?, "takenAt", "effectiveness"? }],
    "preventions": [{ "id", "createdAt", "updatedAt", "name", "type", "dose"?, "startDate", "endDate"? }],
    "lifeEvents": [{ "id", "createdAt", "updatedAt", "name", "date" }]
  }
}

Rules:
- All times (startedAt, endedAt, takenAt, createdAt, updatedAt, exportedAt) are Unix time in milliseconds (13 digits) in my time zone ${timeZone}. Set createdAt and updatedAt to the time of the entry.
- id: a unique text per record, e.g. "attack-1", "med-1", "intake-1".
- painLevel: whole number from 0 to 10. Convert other scales, e.g. mild = 3, moderate = 6, severe = 9.
- Always set endedAt. If the end is unknown, use the end of that day. Migraines must not overlap.
- List each medication only once in medications. isTriptan is true for triptans such as sumatriptan or rizatriptan.
- medicationId points to a medication; attackId points to the migraine during which it was taken, if there is one.
- effectiveness only if known: "strong" (much better), "slight" (a little better), "none" (no effect), "worse".
- preventions: type is "medication" or "lifestyle"; dates as "YYYY-MM-DD". lifeEvents are things like a new job or a move, with "date" as "YYYY-MM-DD".
- Leave out fields you do not know. Never write null and never invent data.
- After the file, briefly list anything you could not convert.`,
  },
  symptoms: {
    title: 'Symptoms',
    builtIn: {
      aura: 'Aura',
      nausea: 'Nausea',
      vomiting: 'Vomiting',
      light: 'Sensitive to light',
      noise: 'Sensitive to noise',
    },
    auraHint: 'Visual disturbances or tingling beforehand',
    done: 'Done',
    newSymptom: 'Own symptom',
    manageHint: 'Switch off what you do not need. Tap a name to rename or delete it.',
    count: (shown: number) => (shown === 1 ? '1 shown' : `${shown} shown`),
    reportSummary: (items: string, total: number) => `Symptoms in ${total} migraines: ${items}`,
    reportItem: (name: string, count: number) => `${name} ${count}`,
  },
  dayEvents: {
    title: 'Small events',
    today: 'Today',
    label: 'Events',
    add: 'Add an event',
    newTitle: 'New event',
    period: 'Period',
    periodHint:
      'For “Period”, tapping the first day is enough. Headly then checks for menstrual migraine.',
    suggestions: ['Flight', 'Up early', 'Little sleep', 'Alcohol', 'Stress'],
    ownName: 'Or your own',
    addOwn: 'Add',
    count: (n: number) => (n === 1 ? '1 event' : `${n} events`),
    manageHint: 'Tap one to rename or remove it.',
    rename: 'Name',
    deleteWarning: 'Also removes every day it was logged on.',
  },
  knowledge: {
    title: 'Knowledge',
    aboutMigraine: 'About migraine',
    articleCount: (n: number) => (n === 1 ? '1 article' : `${n} articles`),
    disclaimer: 'Not medical advice. Always talk to your doctor before changing your medication.',
    groups: {
      basics: 'Basics',
      lesserKnown: 'Lesser known',
    },
  },
  profile: {
    title: 'Profile',
    backToProfile: 'Profile',
    medications: 'Medications',
    manageMedications: 'Manage medications',
    medicationCount: (n: number) => (n === 1 ? '1 medication' : `${n} medications`),
    newMedication: 'New medication',
    editMedication: 'Edit medication',
    name: 'Name',
    dose: 'Dose (optional)',
    isTriptan: 'Triptan',
    archive: 'Archive',
    restore: 'Restore',
    archived: 'Archived',
    preventions: 'Prevention',
    managePreventions: 'Manage prevention',
    preventionCount: (total: number, active: number) =>
      `${total === 1 ? '1 prevention' : `${total} preventions`} · ${active} active`,
    lifeEvents: 'Life events',
    manageLifeEvents: 'Life events',
    lifeEventCount: (n: number) => (n === 1 ? '1 life event' : `${n} life events`),
    newLifeEvent: 'New life event',
    editLifeEvent: 'Edit life event',
    lifeEventHint: 'For example a new job, a move or stopping the pill',
    lifeEventDate: 'Date',
    newPrevention: 'New prevention',
    editPrevention: 'Edit prevention',
    preventionType: 'Type',
    preventionTypes: {
      medication: 'Medication',
      lifestyle: 'Lifestyle',
    },
    startDate: 'Start date',
    effectiveFrom: 'Expected to work from (optional)',
    effectiveFromHint:
      'Many preventions take 2–3 months to work. Without a date, the start date counts.',
    endDate: 'End date (optional)',
    endReason: 'Reason for stopping (optional)',
    activePreventions: 'Active',
    pastPreventions: 'Past',
    since: (date: string) => `since ${date}`,
    active: 'active',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirmDelete: 'Really delete?',
    data: 'Data',
    exportData: 'Export data',
    lastBackup: (days: number | undefined) =>
      days === undefined
        ? 'No backup yet'
        : days === 0
          ? 'Last backup: today'
          : days === 1
            ? 'Last backup: 1 day ago'
            : `Last backup: ${days} days ago`,
    exported: 'Backup saved',
    removeAppHint: 'Removing the app from the home screen deletes all data.',
    importData: 'Import data',
    importHint: 'Restore a backup',
    backupReminder: 'Backup reminder',
    backupReminderHint: 'On Home, after 30 days',
    deleteAll: 'Delete all data',
    deleteAllHint: 'Cannot be undone',
    app: 'App',
    intro: 'Introduction',
    introHint: 'How Headly works',
    language: 'Language',
    theme: 'Appearance',
    privacy: 'Privacy policy',
    imprint: 'Imprint',
    about: 'About Headly',
    version: (version: string) => `Version ${version}`,
    aboutText:
      'Headly is a calm migraine tracker. All data stays in your browser on this device: no account, no server, no tracking.',
    disclaimer: 'Headly is not a medical device and does not replace medical advice.',
    comingSoon: 'Coming soon',
    pdfExport: 'PDF export',
    pdfExportHint: 'For your doctor',
    notifications: 'Notifications',
    notificationsHint: 'Reminders and checks',
  },
  backup: {
    importTitle: 'Import backup',
    fileContains: (counts: string) => `This backup contains ${counts}.`,
    counts: ({
      attacks,
      medications,
      medicationIntakes,
      preventions,
      lifeEvents,
      dayEvents,
    }: BackupCounts) =>
      [
        attacks === 1 ? '1 migraine' : `${attacks} migraines`,
        medications === 1 ? '1 medication' : `${medications} medications`,
        medicationIntakes === 1 ? '1 intake' : `${medicationIntakes} intakes`,
        preventions === 1 ? '1 prevention' : `${preventions} preventions`,
        lifeEvents === 1 ? '1 life event' : `${lifeEvents} life events`,
        dayEvents === 1 ? '1 small event' : `${dayEvents} small events`,
      ].join(', '),
    merge: 'Merge',
    mergeHint: 'Adds new entries and updates entries that changed.',
    replace: 'Replace all',
    replaceHint: 'Deletes all current entries first.',
    confirmReplace: 'Really replace everything?',
    imported: (counts: string) => `Imported ${counts}.`,
    done: 'Done',
    errors: {
      invalidFile: 'This file is not a Headly backup or is damaged. Nothing was changed.',
      newerVersion:
        'This backup is from a newer version of Headly. Update the app first. Nothing was changed.',
    },
    reminder: 'Your data is stored only on this device.',
    backUpNow: 'Back up now',
    later: 'Later',
    deleteAllTitle: 'Delete all data',
    deleteAllText:
      'All migraines, medications, intakes and preventions will be deleted from this device. Export a backup first if you want to keep them.',
    deleteAll: 'Delete all data',
    confirmDeleteAll: 'Really delete everything?',
  },
  report: {
    months: { '3M': '3 months', '6M': '6 months' },
    rangeLabel: 'Period',
    hint: 'Creates a table with one row per day and opens the print menu. There you can save it as a PDF or share it.',
    create: 'Create PDF',
    heading: 'Migraine report',
    period: (range: string) => `Period: ${range}`,
    month: 'Month',
    attacks: 'Attacks',
    intakes: 'Medication intakes',
    date: 'Date',
    migraine: 'Migraine',
    yes: 'Yes',
    helped: 'Helped',
  },

  painScale: {
    label: 'Pain level',
    low: 'no pain',
    high: 'unbearable',
    question: 'How bad is the pain?',
  },
  dev: {
    title: 'Components',
    buttons: 'Buttons',
    card: 'Card',
    cardText: 'Cards group related content on the surface color.',
    painScale: 'Pain scale',
    segmentedControl: 'Segmented control',
    toggleChips: 'Toggle chips',
    bottomSheet: 'Bottom sheet',
    openSheet: 'Open sheet',
    migraineDays: (n: number) => (n === 1 ? '1 migraine day' : `${n} migraine days`),
  },
};

export type Dictionary = typeof en;
