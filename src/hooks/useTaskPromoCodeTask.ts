import { useCallback, useState } from 'react';
import {
  createTaskPromoCodeTask,
  listTaskPromoCodeTasks,
  updateTaskPromoCodeTask,
} from '../api/taskPromoCode';
import type {
  AdminTaskPromoCodeTask,
  CreateTaskPromoCodeTaskPayload,
  UpdateTaskPromoCodeTaskPayload,
} from '../types/taskPromoCode';

function sortTasks(tasks: AdminTaskPromoCodeTask[]): AdminTaskPromoCodeTask[] {
  return [...tasks].sort((left, right) => {
    if (left.can_edit !== right.can_edit) {
      return left.can_edit ? -1 : 1;
    }
    if (left.starts_at !== right.starts_at) {
      if (left.starts_at === null) return 1;
      if (right.starts_at === null) return -1;
      return left.starts_at.localeCompare(right.starts_at);
    }
    return left.tasks_id - right.tasks_id;
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useTaskPromoCodeTask() {
  const [tasks, setTasks] = useState<AdminTaskPromoCodeTask[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTaskPromoCodeTasks();
      setTasks(sortTasks(data));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateTaskPromoCodeTaskPayload) => {
    setCreating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const created = await createTaskPromoCodeTask(payload);
      const data = await listTaskPromoCodeTasks();
      setTasks(sortTasks(data));
      setSuccessMessage(`Задание ${created.task_name} создано с промокодом ${created.promo_code}`);
      return created;
    } catch (e) {
      setError(getErrorMessage(e));
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const update = useCallback(
    async (tasksId: number, payload: UpdateTaskPromoCodeTaskPayload) => {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const updated = await updateTaskPromoCodeTask(tasksId, payload);
        setTasks((prev) =>
          sortTasks(prev ? prev.map((item) => (item.tasks_id === updated.tasks_id ? updated : item)) : [updated]),
        );
        setSuccessMessage(`Задание ${updated.task_name} обновлено`);
        return updated;
      } catch (e) {
        setError(getErrorMessage(e));
        const data = await listTaskPromoCodeTasks().catch(() => null);
        if (data !== null) {
          setTasks(sortTasks(data));
        }
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  const resetStatus = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    tasks,
    loading,
    creating,
    updating,
    error,
    successMessage,
    fetch,
    create,
    update,
    resetStatus,
  };
}
