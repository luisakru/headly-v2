import { addMonths, startOfMonth } from 'date-fns';
import { Button } from '../../components/Button';
import { InsightCard } from '../../components/InsightCard';
import { startAttack } from '../../data/attackRepository';
import { lookbackRange } from '../../domain/dateRange';
import { firstDataDay } from '../../domain/prevention';
import { countDaysInRange, migraineDays } from '../../domain/days';
import { generateInsights } from '../../domain/insights';
import { useI18n } from '../../i18n/context';
import { formatMonthYear } from '../../i18n/format';
import { BackupReminderCard } from './BackupReminderCard';
import styles from './Home.module.css';
import { RatingPromptCard } from './RatingPromptCard';
import { RecentWeeks } from './RecentWeeks';
import type { HomeData } from './useHomeData';

export function IdleHome({
  attacks,
  intakes,
  medications,
  preventions,
  lifeEvents,
  now,
}: HomeData & { now: number }) {
  const { t, language } = useI18n();

  const monthStart = startOfMonth(now);
  const thisMonth = { start: monthStart.getTime(), end: addMonths(monthStart, 1).getTime() };
  const migraineDaysThisMonth = countDaysInRange(migraineDays(attacks, now), thisMonth);
  const insight = generateInsights({
    attacks,
    intakes,
    medications,
    preventions,
    lifeEvents,
    range: lookbackRange('3M', now, firstDataDay(attacks, intakes)),
    now,
  })[0];

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{formatMonthYear(now, language)}</p>
        <h1 className={styles.greeting}>{t.home.title}</h1>
        <p className={styles.subtitle}>{t.home.migraineDaysThisMonth(migraineDaysThisMonth)}</p>
      </header>

      <div className={styles.actions}>
        <RatingPromptCard intakes={intakes} medications={medications} now={now} />
        <BackupReminderCard
          data={{ attacks, intakes, medications, preventions, lifeEvents }}
          now={now}
        />
        <Button large onClick={() => void startAttack()}>
          {t.home.startMigraine}
        </Button>
      </div>

      <RecentWeeks attacks={attacks} intakes={intakes} medications={medications} now={now} />

      {insight && (
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.home.insight}</h2>
          <InsightCard insight={insight} />
        </section>
      )}
    </>
  );
}
