import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import type { AccessPlanId, CreatorPlanId, MemberPlanId, TeamPlanId, LifetimePlanId } from '@/app/lib/monetization';

type SubscriptionFamily = 'member' | 'creator' | 'access' | 'team' | 'lifetime';
type SubscriptionPlanId = MemberPlanId | CreatorPlanId | AccessPlanId | TeamPlanId | LifetimePlanId;

export interface SubscriptionRecord {
  id: string;
  actorId: string;
  walletAddress: string;
  family: SubscriptionFamily;
  planId: SubscriptionPlanId;
  billingCadence: 'monthly' | 'annual' | 'one-time';
  paymentMethod: 'card' | 'indi' | 'staked';
  status: 'active' | 'cancelled';
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
  cancelledAt?: string | null;
  stripeCustomerId?: string;
  stripeCheckoutSessionId?: string;
  stripeSubscriptionId?: string;
  startedAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActorEntitlements {
  memberPlanId: MemberPlanId;
  creatorPlanId: CreatorPlanId;
  accessPlanIds: AccessPlanId[];
  teamPlanIds: TeamPlanId[];
  lifetimePlanIds: LifetimePlanId[];
  records: SubscriptionRecord[];
  source: 'supabase' | 'runtime';
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'creator-subscriptions.json');

const MEMBER_PRIORITY: MemberPlanId[] = ['all-access', 'patron', 'community', 'free'];
const CREATOR_PRIORITY: CreatorPlanId[] = ['studio', 'creator', 'free'];

function isMemberPlanId(value: string): value is MemberPlanId {
  return ['free', 'community', 'patron', 'all-access'].includes(value);
}

function isCreatorPlanId(value: string): value is CreatorPlanId {
  return ['free', 'creator', 'studio'].includes(value);
}

function isAccessPlanId(value: string): value is AccessPlanId {
  return [
    'digital-arts-pass',
    'heritage-archive-pass',
    'seva-impact-pass',
    'tourism-explorer-pass',
    'creative-pro-pass',
    'all-access-pass',
    'basic-archive',
    'researcher-access',
    'institutional-archive'
  ].includes(value);
}

function isTeamPlanId(value: string): value is TeamPlanId {
  return ['collective', 'hub', 'organization'].includes(value);
}

function isLifetimePlanId(value: string): value is LifetimePlanId {
  return ['founder', 'elder'].includes(value);
}

function pickBestMember(records: SubscriptionRecord[]): MemberPlanId {
  for (const id of MEMBER_PRIORITY) {
    if (records.some((record) => record.family === 'member' && record.planId === id && record.status === 'active')) {
      return id;
    }
  }
  return 'free';
}

function pickBestCreator(records: SubscriptionRecord[]): CreatorPlanId {
  for (const id of CREATOR_PRIORITY) {
    if (records.some((record) => record.family === 'creator' && record.planId === id && record.status === 'active')) {
      return id;
    }
  }
  return 'free';
}

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('subscription state');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntimeRecords(): Promise<SubscriptionRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SubscriptionRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeRecords(records: SubscriptionRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function normalizeSupabaseRecord(row: Record<string, unknown>): SubscriptionRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    walletAddress: String(row.wallet_address || ''),
    family: String(row.family || 'member') as SubscriptionFamily,
    planId: String(row.plan_id || '') as SubscriptionPlanId,
    billingCadence: String(row.billing_cadence || 'monthly') as SubscriptionRecord['billingCadence'],
    paymentMethod: String(row.payment_method || 'card') as SubscriptionRecord['paymentMethod'],
    status: String(row.status || 'active') as SubscriptionRecord['status'],
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    cancellationReason: row.cancellation_reason ? String(row.cancellation_reason) : undefined,
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : null,
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id ? String(row.stripe_checkout_session_id) : undefined,
    stripeSubscriptionId: row.stripe_subscription_id ? String(row.stripe_subscription_id) : undefined,
    startedAt: String(row.started_at || ''),
    endsAt: row.ends_at ? String(row.ends_at) : null,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

export async function getActorEntitlements(actorId: string, walletAddress = ''): Promise<ActorEntitlements> {
  let records: SubscriptionRecord[] = [];
  let source: ActorEntitlements['source'] = 'runtime';
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const actorFilter = actorId !== 'guest' ? actorId : walletAddress;
    if (actorFilter) {
      const { data } = await supabase
        .from('creator_account_subscriptions')
        .select('*')
        .or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      records = (data || []).map((row) => normalizeSupabaseRecord(row as Record<string, unknown>));
      source = 'supabase';
    }
  } else {
    const runtime = await readRuntimeRecords();
    records = runtime.filter((record) => record.status === 'active' && (record.actorId === actorId || (!!walletAddress && record.walletAddress === walletAddress)));
  }

  const accessPlanIds = records
    .filter((record) => record.family === 'access' && isAccessPlanId(String(record.planId)))
    .map((record) => record.planId as AccessPlanId);
  const teamPlanIds = records
    .filter((record) => record.family === 'team' && isTeamPlanId(String(record.planId)))
    .map((record) => record.planId as TeamPlanId);
  const lifetimePlanIds = records
    .filter((record) => record.family === 'lifetime' && isLifetimePlanId(String(record.planId)))
    .map((record) => record.planId as LifetimePlanId);

  return {
    memberPlanId: pickBestMember(records),
    creatorPlanId: pickBestCreator(records),
    accessPlanIds,
    teamPlanIds,
    lifetimePlanIds,
    records,
    source
  };
}

export async function upsertActorSubscription(input: {
  actorId: string;
  walletAddress?: string;
  family: SubscriptionFamily;
  planId: SubscriptionPlanId;
  billingCadence: SubscriptionRecord['billingCadence'];
  paymentMethod: SubscriptionRecord['paymentMethod'];
  stripeCustomerId?: string;
  stripeCheckoutSessionId?: string;
  stripeSubscriptionId?: string;
}): Promise<SubscriptionRecord> {
  const now = new Date().toISOString();
  const record: SubscriptionRecord = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: input.actorId,
    walletAddress: input.walletAddress || '',
    family: input.family,
    planId: input.planId,
    billingCadence: input.billingCadence,
    paymentMethod: input.paymentMethod,
    status: 'active',
    cancelAtPeriodEnd: false,
    cancellationReason: undefined,
    cancelledAt: null,
    stripeCustomerId: input.stripeCustomerId,
    stripeCheckoutSessionId: input.stripeCheckoutSessionId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    startedAt: now,
    endsAt: input.billingCadence === 'one-time' ? null : null,
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const actorFilter = input.actorId !== 'guest' ? input.actorId : input.walletAddress || '';
    if (actorFilter) {
      await supabase
        .from('creator_account_subscriptions')
        .update({ status: 'cancelled', updated_at: now })
        .or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
        .eq('family', input.family)
        .eq('status', 'active');
    }
    const { data, error } = await supabase
      .from('creator_account_subscriptions')
      .insert({
        id: record.id,
        actor_id: record.actorId,
        wallet_address: record.walletAddress || null,
        family: record.family,
        plan_id: record.planId,
        billing_cadence: record.billingCadence,
        payment_method: record.paymentMethod,
        status: record.status,
        cancel_at_period_end: false,
        cancellation_reason: null,
        cancelled_at: null,
        stripe_customer_id: record.stripeCustomerId || null,
        stripe_checkout_session_id: record.stripeCheckoutSessionId || null,
        stripe_subscription_id: record.stripeSubscriptionId || null,
        started_at: record.startedAt,
        ends_at: record.endsAt,
        created_at: record.createdAt,
        updated_at: record.updatedAt
      })
      .select('*')
      .single();
    if (error) throw error;
    return normalizeSupabaseRecord(data as Record<string, unknown>);
  }

  const runtime = await readRuntimeRecords();
  const updated = runtime.map((existing) =>
    (existing.actorId === input.actorId || (!!input.walletAddress && existing.walletAddress === input.walletAddress)) &&
    existing.family === input.family &&
    existing.status === 'active'
      ? { ...existing, status: 'cancelled' as const, updatedAt: now }
      : existing
  );
  updated.unshift(record);
  await writeRuntimeRecords(updated);
  return record;
}

export async function updateSubscriptionStatusByStripeReference(input: {
  stripeSubscriptionId?: string;
  stripeCheckoutSessionId?: string;
  stripeCustomerId?: string;
  status: SubscriptionRecord['status'];
  cancelAtPeriodEnd?: boolean;
}) {
  const now = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('creator_account_subscriptions').update({
      status: input.status,
      updated_at: now,
      cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
      cancelled_at: input.status === 'cancelled' ? now : null
    });
    if (input.stripeSubscriptionId) query = query.eq('stripe_subscription_id', input.stripeSubscriptionId);
    else if (input.stripeCheckoutSessionId) query = query.eq('stripe_checkout_session_id', input.stripeCheckoutSessionId);
    else if (input.stripeCustomerId) query = query.eq('stripe_customer_id', input.stripeCustomerId);
    else return;
    await query;
    return;
  }

  const runtime = await readRuntimeRecords();
  const updated = runtime.map((record) => {
    const matches =
      (input.stripeSubscriptionId && record.stripeSubscriptionId === input.stripeSubscriptionId) ||
      (input.stripeCheckoutSessionId && record.stripeCheckoutSessionId === input.stripeCheckoutSessionId) ||
      (input.stripeCustomerId && record.stripeCustomerId === input.stripeCustomerId);
    return matches
      ? {
          ...record,
          status: input.status,
          updatedAt: now,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
          cancelledAt: input.status === 'cancelled' ? now : record.cancelledAt || null
        }
      : record;
  });
  await writeRuntimeRecords(updated);
}

export async function cancelActorSubscription(
  actorId: string,
  walletAddress: string,
  family: SubscriptionFamily,
  options?: { cancelAtPeriodEnd?: boolean; reason?: string }
) {
  const now = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const actorFilter = actorId !== 'guest' ? actorId : walletAddress;
    if (!actorFilter) return;
    await supabase
      .from('creator_account_subscriptions')
      .update({
        status: options?.cancelAtPeriodEnd ? 'active' : 'cancelled',
        cancel_at_period_end: options?.cancelAtPeriodEnd ?? false,
        cancellation_reason: options?.reason || null,
        cancelled_at: options?.cancelAtPeriodEnd ? null : now,
        updated_at: now
      })
      .or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
      .eq('family', family)
      .eq('status', 'active');
    return;
  }
  const runtime = await readRuntimeRecords();
  const updated = runtime.map((record) =>
    (record.actorId === actorId || (!!walletAddress && record.walletAddress === walletAddress)) &&
    record.family === family &&
    record.status === 'active'
      ? {
          ...record,
          status: options?.cancelAtPeriodEnd ? ('active' as const) : ('cancelled' as const),
          cancelAtPeriodEnd: options?.cancelAtPeriodEnd ?? false,
          cancellationReason: options?.reason,
          cancelledAt: options?.cancelAtPeriodEnd ? null : now,
          updatedAt: now
        }
      : record
  );
  await writeRuntimeRecords(updated);
}

export async function listActorSubscriptions(actorId: string, walletAddress = ''): Promise<SubscriptionRecord[]> {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const actorFilter = actorId !== 'guest' ? actorId : walletAddress;
    if (actorFilter) {
      const { data } = await supabase
        .from('creator_account_subscriptions')
        .select('*')
        .or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
        .order('created_at', { ascending: false });
      return (data || []).map((row) => normalizeSupabaseRecord(row as Record<string, unknown>));
    }
    return [];
  }
  const runtime = await readRuntimeRecords();
  return runtime.filter((record) => record.actorId === actorId || (!!walletAddress && record.walletAddress === walletAddress));
}
