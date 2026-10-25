import { ScreenTitle } from '../../components/ScreenTitle';
import { useI18n } from '../../i18n/context';

export function HomeScreen() {
  const { t } = useI18n();
  return <ScreenTitle>{t.home.title}</ScreenTitle>;
}
