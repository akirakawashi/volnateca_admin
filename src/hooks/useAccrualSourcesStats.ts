import { useCallback, useEffect, useState } from 'react';
import { getAccrualSourcesStats } from '../api/stats';
import type { AccrualSourcesStats, StatsRangeDays } from '../types/stats';

export function useAccrualSourcesStats(rangeDays: StatsRangeDays) {
  const [stats, setStats] = useState<AccrualSourcesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAccrualSourcesStats(rangeDays);
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
