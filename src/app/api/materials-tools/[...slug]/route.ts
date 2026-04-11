import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestIdentity, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';
import {
  type MaterialsToolsActionType,
  createMaterialsToolsActionRecord,
  getMaterialsToolsSettingsOverview,
} from '@/app/lib/materialsToolsOps';
import {
  coopOrders,
  coopCommitments,
  getOriginStoryByProductId,
  getProductById,
  getRentalById,
  listCoopCommitmentsForActor,
  listOrdersForActor,
  listRentalBookingsForActor,
  materialsToolsOrders,
  originStories,
  products,
  rentals,
  rentalBookings,
  services,
  suppliers
} from '@/app/materials-tools/data/pillar10Data';

type R = Record<string, unknown>;

const MATERIALS_WEBHOOK_SECRET =
  process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET ||
  (process.env.NODE_ENV !== 'production' ? 'test-materials-webhook-secret' : '');
const MATERIALS_PROOF_BUCKET = process.env.SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET || 'materials-tools-proof';
const LOCAL_PROOF_DIR = path.join(process.cwd(), '.runtime', 'materials-tools-proof');

async function ensureLocalProofDir() {
  await fs.mkdir(LOCAL_PROOF_DIR, { recursive: true });
}

function signMaterialWebhookPayload(timestamp: string, body: string) {
  return crypto.createHmac('sha256', MATERIALS_WEBHOOK_SECRET).update(`${timestamp}.${body}`).digest('hex');
}

function normalizeSupplier(row: R) {
  return {
    id: String(row.id || ''),
    actorId: String(row.supplier_actor_id || row.actor_id || row.id || ''),
    name: String(row.name || ''),
    nation: String(row.nation || ''),
    region: String(row.region || ''),
    verified: Boolean(row.verified),
    verificationTier: String(row.verification_tier || row.verificationTier || 'bronze'),
    avatar: String(row.avatar || ''),
    cover: String(row.cover || ''),
    specialties: Array.isArray(row.specialties) ? (row.specialties as string[]) : [],
    bio: String(row.bio || ''),
    responseTime: String(row.response_time || row.responseTime || ''),
    fulfillmentScore: Number(row.fulfillment_score || row.fulfillmentScore || 0)
  };
}

function normalizeProduct(row: R) {
  const traceability = (row.traceability || {}) as R;
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    supplierId: String(row.supplier_id || row.supplierId || ''),
    supplierName: String(row.supplier_name || row.supplierName || ''),
    nation: String(row.nation || ''),
    category: String(row.category || ''),
    kind: String(row.kind || 'material'),
    price: Number(row.price || 0),
    currency: String(row.currency || 'USD'),
    image: String(row.image || ''),
    stockLabel: String(row.stock_label || row.stockLabel || ''),
    leadTime: String(row.lead_time || row.leadTime || ''),
    verified: Boolean(row.verified),
    verificationTier: String(row.verification_tier || row.verificationTier || 'bronze'),
    summary: String(row.summary || ''),
    traceability: {
      originRegion: String(traceability.originRegion || traceability.origin_region || ''),
      harvestDate: String(traceability.harvestDate || traceability.harvest_date || ''),
      method: String(traceability.method || ''),
      qrLabel: String(traceability.qrLabel || traceability.qr_label || '')
    },
    certifications: Array.isArray(row.certifications) ? (row.certifications as string[]) : [],
    moqLabel: String(row.moq_label || row.moqLabel || '')
  };
}

function normalizeRental(row: R) {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    hubName: String(row.hub_name || row.hubName || ''),
    nation: String(row.nation || ''),
    location: String(row.location || ''),
    dailyRateLabel: String(row.daily_rate_label || row.dailyRateLabel || ''),
    image: String(row.image || ''),
    summary: String(row.summary || ''),
    availability: String(row.availability || ''),
    equipmentType: String(row.equipment_type || row.equipmentType || '')
  };
}

function normalizeService(row: R) {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    provider: String(row.provider || ''),
    nation: String(row.nation || ''),
    rateLabel: String(row.rate_label || row.rateLabel || ''),
    image: String(row.image || ''),
    summary: String(row.summary || ''),
    serviceType: String(row.service_type || row.serviceType || 'repair')
  };
}

function normalizeCoopOrder(row: R) {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    summary: String(row.summary || ''),
    targetUnits: Number(row.target_units || row.targetUnits || 0),
    committedUnits: Number(row.committed_units || row.committedUnits || 0),
    closeDate: String(row.close_date || row.closeDate || ''),
    image: String(row.image || ''),
    preferredCategory: String(row.preferred_category || row.preferredCategory || '')
  };
}

function normalizeOrder(row: R) {
  const paymentBreakdown = (row.payment_breakdown as R) || (row.paymentBreakdown as R) || {};
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || row.actorId || ''),
    walletAddress: String(row.wallet_address || row.walletAddress || ''),
    productId: String(row.product_id || row.productId || ''),
    productTitle: String(row.product_title || row.productTitle || ''),
    supplierId: String(row.supplier_id || row.supplierId || ''),
    supplierName: String(row.supplier_name || row.supplierName || ''),
    quantity: Number(row.quantity || 1),
    unitPrice: Number(row.unit_price || row.unitPrice || 0),
    currency: String(row.currency || 'USD'),
    shippingRegion: String(row.shipping_region || row.shippingRegion || ''),
    deliveryMode: String(row.delivery_mode || row.deliveryMode || ''),
    fulfillmentStatus: String(row.fulfillment_status || row.fulfillmentStatus || ''),
    paymentStatus: String(row.payment_status || row.paymentStatus || ''),
    traceabilityStatus: String(row.traceability_status || row.traceabilityStatus || ''),
    estimatedShipDate: String(row.estimated_ship_date || row.estimatedShipDate || ''),
    reorderReady: Boolean(row.reorder_ready || row.reorderReady),
    receiptId: String(row.receipt_id || row.receiptId || ''),
    paymentIntentId: String(row.payment_intent_id || row.paymentIntentId || ''),
    processorEventId: String(row.processor_event_id || row.processorEventId || ''),
    amountPaid: Number(row.amount_paid || row.amountPaid || 0),
    paymentBreakdown: {
      subtotal: Number(paymentBreakdown.subtotal || 0),
      buyerServiceFee: Number(paymentBreakdown.buyerServiceFee || 0),
      platformFee: Number(paymentBreakdown.platformFee || 0),
      buyerTotal: Number(paymentBreakdown.buyerTotal || 0),
      creatorNet: Number(paymentBreakdown.creatorNet || 0)
    },
    reconciledAt: String(row.reconciled_at || row.reconciledAt || ''),
    notes: String(row.notes || ''),
    createdAt: String(row.created_at || row.createdAt || '')
  };
}

function normalizeBooking(row: R) {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || row.actorId || ''),
    walletAddress: String(row.wallet_address || row.walletAddress || ''),
    rentalId: String(row.rental_id || row.rentalId || ''),
    rentalTitle: String(row.rental_title || row.rentalTitle || ''),
    hubName: String(row.hub_name || row.hubName || ''),
    bookingDate: String(row.booking_date || row.bookingDate || ''),
    sessionWindow: String(row.session_window || row.sessionWindow || ''),
    depositLabel: String(row.deposit_label || row.depositLabel || ''),
    accessStatus: String(row.access_status || row.accessStatus || ''),
    returnProtocol: String(row.return_protocol || row.returnProtocol || ''),
    stewardStatus: String(row.steward_status || row.stewardStatus || ''),
    checkedOutAt: String(row.checked_out_at || row.checkedOutAt || ''),
    returnedAt: String(row.returned_at || row.returnedAt || ''),
    conditionStatus: String(row.condition_status || row.conditionStatus || ''),
    conditionNotes: String(row.condition_notes || row.conditionNotes || ''),
    createdAt: String(row.created_at || row.createdAt || '')
  };
}

function normalizeCommitment(row: R) {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || row.actorId || ''),
    walletAddress: String(row.wallet_address || row.walletAddress || ''),
    orderId: String(row.order_id || row.orderId || ''),
    orderTitle: String(row.order_title || row.orderTitle || ''),
    units: Number(row.units || 0),
    contributionStatus: String(row.contribution_status || row.contributionStatus || ''),
    paymentWindow: String(row.payment_window || row.paymentWindow || ''),
    freightLane: String(row.freight_lane || row.freightLane || ''),
    invoiceId: String(row.invoice_id || row.invoiceId || ''),
    invoiceArtifactUrl: String(row.invoice_artifact_url || row.invoiceArtifactUrl || ''),
    settledAt: String(row.settled_at || row.settledAt || ''),
    dispatchStatus: String(row.dispatch_status || row.dispatchStatus || ''),
    dispatchClosedAt: String(row.dispatch_closed_at || row.dispatchClosedAt || ''),
    createdAt: String(row.created_at || row.createdAt || '')
  };
}

function normalizeOriginStory(row: R) {
  return {
    productId: String(row.product_id || row.productId || ''),
    batchCode: String(row.batch_code || row.batchCode || ''),
    stewardName: String(row.steward_name || row.stewardName || ''),
    originTitle: String(row.origin_title || row.originTitle || ''),
    originSummary: String(row.origin_summary || row.originSummary || ''),
    stewardshipProtocol: String(row.stewardship_protocol || row.stewardshipProtocol || ''),
    chainOfCustody: Array.isArray(row.chain_of_custody) ? (row.chain_of_custody as string[]) : [],
    proofDocuments: Array.isArray(row.proof_documents)
      ? (row.proof_documents as Array<R | string>).map((item) => {
          if (typeof item === 'string') {
            return {
              id: crypto.randomUUID(),
              label: item,
              fileName: '',
              mimeType: '',
              sizeBytes: 0,
              storagePath: '',
              downloadPath: '',
              createdAt: ''
            };
          }
          return {
            id: String(item.id || crypto.randomUUID()),
            label: String(item.label || ''),
            fileName: String(item.fileName || item.file_name || ''),
            mimeType: String(item.mimeType || item.mime_type || ''),
            sizeBytes: Number(item.sizeBytes || item.size_bytes || 0),
            storagePath: String(item.storagePath || item.storage_path || ''),
            downloadPath: String(item.downloadPath || item.download_path || ''),
            createdAt: String(item.createdAt || item.created_at || '')
          };
        })
      : [],
    qrDestinationLabel: String(row.qr_destination_label || row.qrDestinationLabel || '')
  };
}

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function paginate<T>(items: T[], page = 1, limit = 18) {
  const safeLimit = Math.max(1, Math.min(60, limit));
  const safePage = Math.max(1, page);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  return { items: items.slice(start, start + safeLimit), page: safePage, pages, total };
}

function query(req: NextRequest) {
  return {
    q: String(req.nextUrl.searchParams.get('q') || '').trim().toLowerCase(),
    category: String(req.nextUrl.searchParams.get('category') || '').trim(),
    verifiedOnly: req.nextUrl.searchParams.get('verifiedOnly') === '1',
    page: Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1')),
    limit: Math.min(60, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '18'))),
    supplierId: String(req.nextUrl.searchParams.get('supplierId') || '').trim() || 'sup-1'
  };
}

function filterLocalProducts(req: NextRequest) {
  const { q, category, verifiedOnly, page, limit } = query(req);
  const filtered = products.filter((item) => {
    if (category && category !== 'all' && item.category !== category) return false;
    if (verifiedOnly && !item.verified) return false;
    if (!q) return true;
    return [item.title, item.supplierName, item.summary, item.nation].join(' ').toLowerCase().includes(q);
  });
  return paginate(filtered, page, limit);
}

function filterList<T>(items: T[], req: NextRequest, fields: Array<(item: T) => string>) {
  const { q, page, limit } = query(req);
  const filtered = !q ? items : items.filter((item) => fields.map((fn) => fn(item)).join(' ').toLowerCase().includes(q));
  return paginate(filtered, page, limit);
}

async function listProducts(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json(filterLocalProducts(req));
  const supabase = createSupabaseServerClient();
  const { q, category, verifiedOnly, page, limit } = query(req);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let builder = supabase.from('materials_tools_listings').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  if (q) builder = builder.ilike('title', `%${q}%`);
  if (category && category !== 'all') builder = builder.eq('category', category);
  if (verifiedOnly) builder = builder.eq('verified', true);
  const { data, count, error } = await builder;
  if (error) return NextResponse.json(filterLocalProducts(req));
  return NextResponse.json({ items: (data || []).map((item) => normalizeProduct(item as R)), page, pages: Math.max(1, Math.ceil(Number(count || 0) / limit)), total: Number(count || 0) });
}

async function listSuppliers(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json(filterList(suppliers, req, [(item) => item.name, (item) => item.bio, (item) => item.region, (item) => item.nation]));
  const supabase = createSupabaseServerClient();
  const { q, page, limit } = query(req);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let builder = supabase.from('materials_tools_suppliers').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  if (q) builder = builder.ilike('name', `%${q}%`);
  const { data, count, error } = await builder;
  if (error) return NextResponse.json(filterList(suppliers, req, [(item) => item.name, (item) => item.bio, (item) => item.region, (item) => item.nation]));
  return NextResponse.json({ items: (data || []).map((item) => normalizeSupplier(item as R)), page, pages: Math.max(1, Math.ceil(Number(count || 0) / limit)), total: Number(count || 0) });
}

async function listRentals(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json(filterList(rentals, req, [(item) => item.title, (item) => item.hubName, (item) => item.location, (item) => item.summary]));
  const supabase = createSupabaseServerClient();
  const { q, page, limit } = query(req);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let builder = supabase.from('materials_tools_rentals').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  if (q) builder = builder.ilike('title', `%${q}%`);
  const { data, count, error } = await builder;
  if (error) return NextResponse.json(filterList(rentals, req, [(item) => item.title, (item) => item.hubName, (item) => item.location, (item) => item.summary]));
  return NextResponse.json({ items: (data || []).map((item) => normalizeRental(item as R)), page, pages: Math.max(1, Math.ceil(Number(count || 0) / limit)), total: Number(count || 0) });
}

async function listServices(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json(filterList(services, req, [(item) => item.title, (item) => item.provider, (item) => item.summary, (item) => item.nation]));
  const supabase = createSupabaseServerClient();
  const { q, page, limit } = query(req);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let builder = supabase.from('materials_tools_services').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  if (q) builder = builder.ilike('title', `%${q}%`);
  const { data, count, error } = await builder;
  if (error) return NextResponse.json(filterList(services, req, [(item) => item.title, (item) => item.provider, (item) => item.summary, (item) => item.nation]));
  return NextResponse.json({ items: (data || []).map((item) => normalizeService(item as R)), page, pages: Math.max(1, Math.ceil(Number(count || 0) / limit)), total: Number(count || 0) });
}

async function listCoopOrders(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json(filterList(coopOrders, req, [(item) => item.title, (item) => item.summary]));
  const supabase = createSupabaseServerClient();
  const { q, page, limit } = query(req);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let builder = supabase.from('materials_tools_coop_orders').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  if (q) builder = builder.ilike('title', `%${q}%`);
  const { data, count, error } = await builder;
  if (error) return NextResponse.json(filterList(coopOrders, req, [(item) => item.title, (item) => item.summary]));
  return NextResponse.json({ items: (data || []).map((item) => normalizeCoopOrder(item as R)), page, pages: Math.max(1, Math.ceil(Number(count || 0) / limit)), total: Number(count || 0) });
}

async function listOrders(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ items: listOrdersForActor(actorId, wallet), bookings: listRentalBookingsForActor(actorId, wallet), page: 1, pages: 1, total: listOrdersForActor(actorId, wallet).length });
  }
  const supabase = createSupabaseServerClient();
  const actorFilter = actorId !== 'guest' ? actorId : wallet;
  if (!actorFilter) return fail('Wallet authentication required', 401);
  const [{ data: ordersData, error: ordersError }, { data: bookingsData, error: bookingsError }] = await Promise.all([
    supabase.from('materials_tools_orders').select('*').or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`).order('created_at', { ascending: false }),
    supabase.from('materials_tools_rental_bookings').select('*').or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`).order('created_at', { ascending: false })
  ]);
  if (ordersError || bookingsError) {
    return NextResponse.json({ items: listOrdersForActor(actorId, wallet), bookings: listRentalBookingsForActor(actorId, wallet), page: 1, pages: 1, total: listOrdersForActor(actorId, wallet).length });
  }
  return NextResponse.json({ items: (ordersData || []).map((item) => normalizeOrder(item as R)), bookings: (bookingsData || []).map((item) => normalizeBooking(item as R)), page: 1, pages: 1, total: Number((ordersData || []).length) });
}

async function orderDetail(orderId: string) {
  const localOrder = materialsToolsOrders.find((item) => item.id === orderId);
  if (!isSupabaseServerConfigured()) {
    if (!localOrder) return fail('Order not found', 404);
    return NextResponse.json({ order: localOrder });
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('materials_tools_orders').select('*').eq('id', orderId).maybeSingle();
  if (error || !data) {
    if (!localOrder) return fail('Order not found', 404);
    return NextResponse.json({ order: localOrder });
  }
  return NextResponse.json({ order: normalizeOrder(data as R) });
}

async function supplierDashboard(req: NextRequest) {
  const { supplierId } = query(req);
  const localSupplier = suppliers.find((item) => item.id === supplierId) || suppliers[0];
  const localListings = products.filter((item) => item.supplierId === localSupplier.id);
  const localOrders = materialsToolsOrders.filter((item) => item.supplierId === localSupplier.id);
  const localDemand = coopCommitments.filter((item) => coopOrders.find((order) => order.id === item.orderId)?.preferredCategory && localListings.some((listing) => listing.category === coopOrders.find((order) => order.id === item.orderId)?.preferredCategory));
  const localPayload = {
    supplier: localSupplier,
    stats: {
      activeListings: localListings.length,
      lowStock: localListings.filter((item) => item.stockLabel !== 'In Stock').length,
      inboundOrders: localOrders.length,
      reorderReady: localOrders.filter((item) => item.reorderReady).length,
      avgFulfillment: localSupplier.fulfillmentScore
    },
    listingHealth: localListings,
    recentOrders: localOrders.slice(0, 4),
    inboundCoopDemand: localDemand.slice(0, 4)
  };
  if (!isSupabaseServerConfigured()) return NextResponse.json(localPayload);
  const supabase = createSupabaseServerClient();
  const [
    { data: supplierData, error: supplierError },
    { data: listingData, error: listingError },
    { data: orderData, error: orderError }
  ] = await Promise.all([
    supabase.from('materials_tools_suppliers').select('*').eq('id', supplierId).maybeSingle(),
    supabase.from('materials_tools_listings').select('*').eq('supplier_id', supplierId).order('created_at', { ascending: false }),
    supabase.from('materials_tools_orders').select('*').eq('supplier_id', supplierId).order('created_at', { ascending: false })
  ]);
  if (supplierError || listingError || orderError || !supplierData) return NextResponse.json(localPayload);
  return NextResponse.json({
    supplier: normalizeSupplier(supplierData as R),
    stats: {
      activeListings: (listingData || []).length,
      lowStock: (listingData || []).filter((item: R) => String(item.stock_label || '') !== 'In Stock').length,
      inboundOrders: (orderData || []).length,
      reorderReady: (orderData || []).filter((item: R) => Boolean(item.reorder_ready)).length,
      avgFulfillment: Number((supplierData as R).fulfillment_score || 0)
    },
    listingHealth: (listingData || []).map((item) => normalizeProduct(item as R)),
    recentOrders: (orderData || []).map((item) => normalizeOrder(item as R)),
    inboundCoopDemand: localDemand
  });
}

async function coopDashboard(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  const localCommitments = listCoopCommitmentsForActor(actorId, wallet);
  const localPayload = {
    stats: {
      openRuns: coopOrders.length,
      yourCommitments: localCommitments.length,
      closingSoon: coopOrders.filter((item) => new Date(item.closeDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 14).length,
      avgProgress: Math.round(coopOrders.reduce((sum, item) => sum + item.committedUnits / item.targetUnits, 0) / coopOrders.length * 100)
    },
    openOrders: coopOrders,
    yourCommitments: localCommitments,
    milestones: [
      { label: 'Bead run invoice release', date: '2026-03-19', description: 'Final freight quote goes out to confirmed bead run members.' },
      { label: 'Textile hardware consolidation', date: '2026-03-24', description: 'Regional hubs lock counts before hardware kit packing.' },
      { label: 'Shipping pool dispatch', date: '2026-04-05', description: 'Packaging pool moves into shared freight dispatch.' }
    ]
  };
  if (!isSupabaseServerConfigured()) return NextResponse.json(localPayload);
  const supabase = createSupabaseServerClient();
  const actorFilter = actorId !== 'guest' ? actorId : wallet;
  const [{ data: orderData, error: orderError }, { data: commitmentData, error: commitmentError }] = await Promise.all([
    supabase.from('materials_tools_coop_orders').select('*').order('close_date', { ascending: true }),
    actorFilter
      ? supabase.from('materials_tools_coop_commitments').select('*').or(`actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`).order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null })
  ]);
  if (orderError || commitmentError) return NextResponse.json(localPayload);
  const orders = (orderData || []) as Array<R>;
  return NextResponse.json({
    stats: {
      openRuns: orders.length,
      yourCommitments: Number((commitmentData || []).length),
      closingSoon: orders.filter((item) => new Date(String(item.close_date || '')).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 14).length,
      avgProgress: orders.length ? Math.round(orders.reduce((sum, item) => sum + Number(item.committed_units || 0) / Math.max(1, Number(item.target_units || 1)), 0) / orders.length * 100) : 0
    },
    openOrders: (orderData || []).map((item) => normalizeCoopOrder(item as R)),
    yourCommitments: (commitmentData || []).map((item) => normalizeCommitment(item as R)),
    milestones: localPayload.milestones
  });
}

async function rentalDashboard() {
  const localPayload = {
    stats: {
      totalBookings: rentalBookings.length,
      waitingReview: rentalBookings.filter((item) => item.accessStatus !== 'confirmed').length,
      confirmed: rentalBookings.filter((item) => item.accessStatus === 'confirmed').length
    },
    bookings: rentalBookings
  };
  if (!isSupabaseServerConfigured()) return NextResponse.json(localPayload);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('materials_tools_rental_bookings').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json(localPayload);
  const bookings = (data || []).map((item) => normalizeBooking(item as R));
  return NextResponse.json({
    stats: {
      totalBookings: bookings.length,
      waitingReview: bookings.filter((item) => item.accessStatus === 'pending-review' || item.accessStatus === 'waitlisted' || item.accessStatus === 'orientation-required').length,
      confirmed: bookings.filter((item) => item.accessStatus === 'confirmed').length,
      checkedOut: bookings.filter((item) => item.accessStatus === 'checked-out').length,
      returned: bookings.filter((item) => item.accessStatus === 'returned').length
    },
    bookings
  });
}

async function traceabilityDetail(productId: string) {
  const localStory = getOriginStoryByProductId(productId);
  const localProduct = getProductById(productId);
  if (!localStory || !localProduct) return fail('Origin story not found', 404);
  if (!isSupabaseServerConfigured()) return NextResponse.json({ product: localProduct, story: localStory });
  const supabase = createSupabaseServerClient();
  const [{ data: productData, error: productError }, { data: storyData, error: storyError }] = await Promise.all([
    supabase.from('materials_tools_listings').select('*').eq('id', productId).maybeSingle(),
    supabase.from('materials_tools_origin_stories').select('*').eq('product_id', productId).maybeSingle()
  ]);
  if (productError || storyError || !productData || !storyData) return NextResponse.json({ product: localProduct, story: localStory });
  return NextResponse.json({ product: normalizeProduct(productData as R), story: normalizeOriginStory(storyData as R) });
}

async function trackEvent(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('marketplace_events').insert({
      id: crypto.randomUUID(),
      pillar: 'materials-tools',
      entity_type: 'listing',
      entity_id: String(body.entityId || ''),
      event_name: String(body.event || 'view'),
      actor_id: resolveRequestActorId(req),
      metadata: body.metadata || {},
      created_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ ok: true });
}

async function saveAction(req: NextRequest, actionType: string) {
  const body = (await req.json().catch(() => ({}))) as R;
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (actorId === 'guest' && !wallet) return fail('Wallet authentication required', 401);
  const action = await createMaterialsToolsActionRecord({
    actionType: actionType as MaterialsToolsActionType,
    actorId,
    walletAddress: wallet,
    payload: body
  });
  return NextResponse.json({ ok: true, actionType, actorId, action });
}

async function createOrder(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (actorId === 'guest' && !wallet) return fail('Wallet authentication required', 401);
  const productId = String(body.productId || '').trim();
  const product = getProductById(productId);
  if (!product) return fail('Product not found', 404);
  const quantity = Math.max(1, Number(body.quantity || 1));
    const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
  const subtotal = Number((product.price * quantity).toFixed(2));
  const quote = calculateTransactionQuote({
    pillar: 'materials-tools',
    subtotal,
    creatorPlanId,
    memberPlanId
  });
  const order = {
    id: `order-${crypto.randomUUID()}`,
    actor_id: actorId,
    wallet_address: wallet || null,
    product_id: product.id,
    product_title: product.title,
    supplier_id: product.supplierId,
    supplier_name: product.supplierName,
    quantity,
    unit_price: product.price,
    amount_paid: 0,
    currency: product.currency,
    shipping_region: String(body.shippingRegion || 'Studio delivery lane'),
    delivery_mode: String(body.deliveryMode || 'studio-direct'),
    fulfillment_status: 'awaiting-payment',
    payment_status: 'intent-created',
    traceability_status: 'batch-linked',
    estimated_ship_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
    reorder_ready: false,
    payment_intent_id: `mtpi-${crypto.randomUUID()}`,
    payment_breakdown: {
      subtotal: quote.subtotal,
      buyerServiceFee: quote.buyerServiceFee,
      platformFee: quote.platformFee,
      buyerTotal: quote.buyerTotal,
      creatorNet: quote.creatorNet
    },
    notes: String(body.notes || ''),
    created_at: new Date().toISOString()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('materials_tools_orders').insert(order);
    if (error) return fail('Unable to create materials order', 500);
  }
  return NextResponse.json({ ok: true, order, feeBreakdown: order.payment_breakdown });
}

async function createRentalBooking(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (actorId === 'guest' && !wallet) return fail('Wallet authentication required', 401);
  const rentalId = String(body.rentalId || '').trim();
  const rental = getRentalById(rentalId);
  if (!rental) return fail('Rental listing not found', 404);
  let accessStatus = 'pending-review';
  let depositLabel = `${rental.dailyRateLabel} deposit pending hub approval`;
  let stewardStatus = 'pending';
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('materials_tools_rental_bookings')
      .select('id')
      .eq('rental_id', rental.id)
      .eq('booking_date', String(body.bookingDate || new Date().toISOString().slice(0, 10)))
      .eq('session_window', String(body.sessionWindow || 'Morning access block'));
    if ((data || []).length > 0) {
      accessStatus = 'waitlisted';
      depositLabel = 'Waitlist only - deposit opens when a slot clears';
      stewardStatus = 'waitlisted';
    }
  } else if (rentalBookings.some((item) => item.rentalId === rental.id && item.bookingDate === String(body.bookingDate || new Date().toISOString().slice(0, 10)) && item.sessionWindow === String(body.sessionWindow || 'Morning access block'))) {
    accessStatus = 'waitlisted';
    depositLabel = 'Waitlist only - deposit opens when a slot clears';
    stewardStatus = 'waitlisted';
  }
  const booking = {
    id: `booking-${crypto.randomUUID()}`,
    actor_id: actorId,
    wallet_address: wallet || null,
    rental_id: rental.id,
    rental_title: rental.title,
    hub_name: rental.hubName,
    booking_date: String(body.bookingDate || new Date().toISOString().slice(0, 10)),
    session_window: String(body.sessionWindow || 'Morning access block'),
    deposit_label: depositLabel,
    access_status: accessStatus,
    return_protocol: 'Return tools to steward desk, sign down maintenance notes, and close the access log.',
    steward_status: stewardStatus,
    condition_status: 'not-started',
    created_at: new Date().toISOString()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('materials_tools_rental_bookings').insert(booking);
    if (error) return fail('Unable to create rental booking', 500);
  }
  return NextResponse.json({ ok: true, booking });
}

async function confirmOrderPayment(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (actorId === 'guest' && !wallet) return fail('Wallet authentication required', 401);
  const orderId = String(body.orderId || '').trim();
  const paymentAction = String(body.paymentAction || 'deposit');
  const receiptId = `mt-receipt-${orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`;
  const paymentStatus = paymentAction === 'settle' ? 'settled' : 'deposit-captured';
  const fulfillmentStatus = paymentAction === 'settle' ? 'packing' : 'queued';
  let storedBreakdown: R = (body.paymentBreakdown as R) || {};
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('materials_tools_orders').select('payment_breakdown').eq('id', orderId).maybeSingle();
    storedBreakdown = ((data as R | null)?.payment_breakdown as R) || storedBreakdown;
  }
  const amountPaid =
    Number(body.amountPaid || 0) ||
    Number(storedBreakdown.buyerTotal || 0);
  const updates = {
    payment_status: paymentStatus,
    fulfillment_status: fulfillmentStatus,
    amount_paid: amountPaid,
    receipt_id: receiptId,
    processor_event_id: `manual-${crypto.randomUUID()}`,
    paid_at: new Date().toISOString(),
    reconciled_at: new Date().toISOString()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('materials_tools_orders').update(updates).eq('id', orderId);
    if (error) return fail('Unable to confirm payment', 500);
  }
  let orderTitle = orderId;
  let actorForLedger = '';
  let productIdForLedger = String(body.productId || '').trim();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('materials_tools_orders').select('product_id,product_title,supplier_id').eq('id', orderId).maybeSingle();
    orderTitle = String((data as R | null)?.product_title || orderId);
    productIdForLedger = String((data as R | null)?.product_id || productIdForLedger);
    const supplierId = String((data as R | null)?.supplier_id || '');
    if (supplierId) {
      const supplierRow = await supabase.from('materials_tools_suppliers').select('*').eq('id', supplierId).maybeSingle();
      actorForLedger = normalizeSupplier((supplierRow.data as R | null) || { id: supplierId }).actorId;
    }
  }
  if (!actorForLedger) {
    const supplierId = String(body.supplierId || '');
    actorForLedger = supplierId || actorId;
  }
  await appendFinanceLedgerEntry({
    id: `fin-ledger-${orderId}-${paymentStatus}`,
    actorId: actorForLedger,
    profileSlug: actorForLedger,
    pillar: 'materials-tools',
    type: 'sale',
    status: paymentStatus === 'settled' ? 'settled' : 'pending_payout',
    item: orderTitle,
    grossAmount: Number(storedBreakdown.subtotal || 0),
    platformFeeAmount: Number(storedBreakdown.platformFee || 0),
    processorFeeAmount: 0,
    escrowFeeAmount: 0,
    refundAmount: 0,
    disputeAmount: 0,
    creatorNetAmount: Number(storedBreakdown.creatorNet || 0),
    disputeReason: '',
    sourceType: 'listing',
    sourceId: productIdForLedger || orderId,
    metadata: {
      currency: String(body.currency || 'INDI'),
      paymentStatus,
      orderId,
      receiptId,
      listingId: productIdForLedger || orderId
    },
    createdAt: new Date().toISOString()
  });
  return NextResponse.json({
    ok: true,
    orderId,
    receiptId,
    paymentStatus,
    fulfillmentStatus,
    amountPaid,
    feeBreakdown: storedBreakdown,
    reconciledAt: updates.reconciled_at
  });
}

async function updateOrderFulfillment(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const orderId = String(body.orderId || '').trim();
  const fulfillmentStatus = String(body.fulfillmentStatus || '').trim();
  if (!orderId || !fulfillmentStatus) return fail('Order and fulfillment status are required');
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('materials_tools_orders')
      .update({ fulfillment_status: fulfillmentStatus, reorder_ready: fulfillmentStatus === 'delivered' })
      .eq('id', orderId);
    if (error) return fail('Unable to update fulfillment', 500);
  }
  return NextResponse.json({ ok: true, orderId, fulfillmentStatus, reorderReady: fulfillmentStatus === 'delivered' });
}

async function updateListingStock(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const productId = String(body.productId || '').trim();
  const stockLabel = String(body.stockLabel || '').trim();
  const leadTime = String(body.leadTime || '').trim();
  if (!productId || !stockLabel) return fail('Listing and stock label are required');
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('materials_tools_listings')
      .update({ stock_label: stockLabel, lead_time: leadTime || null })
      .eq('id', productId);
    if (error) return fail('Unable to update listing stock', 500);
  }
  return NextResponse.json({ ok: true, productId, stockLabel, leadTime });
}

async function updateRentalBooking(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const bookingId = String(body.bookingId || '').trim();
  const accessStatus = String(body.accessStatus || '').trim();
  const depositLabel = String(body.depositLabel || '').trim();
  const conditionStatus = String(body.conditionStatus || '').trim();
  const conditionNotes = String(body.conditionNotes || '').trim();
  if (!bookingId || !accessStatus) return fail('Booking and access status are required');
  const updates: R = { access_status: accessStatus, deposit_label: depositLabel || null };
  if (accessStatus === 'confirmed') updates.steward_status = 'approved';
  if (accessStatus === 'waitlisted') updates.steward_status = 'waitlisted';
  if (accessStatus === 'checked-out') {
    updates.checked_out_at = new Date().toISOString();
    updates.condition_status = conditionStatus || 'in-use';
  }
  if (accessStatus === 'returned') {
    updates.returned_at = new Date().toISOString();
    updates.steward_status = 'closed';
    updates.condition_status = conditionStatus || 'returned-good';
    updates.condition_notes = conditionNotes || null;
  } else if (conditionStatus) {
    updates.condition_status = conditionStatus;
    updates.condition_notes = conditionNotes || null;
  }
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('materials_tools_rental_bookings')
      .update(updates)
      .eq('id', bookingId);
    if (error) return fail('Unable to update rental booking', 500);
  }
  return NextResponse.json({ ok: true, bookingId, accessStatus, depositLabel, conditionStatus: updates.condition_status, conditionNotes: updates.condition_notes });
}

async function updateCoopCommitment(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const commitmentId = String(body.commitmentId || '').trim();
  const contributionStatus = String(body.contributionStatus || '').trim();
  const paymentWindow = String(body.paymentWindow || '').trim();
  const invoiceId = String(body.invoiceId || '').trim();
  const invoiceArtifactUrl = String(body.invoiceArtifactUrl || '').trim();
  const dispatchStatus = String(body.dispatchStatus || '').trim();
  if (!commitmentId || !contributionStatus) return fail('Commitment and contribution status are required');
  const updates: R = { contribution_status: contributionStatus, payment_window: paymentWindow || null };
  if (invoiceId) updates.invoice_id = invoiceId;
  if (invoiceArtifactUrl) updates.invoice_artifact_url = invoiceArtifactUrl;
  if (contributionStatus === 'invoice-settled' || contributionStatus === 'confirmed') updates.settled_at = new Date().toISOString();
  if (dispatchStatus) updates.dispatch_status = dispatchStatus;
  if (contributionStatus === 'closed' || dispatchStatus === 'closed') updates.dispatch_closed_at = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('materials_tools_coop_commitments')
      .update(updates)
      .eq('id', commitmentId);
    if (error) return fail('Unable to update co-op commitment', 500);
  }
  return NextResponse.json({ ok: true, commitmentId, contributionStatus, paymentWindow, invoiceId: updates.invoice_id, invoiceArtifactUrl: updates.invoice_artifact_url, dispatchStatus: updates.dispatch_status });
}

async function attachProofDocument(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (actorId === 'guest' && !wallet) return fail('Wallet authentication required', 401);
  const productId = String(body.productId || '').trim();
  const label = String(body.label || '').trim();
  if (!productId || !label) return fail('Listing and proof label are required');
  await createMaterialsToolsActionRecord({
    actionType: 'listing-proof-document',
    actorId,
    walletAddress: wallet,
    payload: { productId, label }
  });
  return NextResponse.json({
    ok: true,
    proofDocument: {
      id: `proof-${crypto.randomUUID()}`,
      productId,
      label,
      fileName: label,
      createdAt: new Date().toISOString()
    }
  });
}

async function createCoopCommitment(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as R;
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (actorId === 'guest' && !wallet) return fail('Wallet authentication required', 401);
  const orderId = String(body.orderId || '').trim();
  const order = coopOrders.find((item) => item.id === orderId);
  if (!order) return fail('Co-op order not found', 404);
  const commitment = {
    id: `commit-${crypto.randomUUID()}`,
    actor_id: actorId,
    wallet_address: wallet || null,
    order_id: order.id,
    order_title: order.title,
    units: Math.max(1, Number(body.units || 1)),
    contribution_status: 'awaiting-payment',
    payment_window: `Commitment window closes ${order.closeDate}`,
    freight_lane: 'Regional shared freight lane',
    invoice_id: `mt-invoice-${crypto.randomUUID().slice(0, 8)}`,
    invoice_artifact_url: `/materials-tools/coop/${order.id}`,
    dispatch_status: 'not-started',
    created_at: new Date().toISOString()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('materials_tools_coop_commitments').insert(commitment);
    if (error) return fail('Unable to save co-op commitment', 500);
  }
  await createMaterialsToolsActionRecord({
    actionType: 'coop-commit',
    actorId,
    walletAddress: wallet,
    payload: body
  });
  return NextResponse.json({ ok: true, commitment });
}

async function uploadProofDocument(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  if (actorId === 'guest' && !wallet) return fail('Wallet authentication required', 401);
  const form = await req.formData().catch(() => null);
  if (!form) return fail('Upload form is required');
  const productId = String(form.get('productId') || '').trim();
  const label = String(form.get('label') || '').trim();
  const file = form.get('file');
  if (!productId || !label || !(file instanceof File)) return fail('Listing, label, and file are required');

  const bytes = Buffer.from(await file.arrayBuffer());
  const proofId = `proof-${crypto.randomUUID()}`;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const storagePath = `${productId}/${proofId}-${safeName}`;
  let downloadPath = `/api/materials-tools/proof-file?path=${encodeURIComponent(storagePath)}`;

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error: uploadError } = await supabase.storage.from(MATERIALS_PROOF_BUCKET).upload(storagePath, bytes, {
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    });
    if (uploadError) return fail('Unable to store proof document', 500);

    const { data: existingStory } = await supabase
      .from('materials_tools_origin_stories')
      .select('proof_documents')
      .eq('product_id', productId)
      .maybeSingle();
    const existingDocs = Array.isArray(existingStory?.proof_documents) ? (existingStory.proof_documents as Array<R>) : [];
    existingDocs.unshift({
      id: proofId,
      label,
      file_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: bytes.length,
      storage_path: storagePath,
      download_path: downloadPath,
      created_at: new Date().toISOString()
    });
    await supabase
      .from('materials_tools_origin_stories')
      .upsert({
        product_id: productId,
        proof_documents: existingDocs,
        created_at: new Date().toISOString()
      }, { onConflict: 'product_id' });
  } else {
    await ensureLocalProofDir();
    const filePath = path.join(LOCAL_PROOF_DIR, `${proofId}-${safeName}`);
    await fs.writeFile(filePath, bytes);
    downloadPath = `/api/materials-tools/proof-file?path=${encodeURIComponent(filePath)}`;
  }

  return NextResponse.json({
    ok: true,
    proofDocument: {
      id: proofId,
      productId,
      label,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: bytes.length,
      storagePath,
      downloadPath,
      createdAt: new Date().toISOString()
    }
  });
}

async function downloadProofDocument(req: NextRequest) {
  const requestedPath = String(req.nextUrl.searchParams.get('path') || '').trim();
  if (!requestedPath) return fail('Proof document path is required');

  if (isSupabaseServerConfigured() && !requestedPath.startsWith('C:') && !requestedPath.startsWith('/')) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(MATERIALS_PROOF_BUCKET).download(requestedPath);
    if (error || !data) return fail('Proof document not found', 404);
    const bytes = Buffer.from(await data.arrayBuffer());
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': data.type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${path.basename(requestedPath)}"`
      }
    });
  }

  const localPath = requestedPath.startsWith(LOCAL_PROOF_DIR) ? requestedPath : path.join(LOCAL_PROOF_DIR, path.basename(requestedPath));
  const bytes = await fs.readFile(localPath).catch(() => null);
  if (!bytes) return fail('Proof document not found', 404);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `inline; filename="${path.basename(localPath)}"`
    }
  });
}

async function reconcileOrderPayment(req: NextRequest) {
  const rawBody = await req.text();
  const timestamp = req.headers.get('x-indigena-webhook-timestamp') || '';
  const signature = req.headers.get('x-indigena-webhook-signature') || '';
  if (!MATERIALS_WEBHOOK_SECRET) return fail('Webhook secret not configured', 500);
  const expected = signMaterialWebhookPayload(timestamp, rawBody);
  if (!timestamp || !signature || signature !== expected) return fail('Invalid webhook signature', 401);
  const body = JSON.parse(rawBody || '{}') as R;
  const paymentIntentId = String(body.paymentIntentId || '').trim();
  const eventId = String(body.eventId || '').trim() || `evt-${crypto.randomUUID()}`;
  const status = String(body.status || '').trim();
  if (!paymentIntentId || !status) return fail('paymentIntentId and status are required');
  const mappedStatus = status === 'failed' ? 'failed' : status === 'refunded' ? 'refunded' : status === 'processing' ? 'processing' : 'settled';
  const fulfillmentStatus = mappedStatus === 'settled' ? 'packing' : mappedStatus === 'failed' ? 'awaiting-payment' : 'queued';

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('materials_tools_orders')
      .update({
        payment_status: mappedStatus,
        processor_event_id: eventId,
        amount_paid: Number(body.amountPaid || 0) || undefined,
        reconciled_at: new Date().toISOString(),
        fulfillment_status: fulfillmentStatus
      })
      .eq('payment_intent_id', paymentIntentId);
    if (error) return fail('Unable to reconcile payment', 500);
  }

  return NextResponse.json({ ok: true, paymentIntentId, eventId, paymentStatus: mappedStatus, fulfillmentStatus });
}

async function buildLaunchAuditSnapshot() {
  const configured = isSupabaseServerConfigured();
  const base = {
    supabaseConfigured: configured,
    proofBucketConfigured: Boolean(process.env.SUPABASE_MATERIALS_TOOLS_PROOF_BUCKET),
    paymentWebhookConfigured: Boolean(MATERIALS_WEBHOOK_SECRET),
    productionLike: configured && Boolean(process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET)
  };
  if (!configured) {
    return {
      ...base,
      source: 'mock',
      counts: {
        listings: products.length,
        suppliers: suppliers.length,
        orders: materialsToolsOrders.length,
        bookings: rentalBookings.length,
        commitments: coopCommitments.length
      }
    };
  }
  const supabase = createSupabaseServerClient();
  const [listings, suppliersCount, ordersCount, bookingsCount, commitmentsCount] = await Promise.all([
    supabase.from('materials_tools_listings').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_orders').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_rental_bookings').select('*', { count: 'exact', head: true }),
    supabase.from('materials_tools_coop_commitments').select('*', { count: 'exact', head: true })
  ]);
  return {
    ...base,
    source: 'api',
    counts: {
      listings: Number(listings.count || 0),
      suppliers: Number(suppliersCount.count || 0),
      orders: Number(ordersCount.count || 0),
      bookings: Number(bookingsCount.count || 0),
      commitments: Number(commitmentsCount.count || 0)
    }
  };
}

async function launchAudit() {
  return NextResponse.json(await buildLaunchAuditSnapshot());
}

async function settingsOverview(req: NextRequest) {
  const identity = await resolveRequestIdentity(req).catch(() => null);
  const actorId = identity?.actorId || resolveRequestActorId(req);
  if (actorId === 'guest') return fail('Wallet authentication required', 401);
  return NextResponse.json({
    overview: await getMaterialsToolsSettingsOverview(actorId),
    audit: await buildLaunchAuditSnapshot()
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a === 'proof-file') return downloadProofDocument(req);
  if (a === 'launch-audit') return launchAudit();
  if (a === 'settings-overview') return settingsOverview(req);
  if (a === 'listings') return listProducts(req);
  if (a === 'suppliers') return listSuppliers(req);
  if (a === 'rentals') return listRentals(req);
  if (a === 'services') return listServices(req);
  if (a === 'coop-orders') return listCoopOrders(req);
  if (a === 'orders' && b) return orderDetail(b);
  if (a === 'orders') return listOrders(req);
  if (a === 'supplier-dashboard') return supplierDashboard(req);
  if (a === 'coop-dashboard') return coopDashboard(req);
  if (a === 'rental-dashboard') return rentalDashboard();
  if (a === 'traceability' && b) return traceabilityDetail(b);
  return fail('Unsupported materials-tools endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  if (a === 'webhooks' && slug[1] === 'payment') return reconcileOrderPayment(req);
  if (a === 'events') return trackEvent(req);
  if (a === 'wishlist') return saveAction(req, 'wishlist');
  if (a === 'tool-library-application') return saveAction(req, 'tool-library-application');
  if (a === 'verified-supplier-application') return saveAction(req, 'verified-supplier-application');
  if (a === 'elder-approval-request') return saveAction(req, 'elder-approval-request');
  if (a === 'coop-commit') return createCoopCommitment(req);
  if (a === 'order-checkout') return createOrder(req);
  if (a === 'order-payment') return confirmOrderPayment(req);
  if (a === 'order-fulfillment-update') return updateOrderFulfillment(req);
  if (a === 'listing-stock-update') return updateListingStock(req);
  if (a === 'listing-proof-document') return attachProofDocument(req);
  if (a === 'listing-proof-upload') return uploadProofDocument(req);
  if (a === 'rental-booking') return createRentalBooking(req);
  if (a === 'rental-booking-update') return updateRentalBooking(req);
  if (a === 'coop-commit-update') return updateCoopCommitment(req);
  return fail('Unsupported materials-tools endpoint', 404);
}
