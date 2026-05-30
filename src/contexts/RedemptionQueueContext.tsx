import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { listPrizeRedemptions } from '../api/prizeRedemptions';
import { REDEMPTIONS_PAGE_SIZE } from '../utils/prizeRedemption';

interface RedemptionQueueContextValue {
  queueCount: number | null;
  queueCountCapped: boolean;
  loading: boolean;
  refreshQueueCount: () => Promise<void>;
}

const RedemptionQueueContext = createContext<RedemptionQueueContextValue | null>(null);

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
    void refreshQueueCount();
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

export function useRedemptionQueue(): RedemptionQueueContextValue {
  const context = useContext(RedemptionQueueContext);
  if (!context) {
    throw new Error('useRedemptionQueue must be used within RedemptionQueueProvider');
  }
  return context;
}
