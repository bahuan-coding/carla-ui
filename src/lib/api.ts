import { z } from 'zod';

// Bank error detail structure for 502 responses
export interface BankErrorDetail {
  status: 'error';
  step: string;
  error_code: string;
  error_message: string;
  correlation_id: string;
  finished_at: string;
  retry: boolean;
}

export class BankError extends Error {
  detail: BankErrorDetail;
  httpStatus: number;

  constructor(detail: BankErrorDetail, httpStatus: number) {
    super(detail.error_message);
    this.name = 'BankError';
    this.detail = detail;
    this.httpStatus = httpStatus;
  }

  get canRetry() {
    return this.detail.retry;
  }

  get step() {
    return this.detail.step;
  }

  get correlationId() {
    return this.detail.correlation_id;
  }
}

export const isBankError = (error: unknown): error is BankError => {
  return error instanceof BankError;
};

// Resolve base URL and token with fallbacks to the Netlify VITE names in use
const resolveBaseUrl = () =>
  (import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_CARLA_SERVICIOS_API_URL ||
    import.meta.env.VITE_CHANNELS_API_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');

// Separate keys for admin vs bridge
const CHANNELS_API_KEY = (import.meta.env.VITE_CHANNELS_API_KEY || '').trim();
const BRIDGE_API_KEY = (import.meta.env.VITE_CARLA_SERVICIOS_API_KEY || '').trim();

const API_URL = resolveBaseUrl();
const IS_DEV = import.meta.env.DEV;

const withBase = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
};

// Token selection: admin endpoints use CHANNELS_API_KEY, others use bridge or localStorage
const getTokenForPath = (path: string) => {
  if (path.startsWith('/admin')) return CHANNELS_API_KEY || null;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('carla_token');
    if (stored) return stored;
  }
  return CHANNELS_API_KEY || BRIDGE_API_KEY || null;
};

// Bridge token cache
let bridgeTokenCache: { token: string; expiresAt: number } | null = null;

const fetchBridgeAccessToken = async (forceRefresh = false): Promise<string | null> => {
  if (!BRIDGE_API_KEY) return null;
  // Return cached token if still valid (with 30s buffer)
  if (!forceRefresh && bridgeTokenCache && Date.now() < bridgeTokenCache.expiresAt - 30000) {
    return bridgeTokenCache.token;
  }
  try {
    const res = await fetch(withBase('/bridge/auth'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${BRIDGE_API_KEY}`,
      },
    });
    if (!res.ok) {
      bridgeTokenCache = null;
      return null;
    }
    const json = await res.json();
    const token = json?.token || null;
    const expiresIn = json?.expires_in || 3600;
    if (token) {
      bridgeTokenCache = { token, expiresAt: Date.now() + expiresIn * 1000 };
    }
    return token;
  } catch {
    bridgeTokenCache = null;
    return null;
  }
};

const parsePayload = <T>(schema: z.ZodType<T>, payload: unknown, fallback: T): T => {
  const direct = schema.safeParse(payload);
  if (direct.success) return direct.data;

  const wrapped = z.object({ data: schema }).safeParse(payload);
  if (wrapped.success) return wrapped.data.data;

  const statusWrapped = z.object({ status: z.string().optional(), data: schema, error: z.any().optional() }).safeParse(payload);
  if (statusWrapped.success) return statusWrapped.data.data;

  if (IS_DEV) {
    const sampleKeys = payload && typeof payload === 'object' ? Object.keys(payload as Record<string, unknown>).slice(0, 6) : [];
    const topIssues = direct.success ? [] : direct.error.issues.slice(0, 3);
    console.warn('[api] schema mismatch, falling back', {
      keys: sampleKeys,
      issues: topIssues,
    });
  }

  return fallback;
};

type RequestInitLite = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>({
  path,
  schema,
  fallback,
  init,
  _retried = false,
}: {
  path: string;
  schema: z.ZodType<T>;
  fallback: T;
  init?: RequestInitLite;
  _retried?: boolean;
}): Promise<T> {
  const token = getTokenForPath(path);
  const isBridge = path.startsWith('/bridge') && !path.startsWith('/bridge/auth');
  const bridgeToken = isBridge ? await fetchBridgeAccessToken() : null;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(bridgeToken ? { 'x-bridge-token': bridgeToken } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const response = await fetch(withBase(path), {
    ...init,
    headers,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  // Retry once on 401/403 for bridge endpoints (token may have expired)
  if (isBridge && !_retried && (response.status === 401 || response.status === 403)) {
    bridgeTokenCache = null;
    return request({ path, schema, fallback, init, _retried: true });
  }

  const buildError = async () => {
    const base = `Carla API error ${response.status}`;
    try {
      const payload = await response.json();

      // Handle 502 BANK_ERROR from bridge endpoints
      if (response.status === 502) {
        const detail = payload?.detail || payload;
        if (detail?.error_code || detail?.code) {
          const bankDetail: BankErrorDetail = {
            status: 'error',
            step: detail.step || detail.field || 'unknown',
            error_code: detail.error_code || detail.code || 'BANK_ERROR',
            error_message: detail.error_message || detail.error || detail.message || 'Error de banco',
            correlation_id: detail.correlation_id || '',
            finished_at: detail.finished_at || new Date().toISOString(),
            retry: detail.retry ?? false,
          };
          return new BankError(bankDetail, response.status);
        }
      }

      const detail = payload?.error?.detail || payload?.detail || payload?.message || payload?.error;
      const message = detail
        ? typeof detail === 'string'
          ? `${base}: ${detail}`
          : `${base}: ${JSON.stringify(detail)}`
        : base;
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

