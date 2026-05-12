import { useState } from 'react';
import { truncateDB } from '../api/db';

// TODO: удалить useTruncateDB и api/db.ts перед релизом — только для локальной отладки.
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
