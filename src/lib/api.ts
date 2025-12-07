import { z } from 'zod';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const STATIC_TOKEN = (import.meta.env.VITE_API_TOKEN || '').trim();

const getToken = () => {
  if (STATIC_TOKEN) return STATIC_TOKEN;
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('carla_token');
};

const withBase = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
};

const parsePayload = <T>(schema: z.ZodType<T>, payload: unknown, fallback: T): T => {
  const direct = schema.safeParse(payload);
  if (direct.success) return direct.data;

  const wrapped = z.object({ data: schema }).safeParse(payload);
  if (wrapped.success) return wrapped.data.data;

  const statusWrapped = z.object({ status: z.string().optional(), data: schema, error: z.any().optional() }).safeParse(payload);
  if (statusWrapped.success) return statusWrapped.data.data;

  return fallback;
};

type RequestInitLite = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>({
  path,
  schema,
  fallback,
  init,
}: {
  path: string;
  schema: z.ZodType<T>;
  fallback: T;
  init?: RequestInitLite;
}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const response = await fetch(withBase(path), {
    ...init,
    headers,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  const buildError = async () => {
    const base = `Carla API error ${response.status}`;
    try {
      const payload = await response.json();
      const detail = payload?.error?.detail || payload?.detail || payload?.message;
      const message = detail ? `${base}: ${detail}` : base;
      const error = new Error(message) as Error & { violations?: unknown; payload?: unknown };
      error.violations = payload?.error?.violations;
      error.payload = payload;
      return error;
    } catch {
      return new Error(base);
    }
  };

  if (!response.ok) {
    throw await buildError();
  }

  const json = await response.json().catch(() => null);
  if (json === null) return fallback;

  return parsePayload(schema, json, fallback);
}

export const apiGet = async <T>(path: string, schema: z.ZodType<T>, fallback: T) =>
  request<T>({ path, schema, fallback, init: { method: 'GET' } });

export const apiPost = async <T>(
  path: string,
  schema: z.ZodType<T>,
  body: Record<string, unknown> | FormData,
  fallback: T,
) =>
  request<T>({
    path,
    schema,
    fallback,
    init: {
      method: 'POST',
      body,
    },
  });

export const apiPut = async <T>(
  path: string,
  schema: z.ZodType<T>,
  body: Record<string, unknown> | FormData,
  fallback: T,
) =>
  request<T>({
    path,
    schema,
    fallback,
    init: {
      method: 'PUT',
      body,
    },
  });

export const apiWsUrl = (path: string) => {
  if (!API_URL) return '';
  const wsBase = API_URL.startsWith('https') ? API_URL.replace('https', 'wss') : API_URL.replace('http', 'ws');
  return `${wsBase}${path.startsWith('/') ? path : `/${path}`}`;
};

export { API_URL };

