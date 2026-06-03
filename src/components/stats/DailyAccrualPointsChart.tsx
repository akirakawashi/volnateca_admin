import type { DailyAccrualPointsStats, StatsRangeDays } from '../../types/stats';
import { formatPointsAmount } from '../../utils/chartFormatting';
import {
  DailyMetricLineChart,
  type DailyMetricLineChartLabels,
  type DailyMetricLineChartTheme,
} from './DailyMetricLineChart';

const THEME: DailyMetricLineChartTheme = {
  gradientId: 'economyAreaGradient',
  gradientTop: 'rgba(251, 191, 36, 0.28)',
  gradientBottom: 'rgba(251, 191, 36, 0.02)',
  stroke: '#fbbf24',
  activeDotFill: '#fcd34d',
  brushStroke: '#fbbf24',
  brushFill: 'rgba(251, 191, 36, 0.06)',
};

const LABELS: DailyMetricLineChartLabels = {
  defaultDescription:
    'Сумма всех начислений баллов за календарный день — объём «раздачи» экономики проекта.',
  yAxisLabel: 'Баллы',
  rangeAriaLabel: 'Период начислений',
  loadingText: 'Загрузка начислений…',
  emptyText: 'За выбранный период начислений не было.',
  summaryTotalLabel: 'Всего за период',
  formatValue: formatPointsAmount,
  formatSummaryValue: formatPointsAmount,
};

interface DailyAccrualPointsChartProps {
  stats: DailyAccrualPointsStats | null;
  loading: boolean;
  error: string | null;
  rangeDays: StatsRangeDays;
  onRangeChange: (days: StatsRangeDays) => void;
  onRefresh: () => void;
}

export function DailyAccrualPointsChart(props: DailyAccrualPointsChartProps) {
  return <DailyMetricLineChart {...props} theme={THEME} labels={LABELS} />;
}
