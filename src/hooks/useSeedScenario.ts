// TODO DEV: удалить hooks/useSeedScenario.ts перед релизом — только для локальной отладки.

import { useState } from 'react';
import { seedDevScenario, type SeedDevScenarioPayload } from '../api/dev';

interface UseSeedScenarioResult {
  seed: (payload: SeedDevScenarioPayload) => Promise<string[]>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useSeedScenario(): UseSeedScenarioResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seed = async (payload: SeedDevScenarioPayload): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await seedDevScenario(payload);
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

  return { seed, loading, error, reset };
}
