import type { TimeOfDay } from '../domain/timeOfDay';
import styles from './Headly.module.css';

const BRAIN =
  'M30 64 C16 60 16 40 32 36 C34 20 52 16 58 28 C66 14 88 20 86 36 C102 40 102 62 88 66 C90 82 72 90 62 82 C56 92 36 90 36 78 C24 80 18 68 30 64 Z';
const FOLDS =
  'M58 28 C52 40 62 48 57 60 M34 44 q8 -5 13 3 M74 38 q9 -1 11 8 M32 72 q4 6 10 4 M78 74 q6 -2 8 -8';

/** A small brain as companion on Home, with a different look for each time of day. */
export function Headly({ look }: { look: TimeOfDay }) {
  return (
    <svg className={styles.headly} viewBox="0 0 112 112" aria-hidden="true">
      {look === 'night' && (
        <>
          <path
            className={styles.cap}
            d="M28 40 C34 20 62 12 84 24 C96 30 102 40 104 50 C96 44 86 40 76 39 C60 37 44 38 28 40 Z"
          />
          <path className={styles.capBrim} d="M28 40 C46 34 64 34 80 39" />
          <circle className={styles.pompom} cx="104" cy="52" r="5.5" />
        </>
      )}
      <path className={styles.brain} d={BRAIN} />
      <path className={styles.fold} d={FOLDS} />
      <ellipse className={styles.cheek} cx="42" cy="67" rx="5" ry="3" />
      <ellipse className={styles.cheek} cx="74" cy="67" rx="5" ry="3" />

      {look === 'morning' && (
        <>
          <ellipse className={styles.ink} cx="48" cy="60" rx="3.4" ry="2.6" />
          <ellipse className={styles.ink} cx="68" cy="60" rx="3.4" ry="2.6" />
          <path className={styles.lid} d="M43.5 58 q4.5 -2.5 9 0 M63.5 58 q4.5 -2.5 9 0" />
          <path className={styles.line} d="M54 67 q4 3 8 0" />
          <path className={styles.steam} d="M90 70 q-3 -5 0 -10 M97 70 q-3 -5 0 -10" />
          <path className={styles.cupHandle} d="M104 80 q7 0 6 6 q-1 5 -7 5" />
          <rect className={styles.cup} x="84" y="74" width="20" height="20" rx="5" />
        </>
      )}
      {look === 'day' && (
        <>
          <ellipse className={styles.ink} cx="48" cy="58" rx="4" ry="4.8" />
          <ellipse className={styles.ink} cx="68" cy="58" rx="4" ry="4.8" />
          <circle className={styles.shine} cx="49.4" cy="56.2" r="1.4" />
          <circle className={styles.shine} cx="69.4" cy="56.2" r="1.4" />
          <path className={styles.line} d="M52 65 q6 6 12 0" />
        </>
      )}
      {look === 'evening' && (
        <>
          <path className={styles.line} d="M44 60 q4 -4 8 0 M64 60 q4 -4 8 0" />
          <path className={styles.line} d="M54 67 q4 3 8 0" />
          <path
            className={styles.blanket}
            d="M14 82 C30 70 50 76 58 80 C68 74 88 70 100 82 C96 96 20 98 14 82 Z"
          />
          <path
            className={styles.blanketLine}
            d="M30 84 l4 6 M46 84 l4 7 M66 84 l4 7 M82 82 l4 6"
          />
        </>
      )}
      {look === 'night' && (
        <>
          <path className={styles.line} d="M44 58 q4 3.5 8 0 M64 58 q4 3.5 8 0" />
          <ellipse className={styles.ink} cx="58" cy="67" rx="2.2" ry="1.8" />
          <text className={styles.sleep} x="8" y="34" fontSize="12">
            z
          </text>
          <text className={styles.sleep} x="2" y="24" fontSize="9">
            z
          </text>
        </>
      )}
    </svg>
  );
}
