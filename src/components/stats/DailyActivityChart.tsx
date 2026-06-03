import type { DailyActivityStats, StatsRangeDays } from '../../types/stats';
import { formatUsersCount } from '../../utils/chartFormatting';
import {
  DailyMetricLineChart,
  type DailyMetricLineChartLabels,
  type DailyMetricLineChartTheme,
} from './DailyMetricLineChart';

const THEME: DailyMetricLineChartTheme = {
  gradientId: 'activityLineGradient',
  gradientTop: 'rgba(139, 147, 255, 0.28)',
  gradientBottom: 'rgba(139, 147, 255, 0.02)',
  stroke: '#8b93ff',
  activeDotFill: '#a5adff',
  brushStroke: '#8b93ff',
  brushFill: 'rgba(139, 147, 255, 0.06)',
};

const LABELS: DailyMetricLineChartLabels = {
  defaultDescription:
    'Уникальные пользователи с хотя бы одним начислением баллов за календарный день.',
  yAxisLabel: 'Пользователи',
  rangeAriaLabel: 'Период активности',
  loadingText: 'Загрузка активности…',
  emptyText: 'За выбранный период начислений не было.',
  summaryTotalLabel: 'Сумма по дням',
  formatValue: formatUsersCount,
};

interface DailyActivityChartProps {
  stats: DailyActivityStats | null;
  loading: boolean;
  error: string | null;
  rangeDays: StatsRangeDays;
  onRangeChange: (days: StatsRangeDays) => void;
  onRefresh: () => void;
}

export function DailyActivityChart(props: DailyActivityChartProps) {
  return <DailyMetricLineChart {...props} theme={THEME} labels={LABELS} />;
}
