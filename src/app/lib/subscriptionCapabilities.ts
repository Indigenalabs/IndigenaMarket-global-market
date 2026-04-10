import type { SubscriptionEntitlementsResponse } from '@/app/lib/profileApi';

export interface SubscriptionCapabilities {
  hasCreatorPremium: boolean;
  hasCreatorAnalytics: boolean;
  hasUnlimitedListings: boolean;
  hasTeamWorkspace: boolean;
  hasArchiveAccess: boolean;
  hasResearcherArchiveAccess: boolean;
  hasInstitutionalArchiveAccess: boolean;
  hasCommunityMembership: boolean;
  hasPatronMembership: boolean;
  hasAllAccessMembership: boolean;
  hasLifetimeFounder: boolean;
  hasLifetimeElder: boolean;
  hasLifetimeLegacy: boolean;
  activeTeamPlanId: string | null;
  activeLifetimePlanId: string | null;
  activeArchivePlans: string[];
}

export function resolveSubscriptionCapabilities(
  entitlements?: SubscriptionEntitlementsResponse | null
): SubscriptionCapabilities {
  const memberPlanId = entitlements?.memberPlanId || 'free';
  const creatorPlanId = entitlements?.creatorPlanId || 'free';
  const accessPlanIds = entitlements?.accessPlanIds || [];
  const teamPlanIds = entitlements?.teamPlanIds || [];
  const lifetimePlanIds = entitlements?.lifetimePlanIds || [];
  const featureAdoption = entitlements?.metrics?.featureAdoption;

  const hasLifetimeFounder = lifetimePlanIds.includes('founder');
  const hasLifetimeElder = lifetimePlanIds.includes('elder');
  const hasLifetimeLegacy = hasLifetimeFounder || hasLifetimeElder;
  const hasPatronMembership = memberPlanId === 'patron' || memberPlanId === 'all-access' || hasLifetimeFounder || hasLifetimeElder;
  const hasAllAccessMembership = memberPlanId === 'all-access' || hasLifetimeElder;
  const hasCommunityMembership =
    memberPlanId === 'community' ||
    memberPlanId === 'patron' ||
    memberPlanId === 'all-access' ||
    hasLifetimeFounder ||
    hasLifetimeElder;
  const hasCreatorPremium = creatorPlanId === 'creator' || creatorPlanId === 'studio';
  const hasCreatorAnalytics = featureAdoption?.creatorAnalyticsUnlocked ?? hasCreatorPremium;
  const hasUnlimitedListings = featureAdoption?.unlimitedListingsUnlocked ?? hasCreatorPremium;
  const hasTeamWorkspace =
    featureAdoption?.teamWorkspaceUnlocked ?? (creatorPlanId === 'studio' || teamPlanIds.length > 0);
  const hasArchiveAccess =
    featureAdoption?.archiveAccessUnlocked ?? (accessPlanIds.length > 0 || hasAllAccessMembership);
  const hasResearcherArchiveAccess =
    accessPlanIds.includes('researcher-access') ||
    accessPlanIds.includes('institutional-archive') ||
    hasLifetimeElder;
  const hasInstitutionalArchiveAccess = accessPlanIds.includes('institutional-archive');

  return {
    hasCreatorPremium,
    hasCreatorAnalytics,
    hasUnlimitedListings,
    hasTeamWorkspace,
    hasArchiveAccess,
    hasResearcherArchiveAccess,
    hasInstitutionalArchiveAccess,
    hasCommunityMembership,
    hasPatronMembership,
    hasAllAccessMembership,
    hasLifetimeFounder,
    hasLifetimeElder,
    hasLifetimeLegacy,
    activeTeamPlanId: teamPlanIds[0] || null,
    activeLifetimePlanId: lifetimePlanIds[0] || null,
    activeArchivePlans: accessPlanIds.filter((planId) =>
      ['basic-archive', 'researcher-access', 'institutional-archive', 'heritage-archive-pass', 'all-access-pass'].includes(planId)
    )
  };
}
