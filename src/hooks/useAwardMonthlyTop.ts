import { useState } from 'react';
import { awardMonthlyTop } from '../api/monthly_top';
import type { AwardMonthlyTopPayload, AwardMonthlyTopResponse } from '../types/monthly_top';

interface UseAwardMonthlyTopResult {
  award: (payload: AwardMonthlyTopPayload) => Promise<AwardMonthlyTopResponse>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useAwardMonthlyTop(): UseAwardMonthlyTopResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const award = async (payload: AwardMonthlyTopPayload): Promise<AwardMonthlyTopResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await awardMonthlyTop(payload);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Неизвестная ошибка';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setError(null);

  return { award, loading, error, reset };
}
