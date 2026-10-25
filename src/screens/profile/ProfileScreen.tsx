import { ScreenTitle } from '../../components/ScreenTitle';
import { useI18n } from '../../i18n/context';

export function ProfileScreen() {
  const { t } = useI18n();
  return <ScreenTitle>{t.profile.title}</ScreenTitle>;
}
