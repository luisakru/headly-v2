import { useState } from 'react';
import { Card } from './Card';
import { InfoButton } from './InfoButton';
import { TrendIcon } from './icons';
import { insightTrend, type Insight } from '../domain/insights';
import { useI18n } from '../i18n/context';
import { formatInsight, formatInsightDetail } from '../i18n/insights';
import styles from './InsightCard.module.css';

export function InsightCard({ insight }: { insight: Insight }) {
  const { t, language } = useI18n();
  const [showDetail, setShowDetail] = useState(false);
  const detail = formatInsightDetail(insight, t, language);
  const trend = insightTrend(insight);

  return (
    <Card className={styles.insight}>
      <div className={styles.insightRow}>
        <span
          className={styles.trend}
          data-tone={trend.tone}
          role="img"
          aria-label={t.insights.tone[trend.tone]}
        >
          <TrendIcon direction={trend.direction} />
        </span>
        <p className={styles.insightText}>{formatInsight(insight, t, language)}</p>
        {detail && (
          <InfoButton
            label={t.stats.howCalculated}
            expanded={showDetail}
            onClick={() => setShowDetail(!showDetail)}
          />
        )}
      </div>
      {showDetail && <p className={styles.insightDetail}>{detail}</p>}
    </Card>
  );
}
