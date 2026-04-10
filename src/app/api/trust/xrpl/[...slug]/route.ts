import { NextRequest, NextResponse } from 'next/server';
import { resolveRequestIdentity } from '@/app/lib/requestIdentity';
import { findCreatorProfileSlugForActor } from '@/app/lib/accountAuthService';
import {
  createXrplTrustRecord,
  findXrplTrustRecordByAsset,
  listXrplTrustRecords,
  updateXrplTrustRecord
} from '@/app/lib/xrplTrustLayer';

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
  if (a !== 'records') return fail('Unsupported XRPL trust endpoint.', 404);
  if (b === 'asset') {
    const assetType = asText(req.nextUrl.searchParams.get('assetType'), 'digital_art') as any;
    const assetId = asText(req.nextUrl.searchParams.get('assetId')).trim();
    const trustType = asText(req.nextUrl.searchParams.get('trustType')).trim() || undefined;
    if (!assetId) return fail('assetId is required.', 400);
    const record = await findXrplTrustRecordByAsset({ assetType, assetId, trustType: trustType as any });
    return NextResponse.json({ data: record });
  }
  if (b !== 'me') return fail('Unsupported XRPL trust endpoint.', 404);

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a !== 'records' || b !== 'me') return fail('Unsupported XRPL trust endpoint.', 404);

  const identity = await resolveRequestIdentity(req).catch(() => null);
  if (!identity?.actorId) return fail('Sign in required.', 401);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('Invalid XRPL trust payload.');
  const recordId = asText(body.recordId).trim();
  if (!recordId) return fail('recordId is required.');

  const profileSlug =
    asText(body.profileSlug) || (await findCreatorProfileSlugForActor(identity.actorId).catch(() => null)) || '';
  const mine = await listXrplTrustRecords({ actorId: identity.actorId, profileSlug });
  const owned = mine.find((record) => record.id === recordId);
  if (!owned) return fail('XRPL trust record not found.', 404);

  const updated = await updateXrplTrustRecord({
    id: recordId,
    status: asText(body.status) as any,
    xrplTransactionHash: body.xrplTransactionHash === undefined ? undefined : asText(body.xrplTransactionHash),
    xrplTokenId: body.xrplTokenId === undefined ? undefined : asText(body.xrplTokenId),
    xrplLedgerIndex: body.xrplLedgerIndex === undefined ? undefined : asText(body.xrplLedgerIndex),
    anchorUri: body.anchorUri === undefined ? undefined : asText(body.anchorUri),
    metadata: body.metadata ? asObject(body.metadata) : undefined
  });
  if (!updated) return fail('XRPL trust record not found.', 404);
  return NextResponse.json({ data: updated });
}
