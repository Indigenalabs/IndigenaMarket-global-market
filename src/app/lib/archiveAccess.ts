import type { SubscriptionEntitlementsResponse } from '@/app/lib/profileApi';
import type { HeritageAccessLevel } from '@/app/lib/languageHeritageApi';

export interface HeritageEntitlementState {
  memberPlanId: string;
  accessPlanIds: string[];
  hasCommunityAccess: boolean;
  hasRestrictedAccess: boolean;
  hasResearcherAccess: boolean;
  hasInstitutionalAccess: boolean;
  institutionalSeatLimit: number;
}

const COMMUNITY_MEMBER_PLANS = new Set(['community', 'patron', 'all-access']);
const RESTRICTED_MEMBER_PLANS = new Set(['all-access']);
const COMMUNITY_ACCESS_PLANS = new Set([
  'heritage-archive-pass',
  'all-access-pass',
  'basic-archive',
  'researcher-access',
  'institutional-archive'
]);
const RESTRICTED_ACCESS_PLANS = new Set([
  'heritage-archive-pass',
  'all-access-pass',
  'researcher-access',
  'institutional-archive'
]);

export function resolveHeritageEntitlements(
  entitlements?: Pick<SubscriptionEntitlementsResponse, 'memberPlanId' | 'accessPlanIds'> | null
): HeritageEntitlementState {
  const memberPlanId = entitlements?.memberPlanId || 'free';
  const accessPlanIds = entitlements?.accessPlanIds || [];
  const hasCommunityAccess =
    COMMUNITY_MEMBER_PLANS.has(memberPlanId) ||
    accessPlanIds.some((planId) => COMMUNITY_ACCESS_PLANS.has(planId));
  const hasRestrictedAccess =
    RESTRICTED_MEMBER_PLANS.has(memberPlanId) ||
    accessPlanIds.some((planId) => RESTRICTED_ACCESS_PLANS.has(planId));
  const hasResearcherAccess = accessPlanIds.includes('researcher-access') || accessPlanIds.includes('institutional-archive');
  const hasInstitutionalAccess = accessPlanIds.includes('institutional-archive');
  const institutionalSeatLimit = hasInstitutionalAccess ? 50 : 0;

  return {
    memberPlanId,
    accessPlanIds,
    hasCommunityAccess,
    hasRestrictedAccess,
    hasResearcherAccess,
    hasInstitutionalAccess
    ,institutionalSeatLimit
  };
}

export function canAccessHeritageLevel(
  accessLevel: HeritageAccessLevel,
  entitlements?: Pick<SubscriptionEntitlementsResponse, 'memberPlanId' | 'accessPlanIds'> | null
) {
  const state = resolveHeritageEntitlements(entitlements);
  if (accessLevel === 'public') return true;
  if (accessLevel === 'community') return state.hasCommunityAccess;
  if (accessLevel === 'restricted') return state.hasRestrictedAccess;
  return false;
}

export function getHeritageAccessUpgradeCopy(accessLevel: Exclude<HeritageAccessLevel, 'public'>) {
  if (accessLevel === 'community') {
    return {
      title: 'Community archive access required',
      detail: 'Unlock community-controlled recordings and archive views with Community, All-Access, or an archive pass.',
      ctaLabel: 'Unlock archive access'
    };
  }
  if (accessLevel === 'restricted') {
    return {
      title: 'Restricted archive access required',
      detail: 'This item requires a heritage archive pass, researcher access, or institutional archive entitlement.',
      ctaLabel: 'Upgrade archive access'
    };
  }
  return {
    title: 'Elder-approved access required',
    detail: 'Sacred and protocol-controlled materials require a community or elder approval request. Access is never automatic.',
    ctaLabel: 'Request access'
  };
}
