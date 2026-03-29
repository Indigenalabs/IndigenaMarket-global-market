import { API_BASE_URL, buildApiUrl, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';

export interface DigitalArtApiQuery {
  q?: string;
  category?: string;
  nation?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface DigitalArtApiListing {
  _id?: string;
  listingId?: string;
  creatorAddress?: string;
  title?: string;
  subcategory?: string;
  category?: string;
  listingType?: string;
  pricing?: {
    basePrice?: { amount?: number; currency?: string };
    buyNowPrice?: number;
    startingBid?: number;
  };
  content?: { previewUrl?: string; images?: string[] };
  culturalMetadata?: { nation?: string };
  nftDetails?: { isNFT?: boolean; totalEditions?: number };
  stats?: { favorites?: number; views?: number; sales?: number };
  compliance?: {
    creatorVerificationStatus?: 'pending' | 'verified' | 'rejected';
    provenanceLevel?: 'none' | 'basic' | 'verified';
    rightsFlags?: {
      personalUse: boolean;
      commercialUse: boolean;
      derivativeUse: boolean;
      attributionRequired: boolean;
    };
    moderationStatus?: 'pending' | 'approved' | 'rejected';
  };
  createdAt?: string;
  status?: string;
}

export interface DigitalArtApiPage {
  listings: DigitalArtApiListing[];
  page: number;
  pages: number;
  total: number;
}

export interface MarketplaceEventPayload {
  event: string;
  listingId?: string;
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

export async function fetchDigitalArtPage(
  query: DigitalArtApiQuery,
  signal?: AbortSignal
): Promise<DigitalArtApiPage> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 24;

  const sort = query.sort ?? 'createdAt';
  if (query.q && query.q.trim()) {
    const url = buildUrl('/digital-arts/search', {
      q: query.q.trim(),
      type: 'listings',
      page,
      limit
    });
    const res = await fetchWithTimeout(url, { signal });
    if (!res.ok) throw new Error(await parseApiError(res, 'Search request failed'));
    const json = await res.json();
    const listings: DigitalArtApiListing[] = json?.data?.listings ?? [];
    const total = Number(json?.data?.listingCount ?? listings.length);
    const pages = Math.max(1, Math.ceil(total / limit));
    return { listings, page, pages, total };
  }

  const url = buildUrl('/digital-arts/listings', {
    category: query.category,
    nation: query.nation,
    listingType: query.listingType,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort,
    page,
    limit
  });
  const res = await fetchWithTimeout(url, { signal });
  if (!res.ok) throw new Error(await parseApiError(res, 'Listings request failed'));
  const json = await res.json();

  const listings: DigitalArtApiListing[] = json?.data ?? [];
  const pagination = json?.pagination ?? {};
  return {
    listings,
    page: Number(pagination.page ?? page),
    pages: Number(pagination.pages ?? 1),
    total: Number(pagination.total ?? listings.length)
  };
}

export async function buyListing(listingId: string, buyerAddress = 'demo-wallet') {
  return postJson(`/digital-arts/listings/${listingId}/buy`, { buyerAddress });
}

export async function bidListing(listingId: string, amount: number, bidderAddress = 'demo-wallet') {
  return postJson(`/digital-arts/listings/${listingId}/bid`, { bidderAddress, amount });
}

export async function makeOffer(listingId: string, amount: number, buyerAddress = 'demo-wallet', message = '') {
  return postJson(`/digital-arts/listings/${listingId}/offers`, { buyerAddress, amount, message });
}

export async function toggleWatchlist(listingId: string, watcherAddress = 'demo-wallet') {
  return postJson(`/digital-arts/listings/${listingId}/watchlist`, { watcherAddress });
}

export async function shareListing(listingId: string, platform: string) {
  return postJson(`/digital-arts/listings/${listingId}/share`, { platform });
}

export async function reportListing(listingId: string, reason: string, details = '') {
  return postJson(`/digital-arts/listings/${listingId}/report`, { reason, details });
}

export async function trackMarketplaceEvent(payload: MarketplaceEventPayload) {
  try {
    return await postJson('/digital-arts/analytics/event', payload as unknown as Record<string, unknown>);
  } catch {
    // Analytics should never break user actions.
    return { ok: false };
  }
}

export async function fetchCategoryDemandHeatmap() {
  const res = await fetchWithTimeout(`${API_BASE}/digital-arts/analytics/heatmap`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Heatmap request failed'));
  return res.json();
}
