import type { ProfileOffering } from '@/app/profile/data/profileShowcase';
import {
  applyLaunchWindowState,
  getOfferingCtaLabel,
  getOfferingImage,
  getOfferingLaunchBadge,
} from '@/app/profile/lib/offeringMerchandising';

type MarketplaceCardOffering = Pick<
  ProfileOffering,
  | 'image'
  | 'coverImage'
  | 'galleryOrder'
  | 'ctaMode'
  | 'ctaPreset'
  | 'launchWindowStartsAt'
  | 'launchWindowEndsAt'
  | 'availabilityLabel'
  | 'availabilityTone'
  | 'featured'
  | 'merchandisingRank'
  | 'status'
  | 'title'
  | 'priceLabel'
  | 'blurb'
  | 'pillarLabel'
>;

export function getMarketplaceCardMerchandising(offering: MarketplaceCardOffering) {
  const normalized = applyLaunchWindowState(offering as ProfileOffering);

  return {
    normalized,
    image: getOfferingImage(normalized),
    ctaLabel: getOfferingCtaLabel(normalized),
    launchBadge: getOfferingLaunchBadge(normalized),
  };
}
