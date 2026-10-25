import { useI18n } from '../i18n/context';
import styles from './PainScale.module.css';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type PainScaleProps = {
  value?: number;
  onChange: (painLevel: number) => void;
};

export function PainScale({ value, onChange }: PainScaleProps) {
  const { t } = useI18n();

  return (
    <div className={styles.painScale}>
      <div role="radiogroup" aria-label={t.painScale.label} className={styles.pips}>
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={level === value}
            className={styles.pip}
            onClick={() => onChange(level)}
          >
            <span className={styles.dot}>{level}</span>
          </button>
        ))}
      </div>
      <div className={styles.labels} aria-hidden="true">
        <span>{t.painScale.low}</span>
        <span>{t.painScale.high}</span>
      </div>
    </div>
  );
}
