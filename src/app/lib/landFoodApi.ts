import { API_BASE_URL, buildApiUrl, fetchWithTimeout, parseApiError } from './apiClient';
import {
  products,
  producers,
  projects,
  services,
  type LandFoodCategoryId
} from '@/app/land-food/data/pillar8Data';
import { isGlobalMockFallbackEnabled } from './mockMode';

const ALLOW_MOCK_FALLBACK = isGlobalMockFallbackEnabled();
const USE_APP_API = String(process.env.NEXT_PUBLIC_USE_APP_API || '').toLowerCase() === 'true';
const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;

export type LandFoodListingKind = 'product' | 'project' | 'service';

export interface LandFoodQuery {
  q?: string;
  kind?: LandFoodListingKind | 'all';
  category?: LandFoodCategoryId | 'all';
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface LandFoodListing {
  id: string;
  kind: LandFoodListingKind;
  title: string;
  subtitle: string;
  summary: string;
  image: string;
  priceLabel?: string;
  route: string;
  verified: boolean;
  category?: LandFoodCategoryId;
  stewardshipSharePercent?: number;
  traceabilityLabel?: string;
}

export interface LandFoodPage {
  items: LandFoodListing[];
  page: number;
  pages: number;
  total: number;
  source: 'api' | 'mock';
}

export interface LandFoodPlacementSummary {
  typeId: string;
  name: string;
  price: number;
  period: string;
  slotsUsed: number;
  maxSlots: number;
  available: boolean;
}

export interface LandFoodPlacementsResponse {
  success: boolean;
  summary: LandFoodPlacementSummary[];
  placements: Record<string, Array<{ creative?: { image?: string; headline?: string; subheadline?: string; cta?: string } }>>;
  source: 'api' | 'mock';
}

const MOCK_PLACEMENTS: LandFoodPlacementsResponse = {
  success: true,
  source: 'mock',
  summary: [
    { typeId: 'landfood_sticky_banner', name: 'Sticky Announcement Banner', price: 300, period: 'week', slotsUsed: 1, maxSlots: 1, available: false },
    { typeId: 'landfood_hero_banner', name: 'Hero Banner', price: 450, period: 'week', slotsUsed: 1, maxSlots: 1, available: false },
    { typeId: 'landfood_featured_producer_spotlight', name: 'Featured Producer Spotlight', price: 250, period: 'week', slotsUsed: 1, maxSlots: 2, available: true },
    { typeId: 'landfood_trending_strip', name: 'Trending Strip Placement', price: 180, period: 'week', slotsUsed: 1, maxSlots: 3, available: true },
    { typeId: 'landfood_sponsored_listing_card', name: 'Sponsored Listing Injection', price: 120, period: 'week', slotsUsed: 2, maxSlots: 6, available: true },
    { typeId: 'landfood_project_spotlight', name: 'Project Spotlight Banner', price: 220, period: 'week', slotsUsed: 1, maxSlots: 2, available: true },
    { typeId: 'landfood_institution_partner_strip', name: 'Institution Partner Strip', price: 260, period: 'week', slotsUsed: 0, maxSlots: 2, available: true }
  ],
  placements: {
    landfood_hero_banner: [
      {
        creative: {
          image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&h=900&fit=crop',
          headline: 'Regenerative Land, Living Food Systems',
          subheadline: 'Feature your producer cooperative at the top of the Land & Food marketplace.',
          cta: 'Reserve Hero Slot'
        }
      }
    ]
  }
};

function toMockListings(): LandFoodListing[] {
  const productRows: LandFoodListing[] = products.map((p) => ({
    id: p.id,
    kind: 'product',
    title: p.title,
    subtitle: `${p.producerName} • ${p.nation}`,
    summary: p.summary,
    image: p.image,
    priceLabel: `$${p.price} ${p.currency}`,
    route: `/land-food/product/${p.id}`,
    verified: p.verified,
    category: p.category,
    stewardshipSharePercent: p.stewardshipSharePercent,
    traceabilityLabel: p.traceability.qrCodeLabel
  }));

  const projectRows: LandFoodListing[] = projects.map((p) => ({
    id: p.id,
    kind: 'project',
    title: p.title,
    subtitle: `${p.location} • ${p.nation}`,
    summary: p.summary,
    image: p.image,
    priceLabel: `${p.carbonCredits.toLocaleString()} credits`,
    route: `/land-food/project/${p.id}`,
    verified: true
  }));

  const serviceRows: LandFoodListing[] = services.map((s) => ({
    id: s.id,
    kind: 'service',
    title: s.title,
    subtitle: `${s.provider} • ${s.nation}`,
    summary: s.summary,
    image: s.image,
    priceLabel: s.rateLabel,
    route: `/land-food/service/${s.id}`,
    verified: true
  }));

  return [...productRows, ...projectRows, ...serviceRows];
}

function applyFilters(items: LandFoodListing[], query: LandFoodQuery) {
  const q = (query.q || '').trim().toLowerCase();
  return items.filter((item) => {
    if (query.kind && query.kind !== 'all' && item.kind !== query.kind) return false;
    if (query.category && query.category !== 'all' && item.category !== query.category) return false;
    if (query.verifiedOnly && !item.verified) return false;
    if (!q) return true;
    return [item.title, item.subtitle, item.summary].join(' ').toLowerCase().includes(q);
  });
}

function paginate(items: LandFoodListing[], page = 1, limit = 18): LandFoodPage {
  const safeLimit = Math.max(1, Math.min(60, limit));
  const safePage = Math.max(1, page);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    page: safePage,
    pages,
    total,
    source: 'mock'
  };
}

export async function fetchLandFoodListings(query: LandFoodQuery, signal?: AbortSignal): Promise<LandFoodPage> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 18;
  try {
    const url = buildApiUrl('/land-food/listings', {
      q: query.q,
      kind: query.kind,
      category: query.category,
      verifiedOnly: query.verifiedOnly ? 1 : undefined,
      page,
      limit
    });
    const res = await fetchWithTimeout(url, { signal, cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Land & Food listings failed'));
    const json = await res.json();
    const items = (json?.items ?? []) as LandFoodListing[];
    return {
      items,
      page: Number(json?.page ?? page),
      pages: Number(json?.pages ?? 1),
      total: Number(json?.total ?? items.length),
      source: 'api'
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const all = toMockListings();
    return paginate(applyFilters(all, query), page, limit);
  }
}

export async function fetchLandFoodPlacements(): Promise<LandFoodPlacementsResponse> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/placements/page/land-food`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Land & Food placements failed'));
    const json = await res.json();
    return {
      success: Boolean(json?.success ?? true),
      summary: (json?.summary ?? []) as LandFoodPlacementSummary[],
      placements: (json?.placements ?? {}) as LandFoodPlacementsResponse['placements'],
      source: 'api'
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return MOCK_PLACEMENTS;
  }
}

export async function trackLandFoodEvent(payload: { event: string; listingId?: string; metadata?: Record<string, unknown> }) {
  try {
    await fetchWithTimeout(`${API_BASE}/land-food/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // non-blocking analytics
  }
}
