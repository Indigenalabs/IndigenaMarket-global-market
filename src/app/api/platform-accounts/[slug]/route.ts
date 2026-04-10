import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAccountAccess } from '@/app/lib/creatorProfileAccess';
import {
  getPlatformAccountBySlug,
  removePlatformAccountMember,
  upsertPlatformAccountMember,
  type PlatformMemberRole
} from '@/app/lib/platformAccounts';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const data = await getPlatformAccountBySlug(slug);
  if (!data) return NextResponse.json({ message: 'Platform account not found' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = asText(body.action);

  const operator = await requirePlatformAccountAccess(req, slug, {
    guestMessage: 'Sign in to manage community representatives.',
    forbiddenMessage: 'Only community operators with member-management access can change representatives.',
    requiredPermissions: ['manage_members']
  });
  if ('error' in operator) return operator.error;

  if (action === 'upsert-member') {
    const role = asText(body.role) as PlatformMemberRole;
    if (!['owner', 'representative', 'editor', 'treasurer', 'elder', 'steward'].includes(role)) {
      return NextResponse.json({ message: 'A valid member role is required.' }, { status: 400 });
    }

    await upsertPlatformAccountMember({
      accountId: operator.account.id,
      actorId: asText(body.actorId),
      displayName: asText(body.displayName),
      role,
      permissions: Array.isArray(body.permissions) ? body.permissions.map(String) : undefined
    });
  } else if (action === 'remove-member') {
    await removePlatformAccountMember({
      accountId: operator.account.id,
      memberId: asText(body.memberId) || undefined,
      actorId: asText(body.actorId) || undefined
    });
  } else {
    return NextResponse.json({ message: 'Unsupported platform account action.' }, { status: 400 });
  }

  const refreshed = await getPlatformAccountBySlug(slug);
  return NextResponse.json({ data: refreshed });
}
