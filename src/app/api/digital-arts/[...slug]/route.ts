import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';
import { createDigitalArtOrder, listDigitalArtOrders } from '@/app/lib/digitalArtOrders';

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
      creatorNet: Number(paymentBreakdown.creatorNet || 0),
      sellerNet: Number(paymentBreakdown.sellerNet || paymentBreakdown.creatorNet || 0),
      royaltyAmount: Number(paymentBreakdown.royaltyAmount || 0),
      royaltyRate: Number(paymentBreakdown.royaltyRate || 0),
      orderKind: String(paymentBreakdown.orderKind || 'primary'),
      sellerActorId: String(paymentBreakdown.sellerActorId || row.creator_actor_id || ''),
      originalCreatorActorId: String(paymentBreakdown.originalCreatorActorId || row.creator_actor_id || ''),
      parentOrderId: String(paymentBreakdown.parentOrderId || '')
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
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  const actorFilter = actorId !== 'guest' ? actorId : wallet;
  if (!actorFilter) return NextResponse.json({ orders: [] });
  const orders = await listDigitalArtOrders({ buyerActorId: actorFilter });
  return NextResponse.json({ orders: orders.map((row) => mapOrder(row as unknown as R)) });
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

  const order = await createDigitalArtOrder({
    id: `dao-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    listingId,
    buyerActorId: actor(req),
    buyerWalletAddress: resolveRequestWallet(req) || String(body.buyerAddress || '').trim().toLowerCase(),
    creatorActorId: String(listing.creator_actor_id || ''),
    sellerActorId: String(listing.creator_actor_id || ''),
    title: String(listing.title || ''),
    amountPaid: quote.buyerTotal,
    currency: String(listing.currency || body.currency || 'INDI'),
    status: 'captured',
    receiptId: `rcpt-${listingId}-${Date.now()}`,
    orderKind: 'primary',
    royaltyRate: 0,
    royaltyAmount: 0,
    sellerNetAmount: quote.creatorNet,
    platformFeeAmount: quote.platformFee,
    buyerServiceFeeAmount: quote.buyerServiceFee,
    subtotalAmount: quote.subtotal,
    buyerTotalAmount: quote.buyerTotal,
    parentOrderId: '',
    createdAt: new Date().toISOString()
  });

  if (String(order.creatorActorId || '')) {
    await appendFinanceLedgerEntry({
      id: `fin-ledger-${String(order.id)}`,
      actorId: String(order.creatorActorId || ''),
      profileSlug: String(order.creatorActorId || ''),
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
      sourceType: 'listing',
      sourceId: listingId,
      metadata: {
        currency: String(order.currency || body.currency || 'INDI'),
        orderId: String(order.id),
        orderKind: 'primary'
      },
      createdAt: String(order.createdAt)
    });
  }
  return NextResponse.json({
    success: true,
    order: mapOrder({
      id: order.id,
      listing_id: order.listingId,
      buyer_actor_id: order.buyerActorId,
      buyer_wallet_address: order.buyerWalletAddress,
      creator_actor_id: order.creatorActorId,
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
        originalCreatorActorId: order.creatorActorId
      },
      created_at: order.createdAt
    }),
    feeBreakdown: {
      subtotal: order.subtotalAmount,
      buyerServiceFee: order.buyerServiceFeeAmount,
      platformFee: order.platformFeeAmount,
      buyerTotal: order.buyerTotalAmount,
      creatorNet: order.sellerNetAmount
    }
  });
}

function money(value: number) {
  return Number(Number(value || 0).toFixed(2));
}

async function createResaleOrder(listingId: string, req: NextRequest, body: R) {
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
      creator_actor_id: String(body.creatorAddress || body.originalCreatorActorId || '')
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

  const sellerActorId = String(body.sellerActorId || body.ownerActorId || listing.creator_actor_id || '').trim().toLowerCase();
  const originalCreatorActorId = String(body.originalCreatorActorId || listing.creator_actor_id || '').trim().toLowerCase();
  if (!sellerActorId || !originalCreatorActorId) return fail('sellerActorId and original creator must be available for resale orders');
  const royaltyRate = Math.max(0, Math.min(40, Number(body.royaltyRate || body.royaltyPercentage || 12)));
  const royaltyAmount = money((quote.subtotal * royaltyRate) / 100);
  const sellerNetAmount = money(Math.max(quote.creatorNet - royaltyAmount, 0));

  const order = await createDigitalArtOrder({
    id: `dao-resale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    listingId,
    buyerActorId: actor(req),
    buyerWalletAddress: resolveRequestWallet(req) || String(body.buyerAddress || '').trim().toLowerCase(),
    creatorActorId: originalCreatorActorId,
    sellerActorId,
    title: String(listing.title || body.title || 'Digital Art Resale'),
    amountPaid: quote.buyerTotal,
    currency: String(listing.currency || body.currency || 'INDI'),
    status: 'captured',
    receiptId: `rcpt-resale-${listingId}-${Date.now()}`,
    orderKind: 'resale',
    royaltyRate,
    royaltyAmount,
    sellerNetAmount,
    platformFeeAmount: quote.platformFee,
    buyerServiceFeeAmount: quote.buyerServiceFee,
    subtotalAmount: quote.subtotal,
    buyerTotalAmount: quote.buyerTotal,
    parentOrderId: String(body.parentOrderId || ''),
    createdAt: new Date().toISOString()
  });

  await appendFinanceLedgerEntry({
    id: `fin-ledger-${String(order.id)}-seller`,
    actorId: sellerActorId,
    profileSlug: sellerActorId,
    pillar: 'digital-arts',
    type: 'sale',
    status: 'pending_payout',
    item: String(order.title || ''),
    grossAmount: Number(quote.subtotal),
    platformFeeAmount: Number(quote.platformFee),
    processorFeeAmount: 0,
    escrowFeeAmount: 0,
    refundAmount: 0,
    disputeAmount: 0,
    creatorNetAmount: sellerNetAmount,
    disputeReason: '',
    sourceType: 'resale',
    sourceId: listingId,
    metadata: {
      currency: String(order.currency || body.currency || 'INDI'),
      orderId: String(order.id),
      orderKind: 'resale',
      sellerActorId,
      originalCreatorActorId,
      royaltyAmount,
      royaltyRate
    },
    createdAt: String(order.createdAt)
  });

  await appendFinanceLedgerEntry({
    id: `fin-ledger-${String(order.id)}-royalty`,
    actorId: originalCreatorActorId,
    profileSlug: originalCreatorActorId,
    pillar: 'digital-arts',
    type: 'royalty',
    status: 'pending_payout',
    item: String(order.title || ''),
    grossAmount: royaltyAmount,
    platformFeeAmount: 0,
    processorFeeAmount: 0,
    escrowFeeAmount: 0,
    refundAmount: 0,
    disputeAmount: 0,
    creatorNetAmount: royaltyAmount,
    disputeReason: '',
    sourceType: 'resale',
    sourceId: listingId,
    metadata: {
      currency: String(order.currency || body.currency || 'INDI'),
      orderId: String(order.id),
      orderKind: 'resale',
      sellerActorId,
      originalCreatorActorId,
      royaltyAmount,
      royaltyRate
    },
    createdAt: String(order.createdAt)
  });

  return NextResponse.json({
    success: true,
    order: mapOrder({
      id: order.id,
      listing_id: order.listingId,
      buyer_actor_id: order.buyerActorId,
      buyer_wallet_address: order.buyerWalletAddress,
      creator_actor_id: order.creatorActorId,
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
        royaltyAmount,
        royaltyRate,
        orderKind: 'resale',
        sellerActorId,
        originalCreatorActorId,
        parentOrderId: order.parentOrderId
      },
      created_at: order.createdAt
    }),
    feeBreakdown: {
      subtotal: order.subtotalAmount,
      buyerServiceFee: order.buyerServiceFeeAmount,
      platformFee: order.platformFeeAmount,
      buyerTotal: order.buyerTotalAmount,
      sellerNet: order.sellerNetAmount,
      royaltyAmount,
      royaltyRate
    }
  }, { status: 201 });
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
  if (a === 'listings' && b && c === 'resale') return createResaleOrder(b, req, body);
  if (a === 'listings' && b && ['bid', 'offers', 'watchlist', 'share', 'report'].includes(c || '')) {
    await event({ event: `listing_${c}`, listingId: b, actorId: actor(req), metadata: body });
    return NextResponse.json({ success: true });
  }
  return fail('Unsupported digital-arts endpoint', 404);
}
