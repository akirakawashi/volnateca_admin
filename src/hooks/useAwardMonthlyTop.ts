import { awardMonthlyTop } from '../api/monthly_top';
import type { AwardMonthlyTopPayload, AwardMonthlyTopResponse } from '../types/monthly_top';
import { useAsyncAction } from './useAsyncAction';

interface UseAwardMonthlyTopResult {
  award: (payload: AwardMonthlyTopPayload) => Promise<AwardMonthlyTopResponse>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useAwardMonthlyTop(): UseAwardMonthlyTopResult {
  const { run: award, loading, error, reset } = useAsyncAction(awardMonthlyTop, {
    rethrow: true,
    unknownErrorMessage: 'Неизвестная ошибка',
  });

  return { award, loading, error, reset };
}
