export interface CreateTaskPromoCodeTaskPayload {
  code: string | null;
  task_name: string;
  description: string | null;
  points: number;
  week_number: number | null;
  starts_at: string | null;
  ends_at: string | null;
  promo_code: string;
  image_attachment: string | null;
}

export interface CreatedTaskPromoCodeTask {
  tasks_id: number;
  code: string;
  task_name: string;
  promo_code: string;
}

export interface AdminTaskPromoCodeTask {
  tasks_id: number;
  code: string;
  task_name: string;
  description: string | null;
  points: number;
  week_number: number | null;
  starts_at: string | null;
  ends_at: string | null;
  promo_code: string;
  image_attachment: string | null;
  can_edit: boolean;
}

export interface UpdateTaskPromoCodeTaskPayload {
  description?: string | null;
  image_attachment?: string | null;
}
