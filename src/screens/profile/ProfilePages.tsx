import { Link } from 'react-router-dom';
import { version } from '../../../package.json';
import { ChevronLeftIcon } from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useI18n } from '../../i18n/context';
import { legalTexts, type LegalPage as LegalPageName } from '../../i18n/legal';
import { Markdown } from './Markdown';
import styles from './Profile.module.css';

function BackToProfile() {
  const { t } = useI18n();
  return (
    <Link to="/profile" className={styles.backLink}>
      <ChevronLeftIcon />
      {t.profile.backToProfile}
    </Link>
  );
}

export function LegalPage({ page }: { page: LegalPageName }) {
  const { language } = useI18n();
  return (
    <>
      <BackToProfile />
      <article className={styles.legal}>
        <Markdown source={legalTexts[language][page]} />
      </article>
    </>
  );
}

export function AboutPage() {
  const { t } = useI18n();
  return (
    <>
      <BackToProfile />
      <ScreenTitle>{t.profile.about}</ScreenTitle>
      <div className={styles.sheetContent}>
        <p className={styles.muted}>{t.profile.version(version)}</p>
        <p className={styles.text}>{t.profile.aboutText}</p>
        <p className={styles.text}>{t.profile.disclaimer}</p>
      </div>
    </>
  );
}
