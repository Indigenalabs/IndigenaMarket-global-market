import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface LogisticsShippingQuote {
  id: string;
  origin: string;
  destination: string;
  weightKg: number;
  carrier: string;
  baseRate: number;
  markupAmount: number;
  insurancePremium: number;
  total: number;
  currency: string;
  estimatedDays: string;
  createdAt: string;
}

export interface LogisticsInsuranceClaim {
  id: string;
  orderId: string;
  actorId: string;
  claimantName: string;
  amount: number;
  reason: string;
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'paid';
  evidenceUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogisticsNfcTagRecord {
  id: string;
  actorId: string;
  listingId: string;
  encodedUrl: string;
  unitFee: number;
  status: 'draft' | 'encoded' | 'attached';
  createdAt: string;
}

export interface LogisticsFulfillmentRecord {
  id: string;
  actorId: string;
  orderId: string;
  warehouse: string;
  storageFee: number;
  handlingFee: number;
  status: 'received' | 'picked' | 'packed' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface LogisticsInventorySubscription {
  id: string;
  actorId: string;
  plan: 'inventory-tools';
  monthlyFee: number;
  catalogSize: number;
  status: 'active' | 'cancelled';
  createdAt: string;
}

export interface LogisticsDashboardData {
  quotes: LogisticsShippingQuote[];
  claims: LogisticsInsuranceClaim[];
  tags: LogisticsNfcTagRecord[];
  fulfillment: LogisticsFulfillmentRecord[];
  inventorySubscriptions: LogisticsInventorySubscription[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'logistics-ops.json');

type RuntimeShape = LogisticsDashboardData;

async function ensureDir() {
  assertRuntimePersistenceAllowed('logistics operations');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<RuntimeShape> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) return { quotes: [], claims: [], tags: [], fulfillment: [], inventorySubscriptions: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<RuntimeShape>;
    return {
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
      claims: Array.isArray(parsed.claims) ? parsed.claims : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      fulfillment: Array.isArray(parsed.fulfillment) ? parsed.fulfillment : [],
      inventorySubscriptions: Array.isArray(parsed.inventorySubscriptions) ? parsed.inventorySubscriptions : []
    };
  } catch {
    return { quotes: [], claims: [], tags: [], fulfillment: [], inventorySubscriptions: [] };
  }
}

async function writeRuntime(data: RuntimeShape) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function quoteCarrier(weightKg: number) {
  if (weightKg <= 2) return { carrier: 'Indigena Post', baseRate: 14, days: '4-8 business days' };
  if (weightKg <= 8) return { carrier: 'Heritage Freight', baseRate: 28, days: '6-12 business days' };
  return { carrier: 'Steward Cargo', baseRate: 52, days: '8-16 business days' };
}

export async function listLogisticsData() {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [quotes, claims, tags, fulfillment, inventorySubscriptions] = await Promise.all([
    supabase.from('logistics_shipping_quotes').select('*').order('created_at', { ascending: false }),
    supabase.from('logistics_insurance_claims').select('*').order('created_at', { ascending: false }),
    supabase.from('logistics_nfc_tags').select('*').order('created_at', { ascending: false }),
    supabase.from('logistics_fulfillment_orders').select('*').order('created_at', { ascending: false }),
    supabase.from('logistics_inventory_subscriptions').select('*').order('created_at', { ascending: false })
  ]);
  return {
    quotes: (quotes.data || []).map((row: any) => ({ id: row.id, origin: row.origin, destination: row.destination, weightKg: Number(row.weight_kg || 0), carrier: row.carrier, baseRate: Number(row.base_rate || 0), markupAmount: Number(row.markup_amount || 0), insurancePremium: Number(row.insurance_premium || 0), total: Number(row.total || 0), currency: row.currency || 'USD', estimatedDays: row.estimated_days || '', createdAt: row.created_at })),
    claims: (claims.data || []).map((row: any) => ({ id: row.id, orderId: row.order_id, actorId: row.actor_id, claimantName: row.claimant_name, amount: Number(row.amount || 0), reason: row.reason, status: row.status, evidenceUrl: row.evidence_url || '', createdAt: row.created_at, updatedAt: row.updated_at || row.created_at })),
    tags: (tags.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, listingId: row.listing_id, encodedUrl: row.encoded_url, unitFee: Number(row.unit_fee || 0), status: row.status, createdAt: row.created_at })),
    fulfillment: (fulfillment.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, orderId: row.order_id, warehouse: row.warehouse, storageFee: Number(row.storage_fee || 0), handlingFee: Number(row.handling_fee || 0), status: row.status, createdAt: row.created_at, updatedAt: row.updated_at || row.created_at })),
    inventorySubscriptions: (inventorySubscriptions.data || []).map((row: any) => ({ id: row.id, actorId: row.actor_id, plan: 'inventory-tools', monthlyFee: Number(row.monthly_fee || 10), catalogSize: Number(row.catalog_size || 0), status: row.status, createdAt: row.created_at }))
  };
}

export async function createShippingQuote(input: { origin: string; destination: string; weightKg: number; insured?: boolean; currency?: string; }) {
  const carrier = quoteCarrier(input.weightKg);
  const markupAmount = Math.round(carrier.baseRate * 0.05 * 100) / 100;
  const insurancePremium = input.insured ? Math.round(Math.max(carrier.baseRate * 0.1, 3) * 100) / 100 : 0;
  const total = Math.round((carrier.baseRate + markupAmount + insurancePremium) * 100) / 100;
  const quote: LogisticsShippingQuote = {
    id: `ship-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    origin: input.origin,
    destination: input.destination,
    weightKg: Number(input.weightKg || 0),
    carrier: carrier.carrier,
    baseRate: carrier.baseRate,
    markupAmount,
    insurancePremium,
    total,
    currency: input.currency || 'USD',
    estimatedDays: carrier.days,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('logistics_shipping_quotes').insert({
      id: quote.id, origin: quote.origin, destination: quote.destination, weight_kg: quote.weightKg, carrier: quote.carrier, base_rate: quote.baseRate, markup_amount: quote.markupAmount, insurance_premium: quote.insurancePremium, total: quote.total, currency: quote.currency, estimated_days: quote.estimatedDays, created_at: quote.createdAt
    });
    return quote;
  }

  const state = await readRuntime();
  state.quotes.unshift(quote);
  await writeRuntime(state);
  return quote;
}

export async function createInsuranceClaim(input: { orderId: string; actorId: string; claimantName: string; amount: number; reason: string; evidenceUrl?: string; }) {
  const claim: LogisticsInsuranceClaim = {
    id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderId: input.orderId,
    actorId: input.actorId,
    claimantName: input.claimantName,
    amount: Number(input.amount || 0),
    reason: input.reason,
    status: 'submitted',
    evidenceUrl: input.evidenceUrl || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('logistics_insurance_claims').insert({ id: claim.id, order_id: claim.orderId, actor_id: claim.actorId, claimant_name: claim.claimantName, amount: claim.amount, reason: claim.reason, status: claim.status, evidence_url: claim.evidenceUrl, created_at: claim.createdAt, updated_at: claim.updatedAt });
    return claim;
  }
  const state = await readRuntime();
  state.claims.unshift(claim);
  await writeRuntime(state);
  return claim;
}

export async function issueNfcTag(input: { actorId: string; listingId: string; encodedUrl: string; }) {
  const tag: LogisticsNfcTagRecord = { id: `nfc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actorId: input.actorId, listingId: input.listingId, encodedUrl: input.encodedUrl, unitFee: 5, status: 'encoded', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('logistics_nfc_tags').insert({ id: tag.id, actor_id: tag.actorId, listing_id: tag.listingId, encoded_url: tag.encodedUrl, unit_fee: tag.unitFee, status: tag.status, created_at: tag.createdAt });
    return tag;
  }
  const state = await readRuntime();
  state.tags.unshift(tag);
  await writeRuntime(state);
  return tag;
}

export async function createFulfillmentOrder(input: { actorId: string; orderId: string; warehouse: string; storageFee?: number; handlingFee?: number; }) {
  const record: LogisticsFulfillmentRecord = { id: `ful-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actorId: input.actorId, orderId: input.orderId, warehouse: input.warehouse, storageFee: Number(input.storageFee || 18), handlingFee: Number(input.handlingFee || 12), status: 'received', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('logistics_fulfillment_orders').insert({ id: record.id, actor_id: record.actorId, order_id: record.orderId, warehouse: record.warehouse, storage_fee: record.storageFee, handling_fee: record.handlingFee, status: record.status, created_at: record.createdAt, updated_at: record.updatedAt });
    return record;
  }
  const state = await readRuntime();
  state.fulfillment.unshift(record);
  await writeRuntime(state);
  return record;
}

export async function createInventorySubscription(input: { actorId: string; catalogSize: number; }) {
  const subscription: LogisticsInventorySubscription = { id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actorId: input.actorId, plan: 'inventory-tools', monthlyFee: 10, catalogSize: input.catalogSize, status: 'active', createdAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('logistics_inventory_subscriptions').insert({ id: subscription.id, actor_id: subscription.actorId, monthly_fee: subscription.monthlyFee, catalog_size: subscription.catalogSize, status: subscription.status, created_at: subscription.createdAt });
    return subscription;
  }
  const state = await readRuntime();
  state.inventorySubscriptions.unshift(subscription);
  await writeRuntime(state);
  return subscription;
}

export async function updateInsuranceClaimStatus(id: string, status: LogisticsInsuranceClaim['status']) {
  const state = await listLogisticsData();
  const claim = state.claims.find((entry) => entry.id === id);
  if (!claim) throw new Error('Insurance claim not found.');
  const updated = { ...claim, status, updatedAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('logistics_insurance_claims').update({ status: updated.status, updated_at: updated.updatedAt }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime();
  runtime.claims = runtime.claims.map((entry) => entry.id === id ? updated : entry);
  await writeRuntime(runtime);
  return updated;
}

export async function updateFulfillmentStatus(id: string, status: LogisticsFulfillmentRecord['status']) {
  const state = await listLogisticsData();
  const record = state.fulfillment.find((entry) => entry.id === id);
  if (!record) throw new Error('Fulfillment record not found.');
  const updated = { ...record, status, updatedAt: new Date().toISOString() };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('logistics_fulfillment_orders').update({ status: updated.status, updated_at: updated.updatedAt }).eq('id', id);
    return updated;
  }
  const runtime = await readRuntime();
  runtime.fulfillment = runtime.fulfillment.map((entry) => entry.id === id ? updated : entry);
  await writeRuntime(runtime);
  return updated;
}
