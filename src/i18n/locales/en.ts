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
    activePreventions: 'Active prevention',
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
  },
  insights: {
    migraineDaysDropped: (before: string, after: string) =>
      `Migraine days dropped from ${before} to ${after} per month.`,
    migraineDaysRose: (before: string, after: string) =>
      `Migraine days rose from ${before} to ${after} per month.`,
    preventionFewerMedicationDays: (name: string, percent: string) =>
      `Since starting ${name}: ${percent} fewer medication days.`,
    preventionMoreMedicationDays: (name: string, percent: string) =>
      `Since starting ${name}: ${percent} more medication days.`,
    medicationHelpedLess: (name: string, months: number, before: string, after: string) =>
      `${name} has helped less over the last ${months} months (${before} to ${after}).`,
    medicationHelpedMore: (name: string, months: number, before: string, after: string) =>
      `${name} has helped more over the last ${months} months (${before} to ${after}).`,
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
      '1M': '1M',
      '3M': '3M',
      '6M': '6M',
      '1Y': '1Y',
      custom: 'Custom',
    },
    series: {
      migraine: 'Migraine',
      medication: 'Medication',
    },
  },
  profile: {
    title: 'Profile',
    language: 'Language',
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
