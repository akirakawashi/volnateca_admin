// TODO DEV: удалить hooks/useSeedStorePrizes.ts перед релизом — только для локальной отладки.

import { useState } from 'react';
import { seedStorePrizes } from '../api/dev';

interface UseSeedStorePrizesResult {
  seedStore: () => Promise<string[]>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useSeedStorePrizes(): UseSeedStorePrizesResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seedStore = async (): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await seedStorePrizes();
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

  return { seedStore, loading, error, reset };
}
