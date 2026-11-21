import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../screens/home/useHomeData';
import styles from './AppShell.module.css';
import { TabBar } from './TabBar';

const THEME_COLORS = { light: '#F2EDE4', dark: '#282828' };

export function AppShell() {
  const settings = useSettings();
  const theme = settings?.theme;
  const isIntro = useLocation().pathname === '/intro';

  useEffect(() => {
    if (!theme) return;
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;

    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      const scheme = meta.media.includes('dark') ? 'dark' : 'light';
      meta.content = THEME_COLORS[theme === 'system' ? scheme : theme];
    });
  }, [theme]);

  if (settings && !settings.introSeen && !isIntro) return <Navigate to="/intro" replace />;

  return (
    <div className={styles.appShell}>
      <main className={styles.content}>
        <Outlet />
      </main>
      {!isIntro && <TabBar />}
    </div>
  );
}
