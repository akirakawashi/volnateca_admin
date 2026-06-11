import { apiFetch } from './client';
import type {
  AddPrizePromoCodesPayload,
  AddPrizePromoCodesResult,
  AdminPrize,
  CreatePrizePayload,
  UpdatePrizePayload,
} from '../types/prize';

export function listPrizes(): Promise<AdminPrize[]> {
  return apiFetch<AdminPrize[]>('/v1/admin/prizes');
}

export function createPrize(payload: CreatePrizePayload): Promise<AdminPrize> {
  return apiFetch<AdminPrize>('/v1/admin/prizes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePrize(prizesId: number, payload: UpdatePrizePayload): Promise<AdminPrize> {
  return apiFetch<AdminPrize>(`/v1/admin/prizes/${prizesId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function addPrizePromoCodes(
  prizesId: number,
  payload: AddPrizePromoCodesPayload,
): Promise<AddPrizePromoCodesResult> {
  return apiFetch<AddPrizePromoCodesResult>(`/v1/admin/prizes/${prizesId}/promo-codes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
