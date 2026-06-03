import type { DailyNewUsersStats, StatsRangeDays } from '../../types/stats';
import { formatNewUsersCount } from '../../utils/chartFormatting';
import {
  DailyMetricLineChart,
  type DailyMetricLineChartLabels,
  type DailyMetricLineChartTheme,
} from './DailyMetricLineChart';

const THEME: DailyMetricLineChartTheme = {
  gradientId: 'growthLineGradient',
  gradientTop: 'rgba(110, 231, 168, 0.28)',
  gradientBottom: 'rgba(110, 231, 168, 0.02)',
  stroke: '#6ee7a8',
  activeDotFill: '#8ef0b8',
  brushStroke: '#6ee7a8',
  brushFill: 'rgba(110, 231, 168, 0.06)',
};

const LABELS: DailyMetricLineChartLabels = {
  defaultDescription: 'Число регистраций в боте за календарный день.',
  yAxisLabel: 'Участники',
  rangeAriaLabel: 'Период регистраций',
  loadingText: 'Загрузка регистраций…',
  emptyText: 'За выбранный период регистраций не было.',
  summaryTotalLabel: 'Всего за период',
  formatValue: formatNewUsersCount,
};

interface DailyNewUsersChartProps {
  stats: DailyNewUsersStats | null;
  loading: boolean;
  error: string | null;
  rangeDays: StatsRangeDays;
  onRangeChange: (days: StatsRangeDays) => void;
  onRefresh: () => void;
}

export function DailyNewUsersChart(props: DailyNewUsersChartProps) {
  return <DailyMetricLineChart {...props} theme={THEME} labels={LABELS} />;
}
