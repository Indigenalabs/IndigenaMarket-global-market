import { API_BASE_URL, buildApiUrl, fetchWithTimeout, parseApiError } from './apiClient';
import {
  products,
  suppliers,
  rentals,
  services,
  coopOrders,
  materialsToolsOrders,
  rentalBookings,
  coopCommitments,
  originStories,
  type MaterialsToolsCategoryId,
  type MaterialProduct,
  type Supplier,
  type ToolRental,
  type SupplyService,
  type CoopOrder,
  type MaterialsToolsOrder,
  type RentalBooking,
  type CoopCommitment,
  type OriginStory
} from '@/app/materials-tools/data/pillar10Data';
import type {
  MaterialsToolsActionRecord,
  MaterialsToolsReviewStatus,
  MaterialsToolsSettingsOverview
} from '@/app/lib/materialsToolsOps';
import { isGlobalMockFallbackEnabled } from './mockMode';

const ALLOW_MOCK_FALLBACK = isGlobalMockFallbackEnabled();
const API_BASE = API_BASE_URL;

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readLocalList<T>(key: string): T[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalList<T>(key: string, items: T[]) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function prependLocalItem<T extends { id: string }>(key: string, item: T) {
  const existing = readLocalList<T>(key).filter((entry) => entry.id !== item.id);
  writeLocalList(key, [item, ...existing]);
}

function updateLocalItem<T extends { id: string }>(key: string, id: string, updater: (item: T) => T) {
  const existing = readLocalList<T>(key);
  writeLocalList(
    key,
    existing.map((item) => (item.id === id ? updater(item) : item))
  );
}

function mergeLocalListingOverrides(items: MaterialProduct[]) {
  const overrides = readLocalList<Partial<MaterialProduct> & { id: string }>('materials_tools_listing_overrides');
  if (!overrides.length) return items;
  return items.map((item) => {
    const match = overrides.find((override) => override.id === item.id);
    return match ? { ...item, ...match } : item;
  });
}

export type MaterialsToolsListingKind = 'material' | 'tool' | 'equipment' | 'bulk-supply';

export interface MaterialsToolsQuery {
  q?: string;
  category?: MaterialsToolsCategoryId | 'all';
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface MaterialsToolsPage<T> {
  items: T[];
  page: number;
  pages: number;
  total: number;
  source: 'api' | 'mock';
}

export interface MaterialsToolsOrdersResponse {
  items: MaterialsToolsOrder[];
  bookings: RentalBooking[];
  page: number;
  pages: number;
  total: number;
  source: 'api' | 'mock';
}

export interface MaterialsToolsSupplierDashboardResponse {
  supplier: Supplier;
  stats: {
    activeListings: number;
    lowStock: number;
    inboundOrders: number;
    reorderReady: number;
    avgFulfillment: number;
  };
  listingHealth: MaterialProduct[];
  recentOrders: MaterialsToolsOrder[];
  inboundCoopDemand: CoopCommitment[];
  source: 'api' | 'mock';
}

export interface MaterialsToolsCoopDashboardResponse {
  stats: {
    openRuns: number;
    yourCommitments: number;
    closingSoon: number;
    avgProgress: number;
  };
  openOrders: CoopOrder[];
  yourCommitments: CoopCommitment[];
  milestones: Array<{ label: string; date: string; description: string }>;
  source: 'api' | 'mock';
}

export interface MaterialsToolsTraceabilityResponse {
  product: MaterialProduct;
  story: OriginStory;
  source: 'api' | 'mock';
}

export interface MaterialsToolsRentalDashboardResponse {
  stats: {
    totalBookings: number;
    waitingReview: number;
    confirmed: number;
    checkedOut?: number;
    returned?: number;
  };
  bookings: RentalBooking[];
  source: 'api' | 'mock';
}

export interface MaterialsToolsLaunchAuditResponse {
  supabaseConfigured: boolean;
  proofBucketConfigured: boolean;
  paymentWebhookConfigured: boolean;
  productionLike: boolean;
  source: 'api' | 'mock';
  counts: {
    listings: number;
    suppliers: number;
    orders: number;
    bookings: number;
    commitments: number;
  };
}

export interface MaterialsToolsSettingsOverviewResponse {
  overview: MaterialsToolsSettingsOverview;
  audit: MaterialsToolsLaunchAuditResponse;
}

export interface MaterialsToolsOrderDetailResponse {
  order: MaterialsToolsOrder;
  source: 'api' | 'mock';
}

function paginate<T>(items: T[], page = 1, limit = 18): MaterialsToolsPage<T> {
  const safeLimit = Math.max(1, Math.min(60, limit));
  const safePage = Math.max(1, page);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  return { items: items.slice(start, start + safeLimit), page: safePage, pages, total, source: 'mock' };
}

function filterProducts(query: MaterialsToolsQuery) {
  const q = (query.q || '').trim().toLowerCase();
  return products.filter((item) => {
    if (query.category && query.category !== 'all' && item.category !== query.category) return false;
    if (query.verifiedOnly && !item.verified) return false;
    if (!q) return true;
    return [item.title, item.supplierName, item.summary, item.nation].join(' ').toLowerCase().includes(q);
  });
}

function filterSuppliers(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return suppliers;
  return suppliers.filter((item) => [item.name, item.bio, item.region, item.nation, item.specialties.join(' ')].join(' ').toLowerCase().includes(needle));
}

function filterRentals(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return rentals;
  return rentals.filter((item) => [item.title, item.hubName, item.location, item.summary, item.equipmentType].join(' ').toLowerCase().includes(needle));
}

function filterServices(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return services;
  return services.filter((item) => [item.title, item.provider, item.summary, item.nation].join(' ').toLowerCase().includes(needle));
}

function filterCoopOrders(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return coopOrders;
  return coopOrders.filter((item) => [item.title, item.summary].join(' ').toLowerCase().includes(needle));
}

async function getJson<T>(url: string, fallback: () => MaterialsToolsPage<T>): Promise<MaterialsToolsPage<T>> {
  try {
    const res = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools request failed'));
    const json = await res.json();
    return {
      items: (json?.items ?? []) as T[],
      page: Number(json?.page ?? 1),
      pages: Number(json?.pages ?? 1),
      total: Number(json?.total ?? 0),
      source: 'api'
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return fallback();
  }
}

export async function fetchMaterialsToolsListings(query: MaterialsToolsQuery, signal?: AbortSignal) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 18;
  try {
    const res = await fetchWithTimeout(buildApiUrl('/materials-tools/listings', { q: query.q, category: query.category, verifiedOnly: query.verifiedOnly ? 1 : undefined, page, limit }), { cache: 'no-store', signal });
    if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools listings failed'));
    const json = await res.json();
    return { items: (json?.items ?? []) as MaterialProduct[], page: Number(json?.page ?? page), pages: Number(json?.pages ?? 1), total: Number(json?.total ?? 0), source: 'api' as const };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return paginate(filterProducts(query), page, limit);
  }
}

export function fetchMaterialsToolsSuppliers(q = '', page = 1, limit = 18) {
  return getJson<Supplier>(buildApiUrl('/materials-tools/suppliers', { q, page, limit }), () => paginate(filterSuppliers(q), page, limit));
}

export function fetchMaterialsToolsRentals(q = '', page = 1, limit = 18) {
  return getJson<ToolRental>(buildApiUrl('/materials-tools/rentals', { q, page, limit }), () => paginate(filterRentals(q), page, limit));
}

export function fetchMaterialsToolsServices(q = '', page = 1, limit = 18) {
  return getJson<SupplyService>(buildApiUrl('/materials-tools/services', { q, page, limit }), () => paginate(filterServices(q), page, limit));
}

export function fetchMaterialsToolsCoopOrders(q = '', page = 1, limit = 18) {
  return getJson<CoopOrder>(buildApiUrl('/materials-tools/coop-orders', { q, page, limit }), () => paginate(filterCoopOrders(q), page, limit));
}

export async function fetchMaterialsToolsOrders() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/materials-tools/orders`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools orders failed'));
    const json = await res.json();
    return {
      items: (json?.items ?? []) as MaterialsToolsOrder[],
      bookings: (json?.bookings ?? []) as RentalBooking[],
      page: Number(json?.page ?? 1),
      pages: Number(json?.pages ?? 1),
      total: Number(json?.total ?? 0),
      source: 'api' as const
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const localOrders = readLocalList<MaterialsToolsOrder>('materials_tools_orders');
    const localBookings = readLocalList<RentalBooking>('materials_tools_rental_bookings');
    return {
      items: [...localOrders, ...materialsToolsOrders.filter((item) => !localOrders.some((local) => local.id === item.id))].slice(0, 6),
      bookings: [...localBookings, ...rentalBookings.filter((item) => !localBookings.some((local) => local.id === item.id))].slice(0, 6),
      page: 1,
      pages: 1,
      total: Math.max(localOrders.length, materialsToolsOrders.length),
      source: 'mock' as const
    };
  }
}

export async function fetchMaterialsToolsSupplierDashboard(supplierId = 'sup-1') {
  try {
    const res = await fetchWithTimeout(buildApiUrl('/materials-tools/supplier-dashboard', { supplierId }), { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Supplier dashboard failed'));
    const json = await res.json();
    return { ...(json as Omit<MaterialsToolsSupplierDashboardResponse, 'source'>), source: 'api' as const };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const supplier = suppliers.find((item) => item.id === supplierId) || suppliers[0];
    const listingHealth = mergeLocalListingOverrides(products.filter((item) => item.supplierId === supplier.id));
    const localOrders = readLocalList<MaterialsToolsOrder>('materials_tools_orders');
    const recentOrders = [...localOrders, ...materialsToolsOrders].filter((item) => item.supplierId === supplier.id);
    return {
      supplier,
      stats: {
        activeListings: listingHealth.length,
        lowStock: listingHealth.filter((item) => item.stockLabel !== 'In Stock').length,
        inboundOrders: recentOrders.length,
        reorderReady: recentOrders.filter((item) => item.reorderReady).length,
        avgFulfillment: supplier.fulfillmentScore
      },
      listingHealth,
      recentOrders,
      inboundCoopDemand: coopCommitments.slice(0, 2),
      source: 'mock' as const
    };
  }
}

export async function fetchMaterialsToolsCoopDashboard() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/materials-tools/coop-dashboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Co-op dashboard failed'));
    const json = await res.json();
    return { ...(json as Omit<MaterialsToolsCoopDashboardResponse, 'source'>), source: 'api' as const };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const localCommitments = readLocalList<CoopCommitment>('materials_tools_coop_commitments');
    return {
      stats: {
        openRuns: coopOrders.length,
        yourCommitments: localCommitments.length || coopCommitments.length,
        closingSoon: coopOrders.filter((item) => new Date(item.closeDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 14).length,
        avgProgress: Math.round(coopOrders.reduce((sum, item) => sum + item.committedUnits / item.targetUnits, 0) / coopOrders.length * 100)
      },
      openOrders: coopOrders,
      yourCommitments: localCommitments.length ? localCommitments : coopCommitments,
      milestones: [
        { label: 'Bead run invoice release', date: '2026-03-19', description: 'Final freight quote goes out to confirmed bead run members.' },
        { label: 'Textile hardware consolidation', date: '2026-03-24', description: 'Regional hubs lock counts before hardware kit packing.' },
        { label: 'Shipping pool dispatch', date: '2026-04-05', description: 'Packaging pool moves into shared freight dispatch.' }
      ],
      source: 'mock' as const
    };
  }
}

export async function fetchMaterialsToolsTraceability(productId: string) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/materials-tools/traceability/${productId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Traceability story failed'));
    const json = await res.json();
    return { product: json.product as MaterialProduct, story: json.story as OriginStory, source: 'api' as const };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const product = products.find((item) => item.id === productId) || products[0];
    const story = originStories.find((item) => item.productId === productId) || originStories[0];
    return { product, story, source: 'mock' as const };
  }
}

export async function fetchMaterialsToolsRentalDashboard() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/materials-tools/rental-dashboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Rental steward dashboard failed'));
    const json = await res.json();
    return { ...(json as Omit<MaterialsToolsRentalDashboardResponse, 'source'>), source: 'api' as const };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const localBookings = readLocalList<RentalBooking>('materials_tools_rental_bookings');
    const bookings = [...localBookings, ...rentalBookings.filter((item) => !localBookings.some((local) => local.id === item.id))];
    return {
      stats: {
        totalBookings: bookings.length,
        waitingReview: bookings.filter((item) => item.accessStatus !== 'confirmed').length,
        confirmed: bookings.filter((item) => item.accessStatus === 'confirmed').length,
        checkedOut: bookings.filter((item) => item.accessStatus === 'checked-out').length,
        returned: bookings.filter((item) => item.accessStatus === 'returned').length
      },
      bookings,
      source: 'mock' as const
    };
  }
}

export async function fetchMaterialsToolsLaunchAudit() {
  const res = await fetchWithTimeout(`${API_BASE}/materials-tools/launch-audit`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools launch audit failed'));
  return (await res.json()) as MaterialsToolsLaunchAuditResponse;
}

export async function fetchMaterialsToolsSettingsOverview() {
  const res = await fetchWithTimeout(`${API_BASE}/materials-tools/settings-overview`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools settings overview failed'));
  return (await res.json()) as MaterialsToolsSettingsOverviewResponse;
}

export async function reviewMaterialsToolsAction(body: {
  id: string;
  status: MaterialsToolsReviewStatus;
  note?: string;
  reviewedBy?: string;
}) {
  const res = await fetchWithTimeout(`${API_BASE}/materials-tools/action-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools action review failed'));
  const json = await res.json();
  return json.action as MaterialsToolsActionRecord;
}

export async function fetchMaterialsToolsOrderDetail(orderId: string) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/materials-tools/orders/${orderId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools receipt failed'));
    const json = await res.json();
    return { order: json.order as MaterialsToolsOrder, source: 'api' as const };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const localOrders = readLocalList<MaterialsToolsOrder>('materials_tools_orders');
    const order = [...localOrders, ...materialsToolsOrders].find((item) => item.id === orderId) || materialsToolsOrders[0];
    return { order, source: 'mock' as const };
  }
}

export async function trackMaterialsToolsEvent(payload: { event: string; entityId?: string; metadata?: Record<string, unknown> }) {
  try {
    await fetchWithTimeout(`${API_BASE}/materials-tools/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // non-blocking analytics
  }
}

async function postAction<T extends Record<string, unknown>>(action: string, body: T) {
  const res = await fetchWithTimeout(`${API_BASE}/materials-tools/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res, `Materials & Tools ${action} failed`));
  return res.json();
}

export function submitMaterialsWishlist(body: { title: string; details: string }) {
  return postAction('wishlist', body);
}

export function submitToolLibraryApplication(body: { studioName: string; equipmentNeed: string }) {
  return postAction('tool-library-application', body);
}

export function submitVerifiedSupplierApplication(body: { organization: string; specialty: string }) {
  return postAction('verified-supplier-application', body);
}

export function submitElderApprovalRequest(body: { materialName: string; useCase: string }) {
  return postAction('elder-approval-request', body);
}

export function submitCoopCommit(body: { orderId: string; units: number }) {
  return postAction('coop-commit', body).then((json) => {
    if (json?.commitment) prependLocalItem('materials_tools_coop_commitments', json.commitment as CoopCommitment);
    return json;
  });
}

export function submitMaterialsOrder(body: {
  productId: string;
  quantity: number;
  shippingRegion: string;
  deliveryMode: 'freight-consolidated' | 'studio-direct' | 'tool-hub-pickup';
  notes: string;
}) {
  return postAction('order-checkout', body).then((json) => {
    if (json?.order) prependLocalItem('materials_tools_orders', json.order as MaterialsToolsOrder);
    return json;
  });
}

export function saveMaterialsPurchasePlan(body: {
  productId: string;
  quantity: number;
  shippingRegion: string;
  deliveryMode: 'freight-consolidated' | 'studio-direct' | 'tool-hub-pickup';
  notes: string;
  quoteTotal: number;
}) {
  const plan = {
    id: `plan-${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString()
  };
  prependLocalItem('materials_tools_purchase_plan', plan);
  return Promise.resolve({ ok: true, plan });
}

export function submitRentalBooking(body: {
  rentalId: string;
  bookingDate: string;
  sessionWindow: string;
}) {
  return postAction('rental-booking', body).then((json) => {
    if (json?.booking) prependLocalItem('materials_tools_rental_bookings', json.booking as RentalBooking);
    return json;
  });
}

export function updateMaterialsRentalBooking(body: {
  bookingId: string;
  accessStatus: RentalBooking['accessStatus'];
  depositLabel: string;
  conditionStatus?: RentalBooking['conditionStatus'];
  conditionNotes?: string;
}) {
  return postAction('rental-booking-update', body).then((json) => {
    const bookingId = String(json?.bookingId || body.bookingId);
    updateLocalItem<RentalBooking>('materials_tools_rental_bookings', bookingId, (item) => ({
      ...item,
      accessStatus: body.accessStatus,
      depositLabel: body.depositLabel,
      conditionStatus: body.conditionStatus || item.conditionStatus,
      conditionNotes: body.conditionNotes || item.conditionNotes,
      checkedOutAt: body.accessStatus === 'checked-out' ? new Date().toISOString() : item.checkedOutAt,
      returnedAt: body.accessStatus === 'returned' ? new Date().toISOString() : item.returnedAt
    }));
    return json;
  });
}

export function confirmMaterialsOrderPayment(body: { orderId: string; paymentAction: 'deposit' | 'settle'; amountPaid: number }) {
  return postAction('order-payment', body).then((json) => {
    const orderId = String(json?.orderId || body.orderId);
    updateLocalItem<MaterialsToolsOrder>('materials_tools_orders', orderId, (item) => ({
      ...item,
      paymentStatus: String(json?.paymentStatus || item.paymentStatus) as MaterialsToolsOrder['paymentStatus'],
      fulfillmentStatus: String(json?.fulfillmentStatus || item.fulfillmentStatus) as MaterialsToolsOrder['fulfillmentStatus'],
      receiptId: String(json?.receiptId || item.receiptId || ''),
      reconciledAt: String(json?.reconciledAt || item.reconciledAt || ''),
      notes: item.notes
    }));
    return json;
  });
}

export function updateMaterialsOrderFulfillment(body: { orderId: string; fulfillmentStatus: MaterialsToolsOrder['fulfillmentStatus'] }) {
  return postAction('order-fulfillment-update', body).then((json) => {
    const orderId = String(json?.orderId || body.orderId);
    updateLocalItem<MaterialsToolsOrder>('materials_tools_orders', orderId, (item) => ({
      ...item,
      fulfillmentStatus: body.fulfillmentStatus,
      reorderReady: Boolean(json?.reorderReady ?? item.reorderReady)
    }));
    return json;
  });
}

export function updateMaterialsCoopCommitment(body: {
  commitmentId: string;
  contributionStatus: CoopCommitment['contributionStatus'];
  paymentWindow: string;
  invoiceId?: string;
  invoiceArtifactUrl?: string;
  dispatchStatus?: CoopCommitment['dispatchStatus'];
}) {
  return postAction('coop-commit-update', body).then((json) => {
    const commitmentId = String(json?.commitmentId || body.commitmentId);
    updateLocalItem<CoopCommitment>('materials_tools_coop_commitments', commitmentId, (item) => ({
      ...item,
      contributionStatus: body.contributionStatus,
      paymentWindow: body.paymentWindow,
      invoiceId: String(json?.invoiceId || body.invoiceId || item.invoiceId || ''),
      invoiceArtifactUrl: String(json?.invoiceArtifactUrl || body.invoiceArtifactUrl || item.invoiceArtifactUrl || ''),
      dispatchStatus: String(json?.dispatchStatus || body.dispatchStatus || item.dispatchStatus || '') as CoopCommitment['dispatchStatus']
    }));
    return json;
  });
}

export function updateMaterialsListingStock(body: { productId: string; stockLabel: string; leadTime: string }) {
  return postAction('listing-stock-update', body).then((json) => {
    const overrides = readLocalList<Partial<MaterialProduct> & { id: string }>('materials_tools_listing_overrides').filter((item) => item.id !== body.productId);
    overrides.unshift({ id: body.productId, stockLabel: body.stockLabel, leadTime: body.leadTime });
    writeLocalList('materials_tools_listing_overrides', overrides);
    return json;
  });
}

export function attachMaterialsProofDocument(body: { productId: string; label: string }) {
  return postAction('listing-proof-document', body).then((json) => {
    const existing = readLocalList<{ productId: string; label: string; createdAt: string }>('materials_tools_proof_docs');
    existing.unshift({
      productId: body.productId,
      label: body.label,
      createdAt: new Date().toISOString()
    });
    writeLocalList('materials_tools_proof_docs', existing.slice(0, 20));
    return json;
  });
}

export async function uploadMaterialsProofDocument(body: { productId: string; label: string; file: File }) {
  const form = new FormData();
  form.set('productId', body.productId);
  form.set('label', body.label);
  form.set('file', body.file);
  const res = await fetchWithTimeout(`${API_BASE}/materials-tools/listing-proof-upload`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Materials & Tools proof upload failed'));
  return res.json();
}
