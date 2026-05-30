import type { DailyNewUsersStats, StatsRangeDays } from '../../types/stats';
import { formatNewUsersCount } from '../../utils/chartFormatting';
import {
  DailyMetricLineChart,
  type DailyMetricLineChartLabels,
  type DailyMetricLineChartTheme,
} from './DailyMetricLineChart';

const THEME: DailyMetricLineChartTheme = {
  gradientId: 'growthLineGradient',
  gradientTop: '#8ef0b8',
  gradientBottom: '#3eb87a',
  stroke: '#7cf2ae',
  activeDotFill: '#b4f5d0',
  brushStroke: '#7cf2ae',
  brushFill: 'rgba(124, 242, 174, 0.1)',
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
