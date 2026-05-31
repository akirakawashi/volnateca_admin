import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { listPrizeRedemptions } from '../api/prizeRedemptions';
import { REDEMPTIONS_PAGE_SIZE } from '../utils/prizeRedemption';
import { RedemptionQueueContext } from './redemptionQueue';

export function RedemptionQueueProvider({ children }: { children: ReactNode }) {
  const [queueCount, setQueueCount] = useState<number | null>(null);
  const [queueCountCapped, setQueueCountCapped] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshQueueCount = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPrizeRedemptions({ status: 'reserved', page: 1 });
      setQueueCount(data.length);
      setQueueCountCapped(data.length >= REDEMPTIONS_PAGE_SIZE);
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
