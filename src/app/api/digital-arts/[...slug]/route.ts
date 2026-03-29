import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';

type R = Record<string, unknown>;

const fallback = [
  {
    listingId: 'art-1',
    title: 'Dreaming River',
    category: 'digital-paintings',
    listingType: 'buy-now',
    pricing: { basePrice: { amount: 220, currency: 'INDI' }, buyNowPrice: 220, startingBid: 0 },
    content: { previewUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=700&fit=crop', images: [] },
    culturalMetadata: { nation: 'Yolngu' },
    stats: { favorites: 0, views: 0, sales: 0 },
    compliance: { creatorVerificationStatus: 'verified', provenanceLevel: 'verified', rightsFlags: { personalUse: true, commercialUse: false, derivativeUse: false, attributionRequired: true }, moderationStatus: 'approved' },
    createdAt: new Date().toISOString(),
    status: 'published'
  }
];

function ok(data: unknown) {
  return NextResponse.json({ data, pagination: { page: 1, pages: 1, total: Array.isArray(data) ? data.length : 1 } });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function actor(req: NextRequest) {
  return resolveRequestActorId(req);
}

function map(row: R) {
  const amount = Number(row.price || 0);
  return {
    listingId: String(row.id),
    creatorAddress: String(row.creator_actor_id || ''),
    title: String(row.title || ''),
    category: String(row.category || ''),
    listingType: String(row.sale_type || 'buy-now'),
    pricing: { basePrice: { amount, currency: String(row.currency || 'INDI') }, buyNowPrice: amount, startingBid: amount },
    content: { previewUrl: String(row.preview_url || ''), images: [] },
    culturalMetadata: { nation: String(row.nation || '') },
    stats: { favorites: 0, views: 0, sales: 0 },
    compliance: { creatorVerificationStatus: row.verified ? 'verified' : 'pending', provenanceLevel: 'basic', rightsFlags: row.rights_flags || { personalUse: true, commercialUse: false, derivativeUse: false, attributionRequired: true }, moderationStatus: 'approved' },
    createdAt: String(row.created_at || new Date().toISOString()),
    status: String(row.status || 'published')
  };
}

function mapOrder(row: R) {
  const paymentBreakdown = (row.payment_breakdown as R) || (row.paymentBreakdown as R) || {};
  return {
    orderId: String(row.id || ''),
    listingId: String(row.listing_id || ''),
    buyerActorId: String(row.buyer_actor_id || ''),
    buyerWalletAddress: String(row.buyer_wallet_address || ''),
    creatorActorId: String(row.creator_actor_id || ''),
    title: String(row.title || ''),
    amountPaid: Number(row.amount_paid || 0),
    currency: String(row.currency || 'INDI'),
    status: String(row.status || 'captured'),
    paymentBreakdown: {
      subtotal: Number(paymentBreakdown.subtotal || 0),
      buyerServiceFee: Number(paymentBreakdown.buyerServiceFee || 0),
      platformFee: Number(paymentBreakdown.platformFee || 0),
      buyerTotal: Number(paymentBreakdown.buyerTotal || 0),
      creatorNet: Number(paymentBreakdown.creatorNet || 0)
    },
    receiptId: String(row.receipt_id || ''),
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

async function list(req: NextRequest, isSearch = false) {
  if (!isSupabaseServerConfigured()) return isSearch ? NextResponse.json({ data: { listings: fallback, listingCount: fallback.length } }) : ok(fallback);
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '24')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let q = supabase.from('digital_art_listings').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  const search = String(req.nextUrl.searchParams.get('q') || '').trim();
  if (search) q = q.ilike('title', `%${search}%`);
  const category = String(req.nextUrl.searchParams.get('category') || '').trim();
  if (category) q = q.eq('category', category);
  const nation = String(req.nextUrl.searchParams.get('nation') || '').trim();
  if (nation) q = q.ilike('nation', `%${nation}%`);
  const { data, count, error } = await q;
  if (error) return fail(error.message, 500);
  const listings = (data || []).map((x) => map(x as unknown as R));
  if (isSearch) return NextResponse.json({ data: { listings, listingCount: Number(count || listings.length) } });
  return NextResponse.json({ data: listings, pagination: { page, pages: Math.max(1, Math.ceil(Number(count || listings.length) / limit)), total: Number(count || listings.length) } });
}

async function listOrders(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ orders: [] });
  const supabase = createSupabaseServerClient();
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  const actorFilter = actorId !== 'guest' ? actorId : wallet;
  if (!actorFilter) return NextResponse.json({ orders: [] });
  const { data, error } = await supabase
    .from('digital_art_orders')
    .select('*')
    .or(`buyer_actor_id.eq.${actorFilter},buyer_wallet_address.eq.${actorFilter}`)
    .order('created_at', { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ orders: (data || []).map((row) => mapOrder(row as unknown as R)) });
}

async function createBuyOrder(listingId: string, req: NextRequest, body: R) {
  let listing: R | null = null;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('digital_art_listings').select('*').eq('id', listingId).maybeSingle();
    listing = (data as R | null) || null;
  }
  if (!listing) {
    listing = {
      id: listingId,
      title: String(body.title || 'Digital Art Listing'),
      price: Number(body.amount || 0),
      currency: String(body.currency || 'INDI'),
      creator_actor_id: String(body.creatorAddress || '')
    };
  }

  const subtotal = Number(body.amount || listing.price || 0);
  if (!subtotal) return fail('Listing price is required');
  const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
  const quote = calculateTransactionQuote({
    pillar: 'digital-arts',
    subtotal,
    creatorPlanId,
    memberPlanId
  });

  const order: R = {
    id: `dao-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    listing_id: listingId,
    buyer_actor_id: actor(req),
    buyer_wallet_address: resolveRequestWallet(req) || String(body.buyerAddress || '').trim().toLowerCase() || null,
    creator_actor_id: String(listing.creator_actor_id || ''),
    title: String(listing.title || ''),
    amount_paid: quote.buyerTotal,
    currency: String(listing.currency || body.currency || 'INDI'),
    status: 'captured',
    receipt_id: `rcpt-${listingId}-${Date.now()}`,
    payment_breakdown: {
      subtotal: quote.subtotal,
      buyerServiceFee: quote.buyerServiceFee,
      platformFee: quote.platformFee,
      buyerTotal: quote.buyerTotal,
      creatorNet: quote.creatorNet
    },
    created_at: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('digital_art_orders').insert(order);
    if (error) return fail(error.message, 500);
  }
  if (String(order.creator_actor_id || '')) {
    await appendFinanceLedgerEntry({
      id: `fin-ledger-${String(order.id)}`,
      actorId: String(order.creator_actor_id || ''),
      profileSlug: String(order.creator_actor_id || ''),
      pillar: 'digital-arts',
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
      createdAt: String(order.created_at)
    });
  }
  return NextResponse.json({ success: true, order: mapOrder(order), feeBreakdown: order.payment_breakdown });
}

async function event(body: R) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('marketplace_events').insert({ id: crypto.randomUUID(), pillar: 'digital-arts', entity_type: 'listing', entity_id: String(body.listingId || ''), event_name: String(body.event || 'view'), actor_id: String(body.actorId || ''), metadata: body.metadata || {}, created_at: new Date().toISOString() });
  }
  return NextResponse.json({ ok: true });
}

async function heatmap() {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ categories: {} });
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('marketplace_events').select('*').eq('pillar', 'digital-arts').limit(5000);
  const mapHeat: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const c = String(row?.metadata?.category || 'all');
    mapHeat[c] = (mapHeat[c] || 0) + 1;
  });
  return NextResponse.json(mapHeat);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a === 'search') return list(req, true);
  if (a === 'listings') return list(req, false);
  if (a === 'orders' && b === 'me') return listOrders(req);
  if (a === 'analytics' && b === 'heatmap') return heatmap();
  return fail('Unsupported digital-arts endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c] = slug;
  const body = (await req.json().catch(() => ({}))) as R;
  if (a === 'analytics' && b === 'event') return event(body);
  if (a === 'listings' && b && c === 'buy') return createBuyOrder(b, req, body);
  if (a === 'listings' && b && ['bid', 'offers', 'watchlist', 'share', 'report'].includes(c || '')) {
    await event({ event: `listing_${c}`, listingId: b, actorId: actor(req), metadata: body });
    return NextResponse.json({ success: true });
  }
  return fail('Unsupported digital-arts endpoint', 404);
}
