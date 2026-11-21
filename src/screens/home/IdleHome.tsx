import { addDays } from 'date-fns';
import { Button } from '../../components/Button';
import { DayEventChips } from '../../components/DayEventChips';
import { InsightCard } from '../../components/InsightCard';
import { startAttack } from '../../data/attackRepository';
import { recentWeekDays } from '../../domain/calendar';
import { lookbackRange } from '../../domain/dateRange';
import { firstDataDay } from '../../domain/prevention';
import { countDaysInRange, migraineDays, toDayKey } from '../../domain/days';
import { generateInsights } from '../../domain/insights';
import { useI18n } from '../../i18n/context';
import { formatMonthYear } from '../../i18n/format';
import { BackupReminderCard } from './BackupReminderCard';
import styles from './Home.module.css';
import { RatingPromptCard } from './RatingPromptCard';
import type { HomeData } from './useHomeData';

const RECENT_WEEKS = 4;

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
        <p className={styles.eyebrow}>{formatMonthYear(now, language)}</p>
        <h1 className={styles.greeting}>{t.home.title}</h1>
        <p className={styles.subtitle}>{t.home.migraineDaysLastFourWeeks(recentMigraineDays)}</p>
      </header>

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
