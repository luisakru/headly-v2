# Headly — Build Plan & Agent Handover

Oct 24, 2026 · @Luisa

## Context and goal

Headly is a calm, minimal migraine tracker, built as an installable web app (PWA) that feels native on iPhone. It is not a diary: it records a few facts per attack and turns them into trends that support doctor visits and help avoid medication overuse.

It must be usable during an acute migraine. That means low contrast, large touch targets, 1–2 taps per action, and no decorative animation.

**MVP scope:**

- Start and end an attack, with one pain level (0–10) that can be updated
- Log medication intake in one tap, then rate its effectiveness later
- Manage saved medications and prevention measures (with optional end date)
- Calendar with day details and editing
- Statistics with flexible time ranges and plain-language insights
- German and English UI, switchable in settings
- JSON export and import, plus a gentle backup reminder
- Installable to the iPhone home screen, works fully offline

**Not in the MVP:** push notifications, PDF export, trigger analysis, weather, Apple Health, cycle tracking, any backend or account.

**Reference material:** screenshots of the Headly v1 designs live in `docs/reference/`. They are the visual source of truth for layout and style; this document is the source of truth for behavior.

## Hard rules for the agent

These rules apply to every session. Copy them into `CLAUDE.md` at the repo root in Phase 0.

1. **No German in code.** File names, folders, variables, functions, types, database fields, CSS classes, test names, comments and commit messages are English. Use the naming glossary below.
2. **German lives only in locale files.** Every user-facing string comes from `src/i18n/locales/de.ts` or `en.ts`. No hard-coded UI text in components.
3. **Data stays on the device.** No backend, no analytics, no third-party requests at runtime. Fonts and icons are self-hosted.
4. **Accessibility during pain.** Touch targets at least 48×48 px, primary actions at least 64 px tall, no animation except where this plan names one, respect `prefers-reduced-motion`.
5. **Ask before adding a dependency** that is not listed in the tech stack.
6. **Definition of done per task:** typecheck, lint and tests pass; new domain logic has unit tests; the feature was checked at 390×844 (iPhone viewport).
7. **Small, focused commits** with English conventional-commit messages.
8. **When finishing a phase,** list shortcuts taken, known gaps, and anything the human should test on the phone.

## Tech stack

A static React PWA with all data in the browser's IndexedDB, deployed to a free static host.

| Area | Choice | Why |
| --- | --- | --- |
| Framework | React 18 + TypeScript (strict) | Owner knows TypeScript; agents are strong at React |
| Build | Vite + `vite-plugin-pwa` | Fast dev server; generates manifest and service worker |
| Storage | IndexedDB via Dexie 4 | See below |
| Reactive data | `dexie-react-hooks` (`useLiveQuery`) | UI updates automatically when data changes |
| Validation | zod | Validates imported JSON before it touches the database |
| Dates | date-fns + `Intl` | Day math, week starts Monday, localized formatting |
| Styling | CSS Modules + CSS custom properties | Design tokens in one file, no runtime cost |
| Routing | React Router (hash or browser history) | Four tabs plus sub-pages |
| Charts | Hand-rolled SVG | One simple grouped bar chart; no library needed |
| Tests | Vitest + Testing Library | Unit tests for domain logic, light component tests |
| Hosting | Cloudflare Pages or Vercel (free) | Static files over HTTPS, required for PWA install |

**Why Dexie and not raw IndexedDB or localStorage.** localStorage is synchronous, string-only and small (about 5 MB). Raw IndexedDB works but its event-based API is verbose and error-prone. Dexie is a thin wrapper that adds promises, typed tables, indexed queries, versioned schema migrations and `useLiveQuery`. Migrations matter because the schema will change after real data exists. A lighter alternative is `idb` (about 1 kB), but it has no live queries and makes migrations manual. Dexie is the pragmatic choice; it is not strictly required.

## Naming glossary

Every domain concept has exactly one English code name. German appears only as locale values.

| German UI term | Code name | Notes |
| --- | --- | --- |
| Migräneattacke | `Attack` | One episode with a start and optional end |
| Migränetag | `migraineDay` | A calendar day touched by any attack |
| Aktive Migräne | `activeAttack` | The attack with no `endedAt`; at most one |
| Schmerzintensität | `painLevel` | Integer 0–10 on `Attack`, kept up to date |
| Medikament | `Medication` | A saved medication the user can pick |
| Medikament genommen | `MedicationIntake` | One intake event |
| Medikamententag | `medicationDay` | A day with at least one intake |
| Triptan | `isTriptan` | Flag on `Medication` |
| Wirksamkeit | `Effectiveness` | `'strong' \| 'slight' \| 'none' \| 'worse'` |
| Wirksamkeitsquote | `effectivenessRate` | Share of rated intakes that helped |
| Prophylaxe | `Prevention` | Type `'medication' \| 'lifestyle'` |
| Aktive Prophylaxe | `activePrevention` | No end date, or end date in the future |
| Erkenntnis | `Insight` | Generated plain-language sentence |
| Zeitraum | `DateRangePreset` | `1W`, `1M`, `3M`, `6M`, `1Y`, `2Y`, `all` |
| Sicherung / Export | `backup` / `export` | JSON file |
| Bearbeiten / Löschen | `edit` / `delete` |  |
| Startseite / Kalender / Statistik / Profil | `home` / `calendar` / `stats` / `profile` | Routes and folders |

## Data model and domain rules

Four stored tables plus one settings record; every statistic is computed, never stored. IDs are UUIDs (`crypto.randomUUID()`), timestamps are epoch milliseconds, and day boundaries use the device's local time zone.

```ts
type Attack = {
  id: string;
  startedAt: number;
  endedAt?: number;          // undefined = active
  painLevel?: number;        // 0–10, 0 = no pain
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

type Medication = {
  id: string;
  name: string;
  dose?: string;             // free text, e.g. "50 mg"
  isTriptan: boolean;
  archived: boolean;         // hidden from pickers, kept for history
  createdAt: number;
  updatedAt: number;
};

type Effectiveness = 'strong' | 'slight' | 'none' | 'worse';

type MedicationIntake = {
  id: string;
  medicationId: string;
  attackId?: string;         // set when logged during an attack
  takenAt: number;
  effectiveness?: Effectiveness;
  createdAt: number;
  updatedAt: number;
};

type Prevention = {
  id: string;
  name: string;
  type: 'medication' | 'lifestyle';
  dose?: string;
  startDate: string;         // ISO date, YYYY-MM-DD
  effectiveFrom?: string;    // when it is expected to work; defaults to startDate
  endDate?: string;          // optional
  createdAt: number;
  updatedAt: number;
};

type Settings = {
  language: 'de' | 'en';
  lastBackupAt?: number;
  backupReminderEnabled: boolean;
  backupReminderSnoozedUntil?: number;
  installHintDismissed: boolean;
};
```

**Domain rules:**

- **Migraine day:** every local calendar day that an attack overlaps. An active attack counts up to today.
- **One active attack at a time.** Starting a new one while one is active is not possible; the home screen shows the active state instead.
- **No overlapping attacks.** Editing start or end so two attacks overlap is rejected with a clear message.
- **Medication day:** a day with at least one intake. **Triptan day:** a day with at least one intake of a medication where `isTriptan` is true.
- **Effectiveness rate:** intakes rated `strong` or `slight` divided by all rated intakes in the range. Unrated intakes are excluded and the count of unrated is shown.
- **Overuse warning:** show when any calendar month in range has 10 or more triptan days, or 15 or more medication days. The thresholds live in one constants file.
- **Prevention effect:** compare average migraine days per 30 days in a window before `startDate` with the same-length window from `effectiveFrom` (or `startDate` if unset; max 90 days each). Many preventions take 2–3 months to work, and guidelines assess them after about 3 months against a baseline of at least 28 days. Below 14 days in either window, show the concrete reason instead of values; between 14 and 29 days, show the values with a "not very meaningful" note.
- **Rating prompt:** an intake older than 2 hours without a rating shows an in-app card asking "Did it help?" with the four options.
- **Attack still running?** If an active attack is older than 6 hours, show an in-app card asking whether it is still going, between 08:00 and 22:00 only. If it is still active the next morning, ask "Was yesterday still a migraine day?" and offer to end it at a chosen time.

## Design system

Warm earth tones on a light background: calm, playful, never bright white or harsh black. All values become CSS custom properties in `src/styles/tokens.css`; components never use raw hex values.

| Token | Hex | Use |
| --- | --- | --- |
| `--color-bg` | #F2EDE4 | App background |
| `--color-surface` | #E8E0D4 | Cards, segmented controls |
| `--color-surface-muted` | #EAE4D8 | Empty calendar cells |
| `--color-border` | #DDD5C8 | Dividers, tab bar border |
| `--color-primary` | #8B5E4A | Main actions, migraine + medication day, active tab |
| `--color-primary-soft` | #C4A088 | Migraine day, pills, secondary accents |
| `--color-on-primary` | #F5EFE8 | Text on primary colors |
| `--color-text` | #3A3028 | Headings, values, selected border |
| `--color-text-secondary` | #9C8E80 | Labels, captions |
| `--color-text-muted` | #B4A898 | Placeholders, hints |
| `--color-warning-bg` | #E8D5C8 | Overuse warning background |
| `--color-warning-text` | #8B3A1A | Overuse warning text, active-attack label |
| `--color-positive` | #6B8B4A | Improving trend arrows |
| `--color-error` | #A9483A | Validation error messages |

**Typography:** DM Sans (400, 500) for UI text; DM Serif Display (upright, no italic anywhere) for screen titles, big numbers and the wordmark. Both are self-hosted woff2 files in `public/fonts/`, never loaded from Google.

**Shape and spacing:** 4 px spacing scale; card radius 14 px; button radius 18 px; calendar cell radius 8 px; screen side padding 18 px.

**Principles:** low contrast but readable (body text at least 4.5:1 against its background); one primary action per screen; no motion except the slow pulse on the "migraine active" dot, disabled under reduced motion; numbers before charts, trend arrows before graphs.

**Reference screens** (in `docs/reference/`): home, active attack, calendar with selected day, edit sheet, statistics, profile, and the app icon. Match them closely; where a screenshot and this document disagree on behavior, this document wins.

## Screens

Four tabs in a bottom tab bar: Home, Calendar, Statistics, Profile. Sub-pages push on top with a back button.

### Home (no active attack)

- Greeting and current month with "N migraine days this month"
- Primary button "Start migraine": one tap creates an attack at now and opens the active-attack screen
- Last 4 weeks as a 7-column grid (Monday first), same color rules as the calendar. Tapping a past day selects it and shows the day below the grid: one card per attack with the medication taken for that attack, plus a card for medication without an attack. Tapping an attack card opens the edit sheet; tapping the day again hides the cards
- One insight card, the most relevant current insight
- Prompt cards above the buttons when due: rate an intake, attack still running, backup reminder

### Active attack

Shown on the Home tab while an attack is active.

- "Migraine active" label with the pulsing dot
- Elapsed time, large, and start time; tapping the start time edits it
- Pain scale 0–10 as eleven tappable pips with "no pain" and "unbearable" labels. Each tap sets `painLevel`
- "Medication" button: opens a sheet listing saved medications; one tap logs the intake at now, linked to this attack. Empty state links to adding a medication
- List of intakes during this attack with rating status
- Outlined "End migraine" button: ends at now, with "Ended earlier?" to pick a time
- "Delete migraine" link next to "Ended earlier?": asks "Really delete?" before deleting

### Calendar

- Month title with previous and next arrow buttons; horizontal swipe also changes month. No swipe hint text
- Subtitle "N migraine days"
- Grid Monday to Sunday. Cell colors: neutral = no entry; `--color-primary-soft` = migraine day; `--color-primary` = migraine day with medication. A medication day without migraine shows a small dot
- **Today = small dot at the bottom of the cell. Selected day = 2 px ring in `--color-text` just outside the cell**
- Legend row: migraine, with medication, today, selected
- Tapping a day selects it and shows a detail card below: date, then one card per attack (start, end, duration, pain, the medication taken for that attack with its effectiveness). Tapping a card opens the edit sheet; there is no separate "Edit" link. Days with no entry show "No entry on this day"; no selection shows "Tap a day for details"
- Default selection on open: today

### Edit sheet

A bottom sheet over the dimmed calendar (and over Home when opened from the 4-week grid). Changes apply only on "Save".

- Fields: start, end (date + time, native pickers), pain level (pips), medications taken (list with add and remove), effectiveness per intake (four chips)
- "Save" (primary) and "Delete" (muted destructive, with confirmation)
- Validation: end after start, no overlap with another attack
- A medication added here is logged at the attack's start time

### Statistics

Layout, one element per row, in this order:

1. Title "Statistics"
2. Segmented control: 1W, 1M, 3M, 6M, 1Y, 2Y, All. Default 3M. It sets how much the chart shows at once, not which data exists
3. Toggle chips: Migraine and Medication, both on by default
4. Chart with all data, one page per period, swiped sideways (snapping), starting at the page with today. The visible period is named above the chart
   - 1W (calendar week, Monday first) and 1M (calendar month): one bar per day, height = highest pain level (0–10), a dot at the baseline for an unrated migraine day, a medication dot above
   - 3M: 13 weeks ending with the current week, grouped bars per week (migraine days, medication days)
   - 6M, 1Y, 2Y: that many months ending with the current month, grouped bars per month. All: one page from the first month with data, or one bar per year from the first year once the data spans 36 months or more. Only the visible page and its neighbours are drawn
   - Tapping a bar shows its period and values below the chart
5. Four stat cards for the visible page: average migraine days per 30 days (counted only up to today), effectiveness rate, average pain, total medication days
6. Overuse warning banner when triggered in a month the visible page touches
7. Insights (up to three cards), comparing the preset's length up to today (e.g. the last 3 months) with the same number of days before
8. Preventions overlapping the visible page, each with its before/after effect or the reason it is missing

**Insights** are generated from templates with values filled in, for example: "Migraine days dropped from 6 to 4 per month.", "Fewer attacks, but on average 1.3 points stronger.", "Since Amitriptyline: 2.5 instead of 5 medication days per month." (with an info button that explains both compared windows), "Sumatriptan has helped less recently (91% to 78%)." Each template has a German and English version and only appears when its data condition is met.

### Profile

Grouped list in cards:

- **Medications:** list, add, edit, archive. Fields: name, dose, "is a triptan"
- **Preventions:** active and past lists, add and edit. Fields: name, type, dose, start date, optional expected-effect date, optional end date
- **Data:** export JSON, import JSON, backup reminder on/off, "last backup N days ago", delete all data (double confirmation)
- **App:** language (Deutsch / English), privacy policy, imprint, about with version
- **Coming soon, greyed out with a "Soon" badge:** PDF export for doctor, notifications

## Native feel on iPhone

Users are expected to add Headly to their home screen; once installed it must be indistinguishable from a native app at first glance.

**Install guidance.** iOS Safari has no install prompt, so the app shows its own. When opened in Safari and not installed (`display-mode: standalone` is false and `navigator.standalone` is false), show a friendly bottom card: "Add Headly to your home screen" with three illustrated steps (Share button, "Add to Home Screen", "Add"). It can be dismissed and reappears after 14 days. It never shows inside the installed app. On other browsers, use the standard `beforeinstallprompt` flow if available.

**Manifest and head tags:**

- `display: standalone`, `orientation: portrait`, `theme_color` and `background_color` = #F2EDE4, `name` and `short_name` = Headly
- `apple-touch-icon` 180×180, plus manifest icons 192, 512 and a 512 maskable
- `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` = `default`, `apple-mobile-web-app-title` = Headly
- Viewport with `viewport-fit=cover`
- iOS launch images (`apple-touch-startup-image`) for current iPhone sizes: cream background with the centered icon

**Layout details:**

- Respect safe areas with `env(safe-area-inset-*)`, especially under the tab bar and the notch
- Full height via `100dvh`; disable rubber-band overscroll on the app shell; content areas scroll internally
- No text selection or tap highlight on buttons; no double-tap zoom on controls; inputs at least 16 px so iOS does not zoom
- Bottom sheets support swipe-down to close
- Haptics are not available on the web; skip them

**Offline:** the service worker precaches the whole app shell and fonts, so the app opens without a network after the first visit. On startup, call `navigator.storage.persist()` to ask the browser not to evict data.

## Languages: German and English

The UI ships in German and English from day one, switchable in Profile; the default follows the device language (German if it starts with `de`, otherwise English).

- **No i18n library.** A typed dictionary is enough: `src/i18n/locales/en.ts` is the source of truth and `de.ts` must satisfy the same type, so a missing German key is a compile error.
- **Keys are English and structured by screen**, for example `home.startMigraine`, `calendar.noEntry`, `stats.range.custom`.
- **Plurals and variables** via small helper functions in the dictionary, for example ` migraineDays: (n) => n === 1 ? '1 migraine day' :  `${n} migraine days\`\`.
- **Dates and numbers** formatted with `Intl.DateTimeFormat` and `Intl.NumberFormat` using the current language; date-fns locale for relative phrases. Weeks always start on Monday.
- **Insights** are templates per language, filled with numbers; never machine-translated at runtime.
- **Legal texts** (privacy policy, imprint) exist in both languages as separate Markdown files.
- The selected language is stored in `Settings` and applied without a reload.

## Data safety: export, import, backup reminder

Because data exists only on one phone, a regular JSON backup is the user's only protection against a lost phone or a deleted app, so a gentle reminder is part of the MVP.

**Export:**

- Produces `headly-backup-YYYY-MM-DD.json` with this envelope: `{ app: "headly", schemaVersion, exportedAt, data: { attacks, medications, medicationIntakes, preventions } }`
- Shared through the Web Share API with a file, so iOS opens the share sheet. "Save to Files" then lets the user store it in iCloud Drive. Fallback on other browsers: a regular download
- On success, set `lastBackupAt`

**Import:**

- File picker accepts `.json`; the content is validated with zod. Invalid files show a clear error and change nothing
- Older `schemaVersion` values are migrated before import
- The user chooses "Merge" (add new records, update records with the same ID if the imported `updatedAt` is newer) or "Replace all" (confirmation required)
- Summary afterwards: "Imported 42 attacks, 3 medications…"

**Backup reminder:**

- A dismissible card on Home, never during an active attack
- Shows when there is data, and the last backup is more than 30 days ago (or never, once at least 5 records exist)
- Card text: "Your data only lives on this phone. Save a backup?" with "Back up now" and "Later". "Later" snoozes for 7 days
- Can be turned off in Profile; Profile always shows "Last backup: N days ago"
- Deliberately not a push notification: those are out of scope and would need the app installed

## Legal (Germany)

The existing privacy policy and imprint drafts can be reused, with one change: a web app is served by a hosting provider, which processes IP addresses in its access logs. This is not legal advice; have the final texts checked before a public launch.

- **Privacy policy:** add a "Hosting" section naming the provider (Cloudflare or Vercel), the data processed (IP address, time, requested file, user agent), the legal basis (legitimate interest, Art. 6(1)(f) GDPR) and the provider's data processing terms. Replace "stored on your iPhone" with "stored in your browser on this device". Keep the health-data section (Art. 9 GDPR) and the rights section.
- **Imprint:** name, postal address and email (placeholders until filled). Shown in both languages.
- **Medical disclaimer:** "Headly is not a medical device and does not replace medical advice" in About and in the privacy policy.
- **No third-party requests:** fonts self-hosted (German courts have penalized embedding Google Fonts), no analytics, no CDN scripts at runtime.
- **Delete all data** is required and already in Profile.

## Build phases

Eight phases, each one agent session ending in a working, testable state. Do not start a phase before the previous one's acceptance criteria pass.

1. **Phase 0 — Setup.** Vite + React + TS strict, ESLint, Prettier, Vitest, CSS tokens, self-hosted fonts, folder structure (`src/domain`, `src/data`, `src/i18n`, `src/components`, `src/screens`, `src/styles`), `CLAUDE.md` with the hard rules and glossary, `docs/reference/` with the screenshots.
   - Done when: `npm run dev`, `build`, `test`, `lint`, `typecheck` all pass; an empty screen shows the cream background and DM Sans.
2. **Phase 1 — Data and domain.** Dexie schema v1, repositories per table, settings store, all statistics and insight functions as pure functions in `src/domain`, seed script with realistic demo data.
   - Done when: unit tests cover migraine-day counting across midnight and month boundaries, overlap rejection, effectiveness rate, overuse thresholds, prevention before/after, and every insight condition.
3. **Phase 2 — Design system and shell.** Tokens, Button, Card, PainScale, BottomSheet, SegmentedControl, ToggleChip, TabBar, layout with safe areas, i18n setup with language switching.
   - Done when: a hidden `/dev/components` page shows every component in both languages at 390 px wide.
4. **Phase 3 — Home and active attack.** Start and end an attack, past start time, medication sheet, intake logging, 4-week grid, rating prompt card, still-running card.
   - Done when: on a phone, a full attack can be logged with two taps to start and one to log medication, and it persists after a reload.
5. **Phase 4 — Calendar and editing.** Month grid, navigation and swipe, today dot and selected border, detail card, edit sheet with validation, delete.
   - Done when: any past attack can be created, edited and deleted from the calendar; invalid edits show a message and save nothing.
6. **Phase 5 — Statistics.** Range presets and custom range, toggles, grouped bar chart, stat cards, overuse warning, insights, preventions in range.
   - Done when: with seed data, 1M through 2+ years render without overflow at 390 px, and numbers match the domain tests.
7. **Phase 6 — Profile and data.** Medication and prevention management, export, import (merge and replace), backup reminder, delete all, language setting, legal pages, "Soon" items.
   - Done when: export on iPhone reaches the share sheet; re-importing that file into a fresh install restores everything.
8. **Phase 7 — PWA and launch.** Manifest, icons, launch images, service worker, install guidance card, storage persistence, deployment.
   - Done when: installed from Safari, the app opens full-screen with no browser UI, works in airplane mode, and Lighthouse PWA and accessibility checks show no errors.

## Later, not now

These are deliberately out of scope; the code should not block them, but should not prepare for them either.

- PDF export for doctor visits (selected range, summary page, monthly table)
- Web push reminders (6-hour check, morning check, rating prompt) for the installed app, iOS 16.4 and later
- Optional encrypted sync or automatic backup
- Notes and simple tags per attack
- Native wrapper (Capacitor) if App Store distribution is ever wanted
