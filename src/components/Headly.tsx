import styles from './Headly.module.css';

export type HeadlyLook = 'day' | 'evening';

/** The app icon's head as a small companion: sunglasses by day, a sleep mask in the evening. */
export function Headly({ look }: { look: HeadlyLook }) {
  return (
    <svg className={styles.headly} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse className={styles.skin} cx="27" cy="58" rx="6" ry="8" />
      <ellipse className={styles.skin} cx="93" cy="58" rx="6" ry="8" />
      <rect className={styles.skin} x="53" y="91" width="14" height="9" rx="4" />
      <path className={styles.skin} d="M30 112 Q44 100 60 98 Q76 100 90 112 Z" />
      <ellipse className={styles.skin} cx="60" cy="58" rx="34" ry="36" />
      <path
        className={styles.wave}
        d="M42 34 Q47 29 52 34 Q57 39 62 34 Q67 29 72 34 Q77 39 82 34"
      />
      {look === 'day' ? (
        <>
          <rect className={styles.glasses} x="36" y="48" width="21" height="13" rx="5" />
          <rect className={styles.glasses} x="63" y="48" width="21" height="13" rx="5" />
          <path className={styles.bridge} d="M57 53 h6" />
          <path className={styles.mouth} d="M52 74 q8 7 16 0" />
        </>
      ) : (
        <>
          <path className={styles.band} d="M27 53 h66" />
          <rect className={styles.mask} x="34" y="46" width="52" height="16" rx="8" />
          <path className={styles.closed} d="M42 54 q5 4 10 0 M68 54 q5 4 10 0" />
          <path className={styles.mouth} d="M55 75 q5 3 10 0" />
        </>
      )}
    </svg>
  );
}
