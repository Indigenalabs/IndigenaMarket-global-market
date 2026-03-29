import { API_BASE_URL, buildApiUrl, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';

export interface PhysicalMarketplaceQuery {
  q?: string;
  categoryId?: string;
  nation?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PhysicalMarketplaceItem {
  _id?: string;
  itemId?: string;
  title?: string;
  description?: string;
  categoryId?: string;
  subcategory?: string;
  price?: number;
  currency?: string;
  listingType?: string;
  images?: string[];
  creator?: {
    name?: string;
    tribalAffiliation?: string;
    walletAddress?: string;
  };
  authenticity?: { verified?: boolean };
  elderVerified?: boolean;
  status?: string;
  createdAt?: string;
}

export interface PhysicalMarketplacePage {
  items: PhysicalMarketplaceItem[];
  page: number;
  pages: number;
  total: number;
}

export interface PhysicalMarketplaceEvent {
  event: string;
  itemId?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;

function buildUrl(path: string, query: Record<string, string | number | undefined>) {
  if (!USE_APP_API) return buildApiUrl(path, query);
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === '') return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return `${API_BASE}${path}${qs ? `?${qs}` : ''}`;
}

async function postJson(path: string, body: Record<string, unknown>) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}

export async function fetchPhysicalItems(
  query: PhysicalMarketplaceQuery,
  signal?: AbortSignal
): Promise<PhysicalMarketplacePage> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 24;

  if (query.q && query.q.trim()) {
    const searchUrl = buildUrl('/physical-items/search', {
      q: query.q.trim(),
      categoryId: query.categoryId,
      nation: query.nation,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      page,
      limit
    });
    const searchRes = await fetchWithTimeout(searchUrl, { signal });
    if (!searchRes.ok) throw new Error(await parseApiError(searchRes, 'Search request failed'));
    const searchJson = await searchRes.json();
    const items: PhysicalMarketplaceItem[] = searchJson?.items ?? [];
    const total = Number(searchJson?.total ?? searchJson?.count ?? items.length);
    const pages = Math.max(1, Math.ceil(total / limit));
    return { items, page, pages, total };
  }

  const listUrl = buildUrl('/physical-items/items', {
    categoryId: query.categoryId,
    nation: query.nation,
    listingType: query.listingType,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
    page,
    limit
  });
  const res = await fetchWithTimeout(listUrl, { signal });
  if (!res.ok) throw new Error(await parseApiError(res, 'Items request failed'));
  const json = await res.json();

  const items: PhysicalMarketplaceItem[] = json?.items ?? [];
  return {
    items,
    page: Number(json?.page ?? page),
    pages: Number(json?.pages ?? 1),
    total: Number(json?.total ?? items.length)
  };
}

export async function buyPhysicalItem(itemId: string, buyerAddress = 'demo-wallet') {
  return postJson(`/physical-items/items/${itemId}/buy`, { buyerAddress });
}

export async function makePhysicalOffer(itemId: string, amount: number, buyerAddress = 'demo-wallet', message = '') {
  return postJson(`/physical-items/items/${itemId}/offers`, { buyerAddress, amount, message });
}

export async function togglePhysicalWatchlist(itemId: string, watcherAddress = 'demo-wallet') {
  return postJson(`/physical-items/items/${itemId}/watchlist`, { watcherAddress });
}

export async function sharePhysicalItem(itemId: string, platform: string) {
  return postJson(`/physical-items/items/${itemId}/share`, { platform });
}

export async function reportPhysicalItem(itemId: string, reason: string, details = '') {
  return postJson(`/physical-items/items/${itemId}/report`, { reason, details });
}

export async function trackPhysicalMarketplaceEvent(payload: PhysicalMarketplaceEvent) {
  return postJson('/physical-items/analytics/event', payload as unknown as Record<string, unknown>);
}

export async function fetchPhysicalCategoryDemandHeatmap() {
  const res = await fetchWithTimeout(`${API_BASE}/physical-items/analytics/heatmap`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Heatmap request failed'));
  return res.json();
}
