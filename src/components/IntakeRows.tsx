import type { Effectiveness } from '../domain/types';
import { useI18n } from '../i18n/context';
import styles from './IntakeRows.module.css';

export type IntakeRowData = {
  key: string;
  name: string;
  time: string;
  effectiveness?: Effectiveness;
  /** Shown after the time, e.g. when the next intake is allowed. */
  note?: string;
};

/** Plain rows "name · time · effect"; tapping a row opens the intake to change its time or effect. */
export function IntakeRows({
  rows,
  onOpen,
}: {
  rows: IntakeRowData[];
  onOpen: (key: string) => void;
}) {
  const { t } = useI18n();
  return (
    <ul className={styles.intakeList}>
      {rows.map((row) => (
        <li key={row.key}>
          <button type="button" className={styles.intakeRow} onClick={() => onOpen(row.key)}>
            <span className={styles.intakeText}>
              <span className={styles.name}>{row.name}</span>
              <span className={styles.time}> · {row.time}</span>
              {row.note && <span className={styles.note}> · {row.note}</span>}
            </span>
            <span
              className={styles.effect}
              data-rated={row.effectiveness !== undefined || undefined}
            >
              {t.effectiveness[row.effectiveness ?? 'pending']}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
