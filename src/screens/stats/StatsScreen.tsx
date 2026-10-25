import { ScreenTitle } from '../../components/ScreenTitle';
import { useI18n } from '../../i18n/context';

export function StatsScreen() {
  const { t } = useI18n();
  return <ScreenTitle>{t.stats.title}</ScreenTitle>;
}
