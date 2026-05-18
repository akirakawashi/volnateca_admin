import { apiFetch } from './client';

export function checkAdminSession(authHeader?: string): Promise<void> {
  return apiFetch<void>('/v1/admin/auth/check', { authHeader });
}
