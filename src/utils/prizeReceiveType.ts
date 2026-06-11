import type { PrizeReceiveType } from '../types/prize';

const RECEIVE_TYPE_LABELS: Record<PrizeReceiveType, string> = {
  pickup: 'Самовывоз',
  promo_code: 'Промокод в VK',
  manager_contact: 'Выдача менеджером',
};

export function formatReceiveType(value: string): string {
  if (value in RECEIVE_TYPE_LABELS) {
    return RECEIVE_TYPE_LABELS[value as PrizeReceiveType];
  }
  return value;
}
