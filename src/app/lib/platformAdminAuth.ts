import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { requireAdvocacyOpsRole } from '@/app/lib/advocacyOpsAuth';

const DEFAULT_ALLOWED_ROLES = ['admin', 'platform_ops', 'partnerships_admin', 'governance_admin', 'compliance_admin', 'data_governance'];

export function hasValidPlatformAdminSignature(req: NextRequest) {
  if (req.headers.get('x-admin-signed') !== 'true') return false;
  const expectedToken = process.env.PLATFORM_ADMIN_REVIEW_TOKEN?.trim();
  if (!expectedToken) return true;
  return req.headers.get('x-platform-admin-token') === expectedToken;
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
  const headerStore = await headers();
  const req = new NextRequest('http://local-admin-check', { headers: headerStore });
  return requirePlatformAdmin(req, allowedRoles);
}

export function platformAdminError(message: string, status = 403) {
  return NextResponse.json({ message }, { status });
}
