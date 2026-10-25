import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { CalendarIcon, HomeIcon, ProfileIcon, StatsIcon } from './icons';
import styles from './TabBar.module.css';

const TABS = [
  { to: '/', key: 'home', Icon: HomeIcon },
  { to: '/calendar', key: 'calendar', Icon: CalendarIcon },
  { to: '/stats', key: 'stats', Icon: StatsIcon },
  { to: '/profile', key: 'profile', Icon: ProfileIcon },
] as const;

export function TabBar() {
  const { t } = useI18n();

  return (
    <nav aria-label={t.tabs.label} className={styles.tabBar}>
      {TABS.map(({ to, key, Icon }) => (
        <NavLink key={to} to={to} end className={styles.tab} aria-label={t.tabs[key]}>
          {({ isActive }) => <Icon filled={isActive} />}
        </NavLink>
      ))}
    </nav>
  );
}
