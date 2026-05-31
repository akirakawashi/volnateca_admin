import { useCallback, useEffect, useState } from 'react';
import { getDailyNewUsersStats } from '../api/stats';
import type { DailyNewUsersStats, StatsRangeDays } from '../types/stats';

export function useDailyNewUsersStats(rangeDays: StatsRangeDays) {
  const [stats, setStats] = useState<DailyNewUsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyNewUsersStats(rangeDays);
      setStats(data);
    } catch (e) {
      setStats(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchStats();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
