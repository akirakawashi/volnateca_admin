import { z } from 'zod';
import {
  ADMIN_MANUAL_PRIZE_STATUSES,
  ADMIN_PRIZE_TYPES,
  type PrizeStatus,
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
  status: z.enum(ADMIN_MANUAL_PRIZE_STATUSES),
  cost_points: z.number().int().positive('Стоимость должна быть больше 0'),
  quantity_total: z.number().int().positive('Укажите количество не меньше 1'),
  required_level: z.number().int().min(1).max(4).nullable().optional(),
  sort_order: z.number().int().min(0, 'sort_order не может быть отрицательным'),
});

export type PrizeFormValues = z.infer<typeof prizeFormSchema>;

export const prizeEditFormSchema = prizeFormSchema.omit({ prize_type: true });

export type PrizeEditFormValues = z.infer<typeof prizeEditFormSchema>;

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
};

export function mapPrizeToEditFormValues(prize: {
  prize_name: string;
  description: string | null;
  image_attachment: string | null;
  status: PrizeStatus;
  cost_points: number;
  quantity_total: number | null;
  required_level: number | null;
  sort_order: number;
}): PrizeEditFormValues {
  return {
    prize_name: prize.prize_name,
    description: prize.description ?? '',
    image_attachment: prize.image_attachment ?? '',
    status: prize.status === 'hidden' ? 'hidden' : 'available',
    cost_points: prize.cost_points,
    quantity_total: prize.quantity_total ?? 1,
    required_level: prize.required_level,
    sort_order: prize.sort_order,
  };
}
