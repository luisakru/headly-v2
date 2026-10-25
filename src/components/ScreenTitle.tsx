import type { ReactNode } from 'react';
import styles from './ScreenTitle.module.css';

export function ScreenTitle({ children }: { children: ReactNode }) {
  return <h1 className={styles.screenTitle}>{children}</h1>;
}
