import { addMonths, startOfMonth } from 'date-fns';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { startAttack } from '../../data/attackRepository';
import { resolveDateRange } from '../../domain/dateRange';
import { countDaysInRange, migraineDays } from '../../domain/days';
import { generateInsights } from '../../domain/insights';
import { isActivePrevention } from '../../domain/prevention';
import { useI18n } from '../../i18n/context';
import { formatMonthYear } from '../../i18n/format';
import { formatInsight } from '../../i18n/insights';
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
  now,
}: HomeData & { now: number }) {
  const { t, language } = useI18n();

  const monthStart = startOfMonth(now);
  const thisMonth = { start: monthStart.getTime(), end: addMonths(monthStart, 1).getTime() };
  const migraineDaysThisMonth = countDaysInRange(migraineDays(attacks, now), thisMonth);
  const activePreventions = preventions.filter((prevention) => isActivePrevention(prevention, now));
  const insight = generateInsights({
    attacks,
    intakes,
    medications,
    preventions,
    range: resolveDateRange({ preset: '3M' }, now),
    now,
  })[0];

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{formatMonthYear(now, language)}</p>
        <h1 className={styles.greeting}>{t.home.title}</h1>
        <p className={styles.subtitle}>{t.home.migraineDaysThisMonth(migraineDaysThisMonth)}</p>
        {activePreventions.length > 0 && (
          <p className={styles.pill} aria-label={t.home.activePreventions}>
            {activePreventions.map((prevention) => prevention.name).join(', ')}
          </p>
        )}
      </header>

      <div className={styles.actions}>
        <RatingPromptCard intakes={intakes} medications={medications} now={now} />
        <BackupReminderCard data={{ attacks, intakes, medications, preventions }} now={now} />
        <Button large onClick={() => void startAttack()}>
          {t.home.startMigraine}
        </Button>
      </div>

      <RecentWeeks attacks={attacks} intakes={intakes} medications={medications} now={now} />

      {insight && (
        <section className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.home.insight}</h2>
          <Card className={styles.insight}>{formatInsight(insight, t, language)}</Card>
        </section>
      )}
    </>
  );
}
