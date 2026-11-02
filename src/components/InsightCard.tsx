import { useState } from 'react';
import { Card } from './Card';
import { InfoIcon } from './icons';
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
          <button
            type="button"
            className={styles.infoButton}
            aria-label={t.stats.howCalculated}
            aria-expanded={showDetail}
            onClick={() => setShowDetail(!showDetail)}
          >
            <InfoIcon />
          </button>
        )}
      </div>
      {showDetail && <p className={styles.insightDetail}>{detail}</p>}
    </Card>
  );
}
