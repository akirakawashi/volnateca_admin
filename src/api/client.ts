import { notifyAdminUnauthorized } from '../auth/adminAuth';

const DEFAULT_API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : window.location.origin;

const API_BASE = window.__VOLNATECA_ADMIN_CONFIG__?.API_BASE_URL?.trim() || DEFAULT_API_BASE;

type ApiFetchOptions = RequestInit;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { headers, ...requestInit } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE}${path}`, {
    ...requestInit,
    credentials: 'include',
    headers: requestHeaders,
  });

  if (!response.ok) {
    if (response.status === 401) {
      notifyAdminUnauthorized();
    }

    let detail = `HTTP ${response.status}`;
    try {
      const json = await response.json() as {
        detail?: string | { msg?: string }[];
        message?: string;
        context?: { msg?: string }[] | null;
      };
      if (typeof json.detail === 'string') {
        detail = json.detail;
      } else if (Array.isArray(json.detail)) {
        detail = json.detail.map((d) => d.msg).filter(Boolean).join('; ');
      } else if (Array.isArray(json.context)) {
        detail = json.context.map((d) => d.msg).filter(Boolean).join('; ') || json.message || detail;
      } else if (typeof json.message === 'string') {
        detail = json.message;
      }
    } catch {
      detail = await response.text().catch(() => detail);
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
