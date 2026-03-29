import { NextRequest, NextResponse } from 'next/server';
import { enforceSharedRateLimit } from '@/app/lib/sharedRateLimit';
import {
  getWalletSessionMe,
  logoutWalletAuthSession,
  refreshWalletAuthSession,
  requestWalletAuthChallenge,
  verifyWalletAuthChallenge
} from '@/app/lib/walletAuthService';

type JsonMap = Record<string, unknown>;

function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function rateLimitKey(req: NextRequest, wallet = '') {
  const forwarded = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const fallback = req.headers.get('x-real-ip') || 'local';
  return (wallet || forwarded || fallback || 'local').toLowerCase();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;

  if (a === 'me') {
    const me = await getWalletSessionMe(req);
    if (!me) return ok(null);
    return ok(me);
  }

  return fail('Unsupported wallet auth endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  const body = (await req.json().catch(() => ({}))) as JsonMap;

  try {
    if (a === 'challenge') {
      const wallet = String(body.wallet || '').trim();
      if (!wallet) return fail('wallet is required');
      const limit = await enforceSharedRateLimit({
        scope: 'wallet-auth-challenge',
        bucketKey: rateLimitKey(req, wallet),
        limit: 6,
        windowMs: 10 * 60_000
      });
      if (!limit.allowed) return fail(`Too many wallet auth challenges. Retry after ${limit.resetAt}`, 429);
      const challenge = await requestWalletAuthChallenge(wallet);
      return ok(challenge, 201);
    }

    if (a === 'verify') {
      const wallet = String(body.wallet || '').trim();
      const challengeId = String(body.challengeId || '').trim();
      const signature = String(body.signature || '').trim();
      if (!wallet || !challengeId || !signature) return fail('wallet, challengeId, and signature are required');
      const limit = await enforceSharedRateLimit({
        scope: 'wallet-auth-verify',
        bucketKey: rateLimitKey(req, wallet),
        limit: 8,
        windowMs: 15 * 60_000
      });
      if (!limit.allowed) return fail(`Too many wallet auth verification attempts. Retry after ${limit.resetAt}`, 429);
      const session = await verifyWalletAuthChallenge({ walletAddress: wallet, challengeId, signature });
      return ok(session);
    }

    if (a === 'refresh') {
      const refreshToken = String(body.refreshToken || '').trim();
      if (!refreshToken) return fail('refreshToken is required');
      const session = await refreshWalletAuthSession(refreshToken);
      return ok(session);
    }

    if (a === 'logout') {
      const refreshToken = String(body.refreshToken || '').trim();
      const auth = req.headers.get('authorization') || '';
      const accessToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
      const result = await logoutWalletAuthSession({ refreshToken, accessToken });
      return ok(result);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Wallet auth request failed';
    const status = /not found|not recognized|required/i.test(message)
      ? 400
      : /expired|used|verified/i.test(message)
        ? 401
        : 500;
    return fail(message, status);
  }

  return fail('Unsupported wallet auth endpoint', 404);
}
