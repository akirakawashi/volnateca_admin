import { apiFetch } from './client';
import type { BroadcastSnapshot, BroadcastStartPayload } from '../types/broadcast';

export function startBroadcast(payload: BroadcastStartPayload): Promise<BroadcastSnapshot> {
  return apiFetch<BroadcastSnapshot>('/v1/admin/broadcasts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getBroadcastStatus(broadcastId: string): Promise<BroadcastSnapshot> {
  return apiFetch<BroadcastSnapshot>(`/v1/admin/broadcasts/${encodeURIComponent(broadcastId)}`);
}
