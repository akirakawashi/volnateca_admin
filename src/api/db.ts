import { apiFetch } from './client';

export async function truncateDB(): Promise<void> {
  await apiFetch<void>('/v1/admin/db/truncate', { method: 'DELETE' });
}
