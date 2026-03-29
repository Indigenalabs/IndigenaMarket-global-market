import { createHmac, timingSafeEqual } from 'node:crypto';

export type WalletSessionClaims = {
  iss: 'indigena-wallet-auth';
  typ: 'wallet-access';
  sid: string;
  sub: string;
  wallet: string;
  role: string;
  userUid?: string;
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getWalletSessionSecret() {
  const configured = process.env.INDIGENA_WALLET_SESSION_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('INDIGENA_WALLET_SESSION_SECRET is required in production');
  }
  return 'dev-wallet-session-secret-change-me';
}

function sign(input: string) {
  return createHmac('sha256', getWalletSessionSecret()).update(input).digest('base64url');
}

export function issueWalletAccessToken(input: {
  sessionId: string;
  actorId: string;
  walletAddress: string;
  role: string;
  userUid?: string;
  expiresInSec?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const claims: WalletSessionClaims = {
    iss: 'indigena-wallet-auth',
    typ: 'wallet-access',
    sid: input.sessionId,
    sub: input.actorId,
    wallet: input.walletAddress,
    role: input.role,
    userUid: input.userUid,
    iat: now,
    exp: now + Math.max(300, input.expiresInSec || 3600)
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const signature = sign(`${encodedHeader}.${encodedPayload}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyWalletAccessToken(token: string): WalletSessionClaims | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const parts = trimmed.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, receivedSignature] = parts;
  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);

  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as WalletSessionClaims;
    if (payload?.iss !== 'indigena-wallet-auth' || payload?.typ !== 'wallet-access') return null;
    if (!payload.sid || !payload.sub || !payload.wallet || !payload.exp) return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
