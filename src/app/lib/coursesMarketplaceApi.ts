import { API_BASE_URL, buildApiUrl, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';
const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;

export interface CoursesQuery {
  q?: string;
  categoryId?: string;
  level?: string;
  sort?: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
  minPrice?: number;
  maxPrice?: number;
  durationMinWeeks?: number;
  durationMaxWeeks?: number;
  page?: number;
  limit?: number;
}

export interface CourseRecord {
  _id?: string;
  courseId?: string;
  title?: string;
  description?: string;
  language?: string;
  categoryId?: string;
  category?: string;
  subcategory?: string;
  skillLevel?: string;
  creatorAddress?: string;
  averageRating?: number;
  estimatedDuration?: number;
  tags?: string[];
  pricing?: {
    amount?: number;
    currency?: string;
  };
  modules?: Array<{
    moduleId?: string;
    title?: string;
    description?: string;
    contentType?: string;
    contentUrl?: string;
    duration?: number;
    order?: number;
    isPreview?: boolean;
  }>;
  thumbnailUrl?: string;
  enrollments?: Array<{
    studentAddress?: string;
  }>;
  status?: string;
  createdAt?: string;
}

export interface CoursesPage {
  courses: CourseRecord[];
  page: number;
  pages: number;
  total: number;
}

export interface CoursesPlacementSummary {
  typeId: string;
  name: string;
  price: number;
  period: string;
  slotsUsed: number;
  maxSlots: number;
  available: boolean;
}

export interface CoursesPlacementsResponse {
  success: boolean;
  page: string;
  summary: CoursesPlacementSummary[];
  placements: Record<string, unknown[]>;
}

export interface CourseEnrollmentReceipt {
  receiptId: string;
  courseId: string;
  studentAddress?: string;
  amount: number;
  currency: string;
  status?: string;
  createdAt?: string;
}

export interface CourseEnrollmentRecord {
  courseId: string;
  title: string;
  categoryId?: string;
  creatorAddress?: string;
  thumbnailUrl?: string;
  status?: string;
  progress?: {
    completedModules?: string[];
    percentComplete?: number;
    currentLessonId?: string;
    resumePositionSec?: number;
    lastAccessed?: string;
  };
  completed?: boolean;
  enrolledAt?: string;
  completedAt?: string;
  certificateNftId?: string;
}

export interface CoursePaymentIntent {
  intentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  expiresAt: string;
}

export interface CourseCertificateRecord {
  certificateId: string;
  courseId: string;
  studentActorId: string;
  amount: number;
  currency: string;
  status: 'issued' | 'pending' | 'cancelled';
  issuedAt: string;
  verificationUrl: string;
}

export interface CourseUserPublicProfile {
  walletAddress: string;
  displayName: string;
  avatarUrl?: string;
  tribalAffiliation?: string;
  artistTier?: string;
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

function getUserAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const wallet = (window.localStorage.getItem('indigena_wallet_address') || '').trim().toLowerCase();
  const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
  const headers: Record<string, string> = {};
  if (wallet) headers['x-wallet-address'] = wallet;
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

async function postJson(path: string, body: Record<string, unknown>) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getUserAuthHeaders()
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

async function putJson(path: string, body: Record<string, unknown>) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getUserAuthHeaders()
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

async function getJson<T>(path: string) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    headers: getUserAuthHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as T;
}

export async function fetchCoursesCatalog(query: CoursesQuery, signal?: AbortSignal): Promise<CoursesPage> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 24;
  const hasSearch = Boolean(query.q && query.q.trim());

  if (hasSearch) {
    const searchUrl = buildUrl('/courses/search', {
      q: query.q?.trim(),
      categoryId: query.categoryId,
      level: query.level,
      sort: query.sort,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      durationMinWeeks: query.durationMinWeeks,
      durationMaxWeeks: query.durationMaxWeeks
    });
    const searchRes = await fetchWithTimeout(searchUrl, { signal });
    if (!searchRes.ok) throw new Error(await parseApiError(searchRes, 'Course search failed'));
    const searchJson = await searchRes.json();
    const courses: CourseRecord[] = searchJson?.courses ?? [];
    return {
      courses,
      page: 1,
      pages: 1,
      total: Number(searchJson?.count ?? courses.length)
    };
  }

  const listUrl = buildUrl('/courses', {
    categoryId: query.categoryId,
    level: query.level,
    sort: query.sort,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    durationMinWeeks: query.durationMinWeeks,
    durationMaxWeeks: query.durationMaxWeeks,
    page,
    limit,
    status: 'published'
  });
  const res = await fetchWithTimeout(listUrl, { signal });
  if (!res.ok) throw new Error(await parseApiError(res, 'Courses request failed'));
  const json = await res.json();

  const courses: CourseRecord[] = json?.courses ?? [];
  const total = Number(json?.total ?? courses.length);
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    courses,
    page: Number(json?.page ?? page),
    pages,
    total
  };
}

export async function enrollInCourse(courseId: string, studentAddress: string) {
  return postJson('/courses/enroll', { courseId, studentAddress });
}

export async function createCoursePaymentIntent(courseId: string, studentAddress: string): Promise<CoursePaymentIntent> {
  const json = await postJson(`/courses/${encodeURIComponent(courseId)}/payment-intent`, { studentAddress });
  return (json as { paymentIntent?: CoursePaymentIntent })?.paymentIntent as CoursePaymentIntent;
}

export async function confirmCoursePayment(courseId: string, intentId: string, clientSecret: string, studentAddress: string) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/payment-confirm`, {
    studentAddress,
    intentId,
    clientSecret
  });
}

export async function toggleCourseWatchlist(courseId: string, watcherAddress: string) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/watchlist`, { watcherAddress });
}

export async function shareCourse(courseId: string, sharerAddress: string, platform = 'native', shareUrl?: string) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/share`, { sharerAddress, platform, shareUrl });
}

export async function reportCourse(
  courseId: string,
  reporterAddress: string,
  reason: string,
  details = ''
) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/report`, { reporterAddress, reason, details });
}

export async function fetchMyCourseReceipts(limit = 50): Promise<CourseEnrollmentReceipt[]> {
  const headers = getUserAuthHeaders();
  const url = buildUrl('/courses/receipts/me', { limit });
  const res = await fetchWithTimeout(url, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res));
  const json = await res.json();
  return (json?.receipts ?? []) as CourseEnrollmentReceipt[];
}

export async function fetchMyCourseEnrollments(limit = 100): Promise<CourseEnrollmentRecord[]> {
  const json = await getJson<{ enrollments?: CourseEnrollmentRecord[] }>(`/courses/enrollments/me?limit=${limit}`);
  return json?.enrollments ?? [];
}

export async function fetchCourseById(courseId: string, includeStatus = false): Promise<CourseRecord | null> {
  const suffix = includeStatus ? '?includeStatus=1' : '';
  const json = await getJson<{ course?: CourseRecord }>(`/courses/${encodeURIComponent(courseId)}${suffix}`);
  return json?.course ?? null;
}

export async function fetchCourseProgress(courseId: string) {
  return getJson<{
    progress?: {
      completedModules?: string[];
      percentComplete?: number;
      currentLessonId?: string;
      resumePositionSec?: number;
      lastAccessed?: string;
    };
    completed?: boolean;
  }>(`/courses/${encodeURIComponent(courseId)}/progress`);
}

export async function fetchCourseCertificateStatus(courseId: string) {
  return getJson<{ completed: boolean; certificate: CourseCertificateRecord | null }>(
    `/courses/${encodeURIComponent(courseId)}/certificate-status`
  );
}

export async function issueCourseCertificatePurchase(courseId: string) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/certificate-issue`, {});
}

export async function syncCourseProgress(
  courseId: string,
  payload: { currentLessonId?: string; resumePositionSec?: number; completedModuleId?: string; studentAddress?: string }
) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/progress`, payload as Record<string, unknown>);
}

export async function createCourseListing(payload: Record<string, unknown>) {
  return postJson('/courses/create', payload);
}

export async function updateCourseListing(courseId: string, payload: Record<string, unknown>) {
  return putJson(`/courses/${encodeURIComponent(courseId)}`, payload);
}

export async function submitCourseForReview(courseId: string, creatorAddress: string) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/submit`, { creatorAddress });
}

export async function publishCourseListing(courseId: string, creatorAddress: string, adminWallet?: string) {
  return postJson(`/courses/${encodeURIComponent(courseId)}/publish`, {
    creatorAddress,
    adminWallet
  });
}

export async function fetchCoursesPlacements(): Promise<CoursesPlacementsResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/placements/page/courses`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as CoursesPlacementsResponse;
}

export async function fetchCourseUserPublicProfile(address: string): Promise<CourseUserPublicProfile | null> {
  const safe = String(address || '').trim().toLowerCase();
  if (!safe) return null;
  const res = await fetchWithTimeout(`${API_BASE}/courses/profiles/${encodeURIComponent(safe)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await parseApiError(res));
  const json = (await res.json()) as { profile?: CourseUserPublicProfile };
  return json?.profile ?? null;
}
