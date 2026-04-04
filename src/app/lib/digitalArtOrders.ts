import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type DigitalArtOrderStatus = 'captured' | 'pending_settlement' | 'settled' | 'refunded' | 'disputed';
export type DigitalArtOrderKind = 'primary' | 'resale';

export interface DigitalArtOrderRecord {
  id: string;
  listingId: string;
  buyerActorId: string;
  buyerWalletAddress: string;
  creatorActorId: string;
  sellerActorId: string;
  title: string;
  amountPaid: number;
  currency: string;
  status: DigitalArtOrderStatus;
  receiptId: string;
  orderKind: DigitalArtOrderKind;
  royaltyRate: number;
  royaltyAmount: number;
  sellerNetAmount: number;
  platformFeeAmount: number;
  buyerServiceFeeAmount: number;
  subtotalAmount: number;
  buyerTotalAmount: number;
  parentOrderId: string;
  createdAt: string;
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'digital-art-orders.json');

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function amount(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asMap(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function shouldFallback(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = text((error as Record<string, unknown>).code);
  const message = text((error as Record<string, unknown>).message).toLowerCase();
  return code === '42P01' || code === 'PGRST205' || message.includes('does not exist') || message.includes('schema cache');
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('digital art orders');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<DigitalArtOrderRecord[]> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '[]');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DigitalArtOrderRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRuntime(rows: DigitalArtOrderRecord[]) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), 'utf8');
}

function fromRow(row: Record<string, unknown>): DigitalArtOrderRecord {
  const paymentBreakdown = asMap(row.payment_breakdown || row.paymentBreakdown);
  return {
    id: text(row.id),
    listingId: text(row.listing_id || row.listingId),
    buyerActorId: text(row.buyer_actor_id || row.buyerActorId),
    buyerWalletAddress: text(row.buyer_wallet_address || row.buyerWalletAddress),
    creatorActorId: text(row.creator_actor_id || row.creatorActorId),
    sellerActorId: text(paymentBreakdown.sellerActorId || row.creator_actor_id || row.creatorActorId),
    title: text(row.title),
    amountPaid: amount(row.amount_paid || row.amountPaid),
    currency: text(row.currency, 'INDI'),
    status: text(row.status, 'captured') as DigitalArtOrderStatus,
    receiptId: text(row.receipt_id || row.receiptId),
    orderKind: text(paymentBreakdown.orderKind, 'primary') as DigitalArtOrderKind,
    royaltyRate: amount(paymentBreakdown.royaltyRate),
    royaltyAmount: amount(paymentBreakdown.royaltyAmount),
    sellerNetAmount: amount(paymentBreakdown.sellerNet || paymentBreakdown.creatorNet),
    platformFeeAmount: amount(paymentBreakdown.platformFee),
    buyerServiceFeeAmount: amount(paymentBreakdown.buyerServiceFee),
    subtotalAmount: amount(paymentBreakdown.subtotal || row.amount_paid || row.amountPaid),
    buyerTotalAmount: amount(paymentBreakdown.buyerTotal || row.amount_paid || row.amountPaid),
    parentOrderId: text(paymentBreakdown.parentOrderId),
    createdAt: text(row.created_at || row.createdAt)
  };
}

function toInsertPayload(order: DigitalArtOrderRecord) {
  return {
    id: order.id,
    listing_id: order.listingId,
    buyer_actor_id: order.buyerActorId || null,
    buyer_wallet_address: order.buyerWalletAddress || null,
    creator_actor_id: order.creatorActorId || null,
    title: order.title,
    amount_paid: order.amountPaid,
    currency: order.currency,
    status: order.status,
    receipt_id: order.receiptId,
    payment_breakdown: {
      subtotal: order.subtotalAmount,
      buyerServiceFee: order.buyerServiceFeeAmount,
      platformFee: order.platformFeeAmount,
      buyerTotal: order.buyerTotalAmount,
      creatorNet: order.sellerNetAmount,
      sellerNet: order.sellerNetAmount,
      orderKind: order.orderKind,
      sellerActorId: order.sellerActorId,
      originalCreatorActorId: order.creatorActorId,
      royaltyRate: order.royaltyRate,
      royaltyAmount: order.royaltyAmount,
      parentOrderId: order.parentOrderId
    },
    created_at: order.createdAt
  };
}

export async function listDigitalArtOrders(input: { buyerActorId?: string; includeAll?: boolean } = {}) {
  const buyerActorId = text(input.buyerActorId).trim().toLowerCase();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('digital_art_orders').select('*').order('created_at', { ascending: false }).limit(100);
    if (!input.includeAll && buyerActorId) {
      query = query.or(`buyer_actor_id.eq.${buyerActorId},buyer_wallet_address.eq.${buyerActorId}`);
    }
    const { data, error } = await query;
    if (!error && data) return data.map((row) => fromRow(row as Record<string, unknown>));
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readRuntime();
  if (input.includeAll || !buyerActorId) return runtime;
  return runtime.filter((row) => row.buyerActorId === buyerActorId || row.buyerWalletAddress === buyerActorId);
}

export async function createDigitalArtOrder(order: DigitalArtOrderRecord) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('digital_art_orders').insert(toInsertPayload(order)).select('*').single();
    if (!error && data) return fromRow(data as Record<string, unknown>);
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readRuntime();
  runtime.unshift(order);
  await writeRuntime(runtime);
  return order;
}

export async function updateDigitalArtOrderStatus(input: { id: string; status: DigitalArtOrderStatus }) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('digital_art_orders')
      .update({ status: input.status })
      .eq('id', input.id)
      .select('*')
      .single();
    if (!error && data) return fromRow(data as Record<string, unknown>);
    if (error && !shouldFallback(error)) throw error;
  }

  const runtime = await readRuntime();
  const index = runtime.findIndex((entry) => entry.id === input.id);
  if (index < 0) throw new Error('Digital art order not found.');
  runtime[index] = { ...runtime[index], status: input.status };
  await writeRuntime(runtime);
  return runtime[index];
}
