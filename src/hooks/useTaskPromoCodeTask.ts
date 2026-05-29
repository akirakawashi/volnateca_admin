import { useCallback, useState } from 'react';
import { createTaskPromoCodeTask, getTaskPromoCodeStats } from '../api/taskPromoCode';
import type {
  CreateTaskPromoCodeTaskPayload,
  CreatedTaskPromoCodeTask,
  TaskPromoCodeStats,
} from '../types/taskPromoCode';

export function useTaskPromoCodeTask() {
  const [creating, setCreating] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedTaskPromoCodeTask | null>(null);
  const [stats, setStats] = useState<TaskPromoCodeStats | null>(null);

  const create = useCallback(async (payload: CreateTaskPromoCodeTaskPayload) => {
    setCreating(true);
    setError(null);
    setResult(null);
    setStats(null);
    try {
      const created = await createTaskPromoCodeTask(payload);
      setResult(created);
      const createdStats = await getTaskPromoCodeStats(created.tasks_id);
      setStats(createdStats);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const fetchStats = useCallback(async (tasksId: number) => {
    setLoadingStats(true);
    setError(null);
    try {
      const nextStats = await getTaskPromoCodeStats(tasksId);
      setStats(nextStats);
      return nextStats;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    creating,
    loadingStats,
    error,
    result,
    stats,
    create,
    fetchStats,
    resetStatus,
  };
}
