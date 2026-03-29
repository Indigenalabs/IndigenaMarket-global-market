import { NextRequest } from 'next/server';
import { verifyMessage } from 'ethers';
import {
  consumeWalletChallenge,
  createWalletChallenge,
  createWalletSession,
  getWalletChallenge,
  getWalletSessionById,
  getWalletSessionByRefreshToken,
  normalizeWalletAddress,
  resolveWalletProfile,
  revokeWalletSession,
  rotateWalletSessionRefreshToken,
  touchWalletSession
} from '@/app/lib/walletAuthStore';
import { issueWalletAccessToken, verifyWalletAccessToken } from '@/app/lib/walletSessionToken';

export type WalletAuthSessionResponse = {
  wallet: string;
  actorId: string;
  role: string;
  userUid?: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
};

function parseBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
}

function sessionResponse(input: {
  wallet: string;
  actorId: string;
  role: string;
  userUid?: string;
  refreshToken: string;
  sessionId: string;
}) {
  return {
    wallet: input.wallet,
    actorId: input.actorId,
    role: input.role,
    userUid: input.userUid,
    accessToken: issueWalletAccessToken({
      sessionId: input.sessionId,
      actorId: input.actorId,
      walletAddress: input.wallet,
      role: input.role,
      userUid: input.userUid,
      expiresInSec: 3600
    }),
    refreshToken: input.refreshToken,
    sessionId: input.sessionId,
    expiresIn: 3600
  } satisfies WalletAuthSessionResponse;
}

export async function requestWalletAuthChallenge(walletAddress: string) {
  return createWalletChallenge(walletAddress);
}

export async function verifyWalletAuthChallenge(input: {
  walletAddress: string;
  challengeId: string;
  signature: string;
}) {
  const wallet = normalizeWalletAddress(input.walletAddress);
  const challenge = await getWalletChallenge(input.challengeId);
  if (!challenge) throw new Error('Wallet challenge not found');
  if (challenge.walletAddress !== wallet) throw new Error('Wallet challenge does not match requested wallet');
  if (challenge.consumedAt) throw new Error('Wallet challenge has already been used');
  if (Date.parse(challenge.expiresAt) <= Date.now()) throw new Error('Wallet challenge has expired');

  const recovered = normalizeWalletAddress(verifyMessage(challenge.message, input.signature));
  if (recovered !== wallet) throw new Error('Wallet signature could not be verified');

  await consumeWalletChallenge(challenge.challengeId);
  const profile = await resolveWalletProfile(wallet);
  const { record, refreshToken } = await createWalletSession({
    walletAddress: profile.walletAddress,
    actorId: profile.actorId,
    role: profile.role,
    userUid: profile.userUid
  });

  return sessionResponse({
    wallet: record.walletAddress,
    actorId: record.actorId,
    role: record.role,
    userUid: record.userUid,
    refreshToken,
    sessionId: record.sessionId
  });
}

export async function refreshWalletAuthSession(refreshToken: string) {
  const session = await getWalletSessionByRefreshToken(refreshToken);
  if (!session) throw new Error('Refresh token not recognized');
  if (session.revokedAt) throw new Error('Wallet session has been revoked');
  if (Date.parse(session.refreshExpiresAt) <= Date.now()) throw new Error('Refresh token has expired');

  const rotated = await rotateWalletSessionRefreshToken(session.sessionId);
  if (!rotated) throw new Error('Wallet session refresh failed');

  return sessionResponse({
    wallet: rotated.record.walletAddress,
    actorId: rotated.record.actorId,
    role: rotated.record.role,
    userUid: rotated.record.userUid,
    refreshToken: rotated.refreshToken,
    sessionId: rotated.record.sessionId
  });
}

export async function logoutWalletAuthSession(input: { refreshToken?: string; accessToken?: string }) {
  if (input.refreshToken) {
    const session = await getWalletSessionByRefreshToken(input.refreshToken);
    if (session) await revokeWalletSession(session.sessionId);
    return { ok: true };
  }

  if (input.accessToken) {
    const claims = verifyWalletAccessToken(input.accessToken);
    if (claims) {
      await revokeWalletSession(claims.sid);
    }
  }

  return { ok: true };
}

export async function getWalletSessionMeFromToken(accessToken: string) {
  const claims = verifyWalletAccessToken(accessToken);
  if (!claims) return null;

  const session = await getWalletSessionById(claims.sid);
  if (!session || session.revokedAt || Date.parse(session.refreshExpiresAt) <= Date.now()) return null;

  await touchWalletSession(session.sessionId);
  return {
    actorId: session.actorId,
    walletAddress: session.walletAddress,
    role: session.role,
    userUid: session.userUid,
    sessionId: session.sessionId,
    method: 'wallet',
    verified: true as const
  };
}

export async function getWalletSessionMe(req: NextRequest) {
  const token = parseBearerToken(req);
  if (!token) return null;
  return getWalletSessionMeFromToken(token);
}
