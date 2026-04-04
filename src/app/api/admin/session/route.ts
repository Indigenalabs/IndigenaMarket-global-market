import { NextRequest, NextResponse } from 'next/server';
import {
  PLATFORM_ADMIN_ACTOR_COOKIE,
  PLATFORM_ADMIN_AUTH_COOKIE,
  PLATFORM_ADMIN_SESSION_COOKIE,
  PLATFORM_ADMIN_WALLET_COOKIE,
  requirePlatformAdmin
} from '@/app/lib/platformAdminAuth';

function clearAdminSessionCookies(res: NextResponse) {
  const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };
  res.cookies.set(PLATFORM_ADMIN_SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  res.cookies.set(PLATFORM_ADMIN_AUTH_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  res.cookies.set(PLATFORM_ADMIN_WALLET_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  res.cookies.set(PLATFORM_ADMIN_ACTOR_COOKIE, '', { ...cookieOptions, maxAge: 0 });
}

export async function POST(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;

  const res = NextResponse.json({
    ok: true,
    identity: {
      actorId: auth.identity?.actorId || '',
      walletAddress: auth.identity?.walletAddress || '',
      role: auth.identity?.role || ''
    }
  });
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  };
  res.cookies.set(PLATFORM_ADMIN_SESSION_COOKIE, 'true', cookieOptions);

  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (bearer) {
    res.cookies.set(PLATFORM_ADMIN_AUTH_COOKIE, bearer, cookieOptions);
  }

  const wallet = req.headers.get('x-wallet-address') || auth.identity?.walletAddress || '';
  if (wallet) {
    res.cookies.set(PLATFORM_ADMIN_WALLET_COOKIE, wallet, cookieOptions);
  }
  const actorId = req.headers.get('x-actor-id') || auth.identity?.actorId || '';
  if (actorId) {
    res.cookies.set(PLATFORM_ADMIN_ACTOR_COOKIE, actorId, cookieOptions);
  }

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  clearAdminSessionCookies(res);
  return res;
}
