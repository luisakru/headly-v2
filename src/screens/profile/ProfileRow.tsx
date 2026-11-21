import type { ReactNode } from 'react';
import { ChevronRightIcon } from '../../components/icons';
import styles from './Profile.module.css';

type ProfileRowProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  /** Shows a switch instead of the chevron. */
  checked?: boolean;
};

export function ProfileRow({ icon, title, subtitle, onClick, danger, checked }: ProfileRowProps) {
  const content = (
    <>
      <span className={styles.iconTile}>{icon}</span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        {subtitle && <span className={styles.rowSubtitle}>{subtitle}</span>}
      </span>
    </>
  );

  const isSwitch = checked !== undefined;
  return (
    <button
      type="button"
      className={styles.row}
      data-danger={danger || undefined}
      role={isSwitch ? 'switch' : undefined}
      aria-checked={checked}
      onClick={onClick}
    >
      {content}
      {isSwitch ? (
        <span className={styles.switch} aria-hidden />
      ) : (
        <span className={styles.chevron}>
          <ChevronRightIcon />
        </span>
      )}
    </button>
  );
}
