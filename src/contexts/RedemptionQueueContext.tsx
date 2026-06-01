import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getPrizeRedemptionQueueCount } from '../api/prizeRedemptions';
import { RedemptionQueueContext } from './redemptionQueue';

export function RedemptionQueueProvider({ children }: { children: ReactNode }) {
  const [queueCount, setQueueCount] = useState<number | null>(null);
  const [queueCountCapped, setQueueCountCapped] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshQueueCount = useCallback(async () => {
    setLoading(true);
    try {
      const count = await getPrizeRedemptionQueueCount();
      setQueueCount(count);
      setQueueCountCapped(false);
    } catch {
      setQueueCount(null);
      setQueueCountCapped(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshQueueCount();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshQueueCount]);

  const value = useMemo(
    () => ({
      queueCount,
      queueCountCapped,
      loading,
      refreshQueueCount,
    }),
    [queueCount, queueCountCapped, loading, refreshQueueCount],
  );

  return (
    <RedemptionQueueContext.Provider value={value}>{children}</RedemptionQueueContext.Provider>
  );
}
