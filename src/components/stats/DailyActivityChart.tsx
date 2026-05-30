import type { DailyActivityStats, StatsRangeDays } from '../../types/stats';
import { formatUsersCount } from '../../utils/chartFormatting';
import {
  DailyMetricLineChart,
  type DailyMetricLineChartLabels,
  type DailyMetricLineChartTheme,
} from './DailyMetricLineChart';

const THEME: DailyMetricLineChartTheme = {
  gradientId: 'activityLineGradient',
  gradientTop: '#a7b6ff',
  gradientBottom: '#6b7fe6',
  stroke: '#8b9dff',
  activeDotFill: '#b8c4ff',
  brushStroke: '#8b9dff',
  brushFill: 'rgba(139, 157, 255, 0.08)',
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
