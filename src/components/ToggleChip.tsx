import styles from './ToggleChip.module.css';

type ToggleChipProps = {
  label: string;
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  /** CSS color of the legend swatch, e.g. a token like `var(--color-primary)`. */
  swatchColor?: string;
};

export function ToggleChip({ label, pressed, onChange, swatchColor }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={styles.toggleChip}
      onClick={() => onChange(!pressed)}
    >
      {swatchColor && <span className={styles.swatch} style={{ background: swatchColor }} />}
      {label}
    </button>
  );
}
