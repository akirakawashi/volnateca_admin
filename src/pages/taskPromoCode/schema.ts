import { z } from 'zod';

export const repeatPolicies = ['once', 'daily', 'weekly'] as const;

export function parsePromoCodes(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim().replace(/\s+/g, '').toUpperCase())
    .filter(Boolean);
}

export const taskPromoCodeFormSchema = z
  .object({
    code: z.string().optional(),
    task_name: z.string().min(1, 'Название обязательно'),
    description: z.string().optional(),
    points: z.number().int().positive('Очки должны быть > 0'),
    week_number: z.number().int().min(1).max(12).nullable().optional(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    repeat_policy: z.enum(repeatPolicies),
    promo_codes_text: z.string().min(1, 'Добавь хотя бы один промокод'),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) return new Date(data.starts_at) < new Date(data.ends_at);
      return true;
    },
    { message: 'starts_at должно быть раньше ends_at', path: ['ends_at'] },
  )
  .refine((data) => parsePromoCodes(data.promo_codes_text).length > 0, {
    message: 'Добавь хотя бы один непустой промокод',
    path: ['promo_codes_text'],
  })
  .refine(
    (data) => {
      const codes = parsePromoCodes(data.promo_codes_text);
      return new Set(codes).size === codes.length;
    },
    { message: 'В списке есть дубликаты промокодов', path: ['promo_codes_text'] },
  );

export type TaskPromoCodeFormValues = z.infer<typeof taskPromoCodeFormSchema>;

export const defaultTaskPromoCodeFormValues: TaskPromoCodeFormValues = {
  code: '',
  task_name: 'Меняйка: обмен ГБ на промокод',
  description: '',
  points: 15,
  week_number: null,
  starts_at: '',
  ends_at: '',
  repeat_policy: 'once',
  promo_codes_text: '',
};
