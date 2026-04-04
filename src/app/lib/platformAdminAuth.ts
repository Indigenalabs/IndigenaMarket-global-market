import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { requireAdvocacyOpsRole } from '@/app/lib/advocacyOpsAuth';

const DEFAULT_ALLOWED_ROLES = ['admin', 'platform_ops', 'partnerships_admin', 'governance_admin', 'compliance_admin', 'data_governance'];
export const PLATFORM_ADMIN_SESSION_COOKIE = 'indigena_platform_admin_session';
export const PLATFORM_ADMIN_AUTH_COOKIE = 'indigena_platform_admin_auth';
export const PLATFORM_ADMIN_WALLET_COOKIE = 'indigena_platform_admin_wallet';
export const PLATFORM_ADMIN_ACTOR_COOKIE = 'indigena_platform_admin_actor';

export function hasValidPlatformAdminSignature(req: NextRequest) {
  const signed = req.headers.get('x-admin-signed') === 'true' || req.cookies.get(PLATFORM_ADMIN_SESSION_COOKIE)?.value === 'true';
  if (!signed) return false;
  const expectedToken = process.env.PLATFORM_ADMIN_REVIEW_TOKEN?.trim();
  if (!expectedToken) return true;
  return req.headers.get('x-platform-admin-token') === expectedToken || req.cookies.get(PLATFORM_ADMIN_SESSION_COOKIE)?.value === 'true';
}

async function buildPlatformAdminPageHeaders() {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const merged = new Headers(headerStore);
  if (!merged.get('x-admin-signed') && cookieStore.get(PLATFORM_ADMIN_SESSION_COOKIE)?.value === 'true') {
    merged.set('x-admin-signed', 'true');
  }
  const authToken = cookieStore.get(PLATFORM_ADMIN_AUTH_COOKIE)?.value || '';
  if (authToken && !merged.get('authorization')) {
    merged.set('authorization', `Bearer ${authToken}`);
  }
  const wallet = cookieStore.get(PLATFORM_ADMIN_WALLET_COOKIE)?.value || '';
  if (wallet) {
    if (!merged.get('x-wallet-address')) merged.set('x-wallet-address', wallet);
    if (!merged.get('x-actor-id')) merged.set('x-actor-id', wallet);
  }
  const actorId = cookieStore.get(PLATFORM_ADMIN_ACTOR_COOKIE)?.value || '';
  if (actorId && !merged.get('x-actor-id')) {
    merged.set('x-actor-id', actorId);
  }
  const expectedToken = process.env.PLATFORM_ADMIN_REVIEW_TOKEN?.trim();
  if (expectedToken && !merged.get('x-platform-admin-token') && cookieStore.get(PLATFORM_ADMIN_SESSION_COOKIE)?.value === 'true') {
    merged.set('x-platform-admin-token', expectedToken);
  }
  return merged;
}

export async function requirePlatformAdmin(req: NextRequest, allowedRoles = DEFAULT_ALLOWED_ROLES) {
  if (!hasValidPlatformAdminSignature(req)) {
    return {
      error: NextResponse.json(
        {
          message: process.env.PLATFORM_ADMIN_REVIEW_TOKEN?.trim()
            ? 'Valid admin signature token required.'
            : 'Admin signature required.'
        },
        { status: 403 }
      ),
      identity: null
    };
  }
  return requireAdvocacyOpsRole(req, allowedRoles);
}

export async function requirePlatformAdminPageAccess(allowedRoles = DEFAULT_ALLOWED_ROLES) {
  const req = new NextRequest('http://local-admin-check', { headers: await buildPlatformAdminPageHeaders() });
  return requirePlatformAdmin(req, allowedRoles);
}

export function platformAdminError(message: string, status = 403) {
  return NextResponse.json({ message }, { status });
}
