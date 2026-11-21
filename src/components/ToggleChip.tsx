import styles from './ToggleChip.module.css';

type ToggleChipProps = {
  label: string;
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  /** CSS color of the legend swatch, e.g. a token like `var(--color-primary)`. */
  swatchColor?: string;
  /** A slim legend-style toggle without a frame, e.g. under a chart. */
  compact?: boolean;
};

export function ToggleChip({ label, pressed, onChange, swatchColor, compact }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={styles.toggleChip}
      data-compact={compact || undefined}
      onClick={() => onChange(!pressed)}
    >
      {swatchColor && <span className={styles.swatch} style={{ background: swatchColor }} />}
      {label}
    </button>
  );
}
