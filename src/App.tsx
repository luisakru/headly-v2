import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { I18nProvider } from './i18n/I18nProvider';
import { CalendarScreen } from './screens/calendar/CalendarScreen';
import { ComponentsScreen } from './screens/dev/ComponentsScreen';
import { HomeScreen } from './screens/home/HomeScreen';
import { AboutPage, LegalPage } from './screens/profile/ProfilePages';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { ReportPage } from './screens/profile/ReportPage';
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
            <Route path="profile/privacy" element={<LegalPage page="privacy" />} />
            <Route path="profile/imprint" element={<LegalPage page="imprint" />} />
            <Route path="profile/about" element={<AboutPage />} />
            <Route path="profile/report" element={<ReportPage />} />
            <Route path="dev/components" element={<ComponentsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
