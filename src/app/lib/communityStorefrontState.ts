import type {
  PlatformAccountRecord,
  PlatformVerificationStatus
} from '@/app/lib/platformAccounts';

export function isCommunityStorefrontAccount(account?: Pick<PlatformAccountRecord, 'accountType'> | null) {
  return Boolean(account && ['community', 'tribe', 'collective'].includes(account.accountType));
}

export function getCommunityStorefrontState(status: PlatformVerificationStatus) {
  switch (status) {
    case 'approved':
      return {
        badgeLabel: 'Verified community seller',
        badgeClassName: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        title: 'This storefront is approved for community publishing.',
        detail: 'Listings can be published live from this storefront and proceeds can route through community treasury rules.',
        publishEnabled: true
      };
    case 'pending':
      return {
        badgeLabel: 'Community review pending',
        badgeClassName: 'border-[#d4af37]/30 bg-[#d4af37]/10 text-[#f3ddb1]',
        title: 'This storefront is still in review.',
        detail: 'You can prepare listings in community context now, but live publishing stays blocked until governance review is approved.',
        publishEnabled: false
      };
    case 'rejected':
      return {
        badgeLabel: 'Needs verification follow-up',
        badgeClassName: 'border-[#DC143C]/30 bg-[#DC143C]/10 text-[#ffb4c0]',
        title: 'This storefront needs verification follow-up before it can publish.',
        detail: 'Keep drafts attached to the community storefront if needed, but plan on resolving the verification issues before taking listings live.',
        publishEnabled: false
      };
    case 'draft':
    default:
      return {
        badgeLabel: 'Verification draft',
        badgeClassName: 'border-white/15 bg-white/5 text-gray-300',
        title: 'This storefront is still in draft setup.',
        detail: 'Complete representative details and verification before using this storefront for live community publishing.',
        publishEnabled: false
      };
  }
}

export function appendAccountSlugToHref(href: string, accountSlug?: string) {
  if (!accountSlug) return href;
  const [pathname, rawQuery = ''] = href.split('?');
  const params = new URLSearchParams(rawQuery);
  params.set('accountSlug', accountSlug);
  return `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
}
