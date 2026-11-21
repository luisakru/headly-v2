import type { Effectiveness } from '../domain/types';
import { useI18n } from '../i18n/context';
import styles from './IntakeRows.module.css';

export type IntakeRowData = {
  key: string;
  name: string;
  time: string;
  effectiveness?: Effectiveness;
};

/** Plain rows "name · time" with the effect as a text button that opens the intake. */
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
        <li key={row.key} className={styles.intakeRow}>
          <span className={styles.intakeText}>
            <span className={styles.name}>{row.name}</span>
            <span className={styles.time}> · {row.time}</span>
          </span>
          <button
            type="button"
            className={styles.effectButton}
            data-rated={row.effectiveness !== undefined || undefined}
            onClick={() => onOpen(row.key)}
          >
            {t.effectiveness[row.effectiveness ?? 'pending']}
          </button>
        </li>
      ))}
    </ul>
  );
}
