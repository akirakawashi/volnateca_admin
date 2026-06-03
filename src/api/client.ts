import { notifyAdminUnauthorized } from '../auth/adminAuth';

const DEFAULT_API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : window.location.origin;

const API_BASE = window.__VOLNATECA_ADMIN_CONFIG__?.API_BASE_URL?.trim() || DEFAULT_API_BASE;
const DEFAULT_API_TIMEOUT_MS = 30_000;

type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function formatTimeout(timeoutMs: number): string {
  const seconds = Math.round(timeoutMs / 1000);
  return `${seconds} секунд`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    headers,
    signal,
    timeoutMs = DEFAULT_API_TIMEOUT_MS,
    ...requestInit
  } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set('Content-Type', 'application/json');

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = timeoutMs > 0
    ? window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs)
    : undefined;
  const abortFromCaller = () => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
    controller.abort();
  };

  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...requestInit,
      credentials: 'include',
      headers: requestHeaders,
      signal: controller.signal,
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
  } catch (e) {
    if (timedOut && isAbortError(e)) {
      throw new ApiError(
        `Запрос не получил ответ за ${formatTimeout(timeoutMs)}. Проверьте соединение и попробуйте снова.`,
        0,
      );
    }
    throw e;
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
