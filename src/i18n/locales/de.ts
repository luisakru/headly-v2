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
    startMigraine: 'Migräne starten',
    medicationTaken: 'Medikament genommen',
  },
  calendar: {
    title: 'Kalender',
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
    low: 'kaum spürbar',
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
