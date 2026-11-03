import { useState } from 'react';
import { chartScale } from '../../domain/chart';
import type { PreventionChart as PreventionChartData } from '../../domain/prevention';
import { useI18n } from '../../i18n/context';
import { formatDayRange, formatNumber } from '../../i18n/format';
import styles from './Stats.module.css';

// Drawn at the prevention text width on a 390 px screen; the SVG scales to fit other widths.
const WIDTH = 264;
const PLOT_HEIGHT = 76;
const LABEL_ROW_HEIGHT = 14;
const LABEL_MARGIN = 4;
const BAR_FILL = 0.7;
const MAX_BAR_WIDTH = 24;
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_GAP = 6;

type Marker = { x: number; label: string };

export function PreventionChart({ chart }: { chart: PreventionChartData }) {
  const { t, language } = useI18n();
  const [selected, setSelected] = useState<number>();
  const { blocks, baseline } = chart;
  const scale = chartScale(
    Math.max(baseline ?? 0, ...blocks.map((block) => block.migraineDaysPer30)),
  );
  const blockWidth = WIDTH / blocks.length;
  const barWidth = Math.min(MAX_BAR_WIDTH, blockWidth * BAR_FILL);

  const markers: Marker[] = [];
  blocks.forEach((block, index) => {
    const previous = blocks[index - 1]?.phase ?? 'before';
    if (block.phase === previous) return;
    const label =
      block.phase === 'after'
        ? t.stats.chartMarkers.end
        : block.phase === 'effective' && previous === 'buildUp'
          ? t.stats.chartMarkers.effective
          : t.stats.chartMarkers.start;
    markers.push({ x: index * blockWidth, label });
  });
  // A label that would overlap the one before moves to the next row.
  const rowEnds: number[] = [];
  const labelled = markers.map((marker) => {
    const width = marker.label.length * LABEL_CHAR_WIDTH;
    const anchorEnd = marker.x + width > WIDTH;
    const left = anchorEnd ? marker.x - width : marker.x;
    let row = rowEnds.findIndex((end) => left >= end + LABEL_GAP);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = left + width;
    return { ...marker, row, anchorEnd };
  });
  const plotTop = rowEnds.length * LABEL_ROW_HEIGHT + LABEL_MARGIN;
  const height = plotTop + PLOT_HEIGHT;
  const y = (value: number) => plotTop + PLOT_HEIGHT - (value / scale.max) * PLOT_HEIGHT;

  const selectedBlock = selected === undefined ? undefined : blocks[selected];

  return (
    <>
      <svg
        className={styles.preventionChart}
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={t.stats.preventionChartLabel}
      >
        <line className={styles.gridLine} x1={0} x2={WIDTH} y1={y(0)} y2={y(0)} />
        {labelled.map((marker) => (
          <g key={marker.x}>
            <line
              className={styles.chartMarker}
              x1={marker.x}
              x2={marker.x}
              y1={marker.row * LABEL_ROW_HEIGHT + 2}
              y2={y(0)}
            />
            <text
              className={styles.axisLabel}
              x={marker.anchorEnd ? marker.x - 3 : marker.x + 3}
              y={(marker.row + 1) * LABEL_ROW_HEIGHT - 3}
              textAnchor={marker.anchorEnd ? 'end' : 'start'}
            >
              {marker.label}
            </text>
          </g>
        ))}
        {blocks.map((block, index) => {
          const center = blockWidth * (index + 0.5);
          const top = y(block.migraineDaysPer30);
          const outside = block.phase === 'before' || block.phase === 'after';
          return (
            <g
              key={block.range.start}
              className={styles.bucket}
              onClick={() => setSelected(selected === index ? undefined : index)}
            >
              <rect
                className={styles.bucketHitArea}
                x={index * blockWidth}
                y={0}
                width={blockWidth}
                height={height}
              />
              {block.migraineDaysPer30 > 0 && (
                <rect
                  className={outside ? styles.outsideBar : styles.migraineBar}
                  x={center - barWidth / 2}
                  y={top}
                  width={barWidth}
                  height={y(0) - top}
                  rx={Math.min(4, barWidth / 2)}
                />
              )}
            </g>
          );
        })}
        {baseline !== undefined && (
          <line
            className={styles.baselineLine}
            x1={0}
            x2={WIDTH}
            y1={y(baseline)}
            y2={y(baseline)}
          />
        )}
      </svg>
      {selectedBlock && (
        <p className={styles.chartDetail}>
          {[
            formatDayRange(selectedBlock.range, language),
            t.stats.migraineDaysPerMonth(formatNumber(selectedBlock.migraineDaysPer30, language)),
          ].join(' · ')}
        </p>
      )}
    </>
  );
}
