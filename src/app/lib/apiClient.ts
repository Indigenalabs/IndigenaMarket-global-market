import { getStoredWalletAddress } from './walletStorage';

const EXTERNAL_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_USE_APP_API === 'true' || !EXTERNAL_API_BASE_URL
    ? '/api'
    : EXTERNAL_API_BASE_URL;

const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000);

function browserSafe() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeHeaders(input?: HeadersInit): Record<string, string> {
  if (!input) return {};
  if (input instanceof Headers) {
    const obj: Record<string, string> = {};
    input.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  if (Array.isArray(input)) {
    return Object.fromEntries(input.map(([k, v]) => [k, String(v)]));
  }
  return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, String(v)]));
}

export function getClientAuthHeaders() {
  if (!browserSafe()) return {} as Record<string, string>;
  const wallet = getStoredWalletAddress();
  const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  const userId = (window.localStorage.getItem('indigena_user_id') || '').trim();
  const adminSigned = (window.localStorage.getItem('indigena_admin_signed') || '').trim().toLowerCase() === 'true';
  const headers: Record<string, string> = {};
  if (wallet) {
    headers['x-wallet-address'] = wallet;
    headers['x-actor-id'] = wallet;
  } else if (userId) {
    headers['x-actor-id'] = userId;
  }
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  if (adminSigned) headers['x-admin-signed'] = 'true';
  return headers;
}

function mergeAbortSignals(...signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const valid = signals.filter(Boolean) as AbortSignal[];
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const signal of valid) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }
  return controller.signal;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS
) {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), Math.max(1000, timeoutMs));
  try {
    const existingHeaders = normalizeHeaders(init.headers);
    const mergedHeaders: HeadersInit = {
      ...getClientAuthHeaders(),
      ...existingHeaders
    };
    const signal = mergeAbortSignals(init.signal as AbortSignal | undefined, timeoutController.signal);
    return await fetch(input, { ...init, headers: mergedHeaders, signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseApiError(res: Response, fallback = 'Request failed') {
  try {
    const json = (await res.json()) as { message?: string; error?: string };
    const msg = json?.message || json?.error;
    return `${fallback} (${res.status})${msg ? `: ${msg}` : ''}`;
  } catch {
    return `${fallback} (${res.status})`;
  }
}

export function buildApiUrl(path: string, query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}
