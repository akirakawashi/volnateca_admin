import { createContext, useContext } from 'react';

export interface RedemptionQueueContextValue {
  queueCount: number | null;
  queueCountCapped: boolean;
  loading: boolean;
  refreshQueueCount: () => Promise<void>;
}

export const RedemptionQueueContext = createContext<RedemptionQueueContextValue | null>(null);

export function useRedemptionQueue(): RedemptionQueueContextValue {
  const context = useContext(RedemptionQueueContext);
  if (!context) {
    throw new Error('useRedemptionQueue must be used within RedemptionQueueProvider');
  }
  return context;
}
