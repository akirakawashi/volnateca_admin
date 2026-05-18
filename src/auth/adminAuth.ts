const ADMIN_AUTH_STORAGE_KEY = 'volnateca_admin_basic_auth';
export const ADMIN_UNAUTHORIZED_EVENT = 'volnateca-admin-unauthorized';

export function buildAdminAuthHeader(login: string, password: string): string {
  return `Basic ${window.btoa(`${login}:${password}`)}`;
}

export function getStoredAdminAuthHeader(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
}

export function saveStoredAdminAuthHeader(authHeader: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, authHeader);
}

export function clearStoredAdminAuthHeader(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}

export function notifyAdminUnauthorized(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
}
