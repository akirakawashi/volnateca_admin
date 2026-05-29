import { apiFetch } from './client';
import type {
  CreateTaskPromoCodeTaskPayload,
  CreatedTaskPromoCodeTask,
  TaskPromoCodeStats,
} from '../types/taskPromoCode';

export function createTaskPromoCodeTask(
  payload: CreateTaskPromoCodeTaskPayload,
): Promise<CreatedTaskPromoCodeTask> {
  return apiFetch<CreatedTaskPromoCodeTask>('/v1/admin/task-promo-code-tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getTaskPromoCodeStats(tasksId: number): Promise<TaskPromoCodeStats> {
  return apiFetch<TaskPromoCodeStats>(`/v1/admin/task-promo-code-tasks/${tasksId}/stats`);
}
