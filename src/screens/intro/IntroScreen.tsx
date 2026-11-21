import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { updateSettings } from '../../data/settingsRepository';
import { useI18n } from '../../i18n/context';
import styles from './Intro.module.css';

const isInstalled = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(display-mode: standalone)').matches;

export function IntroScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const pages = t.intro.pages.filter((page) => !page.install || !isInstalled());
  const page = pages[index];
  if (!page) return null;
  const isLast = index === pages.length - 1;

  const finish = async (to = '/') => {
    await updateSettings({ introSeen: true });
    void navigate(to, { replace: true });
  };

  return (
    <div className={styles.intro}>
      <h1 className={styles.title}>{page.title}</h1>
      <p className={styles.text}>{page.text}</p>
      <ul className={styles.items}>
        {page.items.map(([emoji, title, text]) => (
          <li key={title} className={styles.item}>
            <span className={styles.emoji} aria-hidden>
              {emoji}
            </span>
            <span>
              <strong className={styles.itemTitle}>{title}</strong>
              <span className={styles.itemText}>{text}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.dots} aria-hidden>
        {pages.map((_, dot) => (
          <span key={dot} className={styles.dot} data-active={dot === index || undefined} />
        ))}
      </div>
      <div className={styles.actions}>
        <Button large onClick={() => (isLast ? void finish() : setIndex(index + 1))}>
          {isLast ? t.intro.start : t.intro.next}
        </Button>
        {!isLast && (
          <Button variant="outline" onClick={() => void finish()}>
            {t.intro.skip}
          </Button>
        )}
        {isLast && page.guide && (
          <Button variant="outline" onClick={() => void finish('/profile/import-guide')}>
            {t.intro.openGuide}
          </Button>
        )}
      </div>
    </div>
  );
}
