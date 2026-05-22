import { apiFetch } from './client';
import type { AdminPrize, CreatePrizePayload } from '../types/prize';

export function listPrizes(): Promise<AdminPrize[]> {
  return apiFetch<AdminPrize[]>('/v1/admin/prizes');
}

export function createPrize(payload: CreatePrizePayload): Promise<AdminPrize> {
  return apiFetch<AdminPrize>('/v1/admin/prizes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
