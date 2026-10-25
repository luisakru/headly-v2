import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';
import { TabBar } from './TabBar';

export function AppShell() {
  return (
    <div className={styles.appShell}>
      <main className={styles.content}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
