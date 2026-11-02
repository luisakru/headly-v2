import { useState } from 'react';
import { Card } from './Card';
import { InfoButton } from './InfoButton';
import type { Insight } from '../domain/insights';
import { useI18n } from '../i18n/context';
import { formatInsight, formatInsightDetail } from '../i18n/insights';
import styles from './InsightCard.module.css';

export function InsightCard({ insight }: { insight: Insight }) {
  const { t, language } = useI18n();
  const [showDetail, setShowDetail] = useState(false);
  const detail = formatInsightDetail(insight, t, language);

  return (
    <Card className={styles.insight}>
      <div className={styles.insightRow}>
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
