import styles from './Headly.module.css';

export type HeadlyLook = 'day' | 'evening';

/** A small cloud as companion on Home: sunglasses by day, a sleep mask in the evening. */
export function Headly({ look }: { look: HeadlyLook }) {
  return (
    <svg className={styles.headly} viewBox="0 0 112 112" aria-hidden="true">
      <path
        className={styles.cloud}
        d="M24 82 c-12 0 -16 -18 -4 -22 c-2 -16 18 -24 28 -14 c6 -14 30 -12 32 4 c14 -2 20 16 8 24 c4 10 -6 14 -12 8 z"
      />
      <ellipse className={styles.cheek} cx="36" cy="68" rx="5" ry="3" />
      <ellipse className={styles.cheek} cx="76" cy="68" rx="5" ry="3" />
      {look === 'day' ? (
        <>
          <rect className={styles.glasses} x="33" y="52" width="20" height="12" rx="5" />
          <rect className={styles.glasses} x="59" y="52" width="20" height="12" rx="5" />
          <path className={styles.line} d="M53 57 h6" />
          <path className={styles.line} d="M51 70 q5 5 10 0" />
        </>
      ) : (
        <>
          <rect className={styles.mask} x="30" y="52" width="52" height="14" rx="7" />
          <path className={styles.closed} d="M38 59 q5 3 10 0 M64 59 q5 3 10 0" />
          <ellipse className={styles.ink} cx="56" cy="72" rx="2.6" ry="2" />
        </>
      )}
    </svg>
  );
}
