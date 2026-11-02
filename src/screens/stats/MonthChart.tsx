import { useLayoutEffect, useRef, useState } from 'react';
import { chartScale, monthLabelStep } from '../../domain/chart';
import type { MonthCount } from '../../domain/stats';
import { useI18n } from '../../i18n/context';
import { formatMonthShort, formatMonthYearShort } from '../../i18n/format';
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
// Longer ranges scroll sideways instead of squeezing the bars.
const VISIBLE_MONTHS = 12;

type Series = { key: 'migraineDays' | 'medicationDays'; className?: string };

type MonthChartProps = {
  months: MonthCount[];
  showMigraine: boolean;
  showMedication: boolean;
};

export function MonthChart({ months, showMigraine, showMedication }: MonthChartProps) {
  const { t, language } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>();

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, [months.length]);

  const series: Series[] = [
    ...(showMigraine ? [{ key: 'migraineDays' as const, className: styles.migraineBar }] : []),
    ...(showMedication
      ? [{ key: 'medicationDays' as const, className: styles.medicationBar }]
      : []),
  ];
  const maxValue = Math.max(0, ...months.flatMap((month) => series.map((item) => month[item.key])));
  const scale = chartScale(maxValue);
  const visibleWidth = WIDTH - AXIS_WIDTH;
  const groupWidth = visibleWidth / Math.min(months.length, VISIBLE_MONTHS);
  const plotWidth = groupWidth * months.length;
  const barWidth = Math.min(
    MAX_BAR_WIDTH,
    (groupWidth * GROUP_FILL - BAR_GAP * (series.length - 1)) / Math.max(1, series.length),
  );
  const labelStep = monthLabelStep(Math.min(months.length, VISIBLE_MONTHS));
  const y = (value: number) => PLOT_TOP + PLOT_HEIGHT - (value / scale.max) * PLOT_HEIGHT;
  const monthTime = (month: string) => {
    const [year, monthIndex] = month.split('-').map(Number);
    return new Date(year!, monthIndex! - 1, 1).getTime();
  };
  const selected = months.find((month) => month.month === selectedMonth);

  return (
    <>
      <div className={styles.chart} role="img" aria-label={t.stats.chartLabel}>
        <svg
          className={styles.chartAxis}
          style={{ width: `${(AXIS_WIDTH / WIDTH) * 100}%` }}
          viewBox={`0 0 ${AXIS_WIDTH} ${HEIGHT}`}
          aria-hidden="true"
        >
          {scale.ticks.map((tick) => (
            <text
              key={tick}
              className={styles.axisLabel}
              x={0}
              y={y(tick)}
              dominantBaseline="middle"
            >
              {tick}
            </text>
          ))}
        </svg>
        <div ref={scrollRef} className={styles.chartScroll}>
          <svg
            className={styles.chartPlot}
            style={{ width: `${(plotWidth / visibleWidth) * 100}%` }}
            viewBox={`0 0 ${plotWidth} ${HEIGHT}`}
            aria-hidden="true"
          >
            {scale.ticks.map((tick) => (
              <line
                key={tick}
                className={styles.gridLine}
                x1={0}
                x2={plotWidth}
                y1={y(tick)}
                y2={y(tick)}
              />
            ))}
            {months.map((month, index) => {
              const groupCenter = groupWidth * (index + 0.5);
              const barsWidth = series.length * barWidth + (series.length - 1) * BAR_GAP;
              const firstBarX = groupCenter - barsWidth / 2;
              return (
                <g
                  key={month.month}
                  className={styles.monthGroup}
                  onClick={() =>
                    setSelectedMonth(month.month === selectedMonth ? undefined : month.month)
                  }
                >
                  <rect
                    className={styles.monthHitArea}
                    x={groupWidth * index}
                    y={0}
                    width={groupWidth}
                    height={HEIGHT}
                  />
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
                      x={Math.min(
                        Math.max(groupCenter, LABEL_HALF_WIDTH),
                        plotWidth - LABEL_HALF_WIDTH,
                      )}
                      y={HEIGHT - 4}
                      textAnchor="middle"
                    >
                      {formatMonthShort(monthTime(month.month), language)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      {selected && (
        <p className={styles.chartDetail}>
          {[
            formatMonthYearShort(monthTime(selected.month), language),
            ...(showMigraine ? [t.stats.migraineDayCount(selected.migraineDays)] : []),
            ...(showMedication ? [t.stats.medicationDayCount(selected.medicationDays)] : []),
          ].join(' · ')}
        </p>
      )}
    </>
  );
}
