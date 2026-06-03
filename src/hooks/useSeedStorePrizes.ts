// TODO DEV: удалить hooks/useSeedStorePrizes.ts перед релизом — только для локальной отладки.

import { useCallback } from 'react';
import { seedStorePrizes } from '../api/dev';
import { useAsyncAction } from './useAsyncAction';

interface UseSeedStorePrizesResult {
  seedStore: () => Promise<string[]>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useSeedStorePrizes(): UseSeedStorePrizesResult {
  const seedStoreAction = useCallback(async (): Promise<string[]> => {
    const result = await seedStorePrizes();
    return result.messages;
  }, []);

  const { run: seedStore, loading, error, reset } = useAsyncAction(seedStoreAction, {
    rethrow: true,
    unknownErrorMessage: 'Неизвестная ошибка',
  });

  return { seedStore, loading, error, reset };
}
