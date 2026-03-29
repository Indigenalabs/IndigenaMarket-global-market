import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { getAddress } from 'ethers';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';

type JsonMap = Record<string, unknown>;

export type WalletAuthChallengeRecord = {
  challengeId: string;
  walletAddress: string;
  nonce: string;
  message: string;
  expiresAt: string;
  consumedAt?: string | null;
  createdAt: string;
};

export type WalletAuthSessionRecord = {
  sessionId: string;
  walletAddress: string;
  actorId: string;
  role: string;
  userUid?: string;
  refreshTokenHash: string;
  createdAt: string;
  lastSeenAt?: string | null;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  revokedAt?: string | null;
  metadata?: JsonMap;
};

const memoryChallenges = new Map<string, WalletAuthChallengeRecord>();
const memorySessions = new Map<string, WalletAuthSessionRecord>();
const memoryRefreshIndex = new Map<string, string>();

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function normalizeWalletAddress(wallet: string) {
  return getAddress(wallet.trim()).toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

export function createWalletAuthMessage(walletAddress: string, challengeId: string, nonce: string, expiresAt: string) {
  return [
    'Indigena Wallet Authentication',
    '',
    'Sign this message to authenticate your wallet session.',
    `Wallet: ${walletAddress}`,
    `Challenge: ${challengeId}`,
    `Nonce: ${nonce}`,
    `Expires At: ${expiresAt}`,
    '',
    'No blockchain transaction will be created.'
  ].join('\n');
}

function parseAllowedWallets(value: string | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export async function resolveWalletProfile(walletAddress: string) {
  const wallet = normalizeWalletAddress(walletAddress);
  let role = 'user';

  const adminWallets = parseAllowedWallets(process.env.ADVOCACY_ADMIN_WALLETS);
  const legalWallets = parseAllowedWallets(process.env.ADVOCACY_LEGAL_OPS_WALLETS);
  if (adminWallets.includes(wallet)) role = 'admin';
  else if (legalWallets.includes(wallet)) role = 'legal_ops';

  if (!isSupabaseServerConfigured()) {
    return { actorId: wallet, walletAddress: wallet, role };
  }

  const supabase = createSupabaseServerClient();
  const direct = await supabase
    .from('user_profiles')
    .select('id,role,wallet_address,user_uid')
    .ilike('wallet_address', wallet)
    .maybeSingle();
  let profile = direct.data as JsonMap | null;

  if (!profile) {
    const linked = await supabase
      .from('wallet_accounts')
      .select('wallet_address,user_profile_id,user_profiles(id,role,user_uid,wallet_address)')
      .ilike('wallet_address', wallet)
      .maybeSingle();
    if (linked.data) {
      const nested = (linked.data as JsonMap).user_profiles as JsonMap | JsonMap[] | null | undefined;
      profile = Array.isArray(nested) ? (nested[0] || null) : (nested || null);
    }
  }

  if (!profile) {
    return { actorId: wallet, walletAddress: wallet, role };
  }

  return {
    actorId: String(profile.user_uid || profile.id || wallet),
    walletAddress: String(profile.wallet_address || wallet).toLowerCase(),
    userUid: String(profile.user_uid || ''),
    role: String(profile.role || role || 'user')
  };
}

export async function createWalletChallenge(walletAddress: string) {
  const wallet = normalizeWalletAddress(walletAddress);
  const challengeId = `wac-${randomUUID()}`;
  const nonce = randomBytes(16).toString('hex');
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
  const message = createWalletAuthMessage(wallet, challengeId, nonce, expiresAt);

  const record: WalletAuthChallengeRecord = {
    challengeId,
    walletAddress: wallet,
    nonce,
    message,
    expiresAt,
    consumedAt: null,
    createdAt
  };

  if (!isSupabaseServerConfigured()) {
    memoryChallenges.set(challengeId, record);
    return record;
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('auth_wallet_challenges').insert({
    challenge_id: challengeId,
    wallet_address: wallet,
    nonce,
    message,
    expires_at: expiresAt,
    created_at: createdAt
  });
  if (error) throw error;
  return record;
}

export async function getWalletChallenge(challengeId: string) {
  if (!isSupabaseServerConfigured()) {
    return memoryChallenges.get(challengeId) || null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('auth_wallet_challenges')
    .select('*')
    .eq('challenge_id', challengeId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    challengeId: String((data as JsonMap).challenge_id || ''),
    walletAddress: String((data as JsonMap).wallet_address || ''),
    nonce: String((data as JsonMap).nonce || ''),
    message: String((data as JsonMap).message || ''),
    expiresAt: String((data as JsonMap).expires_at || ''),
    consumedAt: String((data as JsonMap).consumed_at || '') || null,
    createdAt: String((data as JsonMap).created_at || '')
  } satisfies WalletAuthChallengeRecord;
}

export async function consumeWalletChallenge(challengeId: string) {
  const consumedAt = nowIso();
  if (!isSupabaseServerConfigured()) {
    const row = memoryChallenges.get(challengeId);
    if (row) {
      row.consumedAt = consumedAt;
      memoryChallenges.set(challengeId, row);
    }
    return;
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('auth_wallet_challenges')
    .update({ consumed_at: consumedAt })
    .eq('challenge_id', challengeId);
  if (error) throw error;
}

export async function createWalletSession(input: {
  walletAddress: string;
  actorId: string;
  role: string;
  userUid?: string;
  metadata?: JsonMap;
}) {
  const sessionId = `ws-${randomUUID()}`;
  const refreshToken = randomBytes(32).toString('hex');
  const refreshTokenHash = sha256(refreshToken);
  const createdAt = nowIso();
  const accessExpiresAt = new Date(Date.now() + 60 * 60_000).toISOString();
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();

  const record: WalletAuthSessionRecord = {
    sessionId,
    walletAddress: normalizeWalletAddress(input.walletAddress),
    actorId: input.actorId,
    role: input.role || 'user',
    userUid: input.userUid,
    refreshTokenHash,
    createdAt,
    lastSeenAt: createdAt,
    accessExpiresAt,
    refreshExpiresAt,
    revokedAt: null,
    metadata: input.metadata || {}
  };

  if (!isSupabaseServerConfigured()) {
    memorySessions.set(sessionId, record);
    memoryRefreshIndex.set(refreshTokenHash, sessionId);
    return { record, refreshToken };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('auth_wallet_sessions').insert({
    session_id: record.sessionId,
    wallet_address: record.walletAddress,
    actor_id: record.actorId,
    role: record.role,
    user_uid: record.userUid || null,
    refresh_token_hash: record.refreshTokenHash,
    created_at: record.createdAt,
    last_seen_at: record.lastSeenAt,
    access_expires_at: record.accessExpiresAt,
    refresh_expires_at: record.refreshExpiresAt,
    revoked_at: null,
    metadata: record.metadata || {}
  });
  if (error) throw error;
  return { record, refreshToken };
}

export async function getWalletSessionById(sessionId: string) {
  if (!isSupabaseServerConfigured()) {
    return memorySessions.get(sessionId) || null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('auth_wallet_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    sessionId: String((data as JsonMap).session_id || ''),
    walletAddress: String((data as JsonMap).wallet_address || ''),
    actorId: String((data as JsonMap).actor_id || ''),
    role: String((data as JsonMap).role || 'user'),
    userUid: String((data as JsonMap).user_uid || '') || undefined,
    refreshTokenHash: String((data as JsonMap).refresh_token_hash || ''),
    createdAt: String((data as JsonMap).created_at || ''),
    lastSeenAt: String((data as JsonMap).last_seen_at || '') || null,
    accessExpiresAt: String((data as JsonMap).access_expires_at || ''),
    refreshExpiresAt: String((data as JsonMap).refresh_expires_at || ''),
    revokedAt: String((data as JsonMap).revoked_at || '') || null,
    metadata: ((data as JsonMap).metadata as JsonMap | null) || {}
  } satisfies WalletAuthSessionRecord;
}

export async function getWalletSessionByRefreshToken(refreshToken: string) {
  const refreshTokenHash = sha256(refreshToken.trim());
  if (!isSupabaseServerConfigured()) {
    const sessionId = memoryRefreshIndex.get(refreshTokenHash);
    return sessionId ? (memorySessions.get(sessionId) || null) : null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('auth_wallet_sessions')
    .select('*')
    .eq('refresh_token_hash', refreshTokenHash)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return getWalletSessionById(String((data as JsonMap).session_id || ''));
}

export async function rotateWalletSessionRefreshToken(sessionId: string) {
  const nextRefreshToken = randomBytes(32).toString('hex');
  const refreshTokenHash = sha256(nextRefreshToken);
  const accessExpiresAt = new Date(Date.now() + 60 * 60_000).toISOString();
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();
  const lastSeenAt = nowIso();

  if (!isSupabaseServerConfigured()) {
    const row = memorySessions.get(sessionId);
    if (!row) return null;
    memoryRefreshIndex.delete(row.refreshTokenHash);
    row.refreshTokenHash = refreshTokenHash;
    row.accessExpiresAt = accessExpiresAt;
    row.refreshExpiresAt = refreshExpiresAt;
    row.lastSeenAt = lastSeenAt;
    memorySessions.set(sessionId, row);
    memoryRefreshIndex.set(refreshTokenHash, sessionId);
    return { record: row, refreshToken: nextRefreshToken };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('auth_wallet_sessions')
    .update({
      refresh_token_hash: refreshTokenHash,
      access_expires_at: accessExpiresAt,
      refresh_expires_at: refreshExpiresAt,
      last_seen_at: lastSeenAt
    })
    .eq('session_id', sessionId)
    .is('revoked_at', null)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    record: {
      sessionId: String((data as JsonMap).session_id || ''),
      walletAddress: String((data as JsonMap).wallet_address || ''),
      actorId: String((data as JsonMap).actor_id || ''),
      role: String((data as JsonMap).role || 'user'),
      userUid: String((data as JsonMap).user_uid || '') || undefined,
      refreshTokenHash: String((data as JsonMap).refresh_token_hash || ''),
      createdAt: String((data as JsonMap).created_at || ''),
      lastSeenAt: String((data as JsonMap).last_seen_at || '') || null,
      accessExpiresAt: String((data as JsonMap).access_expires_at || ''),
      refreshExpiresAt: String((data as JsonMap).refresh_expires_at || ''),
      revokedAt: String((data as JsonMap).revoked_at || '') || null,
      metadata: ((data as JsonMap).metadata as JsonMap | null) || {}
    } satisfies WalletAuthSessionRecord,
    refreshToken: nextRefreshToken
  };
}

export async function revokeWalletSession(sessionId: string) {
  const revokedAt = nowIso();
  if (!isSupabaseServerConfigured()) {
    const row = memorySessions.get(sessionId);
    if (row) {
      row.revokedAt = revokedAt;
      memorySessions.set(sessionId, row);
    }
    return;
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('auth_wallet_sessions')
    .update({ revoked_at: revokedAt, last_seen_at: revokedAt })
    .eq('session_id', sessionId);
  if (error) throw error;
}

export async function touchWalletSession(sessionId: string) {
  const lastSeenAt = nowIso();
  if (!isSupabaseServerConfigured()) {
    const row = memorySessions.get(sessionId);
    if (row) {
      row.lastSeenAt = lastSeenAt;
      memorySessions.set(sessionId, row);
    }
    return;
  }
  const supabase = createSupabaseServerClient();
  await supabase.from('auth_wallet_sessions').update({ last_seen_at: lastSeenAt }).eq('session_id', sessionId);
}
