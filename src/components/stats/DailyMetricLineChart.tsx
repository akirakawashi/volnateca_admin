import { useMemo } from 'react';
import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { Alert } from '../ui/Alert/Alert';
import { Button } from '../ui/Button/Button';
import { Card } from '../ui/Card/Card';
import type { DailySeriesStats, StatsRangeDays } from '../../types/stats';
import {
  formatChartAxisLabel,
  formatChartDayLabel,
  getMinTickGap,
  getXAxisInterval,
} from '../../utils/chartFormatting';
import styles from './DailyMetricChart.module.css';

const RANGE_OPTIONS: StatsRangeDays[] = [7, 30, 90];
const CHART_HEIGHT = 360;

const GRID_COLOR = 'rgba(255, 255, 255, 0.08)';
const AXIS_COLOR = 'rgba(255, 255, 255, 0.45)';

interface ChartPoint {
  date: string;
  shortLabel: string;
  fullLabel: string;
  value: number;
}

export interface DailyMetricLineChartTheme {
  gradientId: string;
  gradientTop: string;
  gradientBottom: string;
  stroke: string;
  activeDotFill: string;
  brushStroke: string;
  brushFill: string;
}

export interface DailyMetricLineChartLabels {
  defaultDescription: string;
  yAxisLabel: string;
  rangeAriaLabel: string;
  loadingText: string;
  emptyText: string;
  summaryTotalLabel: string;
  formatValue: (value: number) => string;
  formatSummaryValue?: (value: number) => string;
}

interface DailyMetricLineChartProps {
  stats: DailySeriesStats | null;
  loading: boolean;
  error: string | null;
  rangeDays: StatsRangeDays;
  onRangeChange: (days: StatsRangeDays) => void;
  onRefresh: () => void;
  theme: DailyMetricLineChartTheme;
  labels: DailyMetricLineChartLabels;
}

function toChartData(stats: DailySeriesStats): ChartPoint[] {
  return stats.points.map((point) => ({
    date: point.date,
    shortLabel: formatChartAxisLabel(point.date),
    fullLabel: formatChartDayLabel(point.date),
    value: point.value,
  }));
}

function createTooltip(formatValue: (value: number) => string) {
  return function MetricTooltip({ active, payload }: TooltipProps<number, string>) {
    if (!active || !payload?.length) {
      return null;
    }

    const point = payload[0]?.payload as ChartPoint | undefined;
    if (!point) {
      return null;
    }

    return (
      <div className={styles.tooltip}>
        <strong>{point.fullLabel}</strong>
        <span>{formatValue(point.value)}</span>
      </div>
    );
  };
}

function formatSummaryNumber(
  value: number,
  formatSummaryValue: DailyMetricLineChartLabels['formatSummaryValue'],
): string {
  if (formatSummaryValue) {
    return formatSummaryValue(value);
  }
  return String(value);
}

export function DailyMetricLineChart({
  stats,
  loading,
  error,
  rangeDays,
  onRangeChange,
  onRefresh,
  theme,
  labels,
}: DailyMetricLineChartProps) {
  const chartData = useMemo(() => (stats ? toChartData(stats) : []), [stats]);
  const TooltipContent = useMemo(() => createTooltip(labels.formatValue), [labels.formatValue]);

  const summary = useMemo(() => {
    if (!stats || stats.points.length === 0) {
      return { peak: 0, average: 0, total: 0 };
    }
    const values = stats.points.map((point) => point.value);
    const total = values.reduce((sum, value) => sum + value, 0);
    const peak = Math.max(...values);
    const average = Math.round(total / values.length);
    return { peak, average, total };
  }, [stats]);

  const showBrush = rangeDays >= 30;
  const formatSummary = labels.formatSummaryValue ?? labels.formatValue;

  return (
    <Card
      className={styles.root}
      action={
        <Button variant="ghost" size="sm" loading={loading} onClick={onRefresh}>
          Обновить
        </Button>
      }
    >
      <div className={styles.head}>
        <div className={styles.copy}>
          <p className={styles.description}>
            {stats?.description ?? labels.defaultDescription}
          </p>
          {stats ? (
            <p className={styles.meta}>
              Период {formatChartDayLabel(stats.from)} — {formatChartDayLabel(stats.to)} · дни по{' '}
              {stats.timezone}
            </p>
          ) : null}
        </div>
        <div className={styles.rangeSwitch} role="group" aria-label={labels.rangeAriaLabel}>
          {RANGE_OPTIONS.map((days) => (
            <button
              key={days}
              type="button"
              className={days === rangeDays ? styles.rangeBtnActive : styles.rangeBtn}
              onClick={() => onRangeChange(days)}
              aria-pressed={days === rangeDays}
            >
              {days}д
            </button>
          ))}
        </div>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {loading && !stats ? <p className={styles.loading}>{labels.loadingText}</p> : null}

      {!loading && stats && stats.points.length === 0 ? (
        <p className={styles.empty}>{labels.emptyText}</p>
      ) : null}

      {stats && stats.points.length > 0 ? (
        <>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span>Пик за день</span>
              <strong>{formatSummaryNumber(summary.peak, formatSummary)}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>В среднем</span>
              <strong>{formatSummaryNumber(summary.average, formatSummary)}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>{labels.summaryTotalLabel}</span>
              <strong>{formatSummaryNumber(summary.total, formatSummary)}</strong>
            </div>
          </div>

          <div className={styles.chartPanel}>
            <div className={styles.chartViewport}>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 12, right: 8, left: 4, bottom: showBrush ? 4 : 0 }}
                >
                  <defs>
                    <linearGradient id={theme.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.gradientTop} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={theme.gradientBottom} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                    axisLine={{ stroke: GRID_COLOR }}
                    tickLine={false}
                    interval={getXAxisInterval(rangeDays)}
                    minTickGap={getMinTickGap(rangeDays)}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={52}
                    tick={{ fill: AXIS_COLOR, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(
                        Number(value),
                      )
                    }
                    label={{
                      value: labels.yAxisLabel,
                      angle: -90,
                      position: 'insideLeft',
                      fill: AXIS_COLOR,
                      fontSize: 11,
                      dx: 4,
                    }}
                  />
                  <Tooltip
                    content={<TooltipContent />}
                    cursor={{ stroke: theme.stroke, strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    fill={`url(#${theme.gradientId})`}
                    stroke="none"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.stroke}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: theme.stroke, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: theme.activeDotFill, stroke: '#fff', strokeWidth: 1 }}
                  />
                  {showBrush ? (
                    <Brush
                      dataKey="shortLabel"
                      height={28}
                      stroke={theme.brushStroke}
                      fill={theme.brushFill}
                      travellerWidth={10}
                      tickFormatter={(value) => String(value)}
                    />
                  ) : null}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {showBrush ? (
              <p className={styles.hint}>Потяните ползунок под графиком, чтобы выбрать отрезок дат.</p>
            ) : null}
          </div>
        </>
      ) : null}
    </Card>
  );
}
