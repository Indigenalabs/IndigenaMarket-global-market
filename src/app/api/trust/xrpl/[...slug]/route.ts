import { NextRequest, NextResponse } from 'next/server';
import { resolveRequestIdentity } from '@/app/lib/requestIdentity';
import { findCreatorProfileSlugForActor } from '@/app/lib/accountAuthService';
import { createXrplTrustRecord, listXrplTrustRecords } from '@/app/lib/xrplTrustLayer';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a !== 'records' || b !== 'me') return fail('Unsupported XRPL trust endpoint.', 404);

  const identity = await resolveRequestIdentity(req).catch(() => null);
  if (!identity?.actorId) return fail('Sign in required.', 401);

  const profileSlug =
    (req.nextUrl.searchParams.get('profileSlug') || '').trim() ||
    (await findCreatorProfileSlugForActor(identity.actorId).catch(() => null)) ||
    '';

  const records = await listXrplTrustRecords({ actorId: identity.actorId, profileSlug });
  return NextResponse.json({ data: records });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a !== 'records' || b !== 'me') return fail('Unsupported XRPL trust endpoint.', 404);

  const identity = await resolveRequestIdentity(req).catch(() => null);
  if (!identity?.actorId) return fail('Sign in required.', 401);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('Invalid XRPL trust payload.');
  if (asText(body.action) !== 'create-record') return fail('Unsupported XRPL trust action.', 400);

  const assetId = asText(body.assetId).trim();
  const assetTitle = asText(body.assetTitle).trim();
  if (!assetId || !assetTitle) return fail('assetId and assetTitle are required.');

  const profileSlug = asText(body.profileSlug) || (await findCreatorProfileSlugForActor(identity.actorId).catch(() => null)) || '';
  const record = await createXrplTrustRecord({
    actorId: identity.actorId,
    profileSlug,
    assetType: asText(body.assetType, 'digital_art') as any,
    assetId,
    assetTitle,
    trustType: asText(body.trustType, 'provenance') as any,
    status: asText(body.status, 'draft') as any,
    xrplTransactionHash: asText(body.xrplTransactionHash),
    xrplTokenId: asText(body.xrplTokenId),
    xrplLedgerIndex: asText(body.xrplLedgerIndex),
    anchorUri: asText(body.anchorUri),
    metadata: {
      ...asObject(body.metadata),
      requestedFrom: 'wallet',
      accountEmail: identity.email || ''
    }
  });
  return NextResponse.json({ data: record }, { status: 201 });
}