import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { version } from '../../../package.json';
import { ChevronLeftIcon } from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { useI18n } from '../../i18n/context';
import { knowledgeArticles, knowledgeFigures, type KnowledgeGroup } from '../../i18n/knowledge';
import { legalTexts, type LegalPage as LegalPageName } from '../../i18n/legal';
import { Markdown } from './Markdown';
import styles from './Profile.module.css';
import { ProfileRow } from './ProfileRow';

export function BackToProfile({ to = '/profile', label }: { to?: string; label?: string }) {
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

const GROUPS: KnowledgeGroup[] = ['basics', 'alternatives', 'lesserKnown'];

export function KnowledgePage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  return (
    <div className={styles.knowledge}>
      <BackToProfile />
      <ScreenTitle>{t.knowledge.title}</ScreenTitle>
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
        <Markdown source={article.body} figures={knowledgeFigures[language]} />
      </article>
    </>
  );
}

export function ImportGuidePage() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const prompt = t.importGuide.prompt(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      // Clipboard refused: the prompt stays selectable on the page.
    }
  };

  return (
    <>
      <BackToProfile to="/profile/data" label={t.profile.backupAndRestore} />
      <ScreenTitle>{t.importGuide.title}</ScreenTitle>
      <div className={styles.guide}>
        <p>{t.importGuide.intro}</p>
        <div className={styles.warning} role="note">
          <p className={styles.warningTitle}>{t.importGuide.warningTitle}</p>
          <p>{t.importGuide.warning}</p>
        </div>
        <section>
          <h2 className={styles.sectionLabel}>{t.importGuide.stepsTitle}</h2>
          <ol className={styles.steps}>
            {t.importGuide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className={styles.sectionLabel}>{t.importGuide.promptTitle}</h2>
          <pre className={styles.prompt}>{prompt}</pre>
        </section>
        <Button large onClick={() => void copy()}>
          {copied ? t.importGuide.copied : t.importGuide.copy}
        </Button>
      </div>
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
