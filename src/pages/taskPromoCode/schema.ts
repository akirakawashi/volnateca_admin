import { z } from 'zod';

export function normalizePromoCode(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

export const taskPromoCodeFormSchema = z
  .object({
    task_name: z.string().min(1, 'Название обязательно'),
    description: z.string().optional(),
    points: z.number().int().positive('Очки должны быть > 0'),
    week_number: z.number().int().min(1).max(12).nullable().optional(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    promo_code: z.string().min(1, 'Добавь промокод'),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) return new Date(data.starts_at) < new Date(data.ends_at);
      return true;
    },
    { message: 'starts_at должно быть раньше ends_at', path: ['ends_at'] },
  )
  .refine((data) => normalizePromoCode(data.promo_code).length > 0, {
    message: 'Добавь непустой промокод',
    path: ['promo_code'],
  });

export type TaskPromoCodeFormValues = z.infer<typeof taskPromoCodeFormSchema>;

export const defaultTaskPromoCodeFormValues: TaskPromoCodeFormValues = {
  task_name: 'Меняйка: обмен ГБ на промокод',
  description: '',
  points: 15,
  week_number: null,
  starts_at: '',
  ends_at: '',
  promo_code: '',
};
