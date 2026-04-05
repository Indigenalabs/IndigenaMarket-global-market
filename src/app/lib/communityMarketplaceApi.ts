import type { CommunityMarketplaceOffer } from '@/app/lib/communityMarketplace';

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
