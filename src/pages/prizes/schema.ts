import { z } from 'zod';
import { ADMIN_PRIZE_STATUSES, ADMIN_PRIZE_TYPES } from '../../types/prize';
import { extractVkPhotoAttachment } from '../../utils/vkAttachments';

export const prizeFormSchema = z.object({
  prize_name: z.string().min(1, 'Название приза обязательно'),
  description: z.string().optional(),
  image_attachment: z
    .string()
    .optional()
    .refine(
      (value) => !value || extractVkPhotoAttachment(value) !== null,
      'Не удалось распознать VK attachment изображения',
    ),
  prize_type: z.enum(ADMIN_PRIZE_TYPES),
  status: z.enum(ADMIN_PRIZE_STATUSES),
  cost_points: z.number().int().positive('Стоимость должна быть больше 0'),
  quantity_total: z.number().int().positive('Укажите количество не меньше 1'),
  required_level: z.number().int().min(1).max(4).nullable().optional(),
  sort_order: z.number().int().min(0, 'sort_order не может быть отрицательным'),
  is_active: z.boolean(),
});

export type PrizeFormValues = z.infer<typeof prizeFormSchema>;

export const defaultPrizeFormValues: PrizeFormValues = {
  prize_name: '',
  description: '',
  image_attachment: '',
  prize_type: 'merch',
  status: 'available',
  cost_points: 60,
  quantity_total: 10,
  required_level: null,
  sort_order: 0,
  is_active: true,
};
