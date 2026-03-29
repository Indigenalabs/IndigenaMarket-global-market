import { fetchWithTimeout, parseApiError } from './apiClient';
import { clearLegacyWalletStorage, setStoredWalletAddress } from './walletStorage';

export interface WalletAuthChallenge {
  challengeId: string;
  walletAddress: string;
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface WalletAuthSession {
  wallet: string;
  actorId: string;
  role: string;
  userUid?: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
}

function browserSafe() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function emitWalletSessionChanged() {
  if (!browserSafe()) return;
  window.dispatchEvent(new CustomEvent('indigena-wallet-session-changed'));
}

function parseJwtExp(token: string): number {
  try {
    const part = token.split('.')[1] || '';
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalized));
    return Number(json?.exp || 0);
  } catch {
    return 0;
  }
}

export function isWalletSessionExpired(token: string) {
  if (!token) return true;
  const exp = parseJwtExp(token);
  if (!exp) return false;
  return Date.now() >= (exp * 1000 - 30_000);
}

function storeSession(data: WalletAuthSession) {
  if (!browserSafe()) return;
  setStoredWalletAddress(data.wallet);
  window.localStorage.setItem('indigena_user_jwt', data.accessToken);
  window.localStorage.setItem('indigena_user_refresh_token', data.refreshToken);
  window.localStorage.setItem('indigena_user_id', data.actorId);
  emitWalletSessionChanged();
}

export function clearWalletSessionStorage() {
  if (!browserSafe()) return;
  window.localStorage.removeItem('indigena_user_jwt');
  window.localStorage.removeItem('indigena_user_refresh_token');
  window.localStorage.removeItem('indigena_user_id');
  clearLegacyWalletStorage();
  emitWalletSessionChanged();
}

export async function fetchWalletSessionMe() {
  const jwt = browserSafe()
    ? (window.localStorage.getItem('indigena_user_jwt') || '').trim()
    : '';
  if (!jwt) return null;
  const res = await fetchWithTimeout('/api/auth/wallet/me', {
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Wallet session lookup failed'));
  const json = await res.json();
  return (json?.data ?? json) as {
    actorId: string;
    walletAddress: string;
    role: string;
    userUid?: string;
    sessionId: string;
    method: 'wallet';
    verified: true;
  };
}

export async function requestWalletAuthChallenge(wallet: string): Promise<WalletAuthChallenge> {
  const res = await fetchWithTimeout('/api/auth/wallet/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Wallet auth challenge failed'));
  const json = await res.json();
  return (json?.data ?? json) as WalletAuthChallenge;
}

export async function verifyWalletAuthChallengeClient(
  wallet: string,
  challengeId: string,
  signature: string
): Promise<WalletAuthSession> {
  const res = await fetchWithTimeout('/api/auth/wallet/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, challengeId, signature })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Wallet auth verification failed'));
  const json = await res.json();
  const data = (json?.data ?? json) as WalletAuthSession;
  storeSession(data);
  return data;
}

export async function refreshWalletAuthSessionClient(): Promise<WalletAuthSession> {
  const refreshToken = browserSafe()
    ? (window.localStorage.getItem('indigena_user_refresh_token') || '').trim()
    : '';
  const res = await fetchWithTimeout('/api/auth/wallet/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Wallet auth refresh failed'));
  const json = await res.json();
  const data = (json?.data ?? json) as WalletAuthSession;
  storeSession(data);
  return data;
}

export async function logoutWalletAuthSessionClient(): Promise<void> {
  const refreshToken = browserSafe()
    ? (window.localStorage.getItem('indigena_user_refresh_token') || '').trim()
    : '';
  const jwt = browserSafe()
    ? (window.localStorage.getItem('indigena_user_jwt') || '').trim()
    : '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  const res = await fetchWithTimeout('/api/auth/wallet/logout', {
    method: 'POST',
    headers,
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Wallet auth logout failed'));
  clearWalletSessionStorage();
}

export async function ensureWalletSessionAuth(): Promise<void> {
  if (!browserSafe()) return;
  const currentJwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  if (currentJwt && !isWalletSessionExpired(currentJwt)) return;

  const refreshToken = (window.localStorage.getItem('indigena_user_refresh_token') || '').trim();
  if (refreshToken) {
    try {
      await refreshWalletAuthSessionClient();
      return;
    } catch {
      clearWalletSessionStorage();
    }
  }

  const ethereum = (window as unknown as {
    ethereum?: { request: (arg: { method: string; params?: unknown[] }) => Promise<unknown> };
  }).ethereum;
  if (!ethereum) throw new Error('Wallet login required: browser wallet provider not found.');

  let wallet = (window.localStorage.getItem('indigena_wallet_address') || '').trim().toLowerCase();
  if (!wallet) {
    const accounts = (await ethereum.request({ method: 'eth_requestAccounts' }) as string[]) || [];
    wallet = String(accounts[0] || '').trim().toLowerCase();
    if (wallet) setStoredWalletAddress(wallet);
  }
  if (!wallet) throw new Error('Wallet login required: no connected wallet account.');

  const challenge = await requestWalletAuthChallenge(wallet);
  let signature = '';
  try {
    signature = String(await ethereum.request({ method: 'personal_sign', params: [challenge.message, wallet] }));
  } catch {
    signature = String(await ethereum.request({ method: 'personal_sign', params: [wallet, challenge.message] }));
  }
  await verifyWalletAuthChallengeClient(wallet, challenge.challengeId, signature);
}
