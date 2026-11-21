import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { I18nProvider } from './i18n/I18nProvider';
import { CalendarScreen } from './screens/calendar/CalendarScreen';
import { ComponentsScreen } from './screens/dev/ComponentsScreen';
import { HomeScreen } from './screens/home/HomeScreen';
import { IntroScreen } from './screens/intro/IntroScreen';
import { StartShortcut } from './screens/home/StartShortcut';
import {
  AboutPage,
  ArticlePage,
  ImportGuidePage,
  KnowledgePage,
  LegalPage,
} from './screens/profile/ProfilePages';
import { DataPage } from './screens/profile/DataPage';
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
            <Route path="intro" element={<IntroScreen />} />
            <Route path="start" element={<StartShortcut />} />
            <Route path="calendar" element={<CalendarScreen />} />
            <Route path="stats" element={<StatsScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="profile/knowledge" element={<KnowledgePage />} />
            <Route path="profile/knowledge/:slug" element={<ArticlePage />} />
            <Route path="profile/data" element={<DataPage />} />
            <Route path="profile/import-guide" element={<ImportGuidePage />} />
            <Route path="profile/privacy" element={<LegalPage page="privacy" />} />
            <Route path="profile/imprint" element={<LegalPage page="imprint" />} />
            <Route path="profile/about" element={<AboutPage />} />
            <Route path="profile/report" element={<ReportPage />} />
            {/* Developer gallery; left out of the production build. */}
            {import.meta.env.DEV && <Route path="dev/components" element={<ComponentsScreen />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
