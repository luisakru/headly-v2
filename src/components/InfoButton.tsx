import { InfoIcon } from './icons';
import styles from './InfoButton.module.css';

type InfoButtonProps = {
  label: string;
  expanded: boolean;
  onClick: () => void;
};

export function InfoButton({ label, expanded, onClick }: InfoButtonProps) {
  return (
    <button
      type="button"
      className={styles.infoButton}
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <InfoIcon />
    </button>
  );
}
