import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { version } from '../../../package.json';
import { ChevronLeftIcon } from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useI18n } from '../../i18n/context';
import { knowledgeArticles, type KnowledgeGroup } from '../../i18n/knowledge';
import { legalTexts, type LegalPage as LegalPageName } from '../../i18n/legal';
import { Markdown } from './Markdown';
import styles from './Profile.module.css';
import { ProfileRow } from './ProfileRow';

function BackToProfile({ to = '/profile', label }: { to?: string; label?: string }) {
  const { t } = useI18n();
  return (
    <Link to={to} className={styles.backLink}>
      <ChevronLeftIcon />
      {label ?? t.profile.backToProfile}
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

const GROUPS: KnowledgeGroup[] = ['basics', 'lesserKnown'];

export function KnowledgePage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  return (
    <div className={styles.knowledge}>
      <BackToProfile />
      <h1 className={styles.knowledgeTitle}>{t.knowledge.title}</h1>
      <p className={styles.muted}>{t.knowledge.disclaimer}</p>
      {GROUPS.map((group) => (
        <section key={group} className={styles.section}>
          <h2 className={styles.sectionLabel}>{t.knowledge.groups[group]}</h2>
          <div className={styles.card}>
            {knowledgeArticles[language]
              .filter((article) => article.group === group)
              .map((article) => (
                <ProfileRow
                  key={article.slug}
                  icon={article.emoji}
                  title={article.title}
                  onClick={() => void navigate(`/profile/knowledge/${article.slug}`)}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ArticlePage() {
  const { t, language } = useI18n();
  const { slug } = useParams();
  const article = knowledgeArticles[language].find((candidate) => candidate.slug === slug);
  if (!article) return <Navigate to="/profile/knowledge" replace />;

  return (
    <>
      <BackToProfile to="/profile/knowledge" label={t.knowledge.title} />
      <article className={`${styles.legal} ${styles.article}`}>
        <p className={styles.articleEmoji} aria-hidden="true">
          {article.emoji}
        </p>
        <h1>{article.title}</h1>
        <Markdown source={article.body} />
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
