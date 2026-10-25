import { ScreenTitle } from '../../components/ScreenTitle';
import { useI18n } from '../../i18n/context';

export function CalendarScreen() {
  const { t } = useI18n();
  return <ScreenTitle>{t.calendar.title}</ScreenTitle>;
}
