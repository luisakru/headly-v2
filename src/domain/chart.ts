const TICK_STEPS = [1, 2, 5, 10, 20, 50, 100];
const MAX_TICK_INTERVALS = 4;
const MAX_MONTH_LABELS = 6;

export type ChartScale = {
  max: number;
  /** From 0 up to `max`, evenly spaced. */
  ticks: number[];
};

/** A y-axis with round tick values and at most four intervals. */
export function chartScale(maxValue: number): ChartScale {
  const step =
    TICK_STEPS.find((candidate) => maxValue / candidate <= MAX_TICK_INTERVALS) ??
    TICK_STEPS[TICK_STEPS.length - 1]!;
  const intervals = Math.max(1, Math.ceil(maxValue / step));
  return {
    max: intervals * step,
    ticks: Array.from({ length: intervals + 1 }, (_, index) => index * step),
  };
}

/** Show every n-th month label so long ranges still fit. */
export function monthLabelStep(monthCount: number): number {
  return Math.max(1, Math.ceil(monthCount / MAX_MONTH_LABELS));
}
