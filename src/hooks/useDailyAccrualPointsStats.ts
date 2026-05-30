import { useCallback, useEffect, useState } from 'react';
import { getDailyAccrualPointsStats } from '../api/stats';
import type { DailyAccrualPointsStats, StatsRangeDays } from '../types/stats';

export function useDailyAccrualPointsStats(rangeDays: StatsRangeDays) {
  const [stats, setStats] = useState<DailyAccrualPointsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyAccrualPointsStats(rangeDays);
      setStats(data);
    } catch (e) {
      setStats(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
