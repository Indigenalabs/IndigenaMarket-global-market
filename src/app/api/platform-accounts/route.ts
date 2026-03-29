import { NextRequest, NextResponse } from 'next/server';
import { createPlatformAccount, listPlatformAccounts } from '@/app/lib/platformAccounts';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { getWalletSessionMe } from '@/app/lib/walletAuthService';

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
  const data = await listPlatformAccounts(accountTypes.length ? { accountTypes } : undefined);
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const session = await getWalletSessionMe(req).catch(() => null);
  const actorId = session?.actorId || resolveRequestActorId(req) || text(body.actorId) || 'guest';
  const walletAddress = session?.walletAddress || resolveRequestWallet(req) || '';
  if (actorId === 'guest' && !text(body.actorId)) {
    return NextResponse.json({ message: 'Wallet or actor identity required to create a community account.' }, { status: 401 });
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
    actorDisplayName: text(body.actorDisplayName) || session?.actorId || 'Community representative'
  });
  return NextResponse.json({ data }, { status: 201 });
}
