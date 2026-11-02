# Headly

Calm, minimal migraine tracker built as an offline-first React PWA. Full spec and build phases: `docs/PLAN.md` (source of truth for behavior). Visual reference: `docs/reference/` (source of truth for layout and style; red notes on the screenshots mark things to fix vs. v1).

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run typecheck` / `npm run lint` / `npm test` / `npm run format`

## Structure

- `src/domain` — pure domain logic and statistics (unit tested)
- `src/data` — Dexie database and repositories
- `src/i18n` — typed dictionaries (`locales/en.ts` is the source of truth)
- `src/components` — reusable UI components
- `src/screens` — `home`, `calendar`, `stats`, `profile`
- `src/styles` — `tokens.css` (design tokens), fonts, global styles

## Hard rules

1. **No German in code.** File names, folders, variables, functions, types, database fields, CSS classes, test names, comments and commit messages are English. Use the naming glossary below.
2. **German lives only in locale files.** Every user-facing string comes from `src/i18n/locales/de.ts` or `en.ts`. No hard-coded UI text in components.
3. **Data stays on the device.** No backend, no analytics, no third-party requests at runtime. Fonts and icons are self-hosted.
4. **Accessibility during pain.** Touch targets at least 48×48 px, primary actions at least 64 px tall, no animation except where docs/PLAN.md names one, respect `prefers-reduced-motion`.
5. **Ask before adding a dependency** that is not listed in the tech stack.
6. **Definition of done per task:** typecheck, lint and tests pass; new domain logic has unit tests; the feature was checked at 390×844 (iPhone viewport).
7. **Small, focused commits** with English conventional-commit messages.
8. **When finishing a phase,** list shortcuts taken, known gaps, and anything the human should test on the phone.

## Naming glossary

Every domain concept has exactly one English code name. German appears only as locale values.

| German UI term                             | Code name                                 | Notes                                       |
| ------------------------------------------ | ----------------------------------------- | ------------------------------------------- |
| Migräneattacke                             | `Attack`                                  | One episode with a start and optional end   |
| Migränetag                                 | `migraineDay`                             | A calendar day touched by any attack        |
| Aktive Migräne                             | `activeAttack`                            | The attack with no `endedAt`; at most one   |
| Schmerzintensität                          | `painLevel`                               | Integer 0–10 on `Attack`, kept up to date   |
| Medikament                                 | `Medication`                              | A saved medication the user can pick        |
| Medikament genommen                        | `MedicationIntake`                        | One intake event                            |
| Medikamententag                            | `medicationDay`                           | A day with at least one intake              |
| Triptan                                    | `isTriptan`                               | Flag on `Medication`                        |
| Wirksamkeit                                | `Effectiveness`                           | `'strong' \| 'slight' \| 'none' \| 'worse'` |
| Wirksamkeitsquote                          | `effectivenessRate`                       | Share of rated intakes that helped          |
| Prophylaxe                                 | `Prevention`                              | Type `'medication' \| 'lifestyle'`          |
| Aktive Prophylaxe                          | `activePrevention`                        | No end date, or end date in the future      |
| Wirkbeginn                                 | `effectiveFrom`                           | Optional date on `Prevention`               |
| Erkenntnis                                 | `Insight`                                 | Generated plain-language sentence           |
| Zeitraum                                   | `DateRangePreset`                         | `1W`, `1M`, `3M`, `6M`, `1Y`, `2Y`, `all`   |
| Sicherung / Export                         | `backup` / `export`                       | JSON file                                   |
| Bearbeiten / Löschen                       | `edit` / `delete`                         |                                             |
| Startseite / Kalender / Statistik / Profil | `home` / `calendar` / `stats` / `profile` | Routes and folders                          |
