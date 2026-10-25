import type { ReactNode } from 'react';
import { ChevronRightIcon } from '../../components/icons';
import { useI18n } from '../../i18n/context';
import styles from './Profile.module.css';

type ProfileRowProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  /** Greyed out with a "Soon" badge, not tappable. */
  soon?: boolean;
  danger?: boolean;
  /** Shows a switch instead of the chevron. */
  checked?: boolean;
};

export function ProfileRow({
  icon,
  title,
  subtitle,
  onClick,
  soon,
  danger,
  checked,
}: ProfileRowProps) {
  const { t } = useI18n();
  const content = (
    <>
      <span className={styles.iconTile}>{icon}</span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        {subtitle && <span className={styles.rowSubtitle}>{subtitle}</span>}
      </span>
    </>
  );

  if (soon) {
    return (
      <div className={styles.row} data-soon>
        {content}
        <span className={styles.badge}>{t.common.soon}</span>
      </div>
    );
  }

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
