export interface DailyStatPoint {
  date: string;
  value: number;
}

export interface DailySeriesStats {
  timezone: string;
  from: string;
  to: string;
  description: string;
  points: DailyStatPoint[];
}

export interface DailyActivityStats extends DailySeriesStats {
  metric: 'active_users';
  label: string;
}

export interface DailyNewUsersStats extends DailySeriesStats {
  metric: 'new_users';
  label: string;
}

export interface DailyAccrualPointsStats extends DailySeriesStats {
  metric: 'accrual_points';
  label: string;
}

export type StatsRangeDays = 7 | 30 | 90;
