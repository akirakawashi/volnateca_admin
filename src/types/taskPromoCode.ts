export type TaskRepeatPolicy = 'once' | 'daily' | 'weekly';

export interface CreateTaskPromoCodeTaskPayload {
  code: string | null;
  task_name: string;
  description: string | null;
  points: number;
  week_number: number | null;
  starts_at: string | null;
  ends_at: string | null;
  repeat_policy: TaskRepeatPolicy;
  promo_codes: string[];
}

export interface CreatedTaskPromoCodeTask {
  tasks_id: number;
  code: string;
  task_name: string;
  promo_codes_total: number;
}

export interface TaskPromoCodeStats {
  tasks_id: number;
  total_count: number;
  available_count: number;
  used_count: number;
}
