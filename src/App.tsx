import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { I18nProvider } from './i18n/I18nProvider';
import { CalendarScreen } from './screens/calendar/CalendarScreen';
import { ComponentsScreen } from './screens/dev/ComponentsScreen';
import { HomeScreen } from './screens/home/HomeScreen';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { StatsScreen } from './screens/stats/StatsScreen';

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomeScreen />} />
            <Route path="calendar" element={<CalendarScreen />} />
            <Route path="stats" element={<StatsScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="dev/components" element={<ComponentsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
