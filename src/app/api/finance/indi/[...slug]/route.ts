import { NextRequest, NextResponse } from 'next/server';
import { appendIndiLedgerEntry, getIndiBalanceSnapshot, listIndiLedgerEntries } from '@/app/lib/indiBalanceLedger';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import { findCreatorProfileSlugForActor } from '@/app/lib/accountAuthService';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  const actorId = resolveRequestActorId(req);
  if (!actorId || actorId === 'guest') return fail('Sign in required.', 401);

  const profileSlug = (req.nextUrl.searchParams.get('profileSlug') || '').trim() || (await findCreatorProfileSlugForActor(actorId).catch(() => null)) || '';

  if (a === 'balance' && b === 'me') {
    const balance = await getIndiBalanceSnapshot({ actorId, profileSlug });
    return NextResponse.json({ data: balance });
  }

  if (a === 'ledger' && b === 'me') {
    const entries = await listIndiLedgerEntries({ actorId, profileSlug, limit: 200 });
    return NextResponse.json({ data: entries });
  }

  return fail('Unsupported INDI finance endpoint.', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  if (a !== 'me') return fail('Unsupported INDI finance endpoint.', 404);

  const actorId = resolveRequestActorId(req);
  if (!actorId || actorId === 'guest') return fail('Sign in required.', 401);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('Invalid INDI finance payload.');

  const action = asText(body.action);
  const profileSlug = asText(body.profileSlug) || (await findCreatorProfileSlugForActor(actorId).catch(() => null)) || '';

  if (action === 'request-withdrawal') {
    const amount = asNumber(body.amount);
    if (amount <= 0) return fail('Withdrawal amount must be greater than zero.');
    const balance = await getIndiBalanceSnapshot({ actorId, profileSlug });
    if (balance.availableBalance < amount) {
      return fail('Not enough INDI available for this withdrawal request.', 400);
    }

    const result = await appendIndiLedgerEntry({
      actorId,
      profileSlug,
      type: 'withdrawal_request',
      direction: 'debit',
      status: 'pending',
      amount,
      referenceType: 'withdrawal_request',
      referenceId: `withdrawal-${Date.now()}`,
      description: 'Withdrawal requested',
      metadata: {
        destination: asText(body.destination, 'fiat'),
        note: asText(body.note)
      }
    });
    return NextResponse.json({ data: result }, { status: 201 });
  }

  if (action === 'record-top-up') {
    const amount = asNumber(body.amount);
    if (amount <= 0) return fail('Top-up amount must be greater than zero.');

    const result = await appendIndiLedgerEntry({
      actorId,
      profileSlug,
      type: 'deposit',
      direction: 'credit',
      status: 'completed',
      amount,
      referenceType: 'top_up',
      referenceId: `topup-${Date.now()}`,
      description: 'INDI top-up recorded',
      metadata: {
        source: asText(body.source, 'manual'),
        note: asText(body.note)
      }
    });
    return NextResponse.json({ data: result }, { status: 201 });
  }

  if (action === 'apply-adjustment') {
    const adminGate = await requirePlatformAdmin(req);
    if (adminGate.error) return adminGate.error;
    const amount = asNumber(body.amount);
    if (amount <= 0) return fail('Adjustment amount must be greater than zero.');
    const direction = asText(body.direction, 'credit') === 'debit' ? 'debit' : 'credit';
    const result = await appendIndiLedgerEntry({
      actorId: asText(body.targetActorId, actorId).toLowerCase(),
      profileSlug,
      type: 'adjustment',
      direction,
      status: 'completed',
      amount,
      referenceType: 'admin_adjustment',
      referenceId: `adjustment-${Date.now()}`,
      description: asText(body.description, 'Admin adjustment'),
      metadata: {
        reason: asText(body.reason),
        appliedBy: actorId
      }
    });
    return NextResponse.json({ data: result }, { status: 201 });
  }

  return fail('Unsupported INDI balance action.', 400);
}
