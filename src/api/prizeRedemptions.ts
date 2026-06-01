import { apiFetch } from './client';
import type { AdminListPage } from '../types/pagination';
import type {
  AdminPrizeRedemption,
  CancelPrizeRedemptionPayload,
  FulfillPrizeRedemptionPayload,
  ListPrizeRedemptionsParams,
} from '../types/prizeRedemption';

const REDEMPTIONS_PATH = '/v1/admin/prize-redemptions';

function buildListQuery(params: ListPrizeRedemptionsParams): string {
  const search = new URLSearchParams();
  if (params.status) {
    search.set('status', params.status);
  }
  if (params.prizes_id != null && params.prizes_id > 0) {
    search.set('prizes_id', String(params.prizes_id));
  }
  if (params.page != null && params.page > 0) {
    search.set('page', String(params.page));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function listPrizeRedemptions(
  params: ListPrizeRedemptionsParams = {},
): Promise<AdminListPage<AdminPrizeRedemption>> {
  return apiFetch<AdminListPage<AdminPrizeRedemption>>(
    `${REDEMPTIONS_PATH}${buildListQuery(params)}`,
  );
}

export function getPrizeRedemption(prizeRedemptionsId: number): Promise<AdminPrizeRedemption> {
  return apiFetch<AdminPrizeRedemption>(`${REDEMPTIONS_PATH}/${prizeRedemptionsId}`);
}

export function fulfillPrizeRedemption(
  prizeRedemptionsId: number,
  payload: FulfillPrizeRedemptionPayload = {},
): Promise<AdminPrizeRedemption> {
  return apiFetch<AdminPrizeRedemption>(`${REDEMPTIONS_PATH}/${prizeRedemptionsId}/fulfill`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cancelPrizeRedemption(
  prizeRedemptionsId: number,
  payload: CancelPrizeRedemptionPayload,
): Promise<AdminPrizeRedemption> {
  return apiFetch<AdminPrizeRedemption>(`${REDEMPTIONS_PATH}/${prizeRedemptionsId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
