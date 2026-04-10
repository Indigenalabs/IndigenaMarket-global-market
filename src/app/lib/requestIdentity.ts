import { NextRequest } from 'next/server';
import { ensureAccountIdentityFromAccessToken } from '@/app/lib/accountAuthService';
import { getWalletSessionMe } from '@/app/lib/walletAuthService';
import { verifyWalletAccessToken } from '@/app/lib/walletSessionToken';

function parseBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
}

export type RequestIdentity = {
  actorId: string;
  walletAddress: string;
  email: string;
  displayName: string;
  method: 'wallet' | 'email' | 'header';
  verified: boolean;
};

export async function resolveRequestIdentity(req: NextRequest): Promise<RequestIdentity | null> {
  const walletSession = await getWalletSessionMe(req).catch(() => null);
  if (walletSession?.actorId) {
    return {
      actorId: walletSession.actorId.trim().toLowerCase(),
      walletAddress: String(walletSession.walletAddress || '').trim().toLowerCase(),
      email: '',
      displayName: '',
      method: 'wallet',
      verified: true
    };
  }

  const token = parseBearerToken(req);
  if (token) {
    const account = await ensureAccountIdentityFromAccessToken(token).catch(() => null);
    if (account?.actorId) {
      return {
        actorId: account.actorId.trim().toLowerCase(),
        walletAddress: String(account.walletAddress || '').trim().toLowerCase(),
        email: String(account.email || '').trim().toLowerCase(),
        displayName: String(account.displayName || '').trim(),
        method: 'email',
        verified: true
      };
    }
  }

  const actorId = (req.headers.get('x-actor-id') || req.headers.get('x-wallet-address') || '').trim().toLowerCase();
  const walletAddress = (req.headers.get('x-wallet-address') || '').trim().toLowerCase();
  const email = (req.headers.get('x-account-email') || '').trim().toLowerCase();
  const displayName = (req.headers.get('x-account-display-name') || '').trim();
  if (!actorId && !walletAddress) return null;
  return {
    actorId: actorId || walletAddress,
    walletAddress,
    email,
    displayName,
    method: 'header',
    verified: false
  };
}

export function resolveRequestActorId(req: NextRequest) {
  const headerActor = (req.headers.get('x-actor-id') || req.headers.get('x-wallet-address') || '').trim().toLowerCase();
  if (headerActor) return headerActor;

  const token = parseBearerToken(req);
  if (!token) return 'guest';
  const claims = verifyWalletAccessToken(token);
  if (claims?.sub) return claims.sub.trim().toLowerCase();
  return `jwt:${token.slice(0, 12)}`;
}

export function resolveRequestWallet(req: NextRequest) {
  const headerWallet = (req.headers.get('x-wallet-address') || '').trim().toLowerCase();
  if (headerWallet) return headerWallet;
  const token = parseBearerToken(req);
  if (!token) return '';
  const claims = verifyWalletAccessToken(token);
  return claims?.wallet?.trim().toLowerCase() || '';
}
