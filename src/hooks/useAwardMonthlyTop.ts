import { useState } from 'react';
import { awardMonthlyTop, type AwardMonthlyTopPayload } from '../api/dev';

interface UseAwardMonthlyTopResult {
  award: (payload: AwardMonthlyTopPayload) => Promise<string[]>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useAwardMonthlyTop(): UseAwardMonthlyTopResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const award = async (payload: AwardMonthlyTopPayload): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await awardMonthlyTop(payload);
      return result.messages;
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
