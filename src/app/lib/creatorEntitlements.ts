import type { CreatorPlanId } from '@/app/lib/monetization';

export interface CreatorPlanCapabilities {
  maxListings: number | null;
  analyticsLevel: 'basic' | 'advanced';
  teamWorkspace: boolean;
}

export function getCreatorPlanCapabilities(planId: CreatorPlanId): CreatorPlanCapabilities {
  switch (planId) {
    case 'studio':
      return { maxListings: null, analyticsLevel: 'advanced', teamWorkspace: true };
    case 'creator':
      return { maxListings: null, analyticsLevel: 'advanced', teamWorkspace: false };
    default:
      return { maxListings: 12, analyticsLevel: 'basic', teamWorkspace: false };
  }
}

export function canCreateListing(currentCount: number, planId: CreatorPlanId) {
  const capabilities = getCreatorPlanCapabilities(planId);
  return capabilities.maxListings === null || currentCount < capabilities.maxListings;
}
