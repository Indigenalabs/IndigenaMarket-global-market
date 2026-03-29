import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import type { VerificationProductId } from '@/app/lib/verificationRevenue';

export interface VerificationPurchaseRecord {
  id: string;
  actorId: string;
  walletAddress: string;
  profileSlug: string;
  productId: VerificationProductId;
  productName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationPurchaseEventRecord {
  id: string;
  purchaseId: string;
  status: VerificationPurchaseRecord['status'];
  note: string;
  actorId: string;
  createdAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'creator-verification-purchases.json');
const EVENTS_RUNTIME_FILE = path.join(RUNTIME_DIR, 'creator-verification-purchase-events.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('verification purchases');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntimeRecords(): Promise<VerificationPurchaseRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VerificationPurchaseRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeRecords(records: VerificationPurchaseRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

async function readRuntimeEvents(): Promise<VerificationPurchaseEventRecord[]> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(EVENTS_RUNTIME_FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VerificationPurchaseEventRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntimeEvents(records: VerificationPurchaseEventRecord[]) {
  await ensureRuntimeDir();
  await fs.writeFile(EVENTS_RUNTIME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function normalizeRow(row: Record<string, unknown>): VerificationPurchaseRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    walletAddress: String(row.wallet_address || ''),
    profileSlug: String(row.profile_slug || ''),
    productId: String(row.product_id || '') as VerificationProductId,
    productName: String(row.product_name || ''),
    amount: Number(row.amount || 0),
    currency: String(row.currency || 'usd'),
    status: String(row.status || 'pending') as VerificationPurchaseRecord['status'],
    stripeCheckoutSessionId: row.stripe_checkout_session_id ? String(row.stripe_checkout_session_id) : undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id ? String(row.stripe_payment_intent_id) : undefined,
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function normalizeEventRow(row: Record<string, unknown>): VerificationPurchaseEventRecord {
  return {
    id: String(row.id || ''),
    purchaseId: String(row.purchase_id || ''),
    status: String(row.status || 'pending') as VerificationPurchaseRecord['status'],
    note: String(row.note || ''),
    actorId: String(row.actor_id || ''),
    createdAt: String(row.created_at || '')
  };
}

export async function listVerificationPurchasesForActor(actorId: string, walletAddress = '', profileSlug = '') {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const actorFilter = actorId !== 'guest' ? actorId : walletAddress;
    if (!actorFilter) return [];
    let query = supabase
      .from('creator_verification_purchases')
      .select('*')
      .or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
      .order('created_at', { ascending: false });
    if (profileSlug) query = query.eq('profile_slug', profileSlug);
    const { data } = await query;
    return (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntimeRecords();
  return runtime.filter((record) => {
    const actorMatch = record.actorId === actorId || (!!walletAddress && record.walletAddress === walletAddress);
    const profileMatch = !profileSlug || record.profileSlug === profileSlug;
    return actorMatch && profileMatch;
  });
}

export async function listVerificationPurchases(limit = 200) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('creator_verification_purchases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntimeRecords();
  return runtime.slice(0, limit);
}

export async function createVerificationPurchase(input: {
  actorId: string;
  walletAddress?: string;
  profileSlug: string;
  productId: VerificationProductId;
  productName: string;
  amount: number;
  currency?: string;
  status?: VerificationPurchaseRecord['status'];
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
}) {
  const now = new Date().toISOString();
  const record: VerificationPurchaseRecord = {
    id: `vp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: input.actorId,
    walletAddress: input.walletAddress || '',
    profileSlug: input.profileSlug,
    productId: input.productId,
    productName: input.productName,
    amount: input.amount,
    currency: input.currency || 'usd',
    status: input.status || 'pending',
    stripeCheckoutSessionId: input.stripeCheckoutSessionId,
    stripePaymentIntentId: input.stripePaymentIntentId,
    stripeCustomerId: input.stripeCustomerId,
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('creator_verification_purchases')
      .insert({
        id: record.id,
        actor_id: record.actorId,
        wallet_address: record.walletAddress || null,
        profile_slug: record.profileSlug,
        product_id: record.productId,
        product_name: record.productName,
        amount: record.amount,
        currency: record.currency,
        status: record.status,
        stripe_checkout_session_id: record.stripeCheckoutSessionId || null,
        stripe_payment_intent_id: record.stripePaymentIntentId || null,
        stripe_customer_id: record.stripeCustomerId || null,
        created_at: record.createdAt,
        updated_at: record.updatedAt
      })
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as Record<string, unknown>);
  }

  const runtime = await readRuntimeRecords();
  runtime.unshift(record);
  await writeRuntimeRecords(runtime);
  await appendVerificationPurchaseEvent({
    purchaseId: record.id,
    status: record.status,
    note: 'Purchase created',
    actorId: record.actorId
  });
  return record;
}

export async function updateVerificationPurchaseByCheckoutSession(input: {
  stripeCheckoutSessionId: string;
  status: VerificationPurchaseRecord['status'];
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
}) {
  const now = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase
      .from('creator_verification_purchases')
      .update({
        status: input.status,
        stripe_payment_intent_id: input.stripePaymentIntentId || null,
        stripe_customer_id: input.stripeCustomerId || null,
        updated_at: now
      })
      .eq('stripe_checkout_session_id', input.stripeCheckoutSessionId);
    return;
  }

  const runtime = await readRuntimeRecords();
  const updated = runtime.map((record) =>
    record.stripeCheckoutSessionId === input.stripeCheckoutSessionId
      ? {
          ...record,
          status: input.status,
          stripePaymentIntentId: input.stripePaymentIntentId,
          stripeCustomerId: input.stripeCustomerId,
          updatedAt: now
        }
      : record
  );
  await writeRuntimeRecords(updated);
}

export async function updateVerificationPurchaseStatus(input: {
  id: string;
  status: VerificationPurchaseRecord['status'];
  actorId?: string;
  note?: string;
}) {
  const now = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('creator_verification_purchases')
      .update({
        status: input.status,
        updated_at: now
      })
      .eq('id', input.id)
      .select('*')
      .single();
    if (error) throw error;
    const record = normalizeRow(data as Record<string, unknown>);
    await appendVerificationPurchaseEvent({
      purchaseId: input.id,
      status: input.status,
      note: input.note || `Status changed to ${input.status}`,
      actorId: input.actorId || 'platform-admin'
    });
    return record;
  }

  const runtime = await readRuntimeRecords();
  const updated = runtime.map((record) =>
    record.id === input.id
      ? {
          ...record,
          status: input.status,
          updatedAt: now
        }
      : record
  );
  await writeRuntimeRecords(updated);
  await appendVerificationPurchaseEvent({
    purchaseId: input.id,
    status: input.status,
    note: input.note || `Status changed to ${input.status}`,
    actorId: input.actorId || 'platform-admin'
  });
  return updated.find((record) => record.id === input.id) || null;
}

export async function appendVerificationPurchaseEvent(input: {
  purchaseId: string;
  status: VerificationPurchaseRecord['status'];
  note: string;
  actorId: string;
}) {
  const event: VerificationPurchaseEventRecord = {
    id: `vpe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    purchaseId: input.purchaseId,
    status: input.status,
    note: input.note,
    actorId: input.actorId,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('creator_verification_purchase_events').insert({
      id: event.id,
      purchase_id: event.purchaseId,
      status: event.status,
      note: event.note,
      actor_id: event.actorId,
      created_at: event.createdAt
    });
    return event;
  }

  const runtime = await readRuntimeEvents();
  runtime.unshift(event);
  await writeRuntimeEvents(runtime);
  return event;
}

export async function listVerificationPurchaseEvents(limit = 300) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('creator_verification_purchase_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data || []).map((row) => normalizeEventRow(row as Record<string, unknown>));
  }

  const runtime = await readRuntimeEvents();
  return runtime.slice(0, limit);
}
