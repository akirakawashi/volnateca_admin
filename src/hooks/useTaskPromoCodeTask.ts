import { useCallback, useState } from 'react';
import { createTaskPromoCodeTask } from '../api/taskPromoCode';
import type {
  CreateTaskPromoCodeTaskPayload,
  CreatedTaskPromoCodeTask,
} from '../types/taskPromoCode';

export function useTaskPromoCodeTask() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedTaskPromoCodeTask | null>(null);

  const create = useCallback(async (payload: CreateTaskPromoCodeTaskPayload) => {
    setCreating(true);
    setError(null);
    setResult(null);
    try {
      const created = await createTaskPromoCodeTask(payload);
      setResult(created);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    creating,
    error,
    result,
    create,
    resetStatus,
  };
}
