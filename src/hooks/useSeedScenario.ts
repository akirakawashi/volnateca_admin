// TODO DEV: удалить hooks/useSeedScenario.ts перед релизом — только для локальной отладки.

import { useCallback } from 'react';
import { seedDevScenario, type SeedDevScenarioPayload } from '../api/dev';
import { useAsyncAction } from './useAsyncAction';

interface UseSeedScenarioResult {
  seed: (payload: SeedDevScenarioPayload) => Promise<string[]>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useSeedScenario(): UseSeedScenarioResult {
  const seedAction = useCallback(async (payload: SeedDevScenarioPayload): Promise<string[]> => {
    const result = await seedDevScenario(payload);
    return result.messages;
  }, []);

  const { run: seed, loading, error, reset } = useAsyncAction(seedAction, {
    rethrow: true,
    unknownErrorMessage: 'Неизвестная ошибка',
  });

  return { seed, loading, error, reset };
}
