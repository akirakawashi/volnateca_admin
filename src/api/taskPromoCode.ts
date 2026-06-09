import { apiFetch } from './client';
import type {
  AdminTaskPromoCodeTask,
  CreateTaskPromoCodeTaskPayload,
  CreatedTaskPromoCodeTask,
  UpdateTaskPromoCodeTaskPayload,
} from '../types/taskPromoCode';

export function listTaskPromoCodeTasks(): Promise<AdminTaskPromoCodeTask[]> {
  return apiFetch<AdminTaskPromoCodeTask[]>('/v1/admin/task-promo-code-tasks');
}

export function createTaskPromoCodeTask(
  payload: CreateTaskPromoCodeTaskPayload,
): Promise<CreatedTaskPromoCodeTask> {
  return apiFetch<CreatedTaskPromoCodeTask>('/v1/admin/task-promo-code-tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTaskPromoCodeTask(
  tasksId: number,
  payload: UpdateTaskPromoCodeTaskPayload,
): Promise<AdminTaskPromoCodeTask> {
  return apiFetch<AdminTaskPromoCodeTask>(`/v1/admin/task-promo-code-tasks/${tasksId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
