const RECEIVE_TYPE_LABELS: Record<string, string> = {
  pickup: 'Самовывоз',
  promo_code: 'Код в VK',
  manager_contact: 'Выдача менеджером',
};

export function formatReceiveType(value: string): string {
  if (value in RECEIVE_TYPE_LABELS) {
    return RECEIVE_TYPE_LABELS[value];
  }
  return value;
}
