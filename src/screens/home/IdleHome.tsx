import { addDays } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Headly } from '../../components/Headly';
import { DayEventChips } from '../../components/DayEventChips';
import { InsightCard } from '../../components/InsightCard';
import { startAttack } from '../../data/attackRepository';
import { recentWeekDays } from '../../domain/calendar';
import { lookbackRange } from '../../domain/dateRange';
import { firstDataDay } from '../../domain/prevention';
import { countDaysInRange, migraineDays, toDayKey } from '../../domain/days';
import { generateInsights } from '../../domain/insights';
import { timeOfDay } from '../../domain/timeOfDay';
import { useI18n } from '../../i18n/context';
import { factOfTheDay, knowledgeFacts } from '../../i18n/knowledge';
import { formatDate } from '../../i18n/format';
import { BackupReminderCard } from './BackupReminderCard';
import styles from './Home.module.css';
import { RatingPromptCard } from './RatingPromptCard';
import type { HomeData } from './useHomeData';

const RECENT_WEEKS = 4;
const DISMISSED_FACT_KEY = 'headly.dismissedFact';

/** The day the fact was hidden; a new day brings a new fact. */
function readDismissedFact(): string | null {
  try {
    return localStorage.getItem(DISMISSED_FACT_KEY);
  } catch {
    return null;
  }
}

export function IdleHome({
  attacks,
  intakes,
  medications,
  preventions,
  lifeEvents,
  dayEventTypes,
  dayEvents,
  symptoms,
  now,
}: HomeData & { now: number }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const partOfDay = timeOfDay(now);
  const fact = factOfTheDay(knowledgeFacts[language], now);
  const today = toDayKey(now);
  const [dismissedOn, setDismissedOn] = useState(readDismissedFact);
  const factDismissed = dismissedOn === today;
  const dismissFact = () => {
    setDismissedOn(today);
    try {
      localStorage.setItem(DISMISSED_FACT_KEY, today);
    } catch {
      // Without storage the fact simply comes back after a reload.
    }
  };

  const recentDays = recentWeekDays(now, RECENT_WEEKS);
  const recentStart = recentDays[0]!;
  const recentRange = {
    start: recentStart.getTime(),
    end: addDays(recentStart, recentDays.length).getTime(),
  };
  const recentMigraineDays = countDaysInRange(migraineDays(attacks, now), recentRange);
  const insight = generateInsights({
    attacks,
    intakes,
    medications,
    preventions,
    lifeEvents,
    dayEventTypes,
    dayEvents,
    range: lookbackRange('3M', now, firstDataDay(attacks, intakes)),
    now,
  })[0];

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{formatDate(now, language)}</p>
        <div className={styles.hello}>
          <Headly look={partOfDay} />
          <div className={styles.bubble}>
            <h1 className={styles.greeting}>{t.home.greeting[partOfDay]}</h1>
            <p className={styles.subtitle}>
              {t.home.migraineDaysLastFourWeeks(recentMigraineDays)}
            </p>
          </div>
        </div>
      </header>

      {fact && !factDismissed && (
        <section className={styles.factCard}>
          <h2 className={styles.sectionLabel}>{t.home.didYouKnow}</h2>
          <p className={styles.factText}>{fact.text}</p>
          <button
            type="button"
            className={styles.readMore}
            onClick={() => void navigate(`/profile/knowledge/${fact.article}`)}
          >
            {t.home.readMore} ›
          </button>
          <button
            type="button"
            className={styles.closeFact}
            aria-label={t.home.hideFact}
            onClick={dismissFact}
          >
            ×
          </button>
        </section>
      )}

      {dayEventTypes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.dayEvents.today}</h2>
          <DayEventChips types={dayEventTypes} events={dayEvents} date={toDayKey(now)} />
        </section>
      )}

      <RatingPromptCard intakes={intakes} medications={medications} now={now} />
      <BackupReminderCard
        data={{
          attacks,
          intakes,
          medications,
          preventions,
          lifeEvents,
          dayEventTypes,
          dayEvents,
          symptoms,
        }}
        now={now}
      />

      {insight && (
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.home.insight}</h2>
          <InsightCard insight={insight} />
        </section>
      )}

      <div className={styles.pinnedActions} data-pinned-actions>
        <Button large onClick={() => void startAttack()}>
          {t.home.startMigraine}
        </Button>
      </div>
    </div>
  );
}
