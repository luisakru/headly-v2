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
    startMigraine: 'Start migraine',
    medicationTaken: 'Medication taken',
  },
  calendar: {
    title: 'Calendar',
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
    low: 'barely noticeable',
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
