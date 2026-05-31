import { useCallback, useEffect, useState } from 'react';
import { getDailyActivityStats } from '../api/stats';
import type { DailyActivityStats, StatsRangeDays } from '../types/stats';

export function useDailyActivityStats(rangeDays: StatsRangeDays) {
  const [stats, setStats] = useState<DailyActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyActivityStats(rangeDays);
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
