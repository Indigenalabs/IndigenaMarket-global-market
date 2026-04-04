'use client';

import { createSupabaseBrowserClient } from '@/app/lib/supabase/client';
import { clearLegacyWalletStorage, setStoredWalletAddress } from '@/app/lib/walletStorage';
import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';

export type AccountSessionMe = {
  profileId: string;
  actorId: string;
  userUid: string;
  email: string;
  displayName: string;
  role: string;
  accountStatus: string;
  authProvider: string;
  emailVerified: boolean;
  walletAddress: string;
  walletProvider: string;
  walletType: string;
  walletStatus: string;
  creatorProfileSlug: string;
  method: 'email';
  verified: true;
};

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

function getBrowserClient() {
  if (!browserClient) browserClient = createSupabaseBrowserClient();
  return browserClient;
}

function browserSafe() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function emitSessionChanged() {
  if (!browserSafe()) return;
  window.dispatchEvent(new CustomEvent('indigena-account-session-changed'));
  window.dispatchEvent(new CustomEvent('indigena-wallet-session-changed'));
}

function originSafe() {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
  return window.location.origin;
}

function storeAccessSession(input: {
  accessToken: string;
  refreshToken?: string;
  userId: string;
}) {
  if (!browserSafe()) return;
  window.localStorage.setItem('indigena_user_jwt', input.accessToken);
  if (input.refreshToken) {
    window.localStorage.setItem('indigena_user_refresh_token', input.refreshToken);
  } else {
    window.localStorage.removeItem('indigena_user_refresh_token');
  }
  window.localStorage.setItem('indigena_user_id', input.userId);
}

function storeAccountProfile(account: AccountSessionMe) {
  if (!browserSafe()) return;
  window.localStorage.setItem('indigena_user_id', account.actorId);
  window.localStorage.setItem('indigena_user_email', account.email);
  window.localStorage.setItem('indigena_user_display_name', account.displayName);
  window.localStorage.setItem('indigena_creator_profile_slug', account.creatorProfileSlug || '');
  window.localStorage.setItem('indigena_wallet_provider', account.walletProvider);
  window.localStorage.setItem('indigena_wallet_type', account.walletType);
  window.localStorage.setItem('indigena_wallet_status', account.walletStatus);
  if (account.walletAddress) setStoredWalletAddress(account.walletAddress);
  emitSessionChanged();
}

export function clearAccountSessionStorage() {
  if (!browserSafe()) return;
  window.localStorage.removeItem('indigena_user_jwt');
  window.localStorage.removeItem('indigena_user_refresh_token');
  window.localStorage.removeItem('indigena_user_id');
  window.localStorage.removeItem('indigena_user_email');
  window.localStorage.removeItem('indigena_user_display_name');
  window.localStorage.removeItem('indigena_creator_profile_slug');
  window.localStorage.removeItem('indigena_wallet_provider');
  window.localStorage.removeItem('indigena_wallet_type');
  window.localStorage.removeItem('indigena_wallet_status');
  window.localStorage.removeItem('indigena_wallet_address');
  clearLegacyWalletStorage();
  emitSessionChanged();
}

export async function requestEmailSignInLink(email: string, nextPath = '/') {
  const client = getBrowserClient();
  const redirectTo = `${originSafe()}/sign-in?next=${encodeURIComponent(nextPath)}`;
  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true
    }
  });
  if (error) throw error;
}

export async function getSupabaseBrowserSession() {
  const client = getBrowserClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function hydrateSupabaseSessionFromUrl() {
  if (!browserSafe()) return false;

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  const accessToken = (params.get('access_token') || '').trim();
  const refreshToken = (params.get('refresh_token') || '').trim();
  if (!accessToken || !refreshToken) return false;

  const client = getBrowserClient();
  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  if (error) throw error;

  if (data.session?.user?.id) {
    storeAccessSession({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.session.user.id
    });
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, cleanUrl);
  return true;
}

export async function fetchAccountSessionMeWithToken(accessToken: string) {
  const res = await fetchWithTimeout('/api/auth/account/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Account session lookup failed'));
  const json = await res.json();
  return (json?.data ?? json) as AccountSessionMe | null;
}

export async function syncAccountSessionFromSupabase() {
  const session = await getSupabaseBrowserSession();
  if (!session?.access_token || !session.user?.id) return null;

  storeAccessSession({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: session.user.id
  });

  const res = await fetchWithTimeout('/api/auth/account/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Account sync failed'));
  const json = await res.json();
  const account = (json?.data ?? json) as AccountSessionMe | null;
  if (account) storeAccountProfile(account);
  return account;
}

export async function fetchAccountSessionMe() {
  const session = await getSupabaseBrowserSession();
  if (session?.access_token) {
    storeAccessSession({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      userId: session.user.id
    });
    const account = await fetchAccountSessionMeWithToken(session.access_token);
    if (account) storeAccountProfile(account);
    return account;
  }

  if (!browserSafe()) return null;
  const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  if (!jwt) return null;

  try {
    const account = await fetchAccountSessionMeWithToken(jwt);
    if (account) storeAccountProfile(account);
    return account;
  } catch {
    return null;
  }
}

export async function resolveCurrentCreatorProfileSlug(explicitSlug?: string) {
  const safeExplicitSlug = (explicitSlug || '').trim();
  if (safeExplicitSlug) return safeExplicitSlug;

  if (browserSafe()) {
    const cachedSlug = (window.localStorage.getItem('indigena_creator_profile_slug') || '').trim();
    if (cachedSlug) return cachedSlug;
  }

  const account = await fetchAccountSessionMe().catch(() => null);
  return (account?.creatorProfileSlug || '').trim();
}

export async function ensureAccountSessionAuth() {
  const account = await syncAccountSessionFromSupabase().catch(() => null);
  if (account?.walletAddress) return account;

  if (typeof window !== 'undefined') {
    const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.href = `/sign-in?next=${encodeURIComponent(next)}`;
  }
  throw new Error('Sign in required to continue.');
}

export async function logoutAccountSessionClient() {
  try {
    const client = getBrowserClient();
    await client.auth.signOut();
  } finally {
    clearAccountSessionStorage();
    await fetchWithTimeout('/api/auth/account/logout', { method: 'POST' }).catch(() => null);
  }
}

export function watchAccountAuthState(onChange?: () => void) {
  const client = getBrowserClient();
  const { data } = client.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      clearAccountSessionStorage();
      onChange?.();
      return;
    }

    if (session.access_token && session.user?.id) {
      storeAccessSession({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userId: session.user.id
      });
      await syncAccountSessionFromSupabase().catch(() => null);
      onChange?.();
    }
  });

  return () => data.subscription.unsubscribe();
}


