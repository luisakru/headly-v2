import { Card } from '../../components/Card';
import { recentWeekDays } from '../../domain/calendar';
import { DAY_PARTS, type StartPattern } from '../../domain/startPattern';
import { useI18n } from '../../i18n/context';
import { formatWeekday } from '../../i18n/format';
import styles from './Stats.module.css';

/** Attack starts per weekday and part of the day; notable ones are darker. No sentences. */
export function StartPatternCharts({ pattern, now }: { pattern: StartPattern; now: number }) {
  const { t, language } = useI18n();
  const weekdayNames = recentWeekDays(now, 1).map((day) => formatWeekday(day, language));
  const highest = Math.max(...pattern.weekdays, 1);
  const total = pattern.dayParts.reduce((sum, count) => sum + count, 0);

  return (
    <section className={styles.list}>
      <h2 className={styles.sectionLabel}>{t.stats.startPattern.title}</h2>
      <Card className={styles.startCard}>
        <div
          className={styles.weekdayBars}
          role="img"
          aria-label={pattern.weekdays.map((n, i) => `${weekdayNames[i]} ${n}`).join(', ')}
        >
          {pattern.weekdays.map((count, index) => (
            <div key={index} className={styles.weekdayBar}>
              <span className={styles.barCount}>{count}</span>
              <i
                data-notable={pattern.notableWeekdays.includes(index) || undefined}
                style={{ height: `${(count / highest) * 100}%` }}
              />
              <span
                className={styles.barLabel}
                data-notable={pattern.notableWeekdays.includes(index) || undefined}
              >
                {weekdayNames[index]}
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card className={styles.startCard}>
        <div
          className={styles.dayPartBar}
          role="img"
          aria-label={DAY_PARTS.map(
            (part, i) => `${t.stats.startPattern.dayParts[part]} ${pattern.dayParts[i]}`,
          ).join(', ')}
        >
          {pattern.dayParts.map((count, index) =>
            count === 0 ? null : (
              <span
                key={index}
                data-notable={pattern.notableDayParts.includes(index) || undefined}
                style={{ flexGrow: count / total }}
              >
                {count}
              </span>
            ),
          )}
        </div>
        <div className={styles.dayPartLabels} aria-hidden="true">
          {DAY_PARTS.map((part, index) => (
            <span key={part} data-notable={pattern.notableDayParts.includes(index) || undefined}>
              {t.stats.startPattern.dayParts[part]}
            </span>
          ))}
        </div>
      </Card>
    </section>
  );
}
