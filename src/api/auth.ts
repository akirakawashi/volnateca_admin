import { apiFetch } from './client';
import { buildAdminAuthHeader } from '../auth/adminAuth';

export function loginAdmin(login: string, password: string, adminToken: string): Promise<void> {
  return apiFetch<void>('/v1/admin/auth/login', {
    method: 'POST',
    headers: {
      Authorization: buildAdminAuthHeader(login, password),
      'X-Admin-Token': adminToken,
    },
  });
}

export function checkAdminSession(): Promise<void> {
  return apiFetch<void>('/v1/admin/auth/check');
}

export function logoutAdmin(): Promise<void> {
  return apiFetch<void>('/v1/admin/auth/logout', { method: 'POST' });
}
