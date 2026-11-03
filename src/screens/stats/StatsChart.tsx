import { parseISO } from 'date-fns';
import { useLayoutEffect, useRef, useState } from 'react';
import { chartScale, labelStep, type BucketSize, type ChartBucket } from '../../domain/chart';
import type { LifeEvent } from '../../domain/types';
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
// Keeps the outer bars and their labels off the page edges.
const PLOT_PADDING = 8;
// Rough width of one label character at 11 px, to drop labels that would be cut off.
const LABEL_CHAR_WIDTH = 6.4;
const PAIN_SCALE = { max: 10, ticks: [0, 5, 10] };
// Only pages this close to the visible one are drawn; years of weeks would be too slow.
const RENDERED_NEIGHBOURS = 2;

type Series = { key: 'migraineDays' | 'medicationDays'; className?: string };

type StatsChartProps = {
  /** Buckets per page, oldest page first. */
  pages: ChartBucket[][];
  size: BucketSize;
  /** Drawn as thin vertical lines at their date. */
  lifeEvents: LifeEvent[];
  showMigraine: boolean;
  showMedication: boolean;
  onPageChange: (index: number) => void;
};

export function StatsChart({
  pages,
  size,
  lifeEvents,
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

  const eventTimes = lifeEvents.map((lifeEvent) => ({
    name: lifeEvent.name,
    time: parseISO(lifeEvent.date).getTime(),
  }));
  const eventsIn = (bucket: ChartBucket) =>
    eventTimes.filter(({ time }) => time >= bucket.range.start && time < bucket.range.end);

  const bucketLabel = (bucket: ChartBucket, count: number) => {
    if (size === 'day')
      return count <= 7
        ? formatWeekday(new Date(bucket.range.start), language)
        : String(new Date(bucket.range.start).getDate());
    if (size === 'week') return formatDayMonth(bucket.range.start, language);
    if (size === 'year') return String(new Date(bucket.range.start).getFullYear());
    return formatMonthShort(bucket.range.start, language);
  };

  const detail = (bucket: ChartBucket) =>
    [bucketDetail(bucket), ...eventsIn(bucket).map(({ name }) => name)].join(' · ');

  const bucketDetail = (bucket: ChartBucket) => {
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
        : size === 'year'
          ? String(new Date(bucket.range.start).getFullYear())
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
    const groupWidth = (PLOT_WIDTH - 2 * PLOT_PADDING) / buckets.length;
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
          const center = PLOT_PADDING + groupWidth * (index + 0.5);
          const label = bucketLabel(bucket, buckets.length);
          const labelHalfWidth = (label.length * LABEL_CHAR_WIDTH) / 2;
          // Counted from the newest bucket, so the current period keeps its label.
          const showLabel =
            (buckets.length - 1 - index) % step === 0 &&
            center - labelHalfWidth >= 0 &&
            center + labelHalfWidth <= PLOT_WIDTH;
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
                x={PLOT_PADDING + groupWidth * index}
                y={0}
                width={groupWidth}
                height={HEIGHT}
              />
              {eventsIn(bucket).map(({ name, time }) => {
                const share = (time - bucket.range.start) / (bucket.range.end - bucket.range.start);
                const x = PLOT_PADDING + groupWidth * (index + share);
                return (
                  <line
                    key={name + time}
                    className={styles.chartMarker}
                    x1={x}
                    x2={x}
                    y1={PLOT_TOP}
                    y2={y(0)}
                  />
                );
              })}
              {size === 'day'
                ? renderDay(bucket, center, barWidth)
                : renderGroup(bucket, center, barWidth)}
              {showLabel && (
                <text className={styles.axisLabel} x={center} y={HEIGHT - 4} textAnchor="middle">
                  {label}
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
          {pages.map((buckets, index) =>
            Math.abs(index - visiblePage) <= RENDERED_NEIGHBOURS ? (
              renderPage(buckets, index)
            ) : (
              <div
                key={buckets[0]!.range.start}
                className={styles.chartPage}
                style={{ aspectRatio: `${PLOT_WIDTH} / ${HEIGHT}` }}
              />
            ),
          )}
        </div>
      </div>
      {selectedBucket && <p className={styles.chartDetail}>{detail(selectedBucket)}</p>}
    </>
  );
}
