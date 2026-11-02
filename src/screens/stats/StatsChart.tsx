import { useLayoutEffect, useRef, useState } from 'react';
import { chartScale, labelStep, type BucketSize, type ChartBucket } from '../../domain/chart';
import { useI18n } from '../../i18n/context';
import {
  formatDate,
  formatDayMonth,
  formatDayRange,
  formatMonthShort,
  formatMonthYearShort,
  formatWeekday,
} from '../../i18n/format';
import styles from './Stats.module.css';

// Drawn at the card's inner width on a 390 px screen; the SVG scales to fit other widths.
const WIDTH = 314;
const HEIGHT = 180;
const AXIS_WIDTH = 22;
const PLOT_WIDTH = WIDTH - AXIS_WIDTH;
const LABEL_HEIGHT = 22;
const PLOT_TOP = 12;
const PLOT_HEIGHT = HEIGHT - LABEL_HEIGHT - PLOT_TOP;
const GROUP_FILL = 0.7;
const MAX_BAR_WIDTH = 24;
const BAR_GAP = 2;
const DOT_RADIUS = 3;
// About half of the widest label ("März 26"), so edge labels stay inside the chart.
const LABEL_HALF_WIDTH = 20;
const PAIN_SCALE = { max: 10, ticks: [0, 5, 10] };

type Series = { key: 'migraineDays' | 'medicationDays'; className?: string };

type StatsChartProps = {
  /** Buckets per page, oldest page first. */
  pages: ChartBucket[][];
  size: BucketSize;
  showMigraine: boolean;
  showMedication: boolean;
  onPageChange: (index: number) => void;
};

export function StatsChart({
  pages,
  size,
  showMigraine,
  showMedication,
  onPageChange,
}: StatsChartProps) {
  const { t, language } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visiblePage, setVisiblePage] = useState(pages.length - 1);
  const [selected, setSelected] = useState<{ page: number; index: number }>();

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, []);

  const handleScroll = () => {
    const scroller = scrollRef.current!;
    const page = Math.round(scroller.scrollLeft / scroller.clientWidth);
    if (page === visiblePage) return;
    setVisiblePage(page);
    setSelected(undefined);
    onPageChange(page);
  };

  const series: Series[] = [
    ...(showMigraine ? [{ key: 'migraineDays' as const, className: styles.migraineBar }] : []),
    ...(showMedication
      ? [{ key: 'medicationDays' as const, className: styles.medicationBar }]
      : []),
  ];
  // The y-axis fits the visible page, so a single bad month elsewhere doesn't flatten it.
  const maxValue = Math.max(
    0,
    ...(pages[visiblePage] ?? []).flatMap((bucket) => series.map((item) => bucket[item.key])),
  );
  const scale = size === 'day' ? PAIN_SCALE : chartScale(maxValue);
  const y = (value: number) => PLOT_TOP + PLOT_HEIGHT - (value / scale.max) * PLOT_HEIGHT;

  const bucketLabel = (bucket: ChartBucket, count: number) => {
    if (size === 'day')
      return count <= 7
        ? formatWeekday(new Date(bucket.range.start), language)
        : String(new Date(bucket.range.start).getDate());
    if (size === 'week') return formatDayMonth(bucket.range.start, language);
    return formatMonthShort(bucket.range.start, language);
  };

  const detail = (bucket: ChartBucket) => {
    if (size === 'day') {
      const parts = [
        ...(showMigraine && bucket.migraineDays > 0
          ? [
              bucket.pain === undefined
                ? t.stats.series.migraine
                : `${t.dayDetail.pain} ${t.dayDetail.painOutOfTen(bucket.pain)}`,
            ]
          : []),
        ...(showMedication && bucket.medicationDays > 0 ? [t.stats.series.medication] : []),
      ];
      return [
        formatDate(bucket.range.start, language),
        ...(parts.length > 0 ? parts : [t.dayDetail.noEntry]),
      ].join(' · ');
    }
    return [
      size === 'week'
        ? formatDayRange(bucket.range, language)
        : formatMonthYearShort(bucket.range.start, language),
      ...(showMigraine ? [t.stats.migraineDayCount(bucket.migraineDays)] : []),
      ...(showMedication ? [t.stats.medicationDayCount(bucket.medicationDays)] : []),
    ].join(' · ');
  };

  const renderDay = (bucket: ChartBucket, center: number, barWidth: number) => {
    const hasMigraine = showMigraine && bucket.migraineDays > 0;
    const pain = hasMigraine ? (bucket.pain ?? 0) : 0;
    const top = y(pain);
    return (
      <>
        {hasMigraine && pain > 0 && (
          <rect
            className={styles.migraineBar}
            x={center - barWidth / 2}
            y={top}
            width={barWidth}
            height={y(0) - top}
            rx={Math.min(4, barWidth / 2)}
          />
        )}
        {hasMigraine && pain === 0 && (
          <circle
            className={styles.migraineBar}
            cx={center}
            cy={y(0) - DOT_RADIUS}
            r={DOT_RADIUS}
          />
        )}
        {showMedication && bucket.medicationDays > 0 && (
          <circle
            className={styles.medicationBar}
            cx={center}
            cy={(hasMigraine ? top - DOT_RADIUS : y(0)) - DOT_RADIUS * 2}
            r={DOT_RADIUS}
          />
        )}
      </>
    );
  };

  const renderGroup = (bucket: ChartBucket, center: number, barWidth: number) => {
    const barsWidth = series.length * barWidth + (series.length - 1) * BAR_GAP;
    const firstBarX = center - barsWidth / 2;
    return series.map((item, seriesIndex) => {
      const value = bucket[item.key];
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
    });
  };

  const renderPage = (buckets: ChartBucket[], pageIndex: number) => {
    const groupWidth = PLOT_WIDTH / buckets.length;
    const barCount = size === 'day' ? 1 : Math.max(1, series.length);
    const barWidth = Math.min(
      MAX_BAR_WIDTH,
      (groupWidth * GROUP_FILL - BAR_GAP * (barCount - 1)) / barCount,
    );
    const step = labelStep(buckets.length);
    return (
      <svg
        key={buckets[0]!.range.start}
        className={styles.chartPage}
        viewBox={`0 0 ${PLOT_WIDTH} ${HEIGHT}`}
        aria-hidden="true"
      >
        {scale.ticks.map((tick) => (
          <line
            key={tick}
            className={styles.gridLine}
            x1={0}
            x2={PLOT_WIDTH}
            y1={y(tick)}
            y2={y(tick)}
          />
        ))}
        {buckets.map((bucket, index) => {
          const center = groupWidth * (index + 0.5);
          return (
            <g
              key={bucket.range.start}
              className={styles.bucket}
              onClick={() =>
                setSelected(
                  selected?.page === pageIndex && selected.index === index
                    ? undefined
                    : { page: pageIndex, index },
                )
              }
            >
              <rect
                className={styles.bucketHitArea}
                x={groupWidth * index}
                y={0}
                width={groupWidth}
                height={HEIGHT}
              />
              {size === 'day'
                ? renderDay(bucket, center, barWidth)
                : renderGroup(bucket, center, barWidth)}
              {index % step === 0 && (
                <text
                  className={styles.axisLabel}
                  x={Math.min(Math.max(center, LABEL_HALF_WIDTH), PLOT_WIDTH - LABEL_HALF_WIDTH)}
                  y={HEIGHT - 4}
                  textAnchor="middle"
                >
                  {bucketLabel(bucket, buckets.length)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const selectedBucket = selected && pages[selected.page]?.[selected.index];

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
        <div ref={scrollRef} className={styles.chartScroll} onScroll={handleScroll}>
          {pages.map(renderPage)}
        </div>
      </div>
      {selectedBucket && <p className={styles.chartDetail}>{detail(selectedBucket)}</p>}
    </>
  );
}
