import type { PrizeReceiveType } from '../types/prize';

const RECEIVE_TYPE_LABELS: Record<PrizeReceiveType, string> = {
  pickup: 'Самовывоз',
  manager_contact: 'Связь с менеджером',
};

export function formatReceiveType(value: string): string {
  if (value in RECEIVE_TYPE_LABELS) {
    return RECEIVE_TYPE_LABELS[value as PrizeReceiveType];
  }
  return value;
}

export const receiveTypeOptions = (Object.entries(RECEIVE_TYPE_LABELS) as [PrizeReceiveType, string][]).map(
  ([value, label]) => ({ value, label }),
);
