import { NextRequest } from 'next/server';
import { verifyWalletAccessToken } from '@/app/lib/walletSessionToken';

function parseBearerToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
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
