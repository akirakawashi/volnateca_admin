import { z } from 'zod';
import { extractVkPhotoAttachment } from '../../utils/vkAttachments';

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
    image_attachment: z
      .string()
      .optional()
      .refine(
        (value) => !value || extractVkPhotoAttachment(value) !== null,
        'Не удалось распознать VK attachment изображения',
      ),
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

export const taskPromoCodeEditFormSchema = z.object({
  description: z.string().optional(),
  image_attachment: z
    .string()
    .optional()
    .refine(
      (value) => !value || extractVkPhotoAttachment(value) !== null,
      'Не удалось распознать VK attachment изображения',
    ),
});

export type TaskPromoCodeEditFormValues = z.infer<typeof taskPromoCodeEditFormSchema>;

export const defaultTaskPromoCodeFormValues: TaskPromoCodeFormValues = {
  task_name: 'Партнёр: промокод',
  description:
    'Вставьте текст партнера, который отобразится в его задании.',
  points: 15,
  week_number: null,
  starts_at: '',
  ends_at: '',
  promo_code: '',
  image_attachment: '',
};
