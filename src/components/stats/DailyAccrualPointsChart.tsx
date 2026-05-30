import type { DailyAccrualPointsStats, StatsRangeDays } from '../../types/stats';
import { formatPointsAmount } from '../../utils/chartFormatting';
import {
  DailyMetricLineChart,
  type DailyMetricLineChartLabels,
  type DailyMetricLineChartTheme,
} from './DailyMetricLineChart';

const THEME: DailyMetricLineChartTheme = {
  gradientId: 'economyAreaGradient',
  gradientTop: '#ffd27a',
  gradientBottom: '#e8a030',
  stroke: '#ffc857',
  activeDotFill: '#ffe08a',
  brushStroke: '#ffc857',
  brushFill: 'rgba(255, 200, 87, 0.1)',
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
