export const ADMIN_UNAUTHORIZED_EVENT = 'volnateca-admin-unauthorized';

export function buildAdminAuthHeader(login: string, password: string): string {
  return `Basic ${window.btoa(`${login}:${password}`)}`;
}

export function notifyAdminUnauthorized(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
}
