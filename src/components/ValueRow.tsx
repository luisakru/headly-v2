import type { ReactNode } from 'react';
import { ChevronRightIcon } from './icons';
import styles from './ValueRow.module.css';

type ValueRowProps = {
  label: string;
  value: ReactNode;
  onClick: () => void;
};

/** A label and its current value; tapping opens where the value is changed. */
export function ValueRow({ label, value, onClick }: ValueRowProps) {
  return (
    <button type="button" className={styles.valueRow} onClick={onClick}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <ChevronRightIcon />
    </button>
  );
}
