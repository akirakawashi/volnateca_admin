import { z } from 'zod';
import {
  ADMIN_PRIZE_STATUSES,
  ADMIN_PRIZE_TYPES,
  ADMIN_RECEIVE_TYPES,
} from '../../types/prize';
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
  receive_type: z.enum(ADMIN_RECEIVE_TYPES),
  status: z.enum(ADMIN_PRIZE_STATUSES),
  cost_points: z.number().int().positive('Стоимость должна быть больше 0'),
  quantity_total: z.number().int().positive('Количество должно быть больше 0').nullable().optional(),
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
  receive_type: 'pickup',
  status: 'available',
  cost_points: 60,
  quantity_total: null,
  required_level: null,
  sort_order: 0,
  is_active: true,
};
