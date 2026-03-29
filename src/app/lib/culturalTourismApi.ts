import { API_BASE_URL, fetchWithTimeout, parseApiError } from './apiClient';
import {
  ensureWalletSessionAuth,
  logoutWalletAuthSessionClient,
  refreshWalletAuthSessionClient,
  requestWalletAuthChallenge,
  verifyWalletAuthChallengeClient
} from './walletAuthClient';
import { isNamedMockFallbackEnabled } from './mockMode';

export type VerificationTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type ExperienceKind =
  | 'lodging'
  | 'guided-tours'
  | 'workshops'
  | 'performances'
  | 'festivals'
  | 'wellness'
  | 'culinary'
  | 'adventure'
  | 'virtual'
  | 'arts-crafts'
  | 'voluntourism'
  | 'transport'
  | 'specialty';

export interface CulturalTourismQuery {
  q?: string;
  kind?: ExperienceKind | 'all';
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: 'any' | 'half-day' | 'full-day' | 'multi-day';
  verifiedOnly?: boolean;
  virtualOnly?: boolean;
  sort?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'relevance';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  cluster?: boolean;
}

export interface CulturalProtocol {
  id: string;
  label: string;
  required: boolean;
}

export interface ExperienceSession {
  sessionId: string;
  label: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  active: boolean;
  virtual: boolean;
}

export interface MediaRestrictions {
  photoAllowed: boolean;
  audioAllowed: boolean;
  videoAllowed: boolean;
}

export interface ExperienceListing {
  id: string;
  title: string;
  kind: ExperienceKind;
  nation: string;
  community: string;
  region: string;
  summary: string;
  image: string;
  priceFrom: number;
  currency: 'USD';
  durationLabel: string;
  groupSize: string;
  maxCapacity?: number;
  rating: number;
  reviews: number;
  verificationTier: VerificationTier;
  elderApproved: boolean;
  sacredContent: boolean;
  virtual: boolean;
  availableNextDate: string;
  blackoutDates?: string[];
  protocols: CulturalProtocol[];
  sessions?: ExperienceSession[];
  consentChecklist?: string[];
  mediaRestrictions?: MediaRestrictions;
  tags: string[];
  featured: boolean;
  createdAt: string;
}

export interface ExperiencePage {
  items: ExperienceListing[];
  total: number;
  page: number;
  pages: number;
}

export interface ExperienceCursorPage {
  items: ExperienceListing[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface BookingInput {
  experienceId: string;
  date: string;
  sessionId?: string;
  sessionLabel?: string;
  guests: number;
  travelerName: string;
  travelerEmail: string;
  protocolAccepted: boolean;
  protocolAcknowledgements?: string[];
  notes?: string;
  idempotencyKey?: string;
}

export interface BookingRecord {
  bookingId: string;
  experienceId: string;
  experienceTitle: string;
  date: string;
  sessionId?: string;
  sessionLabel?: string;
  guests: number;
  baseFare?: number;
  serviceFee?: number;
  taxAmount?: number;
  totalAmount: number;
  fareBreakdown?: {
    baseFare: number;
    serviceFee: number;
    taxAmount: number;
    totalAmount: number;
  };
  currency: 'USD';
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus?: 'requires_payment' | 'requires_confirmation' | 'captured' | 'failed' | 'refunded';
  paymentIntentId?: string;
  paymentProvider?: string;
  paymentReference?: string;
  receiptId?: string;
  paymentDueAt?: string | null;
  protocolSnapshot?: string[];
  mediaRestrictions?: MediaRestrictions;
  ticketId?: string;
  cancellationReason?: string;
  rescheduledFromDate?: string;
  createdAt: string;
}

export interface ExperienceAvailability {
  date: string;
  sessionId?: string;
  sessionLabel?: string;
  fareBreakdown?: {
    baseFare: number;
    serviceFee: number;
    taxAmount: number;
    totalAmount: number;
  };
  capacity: number;
  bookedGuests: number;
  remaining: number;
  soldOut: boolean;
  requestedGuests: number;
  canBook: boolean;
  nextAvailableDate: string;
}

export interface ExperienceCalendarDay {
  date: string;
  capacity: number;
  bookedGuests: number;
  remaining: number;
  soldOut: boolean;
  blackout?: boolean;
}

export interface ExperienceCalendar {
  experienceId: string;
  start: string;
  days: number;
  sessionId?: string;
  sessionLabel?: string;
  calendar: ExperienceCalendarDay[];
}

export interface ExperienceReview {
  reviewId: string;
  bookingId: string;
  experienceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OperatorProfile {
  wallet: string;
  operatorName: string;
  nation: string;
  verificationTier: VerificationTier;
  activeListings: number;
  monthlyBookings: number;
  payoutPending: number;
}

export interface TerritoryOverlay {
  id: string;
  territoryName: string;
  nation: string;
  region: string;
  experiences: number;
  protocolsRequired: boolean;
}

export interface TourismModerationItem {
  id: string;
  listingId: string;
  listingTitle: string;
  issueType: 'protocol' | 'authenticity' | 'safety' | 'content';
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  priority?: 'p0' | 'p1' | 'p2' | 'p3';
  queue?: 'trust_safety' | 'legal_protocol' | 'content_quality';
  slaDueAt?: string | null;
  escalationLevel?: number;
  createdAt: string;
}

export interface TourismOpsDashboard {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  paymentFailures: number;
  openModeration: number;
  commsQueued: number;
  conversion: number;
  alerts: string[];
}

export interface TourismFunnelMetrics {
  searches: number;
  views: number;
  starts: number;
  completed: number;
  viewRate: number;
  startRate: number;
  completionRate: number;
}

export interface TourismSyntheticCheck {
  id: string;
  ok: boolean;
  detail: string;
}

export interface TourismAnalyticsEvent {
  event:
    | 'tourism_search'
    | 'tourism_view'
    | 'tourism_wishlist'
    | 'tourism_booking_started'
    | 'tourism_booking_completed'
    | 'tourism_operator_listing_created';
  experienceId?: string;
  kind?: ExperienceKind | 'all';
  metadata?: Record<string, unknown>;
}

export interface BookingTicket {
  ticketId: string;
  bookingId: string;
  experienceId: string;
  experienceTitle: string;
  date: string;
  guests: number;
  protocolSnapshot: string[];
  restrictions: MediaRestrictions;
  notes?: string;
}

export interface TourismPlacementSummary {
  typeId: string;
  name: string;
  price: number;
  period: string;
  slotsUsed: number;
  maxSlots: number;
  available: boolean;
}

export interface TourismPagePlacementsResponse {
  success: boolean;
  page: string;
  summary: TourismPlacementSummary[];
  placements: Record<string, unknown[]>;
}

export interface TourismAuthChallenge {
  challengeId: string;
  wallet: string;
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface TourismAuthSession {
  wallet: string;
  email?: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
}

export interface TourismReadiness {
  dbReady: boolean;
  paymentProvider: string;
  placementTypesLoaded: number;
  placementCoverage: Array<{ typeId: string; exists: boolean }>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_USE_APP_API === 'true'
    ? '/api'
    : API_BASE_URL;
const ALLOW_MOCK_FALLBACK = isNamedMockFallbackEnabled('NEXT_PUBLIC_ALLOW_TOURISM_MOCKS');

const MOCK_EXPERIENCES: ExperienceListing[] = [
  {
    id: 'tour-001',
    title: 'Yolngu Sunrise Cultural Walk',
    kind: 'guided-tours',
    nation: 'Yolngu',
    community: 'Gove Peninsula Collective',
    region: 'Arnhem Land, AU',
    summary: 'Dawn walk through coastal country with seasonal knowledge and visitor protocols.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&h=800&fit=crop',
    priceFrom: 120,
    currency: 'USD',
    durationLabel: 'Half Day',
    groupSize: 'Up to 12',
    rating: 4.9,
    reviews: 184,
    verificationTier: 'Gold',
    elderApproved: true,
    sacredContent: false,
    virtual: false,
    availableNextDate: '2026-03-15',
    protocols: [
      { id: 'p-photo', label: 'No photography at marked sites', required: true },
      { id: 'p-dress', label: 'Modest clothing required', required: true }
    ],
    tags: ['land-based', 'storytelling', 'sunrise'],
    featured: true,
    createdAt: '2026-02-10T10:00:00.000Z'
  },
  {
    id: 'tour-002',
    title: 'Maori Kai and Hangi Workshop',
    kind: 'culinary',
    nation: 'Maori',
    community: 'Rotorua Kai Circle',
    region: 'Rotorua, NZ',
    summary: 'Hands-on traditional food preparation with cultural context and shared feast.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop',
    priceFrom: 95,
    currency: 'USD',
    durationLabel: 'Full Day',
    groupSize: 'Up to 18',
    rating: 4.8,
    reviews: 133,
    verificationTier: 'Silver',
    elderApproved: false,
    sacredContent: false,
    virtual: false,
    availableNextDate: '2026-03-18',
    protocols: [{ id: 'p-food', label: 'Respect food blessing sequence', required: true }],
    tags: ['food', 'workshop', 'family-friendly'],
    featured: true,
    createdAt: '2026-02-14T15:00:00.000Z'
  },
  {
    id: 'tour-003',
    title: 'Lakota Star Knowledge Night',
    kind: 'specialty',
    nation: 'Lakota',
    community: 'Black Hills Star Council',
    region: 'South Dakota, US',
    summary: 'Night sky session connecting constellations with oral history and seasonal teachings.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop',
    priceFrom: 80,
    currency: 'USD',
    durationLabel: 'Half Day',
    groupSize: 'Up to 20',
    rating: 4.9,
    reviews: 201,
    verificationTier: 'Platinum',
    elderApproved: true,
    sacredContent: true,
    virtual: true,
    availableNextDate: '2026-03-20',
    protocols: [
      { id: 'p-recording', label: 'No audio recording of stories', required: true },
      { id: 'p-arrival', label: 'Arrive 20 minutes before start', required: true }
    ],
    tags: ['astrotourism', 'virtual option', 'elder-led'],
    featured: true,
    createdAt: '2026-02-20T09:00:00.000Z'
  },
  {
    id: 'tour-004',
    title: 'Coastal Canoe Expedition',
    kind: 'adventure',
    nation: 'Inuit',
    community: 'Nunavut Water Routes',
    region: 'Nunavut, CA',
    summary: 'Three-day guided journey with safety training, camp setup, and wildlife interpretation.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop',
    priceFrom: 620,
    currency: 'USD',
    durationLabel: 'Multi Day',
    groupSize: 'Up to 8',
    rating: 4.7,
    reviews: 78,
    verificationTier: 'Gold',
    elderApproved: true,
    sacredContent: false,
    virtual: false,
    availableNextDate: '2026-04-05',
    protocols: [{ id: 'p-safety', label: 'Mandatory safety briefing', required: true }],
    tags: ['canoe', 'wildlife', 'expedition'],
    featured: false,
    createdAt: '2026-01-28T11:00:00.000Z'
  },
  {
    id: 'tour-005',
    title: 'Virtual Cultural Festival Pass',
    kind: 'virtual',
    nation: 'Multi-Nation',
    community: 'Indigena Live Festival',
    region: 'Global',
    summary: 'Three-day digital access pass with performances, workshops, and artist talks.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop',
    priceFrom: 35,
    currency: 'USD',
    durationLabel: 'Multi Day',
    groupSize: 'Unlimited',
    rating: 4.6,
    reviews: 529,
    verificationTier: 'Bronze',
    elderApproved: false,
    sacredContent: false,
    virtual: true,
    availableNextDate: '2026-03-25',
    protocols: [{ id: 'p-chat', label: 'Respectful chat conduct policy', required: true }],
    tags: ['virtual', 'festival', 'global'],
    featured: false,
    createdAt: '2026-03-01T12:00:00.000Z'
  }
];

const MOCK_TERRITORIES: TerritoryOverlay[] = [
  { id: 't-001', territoryName: 'Yolngu Sea Country', nation: 'Yolngu', region: 'Arnhem Land, AU', experiences: 18, protocolsRequired: true },
  { id: 't-002', territoryName: 'Te Arawa Cultural District', nation: 'Maori', region: 'Rotorua, NZ', experiences: 25, protocolsRequired: true },
  { id: 't-003', territoryName: 'Black Hills Star Territory', nation: 'Lakota', region: 'South Dakota, US', experiences: 12, protocolsRequired: true },
  { id: 't-004', territoryName: 'Nunavut Ice-Water Corridors', nation: 'Inuit', region: 'Nunavut, CA', experiences: 9, protocolsRequired: false }
];

const MOCK_MODERATION: TourismModerationItem[] = [
  {
    id: 'mod-001',
    listingId: 'tour-003',
    listingTitle: 'Lakota Star Knowledge Night',
    issueType: 'protocol',
    reason: 'Guest reported unauthorized recording attempt during session.',
    status: 'open',
    createdAt: '2026-03-05T08:30:00.000Z'
  },
  {
    id: 'mod-002',
    listingId: 'tour-001',
    listingTitle: 'Yolngu Sunrise Cultural Walk',
    issueType: 'authenticity',
    reason: 'Verification document requires annual renewal.',
    status: 'under_review',
    createdAt: '2026-03-03T12:15:00.000Z'
  }
];

const mockBookings: BookingRecord[] = [];

function requestError(status: number) {
  if (status >= 500) {
    return new Error('Cultural tourism service is temporarily unavailable. Please try again.');
  }
  if (status === 404) {
    return new Error('Requested tourism resource was not found.');
  }
  if (status === 401 || status === 403) {
    return new Error('You do not have permission for this tourism action.');
  }
  if (status === 400) {
    return new Error('Invalid tourism request. Please check your input.');
  }
  return new Error('Tourism request could not be completed. Please try again.');
}

function bySort(sort: CulturalTourismQuery['sort'], a: ExperienceListing, b: ExperienceListing) {
  switch (sort) {
    case 'price-low':
      return a.priceFrom - b.priceFrom;
    case 'price-high':
      return b.priceFrom - a.priceFrom;
    case 'rating':
      return b.rating - a.rating;
    case 'newest':
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    case 'featured':
    default:
      return Number(b.featured) - Number(a.featured);
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as T;
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as T;
}

function getAdminWallet() {
  if (typeof window === 'undefined') return 'demo-admin-wallet';
  return (
    window.localStorage.getItem('indigena_admin_wallet') ||
    window.localStorage.getItem('indigena_wallet_address') ||
    'demo-admin-wallet'
  ).trim();
}

function adminHeaders() {
  const wallet = getAdminWallet();
  return {
    'Content-Type': 'application/json',
    'x-wallet-address': wallet,
    'x-admin-wallet': wallet
  };
}

function getAdminActionSecret() {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('indigena_admin_action_secret') ||
    window.localStorage.getItem('indigena_dev_admin_secret') ||
    ''
  ).trim();
}

async function hmacSha256Hex(secret: string, input: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function adminSignedHeaders(action: string, targetId: string, body: Record<string, unknown> = {}) {
  const base = adminHeaders();
  const secret = getAdminActionSecret();
  if (!secret || typeof window === 'undefined' || !window.crypto?.subtle) {
    return base;
  }
  const timestamp = Date.now().toString();
  const payload = JSON.stringify(body);
  const signature = await hmacSha256Hex(secret, `${timestamp}:${action}:${targetId}:${payload}`);
  return {
    ...base,
    'x-admin-action-timestamp': timestamp,
    'x-admin-action-signature': signature
  };
}

function getTravelerIdentity() {
  const wallet =
    typeof window === 'undefined'
      ? 'demo-traveler-wallet'
      : (window.localStorage.getItem('indigena_wallet_address') || 'demo-traveler-wallet');
  const email =
    typeof window === 'undefined'
      ? ''
      : (window.localStorage.getItem('indigena_wallet_email') || '').trim().toLowerCase();
  const jwtToken =
    typeof window === 'undefined'
      ? ''
      : (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  return { wallet: wallet.trim(), email, jwtToken };
}

function getUserActionSecret() {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('indigena_user_action_secret') ||
    window.localStorage.getItem('indigena_dev_user_secret') ||
    ''
  ).trim();
}

let tourismAuthPromise: Promise<void> | null = null;

async function ensureTourismAuth(): Promise<void> {
  if (!tourismAuthPromise) {
    tourismAuthPromise = ensureWalletSessionAuth().finally(() => {
      tourismAuthPromise = null;
    });
  }

  await tourismAuthPromise;
}

async function userActionHeaders(action: string, targetId: string, body: Record<string, unknown> = {}) {
  await ensureTourismAuth();
  const id = getTravelerIdentity();
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-wallet-address': id.wallet
  };
  if (id.jwtToken) {
    return {
      ...base,
      Authorization: `Bearer ${id.jwtToken}`
    };
  }
  const secret = getUserActionSecret();
  if (!secret || typeof window === 'undefined' || !window.crypto?.subtle) {
    return base;
  }
  const timestamp = Date.now().toString();
  const nonce =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const payload = JSON.stringify(body);
  const signature = await hmacSha256Hex(secret, `${timestamp}:${nonce}:${action}:${targetId}:${id.wallet}:${payload}`);
  return {
    ...base,
    'x-user-action-timestamp': timestamp,
    'x-user-action-nonce': nonce,
    'x-user-action-signature': signature
  };
}

export async function requestTourismAuthChallenge(wallet: string): Promise<TourismAuthChallenge> {
  const data = await requestWalletAuthChallenge(wallet);
  return {
    challengeId: data.challengeId,
    wallet: data.walletAddress,
    nonce: data.nonce,
    message: data.message,
    expiresAt: data.expiresAt
  };
}

export async function verifyTourismAuthChallenge(
  wallet: string,
  challengeId: string,
  signature: string,
  email = ''
): Promise<TourismAuthSession> {
  void email;
  return verifyWalletAuthChallengeClient(wallet, challengeId, signature) as Promise<TourismAuthSession>;
}

export async function refreshTourismAuthSession(): Promise<{ accessToken: string; refreshToken?: string; sessionId: string; expiresIn: number }> {
  return refreshWalletAuthSessionClient();
}

export async function logoutTourismAuthSession(): Promise<void> {
  await logoutWalletAuthSessionClient();
}

export async function fetchTourismExperiences(
  query: CulturalTourismQuery,
  signal?: AbortSignal
): Promise<ExperiencePage> {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === 'all') return;
      params.set(k, String(v));
    });
    const data = await getJson<ExperiencePage>(`/cultural-tourism/experiences?${params.toString()}`);
    return data;
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const q = (query.q ?? '').trim().toLowerCase();

    let filtered = MOCK_EXPERIENCES.filter((item) => {
      if (query.kind && query.kind !== 'all' && item.kind !== query.kind) return false;
      if (query.region && !item.region.toLowerCase().includes(query.region.toLowerCase())) return false;
      if (query.minPrice !== undefined && item.priceFrom < query.minPrice) return false;
      if (query.maxPrice !== undefined && item.priceFrom > query.maxPrice) return false;
      if (query.verifiedOnly && item.verificationTier === 'Bronze') return false;
      if (query.virtualOnly && !item.virtual) return false;
      if (query.duration && query.duration !== 'any') {
        const d = item.durationLabel.toLowerCase();
        if (query.duration === 'half-day' && !d.includes('half')) return false;
        if (query.duration === 'full-day' && !d.includes('full')) return false;
        if (query.duration === 'multi-day' && !d.includes('multi')) return false;
      }
      if (q) {
        const hay = `${item.title} ${item.summary} ${item.nation} ${item.community} ${item.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    filtered = [...filtered].sort((a, b) => bySort(query.sort ?? 'featured', a, b));

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;

    return {
      items: filtered.slice(start, start + limit),
      total,
      page,
      pages
    };
  }
}

export async function fetchTourismExperiencesCursor(
  query: CulturalTourismQuery & { cursor?: string; limit?: number },
  signal?: AbortSignal
): Promise<ExperienceCursorPage> {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === 'all') return;
      params.set(k, String(v));
    });
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/experiences/cursor?${params.toString()}`, { signal });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    const json = await res.json();
    const data = json?.data ?? json;
    return {
      items: data?.items ?? [],
      nextCursor: data?.nextCursor ?? null,
      hasMore: Boolean(data?.hasMore)
    };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const page = await fetchTourismExperiences({ ...query, page: 1, limit: query.limit ?? 12 }, signal);
    return {
      items: page.items,
      nextCursor: null,
      hasMore: false
    };
  }
}

export async function fetchTourismExperienceById(id: string) {
  try {
    return await getJson<ExperienceListing>(`/cultural-tourism/experiences/${id}`);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return MOCK_EXPERIENCES.find((x) => x.id === id) ?? null;
  }
}

export async function fetchTourismAvailability(
  experienceId: string,
  date: string,
  guests = 1,
  sessionId = 'default'
): Promise<ExperienceAvailability> {
  try {
    const params = new URLSearchParams({ date, guests: String(Math.max(1, guests)), sessionId });
    return await getJson<ExperienceAvailability>(`/cultural-tourism/experiences/${experienceId}/availability?${params.toString()}`);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const item = MOCK_EXPERIENCES.find((x) => x.id === experienceId);
    const capacity = Math.max(1, item?.maxCapacity || Number((item?.groupSize || '').match(/\d+/)?.[0] || 10));
    const requestedGuests = Math.max(1, guests);
    const bookedGuests = 0;
    const remaining = Math.max(0, capacity - bookedGuests);
    const baseFare = Number(((item?.priceFrom || 0) * requestedGuests).toFixed(2));
    const serviceFee = Number((baseFare * 0.06).toFixed(2));
    const taxAmount = Number((baseFare * 0.03).toFixed(2));
    const totalAmount = Number((baseFare + serviceFee + taxAmount).toFixed(2));
    return {
      date,
      sessionId,
      sessionLabel: sessionId,
      fareBreakdown: { baseFare, serviceFee, taxAmount, totalAmount },
      capacity,
      bookedGuests,
      remaining,
      soldOut: remaining <= 0,
      requestedGuests,
      canBook: requestedGuests <= remaining,
      nextAvailableDate: item?.availableNextDate || date
    };
  }
}

export async function createTourismBooking(input: BookingInput): Promise<BookingRecord> {
  if (!input.protocolAccepted) {
    throw new Error('Please acknowledge cultural protocols before booking.');
  }

  const item = MOCK_EXPERIENCES.find((x) => x.id === input.experienceId);
  if (!item) throw new Error('Experience not found.');

  try {
    const identity = getTravelerIdentity();
    const idempotencyKey =
      input.idempotencyKey ||
      `tourism-${input.experienceId}-${input.date}-${input.travelerEmail}-${input.guests}`;
    const body = {
      ...(input as unknown as Record<string, unknown>),
      protocolAcknowledgements: input.protocolAcknowledgements ?? [],
      travelerWallet: identity.wallet,
      travelerEmail: input.travelerEmail || identity.email || '',
      idempotencyKey
    };
    const headers = await userActionHeaders('create_booking', 'new', body);
    headers['x-idempotency-key'] = idempotencyKey;
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    const json = await res.json();
    return (json?.data ?? json) as BookingRecord;
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const idempotencyKey =
      input.idempotencyKey ||
      `tourism-${input.experienceId}-${input.date}-${input.travelerEmail}-${input.guests}`;
    const replay = mockBookings.find((b) => b.bookingId === idempotencyKey);
    if (replay) return replay;
    const baseFare = Number((item.priceFrom * input.guests).toFixed(2));
    const serviceFee = Number((baseFare * 0.06).toFixed(2));
    const taxAmount = Number((baseFare * 0.03).toFixed(2));
    const totalAmount = Number((baseFare + serviceFee + taxAmount).toFixed(2));
    const record: BookingRecord = {
      bookingId: idempotencyKey,
      experienceId: item.id,
      experienceTitle: item.title,
      date: input.date,
      sessionId: input.sessionId || 'default',
      sessionLabel: input.sessionLabel || '',
      guests: input.guests,
      baseFare,
      serviceFee,
      taxAmount,
      totalAmount,
      fareBreakdown: { baseFare, serviceFee, taxAmount, totalAmount },
      currency: 'USD',
      status: 'pending',
      paymentStatus: 'requires_payment',
      paymentIntentId: `pi-sim-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    mockBookings.unshift(record);
    return record;
  }
}

export async function fetchTravelerBookings(): Promise<BookingRecord[]> {
  try {
    const headers = await userActionHeaders('get_my_bookings', 'self', {});
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings/me`, {
      headers,
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    const json = await res.json();
    return (json?.data ?? json) as BookingRecord[];
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return [...mockBookings];
  }
}

export async function cancelTourismBooking(bookingId: string, reason = ''): Promise<BookingRecord> {
  try {
    const body = { reason };
    const headers = await userActionHeaders('cancel_booking', bookingId, body);
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    const json = await res.json();
    return (json?.data ?? json) as BookingRecord;
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const row = mockBookings.find((x) => x.bookingId === bookingId);
    if (!row) throw new Error('Booking not found');
    row.status = 'cancelled';
    row.cancellationReason = reason;
    return row;
  }
}

export async function rescheduleTourismBooking(
  bookingId: string,
  newDate: string,
  guests?: number
): Promise<BookingRecord> {
  try {
    const body = { newDate, guests };
    const headers = await userActionHeaders('reschedule_booking', bookingId, body);
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    const json = await res.json();
    return (json?.data ?? json) as BookingRecord;
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const row = mockBookings.find((x) => x.bookingId === bookingId);
    if (!row) throw new Error('Booking not found');
    row.rescheduledFromDate = row.date;
    row.date = newDate;
    if (guests && guests > 0) row.guests = guests;
    return row;
  }
}

export async function fetchTourismExperienceCalendar(
  experienceId: string,
  start: string,
  days = 30,
  sessionId = 'default'
): Promise<ExperienceCalendar> {
  try {
    const params = new URLSearchParams({ start, days: String(days), sessionId });
    return await getJson<ExperienceCalendar>(`/cultural-tourism/experiences/${experienceId}/calendar?${params.toString()}`);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const item = MOCK_EXPERIENCES.find((x) => x.id === experienceId);
    const capacity = Math.max(1, item?.maxCapacity || Number((item?.groupSize || '').match(/\d+/)?.[0] || 10));
    const startDate = new Date(`${start}T00:00:00.000Z`);
    const calendar: ExperienceCalendarDay[] = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(startDate.getTime() + i * 86400000).toISOString().slice(0, 10);
      const blackout = Boolean(item?.blackoutDates?.includes(d));
      calendar.push({
        date: d,
        capacity,
        bookedGuests: blackout ? capacity : 0,
        remaining: blackout ? 0 : capacity,
        soldOut: blackout,
        blackout
      });
    }
    return { experienceId, start, days, sessionId, sessionLabel: sessionId, calendar };
  }
}

export async function updateTourismExperienceBlackouts(
  experienceId: string,
  addDates: string[] = [],
  removeDates: string[] = []
): Promise<{ experienceId: string; blackoutDates: string[] }> {
  try {
    const wallet =
      typeof window === 'undefined'
        ? 'demo-operator-wallet'
        : (window.localStorage.getItem('indigena_wallet_address') || 'demo-operator-wallet');
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/experiences/${experienceId}/blackouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': wallet
      },
      body: JSON.stringify({ wallet, addDates, removeDates })
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    const json = await res.json();
    return (json?.data ?? json) as { experienceId: string; blackoutDates: string[] };
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const item = MOCK_EXPERIENCES.find((x) => x.id === experienceId);
    if (!item) throw new Error('Experience not found');
    const set = new Set((item.blackoutDates || []).map((d) => d.trim()));
    addDates.forEach((d) => { if (d) set.add(d); });
    removeDates.forEach((d) => { if (d) set.delete(d); });
    item.blackoutDates = Array.from(set).sort();
    return { experienceId, blackoutDates: item.blackoutDates };
  }
}

export async function upsertTourismExperienceSessions(
  experienceId: string,
  sessions: ExperienceSession[]
): Promise<{ experienceId: string; sessions: ExperienceSession[] }> {
  const wallet =
    typeof window === 'undefined'
      ? 'demo-operator-wallet'
      : (window.localStorage.getItem('indigena_wallet_address') || 'demo-operator-wallet');
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/experiences/${experienceId}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-wallet-address': wallet
    },
    body: JSON.stringify({ wallet, sessions })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { experienceId: string; sessions: ExperienceSession[] };
}

export async function fetchTerritoryOverlays(): Promise<TerritoryOverlay[]> {
  try {
    return await getJson<TerritoryOverlay[]>('/cultural-tourism/territories');
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return MOCK_TERRITORIES;
  }
}

export async function fetchTourismCategoryHeatmap() {
  try {
    return await getJson<Record<string, number>>('/cultural-tourism/analytics/heatmap');
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return {
      lodging: 64,
      'guided-tours': 91,
      workshops: 73,
      performances: 55,
      festivals: 62,
      wellness: 40,
      culinary: 78,
      adventure: 69,
      virtual: 88,
      'arts-crafts': 66,
      voluntourism: 44,
      transport: 37,
      specialty: 59
    };
  }
}

export async function trackTourismEvent(payload: TourismAnalyticsEvent) {
  // Analytics must never break the user flow.
  try {
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return { ok: false, status: res.status };
    const json = await res.json().catch(() => ({}));
    return (json?.data ?? json) as Record<string, unknown>;
  } catch {
    return { ok: false };
  }
}

export async function fetchTourismModerationQueue(status: TourismModerationItem['status'] | 'all' = 'all') {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/moderation?status=${status}`, {
      headers: adminHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    const json = await res.json();
    return (json?.data ?? json) as TourismModerationItem[];
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    if (status === 'all') return [...MOCK_MODERATION];
    return MOCK_MODERATION.filter((x) => x.status === status);
  }
}

export async function decideTourismModerationItem(id: string, decision: 'resolve' | 'dismiss' | 'review') {
  try {
    const body = { decision };
    const headers = await adminSignedHeaders('moderation_decision', id, body);
    const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/moderation/${id}/decision`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
    return await res.json();
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const item = MOCK_MODERATION.find((x) => x.id === id);
    if (!item) throw new Error('Moderation item not found');
    item.status = decision === 'resolve' ? 'resolved' : decision === 'dismiss' ? 'dismissed' : 'under_review';
    return { ok: true };
  }
}

export async function exportTourismModerationAudit(format: 'json' | 'csv' = 'json') {
  const headers = await adminSignedHeaders('moderation_export', 'all', {});
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/moderation/export?format=${format}`, {
    headers,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as unknown;
}

export async function fetchTourismOpsDashboard(): Promise<TourismOpsDashboard> {
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/ops/dashboard`, {
    headers: adminHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as TourismOpsDashboard;
}

export async function fetchTourismFunnelMetrics(): Promise<TourismFunnelMetrics> {
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/analytics/funnel`, {
    headers: adminHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as TourismFunnelMetrics;
}

export async function runTourismSyntheticCheck(): Promise<{ checks: TourismSyntheticCheck[] }> {
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/ops/synthetic-check`, {
    headers: adminHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { checks: TourismSyntheticCheck[] };
}

export async function fetchTourismOperatorProfile(wallet: string): Promise<OperatorProfile> {
  try {
    return await getJson<OperatorProfile>(`/cultural-tourism/operators/${wallet}`);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    return {
      wallet,
      operatorName: 'Demo Cultural Collective',
      nation: 'Multi-Nation',
      verificationTier: 'Gold',
      activeListings: 3,
      monthlyBookings: 42,
      payoutPending: 2840
    };
  }
}

export interface UpsertExperienceInput {
  title: string;
  kind: ExperienceKind;
  region: string;
  nation: string;
  summary: string;
  image?: string;
  images?: string[];
  priceFrom: number;
  durationLabel: string;
  groupSize?: string;
  maxCapacity?: number;
  availableNextDate?: string;
  blackoutDates?: string[];
  sessions?: ExperienceSession[];
  virtual: boolean;
  sacredContent: boolean;
}

export async function upsertTourismExperienceListing(input: UpsertExperienceInput) {
  try {
    const wallet =
      typeof window === 'undefined'
        ? 'demo-operator-wallet'
        : (window.localStorage.getItem('indigena_wallet_address') || 'demo-operator-wallet');
    return await postJson('/cultural-tourism/experiences', {
      ...(input as unknown as Record<string, unknown>),
      wallet
    });
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const item: ExperienceListing = {
      id: `tour-${Date.now()}`,
      title: input.title,
      kind: input.kind,
      nation: input.nation,
      community: 'Community Managed',
      region: input.region,
      summary: input.summary,
      image: input.image || input.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
      priceFrom: input.priceFrom,
      currency: 'USD',
      durationLabel: input.durationLabel,
      groupSize: input.groupSize || 'Up to 12',
      maxCapacity: input.maxCapacity,
      rating: 0,
      reviews: 0,
      verificationTier: 'Bronze',
      elderApproved: false,
      sacredContent: input.sacredContent,
      virtual: input.virtual,
      availableNextDate: input.availableNextDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      blackoutDates: input.blackoutDates || [],
      protocols: [{ id: 'p-general', label: 'Respect host instructions and protocols', required: true }],
      tags: ['new listing'],
      featured: false,
      createdAt: new Date().toISOString()
    };
    MOCK_EXPERIENCES.unshift(item);
    return item;
  }
}

export async function fetchTourismOperatorListings(wallet: string, limit = 50): Promise<ExperienceListing[]> {
  try {
    return await getJson<ExperienceListing[]>(`/cultural-tourism/operators/${wallet}/listings?limit=${limit}`);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    const key = wallet.trim().toLowerCase();
    if (!key) return [];
    return MOCK_EXPERIENCES.filter((x) => key === 'demo-operator-wallet');
  }
}

export async function fetchTourismOperatorBookingInbox(wallet: string, limit = 200): Promise<BookingRecord[]> {
  try {
    return await getJson<BookingRecord[]>(`/cultural-tourism/operators/${wallet}/bookings?limit=${limit}`);
  } catch (error) {
    if (!ALLOW_MOCK_FALLBACK) throw error;
    if (wallet.trim().toLowerCase() !== 'demo-operator-wallet') return [];
    return [...mockBookings];
  }
}

export async function createTourismBookingPaymentIntent(bookingId: string): Promise<{
  bookingId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  paymentStatus?: string;
}> {
  const idempotencyKey = `tourism-intent-${bookingId}`;
  const body = { idempotencyKey };
  const headers = await userActionHeaders('create_payment_intent', bookingId, body);
  headers['x-idempotency-key'] = idempotencyKey;
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings/${bookingId}/payment-intent`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as {
    bookingId: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    paymentProvider: string;
    paymentStatus?: string;
  };
}

export async function confirmTourismBookingPayment(
  bookingId: string,
  paymentReference?: string
): Promise<BookingRecord> {
  const idempotencyKey = `tourism-confirm-${bookingId}`;
  const body = { paymentReference, idempotencyKey };
  const headers = await userActionHeaders('confirm_payment', bookingId, body);
  headers['x-idempotency-key'] = idempotencyKey;
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings/${bookingId}/payment-confirm`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as BookingRecord;
}

export async function fetchTourismReadiness(): Promise<TourismReadiness> {
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/readyz`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  if (!json?.status || !json?.data) throw new Error('Invalid tourism readiness response');
  return json.data as TourismReadiness;
}

export async function fetchTourismBookingTicket(bookingId: string): Promise<BookingTicket> {
  const headers = await userActionHeaders('get_booking_ticket', bookingId, {});
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings/${bookingId}/ticket`, {
    cache: 'no-store',
    headers
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as BookingTicket;
}

export async function fetchTourismExperienceReviews(
  experienceId: string,
  limit = 20
): Promise<ExperienceReview[]> {
  const params = new URLSearchParams({ limit: String(Math.max(1, limit)) });
  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/experiences/${experienceId}/reviews?${params.toString()}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as ExperienceReview[];
}

export async function submitTourismBookingReview(
  bookingId: string,
  rating: number,
  comment = ''
): Promise<ExperienceReview> {
  const identity = getTravelerIdentity();
  const body = {
    wallet: identity.wallet,
    travelerEmail: identity.email,
    rating,
    comment
  };
  const headers = await userActionHeaders('submit_booking_review', bookingId, body);

  const res = await fetchWithTimeout(`${API_BASE}/cultural-tourism/bookings/${bookingId}/reviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  const json = await res.json();
  return (json?.data ?? json) as ExperienceReview;
}

export async function fetchCulturalTourismPlacements(): Promise<TourismPagePlacementsResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/placements/page/cultural-tourism`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Tourism request failed'));
  return (await res.json()) as TourismPagePlacementsResponse;
}


