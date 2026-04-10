import { NextRequest, NextResponse } from 'next/server';
import { createPlatformAccount, listPlatformAccounts } from '@/app/lib/platformAccounts';
import { resolveRequestIdentity } from '@/app/lib/requestIdentity';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map((entry) => text(entry)).filter(Boolean) : [];
}

export async function GET(req: NextRequest) {
  const accountTypes = (req.nextUrl.searchParams.get('accountTypes') || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) as any[];
  const mine = ['1', 'true', 'yes'].includes((req.nextUrl.searchParams.get('mine') || '').trim().toLowerCase());
  const identity = mine ? await resolveRequestIdentity(req) : null;
  if (mine && !identity?.actorId) {
    return NextResponse.json({ data: [] });
  }
  const data = await listPlatformAccounts({
    ...(accountTypes.length ? { accountTypes } : {}),
    ...(mine && identity?.actorId ? { actorId: identity.actorId } : {})
  });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const identity = await resolveRequestIdentity(req);
  const actorId = identity?.actorId || text(body.actorId) || 'guest';
  const walletAddress = identity?.walletAddress || '';
  if (actorId === 'guest' && !text(body.actorId)) {
    return NextResponse.json({ message: 'Sign in before creating a community account.' }, { status: 401 });
  }
  const slug = text(body.slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) return NextResponse.json({ message: 'Community slug is required.' }, { status: 400 });
  const data = await createPlatformAccount({
    slug,
    displayName: text(body.displayName),
    description: text(body.description),
    accountType: (text(body.accountType) || 'community') as any,
    location: text(body.location),
    nation: text(body.nation),
    storefrontHeadline: text(body.storefrontHeadline),
    payoutWallet: text(body.payoutWallet) || walletAddress,
    story: text(body.story),
    authorityProof: text(body.authorityProof),
    communityReferences: list(body.communityReferences),
    actorId,
    actorDisplayName: text(body.actorDisplayName) || identity?.displayName || identity?.email || 'Community representative'
  });
  return NextResponse.json({ data }, { status: 201 });
}
