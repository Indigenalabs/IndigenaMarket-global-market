import { API_BASE_URL, buildApiUrl, fetchWithTimeout, parseApiError } from './apiClient';
import { PILLAR7_CATEGORIES } from '@/app/language-heritage/data/pillar7Catalog';
import { isGlobalMockFallbackEnabled } from './mockMode';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';
const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;
const ALLOW_MOCK_FALLBACK = isGlobalMockFallbackEnabled();

export type HeritageAccessLevel = 'public' | 'community' | 'restricted' | 'elder-approved';

export interface LanguageHeritageQuery {
  q?: string;
  categoryId?: string;
  accessLevel?: HeritageAccessLevel | 'all';
  minPrice?: number;
  maxPrice?: number;
  format?: 'all' | 'audio' | 'video' | 'document' | 'service' | 'experience' | 'software';
  sort?: 'featured' | 'newest' | 'price-low' | 'price-high';
  page?: number;
  limit?: number;
}

export interface LanguageHeritageListing {
  id: string;
  title: string;
  categoryId: string;
  categoryLabel: string;
  summary: string;
  nation: string;
  keeperName: string;
  format: 'audio' | 'video' | 'document' | 'service' | 'experience' | 'software';
  accessLevel: HeritageAccessLevel;
  verifiedSpeaker: boolean;
  elderApproved: boolean;
  communityControlled: boolean;
  price: number;
  currency: string;
  image: string;
  tags: string[];
  durationLabel?: string;
  itemCountLabel?: string;
  rating: number;
  reviews: number;
  createdAt: string;
}

export interface LanguageHeritagePage {
  items: LanguageHeritageListing[];
  page: number;
  pages: number;
  total: number;
  source: 'api' | 'mock';
}

export interface HeritagePlacementSummary {
  typeId: string;
  name: string;
  price: number;
  period: string;
  slotsUsed: number;
  maxSlots: number;
  available: boolean;
}

export interface HeritagePlacementsResponse {
  success: boolean;
  summary: HeritagePlacementSummary[];
  placements: Record<string, Array<{ creative?: { image?: string; headline?: string; subheadline?: string; cta?: string } }>>;
  source: 'api' | 'mock';
}

export interface HeritagePaymentIntent {
  intentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  expiresAt: string;
}

export interface HeritageReceipt {
  receiptId: string;
  listingId: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface HeritageDownloadGrant {
  listingId: string;
  fileName: string;
  downloadUrl: string;
  accessLevel: HeritageAccessLevel;
}

export interface HeritageCitationExport {
  listingId: string;
  formats: {
    plain: string;
    mla: string;
    apa: string;
  };
}

export interface InstitutionalArchiveSeat {
  id: string;
  actorId: string;
  email: string;
  role: 'admin' | 'researcher' | 'viewer';
  status: 'active' | 'invited' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

export interface HeritageLibraryBundleResponse {
  fileName: string;
  downloadUrl?: string;
  scope?: string;
  citations?: string[];
}

export interface HeritageAccessRequestRecord {
  requestId: string;
  listingId: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeritageLanguageDirectoryItem {
  languageId: string;
  name: string;
  totalItems: number;
  avgRating: number;
  categories: string[];
}

export interface HeritageCommunityProfile {
  communityId: string;
  nation: string;
  totalItems: number;
  categoryCounts: Record<string, number>;
  featured: LanguageHeritageListing[];
}

export interface HeritageDictionaryEntry {
  entryId: string;
  term: string;
  language: string;
  pronunciation: string;
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
  culturalNote: string;
}

export interface HeritageContributorDashboard {
  materialsCount: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  metadataCompletionRate: number;
  reviewSlaHours: number;
  monthlyReach: number;
}

export interface HeritageGrantOpportunity {
  id: string;
  title: string;
  sponsor: string;
  amountLabel: string;
  deadlineLabel: string;
  type: 'federal' | 'global' | 'community' | 'private';
  summary: string;
}

export interface SacredAccessRequestPayload {
  requesterName: string;
  affiliation: string;
  listingId: string;
  purpose: string;
  justification: string;
  acknowledgedProtocols: boolean;
}

const MOCK_LISTINGS: LanguageHeritageListing[] = [
  {
    id: 'lh-1',
    title: 'Passamaquoddy Audio Conversation Pack',
    categoryId: 'audio-video-resources',
    categoryLabel: 'Audio & Video Language Resources',
    summary: 'Natural dialogues between fluent speakers with slowed-learning tracks and transcripts.',
    nation: 'Passamaquoddy',
    keeperName: 'Elder Collective Media Team',
    format: 'audio',
    accessLevel: 'community',
    verifiedSpeaker: true,
    elderApproved: true,
    communityControlled: true,
    price: 39,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=700&fit=crop',
    tags: ['audio', 'conversation', 'transcript'],
    durationLabel: '6 hours',
    itemCountLabel: '48 tracks',
    rating: 4.9,
    reviews: 128,
    createdAt: '2026-02-11T00:00:00.000Z'
  },
  {
    id: 'lh-2',
    title: 'Elder Storytelling Night Archive',
    categoryId: 'oral-history-storytelling',
    categoryLabel: 'Oral History & Storytelling',
    summary: 'Curated seasonal stories with cultural context notes and intergenerational access mode.',
    nation: 'Yolngu',
    keeperName: 'Gumatj Story Circle',
    format: 'video',
    accessLevel: 'community',
    verifiedSpeaker: true,
    elderApproved: true,
    communityControlled: true,
    price: 65,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=700&fit=crop',
    tags: ['stories', 'video', 'elder'],
    durationLabel: '8 sessions',
    itemCountLabel: '24 stories',
    rating: 4.8,
    reviews: 73,
    createdAt: '2026-01-02T00:00:00.000Z'
  },
  {
    id: 'lh-3',
    title: 'Community Place Name Atlas',
    categoryId: 'heritage-sites-land-knowledge',
    categoryLabel: 'Cultural Heritage Sites & Land-Based Knowledge',
    summary: 'Interactive map bundle with language pronunciations and community-approved site context.',
    nation: 'Noongar',
    keeperName: 'Boodja Mapping Unit',
    format: 'document',
    accessLevel: 'restricted',
    verifiedSpeaker: true,
    elderApproved: true,
    communityControlled: true,
    price: 120,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=700&fit=crop',
    tags: ['map', 'place names', 'land'],
    itemCountLabel: '112 place names',
    rating: 4.9,
    reviews: 41,
    createdAt: '2025-12-10T00:00:00.000Z'
  },
  {
    id: 'lh-4',
    title: 'Language Teacher Training Cohort',
    categoryId: 'training-capacity',
    categoryLabel: 'Training & Capacity Building',
    summary: '12-week cohort covering immersion pedagogy, assessment tools, and lesson workflows.',
    nation: 'Anishinaabe',
    keeperName: 'Knowledge Weavers Network',
    format: 'service',
    accessLevel: 'public',
    verifiedSpeaker: true,
    elderApproved: false,
    communityControlled: true,
    price: 950,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=700&fit=crop',
    tags: ['teacher', 'training', 'immersion'],
    durationLabel: '12 weeks',
    rating: 4.7,
    reviews: 57,
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'lh-5',
    title: 'Syllabics Keyboard + Font Bundle',
    categoryId: 'language-technology',
    categoryLabel: 'Language Technology & Tools',
    summary: 'Unicode-ready keyboard layouts and fonts for Indigenous script publishing workflows.',
    nation: 'Cree',
    keeperName: 'Native Script Lab',
    format: 'software',
    accessLevel: 'public',
    verifiedSpeaker: false,
    elderApproved: false,
    communityControlled: true,
    price: 49,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=700&fit=crop',
    tags: ['keyboard', 'font', 'software'],
    itemCountLabel: '4 layouts',
    rating: 4.6,
    reviews: 32,
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'lh-6',
    title: 'Family Immersion Weekend Pass',
    categoryId: 'community-immersion',
    categoryLabel: 'Community Immersion Experiences',
    summary: 'On-country weekend with language circles, song sessions, and family learning tracks.',
    nation: 'Maori',
    keeperName: 'Te Reo Whanau Retreat',
    format: 'experience',
    accessLevel: 'community',
    verifiedSpeaker: true,
    elderApproved: true,
    communityControlled: true,
    price: 480,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=700&fit=crop',
    tags: ['immersion', 'family', 'retreat'],
    durationLabel: '2 days',
    rating: 4.9,
    reviews: 64,
    createdAt: '2026-02-19T00:00:00.000Z'
  },
  {
    id: 'lh-7',
    title: 'Folklore Collection: Trickster Stories',
    categoryId: 'folklore-oral-traditions',
    categoryLabel: 'Folklore & Oral Traditions',
    summary: 'Audio + illustrated text set with youth-friendly language annotations.',
    nation: 'Navajo',
    keeperName: 'Desert Story Guild',
    format: 'document',
    accessLevel: 'public',
    verifiedSpeaker: true,
    elderApproved: false,
    communityControlled: false,
    price: 28,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=700&fit=crop',
    tags: ['folklore', 'stories', 'youth'],
    itemCountLabel: '16 stories',
    rating: 4.5,
    reviews: 89,
    createdAt: '2025-11-28T00:00:00.000Z'
  },
  {
    id: 'lh-8',
    title: 'ICIP Policy & Protocol Advisory Pack',
    categoryId: 'consulting-professional-services',
    categoryLabel: 'Consulting & Professional Services',
    summary: 'Institution-focused ICIP rights consulting, protocol design, and governance templates.',
    nation: 'First Nations Multi-Nation',
    keeperName: 'Sovereign Rights Advisors',
    format: 'service',
    accessLevel: 'restricted',
    verifiedSpeaker: true,
    elderApproved: true,
    communityControlled: true,
    price: 2200,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=700&fit=crop',
    tags: ['icip', 'policy', 'consulting'],
    durationLabel: 'Project based',
    rating: 4.8,
    reviews: 19,
    createdAt: '2026-01-17T00:00:00.000Z'
  }
];

const MOCK_PLACEMENTS: HeritagePlacementsResponse = {
  success: true,
  source: 'mock',
  summary: [
    { typeId: 'heritage_featured_banner', name: 'Featured Heritage Banner', price: 280, period: 'week', slotsUsed: 1, maxSlots: 2, available: true },
    { typeId: 'heritage_speaker_spotlight', name: 'Speaker Spotlight', price: 220, period: 'week', slotsUsed: 1, maxSlots: 2, available: true },
    { typeId: 'heritage_sponsored_card', name: 'Sponsored Archive Card', price: 150, period: 'week', slotsUsed: 2, maxSlots: 4, available: true },
    { typeId: 'heritage_category_boost', name: 'Category Priority Boost', price: 90, period: 'week', slotsUsed: 2, maxSlots: 4, available: true },
    { typeId: 'heritage_newsletter_feature', name: 'Newsletter Language Feature', price: 300, period: 'send', slotsUsed: 1, maxSlots: 1, available: false },
    { typeId: 'heritage_institution_partner', name: 'Institution Partner Strip', price: 180, period: 'week', slotsUsed: 0, maxSlots: 2, available: true },
    { typeId: 'heritage_seasonal_takeover', name: 'Seasonal Revival Takeover', price: 240, period: 'week', slotsUsed: 0, maxSlots: 1, available: true }
  ],
  placements: {
    'heritage_featured_banner': [
      {
        creative: {
          image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=600&fit=crop',
          headline: 'Language Revitalization Season',
          subheadline: 'Place your campaign in the top heritage hero across all discovery views.',
          cta: 'Reserve Banner'
        }
      }
    ]
  }
};

function normalizeListing(raw: Record<string, unknown>): LanguageHeritageListing {
  const categoryId = String(raw.categoryId || 'language-learning-materials');
  const category = PILLAR7_CATEGORIES.find((entry) => entry.id === categoryId);
  const accessLevel = String(raw.accessLevel || 'public') as HeritageAccessLevel;
  const format = String(raw.format || 'document') as LanguageHeritageListing['format'];

  return {
    id: String(raw.id || raw._id || Math.random().toString(36).slice(2)),
    title: String(raw.title || 'Untitled Heritage Listing'),
    categoryId,
    categoryLabel: category?.name || String(raw.categoryLabel || 'Language & Heritage'),
    summary: String(raw.summary || raw.description || 'Community-submitted listing.'),
    nation: String(raw.nation || 'Indigenous Nation'),
    keeperName: String(raw.keeperName || raw.creatorName || 'Community Keeper'),
    format,
    accessLevel,
    verifiedSpeaker: Boolean(raw.verifiedSpeaker),
    elderApproved: Boolean(raw.elderApproved),
    communityControlled: Boolean(raw.communityControlled ?? true),
    price: Number(raw.price ?? 0),
    currency: String(raw.currency || 'USD'),
    image: String(raw.image || raw.thumbnailUrl || 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=1200&h=700&fit=crop'),
    tags: Array.isArray(raw.tags) ? raw.tags.map((tag) => String(tag)) : [],
    durationLabel: raw.durationLabel ? String(raw.durationLabel) : undefined,
    itemCountLabel: raw.itemCountLabel ? String(raw.itemCountLabel) : undefined,
    rating: Number(raw.rating ?? 4.7),
    reviews: Number(raw.reviews ?? 0),
    createdAt: String(raw.createdAt || new Date().toISOString())
  };
}

function applyLocalFilters(items: LanguageHeritageListing[], query: LanguageHeritageQuery): LanguageHeritageListing[] {
  const search = (query.q || '').trim().toLowerCase();

  let filtered = items.filter((item) => {
    if (query.categoryId && query.categoryId !== 'all' && item.categoryId !== query.categoryId) return false;
    if (query.accessLevel && query.accessLevel !== 'all' && item.accessLevel !== query.accessLevel) return false;
    if (query.format && query.format !== 'all' && item.format !== query.format) return false;
    if (query.minPrice !== undefined && item.price < query.minPrice) return false;
    if (query.maxPrice !== undefined && item.price > query.maxPrice) return false;
    if (!search) return true;

    const haystack = [
      item.title,
      item.summary,
      item.nation,
      item.keeperName,
      item.categoryLabel,
      ...item.tags
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });

  const sort = query.sort || 'featured';
  filtered = filtered.sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'newest') return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    return b.rating - a.rating;
  });

  return filtered;
}

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

function paginate(items: LanguageHeritageListing[], page = 1, limit = 12): LanguageHeritagePage {
  const safeLimit = Math.max(1, Math.min(60, limit));
  const safePage = Math.max(1, page);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;

  return {
    items: items.slice(start, end),
    page: safePage,
    pages,
    total,
    source: 'mock'
  };
}

function getUserAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const wallet = (window.localStorage.getItem('indigena_wallet_address') || '').trim().toLowerCase();
  const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  const headers: Record<string, string> = {};
  if (wallet) headers['x-wallet-address'] = wallet;
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

function buildCategoryCounts(items: LanguageHeritageListing[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoryId] = (acc[item.categoryId] || 0) + 1;
    return acc;
  }, {});
}

export async function fetchLanguageHeritageListings(
  query: LanguageHeritageQuery,
  signal?: AbortSignal
): Promise<LanguageHeritagePage> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;

  try {
    const url = buildUrl('/language-heritage/listings', {
      q: query.q,
      categoryId: query.categoryId,
      accessLevel: query.accessLevel,
      format: query.format,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sort: query.sort,
      page,
      limit
    });

    const res = await fetchWithTimeout(url, { signal, cache: 'no-store', headers: getUserAuthHeaders() });
    if (!res.ok) throw new Error(await parseApiError(res, 'Language & Heritage request failed'));

    const json = await res.json();
    const rawItems = (json?.items || json?.listings || []) as Array<Record<string, unknown>>;
    const items = rawItems.map(normalizeListing);
    return {
      items,
      page: Number(json?.page ?? page),
      pages: Number(json?.pages ?? 1),
      total: Number(json?.total ?? items.length),
      source: 'api'
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) {
      throw error;
    }
    const filtered = applyLocalFilters(MOCK_LISTINGS, query);
    return paginate(filtered, page, limit);
  }
}

export async function fetchLanguageHeritagePlacements(): Promise<HeritagePlacementsResponse> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/placements/page/language-heritage`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Language & Heritage placements failed'));
    const json = await res.json();
    return {
      success: Boolean(json?.success ?? true),
      summary: (json?.summary ?? []) as HeritagePlacementSummary[],
      placements: (json?.placements ?? {}) as HeritagePlacementsResponse['placements'],
      source: 'api'
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) {
      throw error;
    }
    return MOCK_PLACEMENTS;
  }
}

export async function trackLanguageHeritageEvent(payload: {
  event: string;
  listingId?: string;
  categoryId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await fetchWithTimeout(`${API_BASE}/language-heritage/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getUserAuthHeaders() },
      body: JSON.stringify(payload)
    });
  } catch {
    // Analytics must not block UI.
  }
}

export async function requestLanguageHeritageAccess(
  listingId: string,
  note = '',
  consentAccepted = false,
  acknowledgements: string[] = []
) {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/listings/${encodeURIComponent(listingId)}/access-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserAuthHeaders() },
    body: JSON.stringify({ note, consentAccepted, acknowledgements })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Access request failed'));
  return res.json();
}

export async function createLanguageHeritagePaymentIntent(
  listingId: string,
  consentAccepted = false,
  acknowledgements: string[] = []
): Promise<HeritagePaymentIntent> {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/listings/${encodeURIComponent(listingId)}/payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserAuthHeaders() },
    body: JSON.stringify({ consentAccepted, acknowledgements })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Payment intent failed'));
  const json = await res.json();
  return json?.paymentIntent as HeritagePaymentIntent;
}

export async function confirmLanguageHeritagePayment(
  listingId: string,
  intentId: string,
  clientSecret: string,
  consentAccepted = false,
  acknowledgements: string[] = []
): Promise<HeritageReceipt> {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/listings/${encodeURIComponent(listingId)}/payment-confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserAuthHeaders() },
    body: JSON.stringify({ intentId, clientSecret, consentAccepted, acknowledgements })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Payment confirmation failed'));
  const json = await res.json();
  return json?.receipt as HeritageReceipt;
}

export async function fetchMyLanguageHeritageReceipts(limit = 20): Promise<HeritageReceipt[]> {
  const url = buildUrl('/language-heritage/receipts/me', { limit });
  const res = await fetchWithTimeout(url, { headers: getUserAuthHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load receipts'));
  const json = await res.json();
  return (json?.receipts ?? []) as HeritageReceipt[];
}

export async function fetchMyLanguageHeritageAccessRequests(limit = 20): Promise<HeritageAccessRequestRecord[]> {
  const url = buildUrl('/language-heritage/access-requests/me', { limit });
  const res = await fetchWithTimeout(url, { headers: getUserAuthHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load access requests'));
  const json = await res.json();
  return (json?.requests ?? []) as HeritageAccessRequestRecord[];
}

export async function requestHeritageDownload(listingId: string): Promise<HeritageDownloadGrant> {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/recordings/${encodeURIComponent(listingId)}/download`, {
    cache: 'no-store',
    headers: getUserAuthHeaders()
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Archive download failed'));
  const json = await res.json();
  return json?.download as HeritageDownloadGrant;
}

export async function exportHeritageCitation(listingId: string): Promise<HeritageCitationExport> {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/recordings/${encodeURIComponent(listingId)}/citation-export`, {
    cache: 'no-store',
    headers: getUserAuthHeaders()
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Citation export failed'));
  const json = await res.json();
  return json?.citation as HeritageCitationExport;
}

export async function fetchInstitutionalArchiveSeats() {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/institutional/seats`, {
    cache: 'no-store',
    headers: getUserAuthHeaders()
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Institutional seats request failed'));
  const json = await res.json();
  return json as { seats: InstitutionalArchiveSeat[]; seatLimit: number };
}

export async function saveInstitutionalArchiveSeat(payload: {
  email: string;
  role: 'admin' | 'researcher' | 'viewer';
}) {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/institutional/seats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserAuthHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Institutional seat save failed'));
  return (await res.json()) as { seat: InstitutionalArchiveSeat; seatLimit: number };
}

export async function fetchHeritageOfflinePack() {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/library/offline-pack`, {
    cache: 'no-store',
    headers: getUserAuthHeaders()
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Offline pack request failed'));
  const json = await res.json();
  return json?.bundle as HeritageLibraryBundleResponse;
}

export async function fetchHeritageCitationBundle() {
  const res = await fetchWithTimeout(`${API_BASE}/language-heritage/library/citation-bundle`, {
    cache: 'no-store',
    headers: getUserAuthHeaders()
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Citation bundle request failed'));
  const json = await res.json();
  return json?.bundle as HeritageLibraryBundleResponse;
}

export async function fetchLanguageDirectory(q = ''): Promise<HeritageLanguageDirectoryItem[]> {
  try {
    const url = buildUrl('/language-heritage/languages', { q: q || undefined });
    const res = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load language directory'));
    const json = await res.json();
    return (json?.items ?? []) as HeritageLanguageDirectoryItem[];
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const grouped = new Map<string, HeritageLanguageDirectoryItem>();
    MOCK_LISTINGS.forEach((item) => {
      const key = item.nation.toLowerCase().replace(/\s+/g, '-');
      const prev = grouped.get(key);
      if (!prev) {
        grouped.set(key, { languageId: key, name: item.nation, totalItems: 1, avgRating: item.rating, categories: [item.categoryId] });
      } else {
        prev.totalItems += 1;
        prev.avgRating = Number(((prev.avgRating + item.rating) / 2).toFixed(2));
        if (!prev.categories.includes(item.categoryId)) prev.categories.push(item.categoryId);
      }
    });
    return Array.from(grouped.values());
  }
}

export async function fetchCommunityProfile(communityId: string): Promise<HeritageCommunityProfile | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/language-heritage/communities/${encodeURIComponent(communityId)}`, {
      cache: 'no-store'
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load community profile'));
    const json = await res.json();
    return (json?.profile ?? null) as HeritageCommunityProfile | null;
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const match = MOCK_LISTINGS.filter((row) => row.nation.toLowerCase().replace(/\s+/g, '-').includes(communityId.toLowerCase()));
    if (!match.length) return null;
    return {
      communityId,
      nation: match[0].nation,
      totalItems: match.length,
      categoryCounts: buildCategoryCounts(match),
      featured: match
    };
  }
}

export async function fetchDictionaryEntry(entryId: string): Promise<HeritageDictionaryEntry | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/language-heritage/dictionary/${encodeURIComponent(entryId)}`, {
      cache: 'no-store'
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load dictionary entry'));
    const json = await res.json();
    return (json?.entry ?? null) as HeritageDictionaryEntry | null;
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return null;
  }
}

export async function fetchRecordingDetail(recordingId: string): Promise<LanguageHeritageListing | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/language-heritage/recordings/${encodeURIComponent(recordingId)}`, {
      cache: 'no-store',
      headers: getUserAuthHeaders()
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load recording'));
    const json = await res.json();
    return normalizeListing(json?.recording ?? {});
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return MOCK_LISTINGS.find((row) => row.id === recordingId) || null;
  }
}

export async function fetchToolDetail(toolId: string): Promise<LanguageHeritageListing | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/language-heritage/tools/${encodeURIComponent(toolId)}`, {
      cache: 'no-store',
      headers: getUserAuthHeaders()
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load tool'));
    const json = await res.json();
    return normalizeListing(json?.tool ?? {});
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return MOCK_LISTINGS.find((row) => row.id === toolId) || null;
  }
}

export async function fetchContributorDashboard(): Promise<HeritageContributorDashboard> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/language-heritage/contributor-dashboard/me`, {
      cache: 'no-store',
      headers: getUserAuthHeaders()
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load contributor dashboard'));
    const json = await res.json();
    return (json?.dashboard ?? json) as HeritageContributorDashboard;
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return {
      materialsCount: 47,
      monthlyRevenue: 1247,
      pendingApprovals: 3,
      metadataCompletionRate: 92,
      reviewSlaHours: 18,
      monthlyReach: 1240
    };
  }
}

export async function fetchGrantOpportunities(): Promise<HeritageGrantOpportunity[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/language-heritage/grants`, {
      cache: 'no-store',
      headers: getUserAuthHeaders()
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load grants'));
    const json = await res.json();
    return (json?.items ?? []) as HeritageGrantOpportunity[];
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return [
      {
        id: 'grant-ana',
        title: 'ANA Language Preservation Grants',
        sponsor: 'Administration for Native Americans',
        amountLabel: 'Up to $150,000',
        deadlineLabel: 'Deadline: June 30',
        type: 'federal',
        summary: 'Funding for language instruction, documentation, and program infrastructure.'
      },
      {
        id: 'grant-unesco',
        title: 'UNESCO Intangible Heritage Fund',
        sponsor: 'UNESCO',
        amountLabel: 'Up to $100,000',
        deadlineLabel: 'Deadline: Aug 15',
        type: 'global',
        summary: 'Supports preservation and transmission of living cultural heritage.'
      },
      {
        id: 'grant-fn',
        title: 'First Nations Language Funding',
        sponsor: 'Regional Indigenous Agencies',
        amountLabel: 'Multiple streams',
        deadlineLabel: 'Rolling',
        type: 'community',
        summary: 'Community-led funding pools for immersion, curriculum, and media production.'
      }
    ];
  }
}

export async function submitSacredAccessRequest(payload: SacredAccessRequestPayload): Promise<{ requestId: string; status: string }> {
  const body = { ...payload, requestedAt: new Date().toISOString() };
  try {
    const res = await fetchWithTimeout(`${API_BASE}/language-heritage/sacred-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getUserAuthHeaders() },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to submit sacred access request'));
    const json = await res.json();
    return {
      requestId: String(json?.requestId || json?.id || ''),
      status: String(json?.status || 'pending')
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return {
      requestId: `mock-${Date.now()}`,
      status: 'pending'
    };
  }
}


