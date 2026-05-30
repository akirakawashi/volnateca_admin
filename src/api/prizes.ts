import { apiFetch } from './client';
import type { AdminPrize, CreatePrizePayload, UpdatePrizePayload } from '../types/prize';

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
