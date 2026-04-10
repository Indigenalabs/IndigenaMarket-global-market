import type {
  CommunityMarketplaceOffer,
  CommunityStorefrontPerformanceRollup,
  CommunityTreasuryRoutingRollup
} from '@/app/lib/communityMarketplace';
export type {
  CommunityMarketplaceOffer,
  CommunityStorefrontPerformanceRollup,
  CommunityTreasuryRoutingRollup
} from '@/app/lib/communityMarketplace';

export async function fetchCommunityMarketplaceOffers(input?: { pillar?: string; search?: string }) {
  const params = new URLSearchParams();
  if (input?.pillar) params.set('pillar', input.pillar);
  if (input?.search) params.set('q', input.search);
  const query = params.toString();
  const response = await fetch(`/api/community/marketplace${query ? `?${query}` : ''}`, {
    credentials: 'same-origin',
    cache: 'no-store'
  });
  const payload = (await response.json().catch(() => ({ data: [] }))) as { data?: CommunityMarketplaceOffer[] };
  if (!response.ok) {
    throw new Error('Unable to load community marketplace listings.');
  }
  return Array.isArray(payload.data) ? payload.data : [];
}

export interface CommunityStorefrontAnalyticsSnapshot {
  treasury: {
    id: string;
    accountId: string;
    accountSlug: string;
    label: string;
    restrictedBalance: number;
    unrestrictedBalance: number;
    pendingDisbursementAmount: number;
    nextDisbursementDate: string;
    reportingNote: string;
  };
  rollups: CommunityTreasuryRoutingRollup[];
  pillarPerformance: CommunityStorefrontPerformanceRollup[];
  summary: {
    liveOfferCount: number;
    projectedGrossValue: number;
    realizedGrossValue: number;
    realizedTreasuryValue: number;
  };
}

export async function fetchCommunityStorefrontAnalytics(slug: string) {
  const response = await fetch(`/api/community-storefront/${encodeURIComponent(slug)}/analytics`, {
    credentials: 'same-origin',
    cache: 'no-store'
  });
  const payload = (await response.json().catch(() => ({}))) as { data?: CommunityStorefrontAnalyticsSnapshot; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || 'Unable to load community storefront analytics.');
  }
  return payload.data || null;
}
