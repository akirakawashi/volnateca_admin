import { createTaskPromoCodeTask } from '../api/taskPromoCode';
import type {
  CreateTaskPromoCodeTaskPayload,
  CreatedTaskPromoCodeTask,
} from '../types/taskPromoCode';
import { useAsyncAction } from './useAsyncAction';

export function useTaskPromoCodeTask() {
  const {
    run: create,
    loading: creating,
    error,
    result,
    reset: resetStatus,
  } = useAsyncAction<[CreateTaskPromoCodeTaskPayload], CreatedTaskPromoCodeTask>(createTaskPromoCodeTask);

  return {
    creating,
    error,
    result,
    create,
    resetStatus,
  };
}
