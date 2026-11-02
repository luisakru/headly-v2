import styles from './SegmentedControl.module.css';

type SegmentedControlProps<Value extends string> = {
  label: string;
  options: { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  /** Tighter spacing so many short options fit on one row. */
  compact?: boolean;
};

export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
  compact,
}: SegmentedControlProps<Value>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={styles.segmentedControl}
      data-compact={compact}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={styles.segment}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
