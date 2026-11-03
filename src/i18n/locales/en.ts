import type { ImportSummary as BackupCounts } from '../../data/backup';
import type { DurationParts } from '../../domain/days';

export const en = {
  languages: {
    de: 'Deutsch',
    en: 'English',
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
    migraineDaysThisMonth: (n: number) =>
      n === 1 ? '1 migraine day this month' : `${n} migraine days this month`,
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
    removeIntake: (name: string) => `Remove ${name}`,
    save: 'Save',
    delete: 'Delete migraine',
    confirmDelete: 'Really delete?',
  },
  activeAttack: {
    label: 'Migraine active',
    runningFor: 'running for',
    duration: ({ days, hours, minutes }: DurationParts) =>
      days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    startedToday: (time: string) => `started at ${time} today`,
    startedOn: (dateTime: string) => `started ${dateTime}`,
    painNow: 'Pain level now',
    medicationsDuring: 'Medication during this migraine',
    logMedication: 'Log medication',
    endMigraine: 'End migraine',
    endedEarlier: 'Ended earlier?',
    deleteIntake: (name: string) => `Delete ${name}`,
  },
  medicationSheet: {
    title: 'Which medication?',
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
    averageMigraineDays: 'Avg. migraine days / month',
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
    preventionMigraineDays: (before: string, after: string) =>
      `Migraine days / month: ${before} → ${after}`,
    preventionMedicationDays: (before: string, after: string) =>
      `Medication days / month: ${before} → ${after}`,
    preventionEffectDetail: (days: number, before: string, after: string) =>
      `Compares the ${days} days before the start (${before}) with ${days} days from when it is expected to work (${after}). Counted are days with a migraine and days with at least one medication intake, scaled to 30 days. You can set when it is expected to work under Profile → Prevention.`,
    preventionChartLabel: 'Migraine days per 30 days before, during and after the prevention',
    chartMarkers: { start: 'Start', effective: 'Effect', end: 'End', lifeEvent: 'Event' },
    migraineDaysPerMonth: (value: string) => `${value} migraine days / month`,
    chartDetail:
      'The chart shows migraine days per 30 days: faint before the start and after the end, strong during the prevention. The dashed line is the average before the start. Tap a bar to see its period.',
    lifeEvents: 'Life events in this period',
    lifeEventEffectDetail: (days: number, before: string, after: string) =>
      `Compares the ${days} days before the event (${before}) with ${days} days from the event (${after}). Counted are days with a migraine and days with at least one medication intake, scaled to 30 days.`,
    lifeEventChartLabel: 'Migraine days per 30 days before and after the event',
    lifeEventChartDetail:
      'The chart shows migraine days per 30 days: faint before the event, strong after it. The dashed line is the average before the event. Tap a bar to see its period.',
    lifeEventGap: {
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'No data recorded before the event.'
          : `Only ${days} days recorded before the event, at least ${min} needed.`,
      shortAfter: (days: number, min: number) =>
        `Only ${days} days since the event, at least ${min} needed.`,
    },
    shortComparison: (days: number) => `Only ${days} days compared, not very meaningful`,
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
    manageLifeEvents: 'Manage life events',
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
    language: 'Language',
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
    counts: ({ attacks, medications, medicationIntakes, preventions, lifeEvents }: BackupCounts) =>
      [
        attacks === 1 ? '1 migraine' : `${attacks} migraines`,
        medications === 1 ? '1 medication' : `${medications} medications`,
        medicationIntakes === 1 ? '1 intake' : `${medicationIntakes} intakes`,
        preventions === 1 ? '1 prevention' : `${preventions} preventions`,
        lifeEvents === 1 ? '1 life event' : `${lifeEvents} life events`,
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
    reminder: 'Your data only lives on this phone. Save a backup?',
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
    hint: 'Opens the print menu. There you can save the report as a PDF or share it.',
    create: 'Create PDF',
    heading: 'Migraine report',
    period: (range: string) => `Period: ${range}`,
    createdOn: (date: string) => `Created on ${date}`,
    overview: 'Overview',
    migraineDays: 'Migraine days',
    migraineDaysPerMonth: 'Migraine days / month',
    medicationDays: 'Medication days',
    triptanDays: 'Triptan days',
    attacks: 'Attacks',
    date: 'Date',
    noAttacks: 'No attacks in this period.',
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
