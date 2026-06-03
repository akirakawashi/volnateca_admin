import { apiFetch } from './client';
import type {
  DailyAccrualPointsStats,
  DailyActivityStats,
  DailyNewUsersStats,
  StatsRangeDays,
} from '../types/stats';

function fetchDailyStats<T>(path: string, days: StatsRangeDays): Promise<T> {
  const search = new URLSearchParams({ days: String(days) });
  return apiFetch<T>(`${path}?${search.toString()}`);
}

export function getDailyActivityStats(days: StatsRangeDays): Promise<DailyActivityStats> {
  return fetchDailyStats<DailyActivityStats>('/v1/admin/stats/daily-activity', days);
}

export function getDailyNewUsersStats(days: StatsRangeDays): Promise<DailyNewUsersStats> {
  return fetchDailyStats<DailyNewUsersStats>('/v1/admin/stats/daily-new-users', days);
}

export function getDailyAccrualPointsStats(days: StatsRangeDays): Promise<DailyAccrualPointsStats> {
  return fetchDailyStats<DailyAccrualPointsStats>('/v1/admin/stats/daily-accrual-points', days);
}
