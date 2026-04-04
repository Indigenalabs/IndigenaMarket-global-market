import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';

type R = Record<string, unknown>;

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function map(row: R) {
  return {
    id: String(row.id),
    kind: String(row.listing_type || 'product'),
    title: String(row.title || ''),
    subtitle: String(row.subtitle || ''),
    summary: String(row.summary || ''),
    image: String(row.image || ''),
    priceLabel: row.price ? `$${Number(row.price)} ${String(row.currency || 'USD')}` : undefined,
    route: `/land-food/${String(row.listing_type || 'product')}/${String(row.id)}`,
    verified: Boolean(row.verified ?? true),
    category: String(row.category || ''),
    stewardshipSharePercent: Number(row.stewardship_share_percent || 0),
    traceabilityLabel: String((row.traceability as R | undefined)?.qrCodeLabel || row.traceability_label || '')
  };
}

function mapOrder(row: R) {
  const paymentBreakdown = (row.payment_breakdown as R) || (row.paymentBreakdown as R) || {};
  return {
    orderId: String(row.id || ''),
    listingId: String(row.listing_id || ''),
    actorId: String(row.actor_id || ''),
    walletAddress: String(row.wallet_address || ''),
    title: String(row.title || ''),
    quantity: Number(row.quantity || 1),
    amountPaid: Number(row.amount_paid || 0),
    currency: String(row.currency || 'USD'),
    paymentStatus: String(row.payment_status || 'captured'),
    fulfillmentStatus: String(row.fulfillment_status || 'queued'),
    paymentBreakdown: {
      subtotal: Number(paymentBreakdown.subtotal || 0),
      buyerServiceFee: Number(paymentBreakdown.buyerServiceFee || 0),
      platformFee: Number(paymentBreakdown.platformFee || 0),
      buyerTotal: Number(paymentBreakdown.buyerTotal || 0),
      creatorNet: Number(paymentBreakdown.creatorNet || 0)
    },
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

async function list(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ items: [], page: 1, pages: 1, total: 0 });
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(60, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '18')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let q = supabase.from('land_food_listings').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  const text = String(req.nextUrl.searchParams.get('q') || '').trim();
  if (text) q = q.ilike('title', `%${text}%`);
  const kind = String(req.nextUrl.searchParams.get('kind') || '').trim();
  if (kind && kind !== 'all') q = q.eq('listing_type', kind);
  const category = String(req.nextUrl.searchParams.get('category') || '').trim();
  if (category && category !== 'all') q = q.eq('category', category);
  const verifiedOnly = req.nextUrl.searchParams.get('verifiedOnly') === '1';
  if (verifiedOnly) q = q.eq('verified', true);
  const { data, count, error } = await q;
  if (error) return fail(error.message, 500);
  const items = (data || []).map((x) => map(x as unknown as R));
  return NextResponse.json({ items, page, pages: Math.max(1, Math.ceil(Number(count || items.length) / limit)), total: Number(count || items.length) });
}

async function listOrders(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ orders: [] });
  const supabase = createSupabaseServerClient();
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  const actorFilter = actorId !== 'guest' ? actorId : wallet;
  if (!actorFilter) return NextResponse.json({ orders: [] });
  const { data, error } = await supabase
    .from('land_food_orders')
    .select('*')
    .or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
    .order('created_at', { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ orders: (data || []).map((row) => mapOrder(row as unknown as R)) });
}

async function createOrder(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const listingId = String(body.listingId || '').trim();
  if (!listingId) return fail('listingId is required');

  let listing: R | null = null;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('land_food_listings').select('*').eq('id', listingId).maybeSingle();
    listing = (data as R | null) || null;
  }
  if (!listing) {
    listing = {
      id: listingId,
      title: String(body.title || 'Land & Food Listing'),
      price: Number(body.unitPrice || body.amount || 0),
      currency: String(body.currency || 'USD')
    };
  }

  const quantity = Math.max(1, Number(body.quantity || 1));
  const subtotal = Number(((Number(listing.price || 0) || Number(body.amount || 0)) * quantity).toFixed(2));
  if (!subtotal) return fail('Listing price is required');
  const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
  const quote = calculateTransactionQuote({
    pillar: 'land-food',
    subtotal,
    creatorPlanId,
    memberPlanId
  });

  const order: R = {
    id: `lfo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    listing_id: listingId,
    actor_id: resolveRequestActorId(req),
    wallet_address: resolveRequestWallet(req) || String(body.walletAddress || '').trim().toLowerCase() || null,
    title: String(listing.title || ''),
    quantity,
    amount_paid: quote.buyerTotal,
    currency: String(listing.currency || body.currency || 'USD'),
    payment_status: 'captured',
    fulfillment_status: 'queued',
    receipt_id: `rcpt-${listingId}-${Date.now()}`,
    payment_breakdown: {
      subtotal: quote.subtotal,
      buyerServiceFee: quote.buyerServiceFee,
      platformFee: quote.platformFee,
      buyerTotal: quote.buyerTotal,
      creatorNet: quote.creatorNet
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('land_food_orders').insert(order);
    if (error) return fail(error.message, 500);
  }
  await appendFinanceLedgerEntry({
    id: `fin-ledger-${String(order.id)}`,
    actorId: String(listing.producer_actor_id || listingId),
    profileSlug: String(listing.producer_actor_id || listingId),
    pillar: 'land-food',
    type: 'sale',
    status: 'paid',
    item: String(order.title || ''),
    grossAmount: Number(quote.subtotal),
    platformFeeAmount: Number(quote.platformFee),
    processorFeeAmount: 0,
    escrowFeeAmount: 0,
    refundAmount: 0,
    disputeAmount: 0,
    creatorNetAmount: Number(quote.creatorNet),
    disputeReason: '',
    sourceType: 'listing',
    sourceId: listingId,
    metadata: {
      currency: String(order.currency || body.currency || 'INDI'),
      orderId: String(order.id),
      receiptId: String(order.receipt_id || ''),
      listingId
    },
    createdAt: String(order.created_at)
  });

  return NextResponse.json({ success: true, order: mapOrder(order), feeBreakdown: order.payment_breakdown }, { status: 201 });
}

async function event(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('marketplace_events').insert({ id: crypto.randomUUID(), pillar: 'land-food', entity_type: 'listing', entity_id: String(body.listingId || ''), event_name: String(body.event || 'view'), actor_id: String(req.headers.get('x-actor-id') || req.headers.get('x-wallet-address') || ''), metadata: body.metadata || {}, created_at: new Date().toISOString() });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a === 'listings') return list(req);
  if (a === 'orders' && b === 'me') return listOrders(req);
  return fail('Unsupported land-food endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  if (a === 'events') return event(req);
  if (a === 'checkout') return createOrder(req);
  return fail('Unsupported land-food endpoint', 404);
}
