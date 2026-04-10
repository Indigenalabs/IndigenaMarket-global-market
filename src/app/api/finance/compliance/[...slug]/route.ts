import { NextRequest, NextResponse } from 'next/server';
import { resolveRequestIdentity } from '@/app/lib/requestIdentity';
import { findCreatorProfileSlugForActor } from '@/app/lib/accountAuthService';
import { getFiatRailsSnapshot, upsertFiatPayoutDestination } from '@/app/lib/fiatRails';
import { recordGovernanceAuditEvent, upsertComplianceProfile } from '@/app/lib/complianceGovernance';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  if (a !== 'me') return fail('Unsupported compliance endpoint.', 404);

  const identity = await resolveRequestIdentity(req).catch(() => null);
  if (!identity?.actorId) return fail('Sign in required.', 401);

  const profileSlug =
    (req.nextUrl.searchParams.get('profileSlug') || '').trim() ||
    (await findCreatorProfileSlugForActor(identity.actorId).catch(() => null)) ||
    '';

  const snapshot = await getFiatRailsSnapshot({
    actorId: identity.actorId,
    walletAddress: identity.walletAddress,
    profileSlug
  });
  return NextResponse.json({ data: snapshot });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  if (a !== 'me') return fail('Unsupported compliance endpoint.', 404);

  const identity = await resolveRequestIdentity(req).catch(() => null);
  if (!identity?.actorId) return fail('Sign in required.', 401);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('Invalid compliance payload.');

  const action = asText(body.action);
  const profileSlug = asText(body.profileSlug) || (await findCreatorProfileSlugForActor(identity.actorId).catch(() => null)) || '';

  if (action === 'save-destination') {
    const label = asText(body.label).trim();
    if (!label) return fail('Destination label is required.');

    const snapshotBefore = await getFiatRailsSnapshot({
      actorId: identity.actorId,
      walletAddress: identity.walletAddress,
      profileSlug
    });
    const derivedStatus =
      asText(body.status) ||
      (
        snapshotBefore.readiness.kycApproved &&
        snapshotBefore.readiness.amlApproved &&
        snapshotBefore.readiness.payoutEnabled &&
        asText(body.last4).trim().length >= 2
          ? 'ready'
          : 'review_required'
      );

    const destination = await upsertFiatPayoutDestination({
      actorId: identity.actorId,
      profileSlug,
      label,
      destinationType: asText(body.destinationType, 'manual_review') as any,
      accountName: asText(body.accountName),
      institutionName: asText(body.institutionName),
      last4: asText(body.last4),
      currency: asText(body.currency, 'USD'),
      countryCode: asText(body.countryCode, 'AU'),
      isDefault: asBoolean(body.isDefault, true),
      status: derivedStatus as any,
      metadata: {
        ...asObject(body.metadata),
        savedFrom: 'wallet',
        accountEmail: identity.email || ''
      }
    });

    await recordGovernanceAuditEvent({
      actorId: identity.actorId,
      domain: 'financial-services',
      action: 'fiat-destination-saved',
      targetId: destination.id,
      metadata: {
        profileSlug,
        destinationType: destination.destinationType,
        status: destination.status
      }
    });

    const snapshot = await getFiatRailsSnapshot({
      actorId: identity.actorId,
      walletAddress: identity.walletAddress,
      profileSlug
    });
    return NextResponse.json({ data: { destination, snapshot } }, { status: 201 });
  }

  if (action === 'request-review') {
    const note = asText(body.note) || 'User requested payout/compliance review from wallet.';
    const profile = await upsertComplianceProfile({
      actorId: identity.actorId,
      walletAddress: identity.walletAddress,
      notes: note
    });
    await recordGovernanceAuditEvent({
      actorId: identity.actorId,
      domain: 'financial-services',
      action: 'fiat-rails-review-requested',
      targetId: profile.id,
      metadata: { profileSlug, email: identity.email || '' }
    });
    const snapshot = await getFiatRailsSnapshot({
      actorId: identity.actorId,
      walletAddress: identity.walletAddress,
      profileSlug
    });
    return NextResponse.json({ data: snapshot }, { status: 201 });
  }

  return fail('Unsupported compliance action.', 400);
}