import type { PlatformAccountRecord } from '@/app/lib/platformAccounts';

const COMMUNITY_METADATA_PREFIXES = ['Storefront:', 'Treasury route:', 'Community verification:'];

export function buildCommunityPublishingMetadata(
  existingMetadata: string[] | undefined,
  account?: PlatformAccountRecord | null
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
    `Community verification: ${account.verificationStatus}`
  ];
}
