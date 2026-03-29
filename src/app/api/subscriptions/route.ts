import { NextRequest, NextResponse } from 'next/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { cancelActorSubscription, getActorEntitlements, listActorSubscriptions, upsertActorSubscription } from '@/app/lib/subscriptionState';
import { summarizeSubscriptionMetrics } from '@/app/lib/subscriptionMetrics';

type JsonMap = Record<string, unknown>;

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function GET(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const walletAddress = resolveRequestWallet(req);
  const data = await getActorEntitlements(actorId, walletAddress);
  const records = await listActorSubscriptions(actorId, walletAddress);
  const metrics = summarizeSubscriptionMetrics(records);
  return NextResponse.json({ ...data, records, metrics });
}

export async function POST(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const walletAddress = resolveRequestWallet(req);
  const body = (await req.json().catch(() => ({}))) as JsonMap;
  const family = String(body.family || '').trim() as 'member' | 'creator' | 'access' | 'team' | 'lifetime';
  const planId = String(body.planId || '').trim();
  const billingCadence = String(body.billingCadence || 'monthly').trim() as 'monthly' | 'annual' | 'one-time';
  const paymentMethod = String(body.paymentMethod || 'card').trim() as 'card' | 'indi' | 'staked';
  if (!family || !planId) return fail('family and planId are required');
  const record = await upsertActorSubscription({
    actorId,
    walletAddress,
    family,
    planId: planId as never,
    billingCadence,
    paymentMethod
  });
  const entitlements = await getActorEntitlements(actorId, walletAddress);
  return NextResponse.json({ record, entitlements }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const walletAddress = resolveRequestWallet(req);
  const family = String(req.nextUrl.searchParams.get('family') || '').trim() as 'member' | 'creator' | 'access' | 'team' | 'lifetime';
  const cancelAtPeriodEnd = String(req.nextUrl.searchParams.get('cancelAtPeriodEnd') || '').trim() === 'true';
  const reason = String(req.nextUrl.searchParams.get('reason') || '').trim();
  if (!family) return fail('family is required');
  await cancelActorSubscription(actorId, walletAddress, family, { cancelAtPeriodEnd, reason: reason || undefined });
  const entitlements = await getActorEntitlements(actorId, walletAddress);
  const records = await listActorSubscriptions(actorId, walletAddress);
  const metrics = summarizeSubscriptionMetrics(records);
  return NextResponse.json({ success: true, entitlements, records, metrics });
}
