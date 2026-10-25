import { chartScale, monthLabelStep } from '../../domain/chart';
import type { MonthCount } from '../../domain/stats';
import { useI18n } from '../../i18n/context';
import { formatMonthShort } from '../../i18n/format';
import styles from './Stats.module.css';

// Drawn at the card's inner width on a 390 px screen; the SVG scales to fit other widths.
const WIDTH = 314;
const HEIGHT = 180;
const AXIS_WIDTH = 22;
const LABEL_HEIGHT = 22;
const PLOT_TOP = 6;
const PLOT_HEIGHT = HEIGHT - LABEL_HEIGHT - PLOT_TOP;
const GROUP_FILL = 0.7;
const MAX_BAR_WIDTH = 24;
const BAR_GAP = 2;
// About half of the widest label ("März 26"), so edge labels stay inside the chart.
const LABEL_HALF_WIDTH = 20;

type Series = { key: 'migraineDays' | 'medicationDays'; className?: string };

type MonthChartProps = {
  months: MonthCount[];
  showMigraine: boolean;
  showMedication: boolean;
};

export function MonthChart({ months, showMigraine, showMedication }: MonthChartProps) {
  const { t, language } = useI18n();

  const series: Series[] = [
    ...(showMigraine ? [{ key: 'migraineDays' as const, className: styles.migraineBar }] : []),
    ...(showMedication
      ? [{ key: 'medicationDays' as const, className: styles.medicationBar }]
      : []),
  ];
  const maxValue = Math.max(0, ...months.flatMap((month) => series.map((item) => month[item.key])));
  const scale = chartScale(maxValue);
  const plotWidth = WIDTH - AXIS_WIDTH;
  const groupWidth = plotWidth / months.length;
  const barWidth = Math.min(
    MAX_BAR_WIDTH,
    (groupWidth * GROUP_FILL - BAR_GAP * (series.length - 1)) / Math.max(1, series.length),
  );
  const labelStep = monthLabelStep(months.length);
  const y = (value: number) => PLOT_TOP + PLOT_HEIGHT - (value / scale.max) * PLOT_HEIGHT;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={t.stats.chartLabel}
    >
      {scale.ticks.map((tick) => (
        <g key={tick}>
          <line className={styles.gridLine} x1={AXIS_WIDTH} x2={WIDTH} y1={y(tick)} y2={y(tick)} />
          <text className={styles.axisLabel} x={0} y={y(tick)} dominantBaseline="middle">
            {tick}
          </text>
        </g>
      ))}
      {months.map((month, index) => {
        const groupCenter = AXIS_WIDTH + groupWidth * (index + 0.5);
        const barsWidth = series.length * barWidth + (series.length - 1) * BAR_GAP;
        const firstBarX = groupCenter - barsWidth / 2;
        const [year, monthIndex] = month.month.split('-').map(Number);
        return (
          <g key={month.month}>
            {series.map((item, seriesIndex) => {
              const value = month[item.key];
              if (value === 0) return null;
              return (
                <rect
                  key={item.key}
                  className={item.className}
                  x={firstBarX + seriesIndex * (barWidth + BAR_GAP)}
                  y={y(value)}
                  width={barWidth}
                  height={y(0) - y(value)}
                  rx={Math.min(4, barWidth / 2)}
                />
              );
            })}
            {index % labelStep === 0 && (
              <text
                className={styles.axisLabel}
                x={Math.min(groupCenter, WIDTH - LABEL_HALF_WIDTH)}
                y={HEIGHT - 4}
                textAnchor="middle"
              >
                {formatMonthShort(new Date(year!, monthIndex! - 1, 1).getTime(), language)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
