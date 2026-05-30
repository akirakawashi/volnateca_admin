import type { AdminPrizeRedemption, PrizeRedemptionStatus } from '../types/prizeRedemption';

export const REDEMPTIONS_PAGE_SIZE = 50;

export function normalizeRedemptionCodeQuery(value: string): string {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

export function matchesRedemptionSearch(
  redemption: AdminPrizeRedemption,
  rawQuery: string,
): boolean {
  const query = normalizeRedemptionCodeQuery(rawQuery);
  if (!query) {
    return true;
  }

  const code = normalizeRedemptionCodeQuery(redemption.redemption_code);
  if (code.includes(query)) {
    return true;
  }

  if (redemption.vk_user_id != null && String(redemption.vk_user_id).includes(query)) {
    return true;
  }

  if (String(redemption.prize_redemptions_id).includes(query)) {
    return true;
  }

  return redemption.prize_name.toLowerCase().includes(query.toLowerCase());
}

export function sortRedemptionsForQueue(
  items: AdminPrizeRedemption[],
  status: PrizeRedemptionStatus | null,
): AdminPrizeRedemption[] {
  const sorted = [...items];
  const ascending = status === 'reserved' || status === null;

  sorted.sort((left, right) => {
    const leftTime = Date.parse(left.created_at);
    const rightTime = Date.parse(right.created_at);
    if (leftTime !== rightTime) {
      return ascending ? leftTime - rightTime : rightTime - leftTime;
    }
    return left.prize_redemptions_id - right.prize_redemptions_id;
  });

  return sorted;
}

export function formatRedemptionDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function buildVkUserUrl(vkUserId: number): string {
  return `https://vk.com/id${vkUserId}`;
}
