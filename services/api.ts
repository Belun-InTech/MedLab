/**
 * Thin fetch wrapper for the MedLab API.
 *
 * Always same-origin: Vite proxies /api to the Express server in dev, and Express serves
 * the built SPA itself in production. That means no CORS and no API key in the browser —
 * the AI provider credentials live only on the server.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'same-origin', // send the httpOnly session cookie
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, (payload as { error?: string }).error ?? 'request_failed');
  }
  return payload as T;
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
