import { apiFetch } from './client';
import type { CreateTaskPromoCodeTaskPayload, CreatedTaskPromoCodeTask } from '../types/taskPromoCode';

export function createTaskPromoCodeTask(
  payload: CreateTaskPromoCodeTaskPayload,
): Promise<CreatedTaskPromoCodeTask> {
  return apiFetch<CreatedTaskPromoCodeTask>('/v1/admin/task-promo-code-tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
