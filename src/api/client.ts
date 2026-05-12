const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const json = await response.json() as { detail?: string | { msg: string }[] };
      if (typeof json.detail === 'string') detail = json.detail;
      else if (Array.isArray(json.detail)) detail = json.detail.map((d) => d.msg).join('; ');
    } catch {
      detail = await response.text().catch(() => detail);
    }
    throw new Error(detail);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
