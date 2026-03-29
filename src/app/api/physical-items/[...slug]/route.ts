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
    itemId: String(row.id),
    title: String(row.title || ''),
    description: String(row.description || ''),
    categoryId: String(row.category || ''),
    subcategory: String(row.subcategory || ''),
    price: Number(row.price || 0),
    currency: String(row.currency || 'USD'),
    listingType: 'buy-now',
    images: row.media || [],
    creator: {
      name: String(row.maker_name || 'Maker'),
      tribalAffiliation: String(row.nation || ''),
      walletAddress: String(row.maker_actor_id || '')
    },
    authenticity: { verified: Boolean(row.verified) },
    elderVerified: Boolean(row.elder_verified),
    status: String(row.status || 'published'),
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

function mapOrder(row: R) {
  const paymentBreakdown = (row.payment_breakdown as R) || (row.paymentBreakdown as R) || {};
  return {
    orderId: String(row.id || row.order_id || ''),
    actorId: String(row.actor_id || row.actorId || ''),
    walletAddress: String(row.wallet_address || row.walletAddress || ''),
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal || 0),
    currency: String(row.currency || 'USD'),
    paymentIntentId: String(row.payment_intent_id || row.paymentIntentId || ''),
    paymentStatus: String(row.payment_status || row.paymentStatus || 'intent-created'),
    fulfillmentStatus: String(row.fulfillment_status || row.fulfillmentStatus || 'awaiting-payment'),
    amountPaid: Number(row.amount_paid || row.amountPaid || 0),
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
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ items: [], total: 0, pages: 1, page: 1, count: 0 });
  }
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '24')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let q = supabase
    .from('physical_item_listings')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });
  const text = String(req.nextUrl.searchParams.get('q') || '').trim();
  if (text) q = q.ilike('title', `%${text}%`);
  const categoryId = String(req.nextUrl.searchParams.get('categoryId') || '').trim();
  if (categoryId) q = q.eq('category', categoryId);
  const { data, count, error } = await q;
  if (error) return fail(error.message, 500);
  const items = (data || []).map((x) => map(x as unknown as R));
  return NextResponse.json({
    items,
    total: Number(count || items.length),
    page,
    pages: Math.max(1, Math.ceil(Number(count || items.length) / limit)),
    count: Number(count || items.length)
  });
}

async function listOrders(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ orders: [] });
  const supabase = createSupabaseServerClient();
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  const actorFilter = actorId !== 'guest' ? actorId : wallet;
  if (!actorFilter) return NextResponse.json({ orders: [] });
  const { data, error } = await supabase
    .from('physical_item_orders')
    .select('*')
    .or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
    .order('created_at', { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ orders: (data || []).map((row) => mapOrder(row as unknown as R)) });
}

async function createCheckoutOrder(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  const entries = Array.isArray(body.entries) ? (body.entries as R[]) : [];
  if (!entries.length) return fail('At least one cart entry is required');

  const normalizedEntries = entries
    .map((entry) => {
      const price = Number(entry.price || 0);
      const quantity = Math.max(1, Number(entry.quantity || 1));
      return {
        itemId: String(entry.itemId || ''),
        title: String(entry.title || ''),
        quantity,
        price,
        image: String(entry.image || ''),
        maker: String(entry.maker || ''),
        nation: String(entry.nation || ''),
        variant: String(entry.variant || '')
      };
    })
    .filter((entry) => entry.itemId && entry.quantity > 0);

  if (!normalizedEntries.length) return fail('No valid cart entries were provided');

  const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
  const subtotal = Number(normalizedEntries.reduce((sum, entry) => sum + entry.price * entry.quantity, 0).toFixed(2));
  const quote = calculateTransactionQuote({
    pillar: 'physical-items',
    subtotal,
    includePhysicalProtection: true,
    creatorPlanId,
    memberPlanId
  });

  const order: R = {
    id: `pio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actor_id: actorId,
    wallet_address: wallet || String(body.walletAddress || '').trim().toLowerCase() || null,
    items: normalizedEntries,
    subtotal,
    currency: String(body.currency || 'INDI'),
    payment_intent_id: `pi-physical-${crypto.randomUUID()}`,
    payment_status: 'intent-created',
    fulfillment_status: 'awaiting-payment',
    amount_paid: 0,
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
    const { error } = await supabase.from('physical_item_orders').insert(order);
    if (error) return fail(error.message, 500);
  }

  return NextResponse.json({ success: true, order: mapOrder(order), feeBreakdown: order.payment_breakdown }, { status: 201 });
}

async function confirmCheckoutOrder(orderId: string, req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  let paymentBreakdown = (body.paymentBreakdown as R) || {};
  let existingOrder: R | null = null;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('physical_item_orders').select('*').eq('id', orderId).maybeSingle();
    existingOrder = (data as R | null) || null;
    paymentBreakdown = ((existingOrder?.payment_breakdown as R) || paymentBreakdown);
  }
  const amountPaid = Number(body.amountPaid || paymentBreakdown.buyerTotal || existingOrder?.amount_paid || 0);
  const updates: R = {
    payment_status: 'captured',
    fulfillment_status: 'queued',
    amount_paid: amountPaid,
    payment_reference: String(body.paymentReference || `pay-${Date.now()}`),
    receipt_id: `rcpt-${orderId}`,
    updated_at: new Date().toISOString()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('physical_item_orders').update(updates).eq('id', orderId);
    if (error) return fail(error.message, 500);
  }
  const items = Array.isArray(existingOrder?.items) ? (existingOrder?.items as R[]) : [];
  const itemIds = items.map((entry) => String(entry.itemId || '')).filter(Boolean);
  const makerByItemId = new Map<string, string>();
  if (isSupabaseServerConfigured() && itemIds.length > 0) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('physical_item_listings')
      .select('id,maker_actor_id')
      .in('id', itemIds);
    (data || []).forEach((row) => {
      const record = row as R;
      makerByItemId.set(String(record.id || ''), String(record.maker_actor_id || ''));
    });
  }

  const sellerGroups = new Map<string, { itemSummary: string[]; subtotal: number }>();
  for (const entry of items) {
    const itemId = String(entry.itemId || '');
    const actorId = makerByItemId.get(itemId) || String(entry.makerActorId || entry.maker || itemId || '').trim();
    if (!actorId) continue;
    const group = sellerGroups.get(actorId) || { itemSummary: [], subtotal: 0 };
    group.itemSummary.push(String(entry.title || itemId || 'Physical item'));
    group.subtotal += Number(entry.price || 0) * Math.max(1, Number(entry.quantity || 1));
    sellerGroups.set(actorId, group);
  }

  const totalSubtotal = Number(paymentBreakdown.subtotal || 0) || Array.from(sellerGroups.values()).reduce((sum, group) => sum + group.subtotal, 0);
  const groupEntries = Array.from(sellerGroups.entries());
  let remainingPlatformFee = Number(paymentBreakdown.platformFee || 0);
  let remainingCreatorNet = Number(paymentBreakdown.creatorNet || 0);
  for (let index = 0; index < groupEntries.length; index += 1) {
    const [sellerActorId, group] = groupEntries[index];
    const isLast = index === groupEntries.length - 1;
    const ratio = totalSubtotal > 0 ? group.subtotal / totalSubtotal : 1 / Math.max(1, groupEntries.length);
    const platformFeeAmount = isLast ? remainingPlatformFee : Number((Number(paymentBreakdown.platformFee || 0) * ratio).toFixed(2));
    const creatorNetAmount = isLast ? remainingCreatorNet : Number((Number(paymentBreakdown.creatorNet || 0) * ratio).toFixed(2));
    remainingPlatformFee = Number((remainingPlatformFee - platformFeeAmount).toFixed(2));
    remainingCreatorNet = Number((remainingCreatorNet - creatorNetAmount).toFixed(2));

    await appendFinanceLedgerEntry({
      id: `fin-ledger-${orderId}-${sellerActorId}`,
      actorId: sellerActorId,
      profileSlug: sellerActorId,
      pillar: 'physical-items',
      type: 'sale',
      status: 'paid',
      item: group.itemSummary.join(', ') || `Physical order ${orderId}`,
      grossAmount: Number(group.subtotal.toFixed(2)),
      platformFeeAmount,
      processorFeeAmount: 0,
      escrowFeeAmount: 0,
      refundAmount: 0,
      disputeAmount: 0,
      creatorNetAmount,
      disputeReason: '',
      createdAt: new Date().toISOString()
    });
  }
  return NextResponse.json({
    success: true,
    orderId,
    paymentStatus: 'captured',
    fulfillmentStatus: 'queued',
    amountPaid,
    receiptId: updates.receipt_id,
    feeBreakdown: paymentBreakdown
  });
}

async function event(body: R) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('marketplace_events').insert({
      id: crypto.randomUUID(),
      pillar: 'physical-items',
      entity_type: 'item',
      entity_id: String(body.itemId || ''),
      event_name: String(body.event || 'view'),
      actor_id: String(body.actorId || ''),
      metadata: body.metadata || {},
      created_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ ok: true });
}

async function report(itemId: string, body: R, req: NextRequest) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('physical_item_reports').insert({
      id: `pir-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      item_id: itemId,
      reporter_actor_id: (req.headers.get('x-actor-id') || req.headers.get('x-wallet-address') || '').toLowerCase(),
      reason: String(body.reason || 'policy'),
      details: String(body.details || ''),
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ success: true });
}

async function heatmap() {
  if (!isSupabaseServerConfigured()) return NextResponse.json({});
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('marketplace_events').select('*').eq('pillar', 'physical-items').limit(5000);
  const h: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const c = String(row?.metadata?.category || 'all');
    h[c] = (h[c] || 0) + 1;
  });
  return NextResponse.json(h);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a === 'search') return list(req);
  if (a === 'items') return list(req);
  if (a === 'orders' && b === 'me') return listOrders(req);
  if (a === 'analytics' && b === 'heatmap') return heatmap();
  if (a === 'moderation' && b === 'queue') {
    if (!isSupabaseServerConfigured()) return NextResponse.json({ status: true, data: { reports: [] } });
    const supabase = createSupabaseServerClient();
    const status = String(req.nextUrl.searchParams.get('status') || 'open');
    const { data, error } = await supabase
      .from('physical_item_reports')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return fail(error.message, 500);
    const reports = (data || []).map((r: any) => ({
      _id: r.id,
      itemId: r.item_id,
      reporterAddress: r.reporter_actor_id,
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.created_at
    }));
    return NextResponse.json({ status: true, data: { reports } });
  }
  return fail('Unsupported physical-items endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c, d] = slug;
  if (a === 'checkout') return createCheckoutOrder(req);
  if (a === 'orders' && b && c === 'payment-confirm') return confirmCheckoutOrder(b, req);
  const body = (await req.json().catch(() => ({}))) as R;
  if (a === 'analytics' && b === 'event') return event(body);
  if (a === 'items' && b && ['buy', 'offers', 'watchlist', 'share'].includes(c || '')) {
    await event({ event: `item_${c}`, itemId: b, metadata: body });
    return NextResponse.json({ success: true });
  }
  if (a === 'items' && b && c === 'report') return report(b, body, req);
  if (a === 'moderation' && b === 'reports' && c && d === 'decision') {
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const decision = String(body.decision || 'review');
      const status = decision === 'resolve' ? 'resolved' : decision === 'dismiss' ? 'dismissed' : 'under_review';
      await supabase.from('physical_item_reports').update({ status, updated_at: new Date().toISOString() }).eq('id', c);
    }
    return NextResponse.json({ status: true });
  }
  return fail('Unsupported physical-items endpoint', 404);
}
