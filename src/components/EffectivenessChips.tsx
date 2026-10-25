import type { Effectiveness } from '../domain/types';
import { useI18n } from '../i18n/context';
import styles from './EffectivenessChips.module.css';

const OPTIONS: Effectiveness[] = ['strong', 'slight', 'none', 'worse'];

type EffectivenessChipsProps = {
  label: string;
  value?: Effectiveness;
  onChange: (effectiveness: Effectiveness) => void;
};

export function EffectivenessChips({ label, value, onChange }: EffectivenessChipsProps) {
  const { t } = useI18n();

  return (
    <div role="radiogroup" aria-label={label} className={styles.chips}>
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === value}
          className={styles.chip}
          onClick={() => onChange(option)}
        >
          {t.effectiveness[option]}
        </button>
      ))}
    </div>
  );
}
