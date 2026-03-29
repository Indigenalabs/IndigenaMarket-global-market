import { API_BASE_URL, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';

export interface SevaCause {
  causeId: string;
  name: string;
  description: string;
  community?: string;
  nation?: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  progress: number;
  status: string;
  imageUrl?: string;
  verifiedByElder?: boolean;
  impact?: {
    landProtected?: number;
    languageLessonsFunded?: number;
    artistsSupported?: number;
  };
}

export interface SevaPlatformStats {
  totalSEVAEarned: number;
  totalSEVADonated: number;
  totalUsers: number;
  totalCauses: number;
  totalFunding: number;
  totalLandProtected: number;
  totalLanguageLessons: number;
}

export interface SevaProjectRequest {
  requestId: string;
  requesterActorId: string;
  requesterWallet: string;
  requesterLabel: string;
  title: string;
  community: string;
  nation: string;
  category: string;
  targetAmount: number;
  summary: string;
  impactPlan: string;
  status: string;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedByActor?: string;
  publishedProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = USE_APP_API ? '/api' : API_BASE_URL;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function fetchSevaCauses(): Promise<SevaCause[]> {
  const json = await getJson<{ status: boolean; causes?: Array<Record<string, unknown>> }>(`${API_BASE}/seva/causes`);
  const rows = json?.causes ?? [];
  return rows.map((row) => ({
    causeId: String(row.causeId || ''),
    name: String(row.name || 'Untitled Cause'),
    description: String(row.description || ''),
    community: String(row.community || ''),
    nation: String(row.nation || ''),
    category: String(row.category || 'cultural_education'),
    fundingGoal: Number(row.fundingGoal || 0),
    currentFunding: Number(row.currentFunding || 0),
    progress: Number(row.progress || 0),
    status: String(row.status || 'active'),
    imageUrl: String(row.imageUrl || ''),
    verifiedByElder: Boolean(row.verifiedByElder),
    impact: {
      landProtected: Number((row.impact as { landProtected?: unknown } | undefined)?.landProtected || 0),
      languageLessonsFunded: Number((row.impact as { languageLessonsFunded?: unknown } | undefined)?.languageLessonsFunded || 0),
      artistsSupported: Number((row.impact as { artistsSupported?: unknown } | undefined)?.artistsSupported || 0)
    }
  }));
}

export async function fetchSevaPlatformStats(): Promise<SevaPlatformStats> {
  const json = await getJson<{ status: boolean; stats?: { seva?: Record<string, unknown>; causes?: Record<string, unknown> } }>(`${API_BASE}/seva/stats`);
  const seva = json?.stats?.seva ?? {};
  const causes = json?.stats?.causes ?? {};
  return {
    totalSEVAEarned: Number(seva.totalSEVAEarned || 0),
    totalSEVADonated: Number(seva.totalSEVADonated || 0),
    totalUsers: Number(seva.totalUsers || 0),
    totalCauses: Number(causes.totalCauses || 0),
    totalFunding: Number(causes.totalFunding || 0),
    totalLandProtected: Number(causes.totalLandProtected || 0),
    totalLanguageLessons: Number(causes.totalLanguageLessons || 0)
  };
}

export async function donateSeva(walletAddress: string, causeId: string, amount: number, message = '') {
  return postJson<{ status: boolean; message?: string }>(`${API_BASE}/seva/donate`, {
    walletAddress,
    causeId,
    amount,
    message
  });
}

export async function requestSevaProject(payload: {
  walletAddress: string;
  requesterLabel: string;
  title: string;
  community: string;
  nation: string;
  category: string;
  targetAmount: number;
  summary: string;
  impactPlan: string;
}) {
  return postJson<{ status: boolean; message?: string; requestId?: string }>(`${API_BASE}/seva/request-project`, payload);
}

export async function fetchMySevaProjectRequests() {
  const json = await getJson<{ status: boolean; requests?: SevaProjectRequest[] }>(`${API_BASE}/seva/requests/mine`);
  return json?.requests ?? [];
}

export async function fetchSevaReviewQueue() {
  const json = await getJson<{ status: boolean; requests?: SevaProjectRequest[] }>(`${API_BASE}/seva/requests/review`);
  return json?.requests ?? [];
}

export async function reviewSevaProjectRequest(payload: {
  requestId: string;
  reviewAction: 'approved' | 'needs_info' | 'rejected';
  reviewNotes: string;
  fundId: 'rapid-response' | 'land-back' | 'innovation';
}) {
  return postJson<{ status: boolean; message?: string; requestId?: string; publishedProjectId?: string }>(
    `${API_BASE}/seva/requests-review`,
    payload
  );
}
