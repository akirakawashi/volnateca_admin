import { useMemo, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts';
import { Alert } from '../ui/Alert/Alert';
import { Button } from '../ui/Button/Button';
import { Card } from '../ui/Card/Card';
import type { AccrualSourcesStats, StatsRangeDays } from '../../types/stats';
import {
  formatAccrualShare,
  getAccrualSourceColor,
  getAccrualSourceLabel,
} from '../../utils/accrualSourceLabels';
import { formatChartDayLabel, formatPointsAmount } from '../../utils/chartFormatting';
import styles from './DailyMetricChart.module.css';
import pieStyles from './AccrualSourcesPieChart.module.css';

const RANGE_OPTIONS: StatsRangeDays[] = [7, 30, 90];
const CHART_HEIGHT = 320;

interface PieSegment {
  source: string;
  label: string;
  value: number;
  color: string;
}

interface AccrualSourcesPieChartProps {
  stats: AccrualSourcesStats | null;
  loading: boolean;
  error: string | null;
  rangeDays: StatsRangeDays;
  onRangeChange: (days: StatsRangeDays) => void;
  onRefresh: () => void;
}

function toPieData(stats: AccrualSourcesStats): PieSegment[] {
  return stats.segments.map((segment) => ({
    source: segment.source,
    label: getAccrualSourceLabel(segment.source),
    value: segment.value,
    color: getAccrualSourceColor(segment.source),
  }));
}

export function AccrualSourcesPieChart({
  stats,
  loading,
  error,
  rangeDays,
  onRangeChange,
  onRefresh,
}: AccrualSourcesPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartData = useMemo(() => (stats ? toPieData(stats) : []), [stats]);

  const topSegment = chartData[0] ?? null;
  const total = stats?.total ?? 0;
  const activeSegment = activeIndex !== null ? (chartData[activeIndex] ?? null) : null;

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
            {stats?.description ??
              'Доля начисленных баллов по бизнес-причинам за выбранный период.'}
          </p>
          {stats ? (
            <p className={styles.meta}>
              Период {formatChartDayLabel(stats.from)} — {formatChartDayLabel(stats.to)} · дни по{' '}
              {stats.timezone}
            </p>
          ) : null}
        </div>
        <div className={styles.rangeSwitch} role="group" aria-label="Период источников начислений">
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

      {loading && !stats ? <p className={styles.loading}>Загрузка источников…</p> : null}

      {!loading && stats && stats.segments.length === 0 ? (
        <p className={styles.empty}>За выбранный период начислений не было.</p>
      ) : null}

      {stats && stats.segments.length > 0 ? (
        <>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span>Всего начислено</span>
              <strong>{formatPointsAmount(total)}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Источников</span>
              <strong>{stats.segments.length}</strong>
            </div>
            {topSegment ? (
              <div className={styles.summaryItem}>
                <span>Лидер</span>
                <strong>{topSegment.label}</strong>
              </div>
            ) : null}
          </div>

          <div className={styles.chartPanel}>
            <div className={pieStyles.layout}>
              <div className={pieStyles.pieViewport}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={2}
                      stroke="none"
                      isAnimationActive={false}
                      activeIndex={activeIndex ?? undefined}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {chartData.map((segment) => (
                        <Cell key={segment.source} fill={segment.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div
                  className={[
                    pieStyles.centerLabel,
                    activeSegment ? pieStyles.centerLabelActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {activeSegment ? (
                    <>
                      <span className={pieStyles.centerEyebrow}>{activeSegment.label}</span>
                      <strong>{formatPointsAmount(activeSegment.value)}</strong>
                      <span className={pieStyles.centerShare}>
                        {formatAccrualShare(activeSegment.value, total)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={pieStyles.centerEyebrow}>Всего</span>
                      <strong>{formatPointsAmount(total)}</strong>
                    </>
                  )}
                </div>
              </div>

              <ul className={pieStyles.legend} aria-label="Источники начислений">
                {chartData.map((segment) => (
                  <li key={segment.source} className={pieStyles.legendItem}>
                    <div className={pieStyles.legendMain}>
                      <span
                        className={pieStyles.legendSwatch}
                        style={{ backgroundColor: segment.color }}
                        aria-hidden
                      />
                      <span className={pieStyles.legendLabel}>{segment.label}</span>
                    </div>
                    <div className={pieStyles.legendMeta}>
                      <span className={pieStyles.legendValue}>{formatPointsAmount(segment.value)}</span>
                      <span className={pieStyles.legendShare}>
                        {formatAccrualShare(segment.value, total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}
