import type { PlatformAccountRecord, RevenueSplitRuleRecord } from '@/app/lib/platformAccounts';

const COMMUNITY_METADATA_PREFIXES = ['Storefront:', 'Treasury route:', 'Community verification:', 'Split rule:', 'Split rule id:'];

export function resolveCommunitySplitRule(
  splitRules: RevenueSplitRuleRecord[] | undefined,
  splitRuleId: string | undefined
) {
  if (!splitRuleId) return null;
  const id = splitRuleId.trim();
  if (!id) return null;
  return (splitRules || []).find((entry) => entry.id === id && entry.status === 'active') || null;
}

export function extractCommunitySplitRuleId(metadata: string[] | undefined) {
  const entry = (metadata || []).find((value) => typeof value === 'string' && value.startsWith('Split rule id:'));
  return entry ? entry.replace('Split rule id:', '').trim() : '';
}

export function buildCommunityPublishingMetadata(
  existingMetadata: string[] | undefined,
  account?: PlatformAccountRecord | null,
  splitRule?: RevenueSplitRuleRecord | null
) {
  const base = Array.isArray(existingMetadata)
    ? existingMetadata.filter(
        (entry) => typeof entry === 'string' && !COMMUNITY_METADATA_PREFIXES.some((prefix) => entry.startsWith(prefix))
      )
    : [];

  if (!account) return base;

  return [
    ...base,
    `Storefront: ${account.displayName}`,
    `Treasury route: ${account.treasuryLabel}`,
    `Community verification: ${account.verificationStatus}`,
    ...(splitRule ? [`Split rule: ${splitRule.offeringLabel}`, `Split rule id: ${splitRule.id}`] : [])
  ];
}
