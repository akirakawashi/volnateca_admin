// TODO DEV: удалить hooks/useTruncateDB.ts перед релизом — truncate только для локальной отладки.

import { useCallback } from 'react';
import { truncateDB } from '../api/db';
import { useAsyncAction } from './useAsyncAction';

interface UseTruncateDBResult {
  truncate: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export function useTruncateDB(): UseTruncateDBResult {
  const truncateAction = useCallback(async (): Promise<boolean> => {
    await truncateDB();
    return true;
  }, []);

  const { run, loading, error, reset } = useAsyncAction(truncateAction, {
    unknownErrorMessage: 'Неизвестная ошибка',
  });

  const truncate = useCallback(async (): Promise<boolean> => {
    return (await run()) ?? false;
  }, [run]);

  return { truncate, loading, error, reset };
}
