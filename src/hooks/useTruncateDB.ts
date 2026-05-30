// TODO DEV: удалить hooks/useTruncateDB.ts перед релизом — truncate только для локальной отладки.

import { useState } from 'react';
import { truncateDB } from '../api/db';

interface UseTruncateDBResult {
  truncate: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useTruncateDB(): UseTruncateDBResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const truncate = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await truncateDB();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setError(null);

  return { truncate, loading, error, reset };
}
