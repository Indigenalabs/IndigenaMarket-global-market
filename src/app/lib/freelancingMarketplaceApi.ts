import { API_BASE_URL, buildApiUrl, fetchWithTimeout, parseApiError } from './apiClient';
const USE_APP_API = process.env.NEXT_PUBLIC_USE_APP_API === 'true';

export interface FreelancingMarketplaceQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface FreelancingMarketplaceService {
  serviceId: string;
  title: string;
  description?: string;
  category?: string;
  freelancerAddress?: string;
  freelancerName?: string;
  freelancerAvatar?: string;
  freelancerNation?: string;
  location?: string;
  verificationStatus?: string;
  averageRating?: number;
  reviewCount?: number;
  completedProjects?: number;
  responseTime?: string;
  languages?: string[];
  skills?: string[];
  pricing?: {
    min?: number;
    max?: number;
    currency?: string;
    fixedAmount?: number;
  };
  deliveryTime?: string;
  featured?: boolean;
  available?: boolean;
}

export interface FreelancingMarketplacePage {
  services: FreelancingMarketplaceService[];
  page: number;
  pages: number;
  total: number;
}

export interface FreelancingMarketplaceEvent {
  event: string;
  serviceId?: string;
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

export async function fetchFreelancingServices(
  query: FreelancingMarketplaceQuery,
  signal?: AbortSignal
): Promise<FreelancingMarketplacePage> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 24;
  const url = buildUrl('/freelancers/marketplace/services', {
    q: query.q,
    category: query.category,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    verifiedOnly: query.verifiedOnly ? 1 : undefined,
    availableOnly: query.availableOnly ? 1 : undefined,
    sort: query.sort,
    page,
    limit
  });
  const res = await fetchWithTimeout(url, { signal });
  if (!res.ok) throw new Error(await parseApiError(res, 'Services request failed'));
  const json = await res.json();

  const data = json?.data ?? {};
  const services: FreelancingMarketplaceService[] = data?.services ?? [];
  return {
    services,
    page: Number(data?.page ?? page),
    pages: Number(data?.pages ?? 1),
    total: Number(data?.total ?? services.length)
  };
}

export async function bookFreelanceService(serviceId: string, clientAddress = 'demo-wallet') {
  return postJson(`/freelancers/marketplace/services/${serviceId}/book`, { clientAddress });
}

export async function createFreelanceEscrowOrder(body: {
  serviceId: string;
  amount: number;
  currency?: string;
  clientAddress?: string;
  projectDetails?: string;
  deadline?: string;
  freelancerName?: string;
  freelancerActorId?: string;
  serviceTitle?: string;
  milestones?: Array<Record<string, unknown>>;
}) {
  return postJson(`/freelancers/marketplace/services/${body.serviceId}/book`, body);
}

export async function releaseFreelanceMilestone(body: {
  orderId: string;
  milestoneId: string;
  amount: number;
}) {
  return postJson(`/freelancers/orders/${body.orderId}/milestones/${body.milestoneId}/release`, body);
}

export async function shortlistFreelanceService(serviceId: string, userAddress = 'demo-wallet') {
  return postJson(`/freelancers/marketplace/services/${serviceId}/shortlist`, { userAddress });
}

export async function shareFreelanceService(serviceId: string, platform: string) {
  return postJson(`/freelancers/marketplace/services/${serviceId}/share`, { platform });
}

export async function reportFreelanceService(serviceId: string, reason: string, details = '') {
  return postJson(`/freelancers/marketplace/services/${serviceId}/report`, { reason, details });
}

export async function trackFreelancingMarketplaceEvent(payload: FreelancingMarketplaceEvent) {
  return postJson('/freelancers/analytics/event', payload as unknown as Record<string, unknown>);
}

export async function fetchFreelancingDemandHeatmap() {
  const res = await fetchWithTimeout(`${API_BASE}/freelancers/analytics/heatmap`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Heatmap request failed'));
  return res.json();
}
