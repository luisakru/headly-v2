import styles from './Headly.module.css';

export type HeadlyLook = 'day' | 'evening';

/** A small brain as companion on Home: eyes open by day, closed and sleepy in the evening. */
export function Headly({ look }: { look: HeadlyLook }) {
  return (
    <svg className={styles.headly} viewBox="0 0 112 112" aria-hidden="true">
      <path
        className={styles.brain}
        d="M30 64 C16 60 16 40 32 36 C34 20 52 16 58 28 C66 14 88 20 86 36 C102 40 102 62 88 66 C90 82 72 90 62 82 C56 92 36 90 36 78 C24 80 18 68 30 64 Z"
      />
      <path
        className={styles.fold}
        d="M58 28 C52 40 62 48 57 60 M34 44 q8 -5 13 3 M74 38 q9 -1 11 8 M32 72 q4 6 10 4 M78 74 q6 -2 8 -8"
      />
      <ellipse className={styles.cheek} cx="42" cy="67" rx="5" ry="3" />
      <ellipse className={styles.cheek} cx="74" cy="67" rx="5" ry="3" />
      {look === 'day' ? (
        <>
          <ellipse className={styles.ink} cx="48" cy="58" rx="3.6" ry="4.4" />
          <ellipse className={styles.ink} cx="68" cy="58" rx="3.6" ry="4.4" />
          <circle className={styles.shine} cx="49.2" cy="56.4" r="1.2" />
          <circle className={styles.shine} cx="69.2" cy="56.4" r="1.2" />
          <path className={styles.line} d="M54 66 q4 4 8 0" />
        </>
      ) : (
        <>
          <path className={styles.line} d="M44 58 q4 3.5 8 0 M64 58 q4 3.5 8 0" />
          <ellipse className={styles.ink} cx="58" cy="67" rx="2.2" ry="1.8" />
          <text className={styles.sleep} x="82" y="44" fontSize="12">
            z
          </text>
          <text className={styles.sleep} x="90" y="35" fontSize="9">
            z
          </text>
        </>
      )}
    </svg>
  );
}
