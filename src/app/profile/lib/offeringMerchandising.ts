import type { ProfileOffering } from '@/app/profile/data/profileShowcase';

export function getOfferingLaunchState(offering: ProfileOffering) {
  const now = Date.now();
  const start = offering.launchWindowStartsAt ? Date.parse(offering.launchWindowStartsAt) : NaN;
  const end = offering.launchWindowEndsAt ? Date.parse(offering.launchWindowEndsAt) : NaN;
  if (Number.isFinite(end) && end < now) return 'expired' as const;
  if (Number.isFinite(start) && start > now) return 'scheduled' as const;
  if (Number.isFinite(start) && Number.isFinite(end) && start <= now && end >= now) return 'live' as const;
  return 'open' as const;
}

export function applyLaunchWindowState(offering: ProfileOffering): ProfileOffering {
  const launchState = getOfferingLaunchState(offering);
  if (launchState === 'expired') {
    return {
      ...offering,
      status: 'Archived',
      availabilityLabel: 'Window closed',
      availabilityTone: 'danger'
    };
  }

  if (launchState === 'scheduled') {
    return {
      ...offering,
      status: 'Scheduled',
      availabilityLabel: 'Launches soon',
      availabilityTone: offering.availabilityTone === 'danger' ? 'danger' : 'warning'
    };
  }

  if (launchState === 'live') {
    return {
      ...offering,
      status: 'Active',
      availabilityLabel: offering.availabilityLabel || 'Launch live',
      availabilityTone: offering.availabilityTone === 'default' ? 'success' : offering.availabilityTone
    };
  }

  return offering;
}

export function shouldShowOfferingInStorefront(offering: ProfileOffering) {
  return getOfferingLaunchState(offering) !== 'expired';
}

export function getOfferingMerchandisingScore(offering: ProfileOffering) {
  const launchState = getOfferingLaunchState(offering);
  const launchBoost = launchState === 'live' ? 80 : launchState === 'scheduled' ? 30 : 0;
  const featuredBoost = offering.featured ? 60 : 0;
  const urgencyBoost = offering.availabilityTone === 'warning' ? 25 : offering.availabilityTone === 'success' ? 10 : 0;
  const rankBoost = Math.max(0, 40 - (offering.merchandisingRank ?? 0));
  const presetBoost =
    offering.ctaPreset === 'collect-now'
      ? 20
      : offering.ctaPreset === 'book-now'
        ? 18
        : offering.ctaPreset === 'enroll-now'
          ? 16
          : offering.ctaPreset === 'request-quote'
            ? 12
            : 8;
  return featuredBoost + launchBoost + urgencyBoost + rankBoost + presetBoost;
}

export function getOfferingImage(offering: ProfileOffering) {
  if (offering.galleryOrder && offering.galleryOrder.length > 0) return offering.galleryOrder[0];
  if (offering.coverImage) return offering.coverImage;
  return offering.image;
}

export function getOfferingCtaLabel(offering: ProfileOffering) {
  switch (offering.ctaMode) {
    case 'buy':
      return 'Buy now';
    case 'book':
      return 'Book now';
    case 'enroll':
      return 'Enroll now';
    case 'quote':
      return 'Request quote';
    case 'message':
      return 'Message creator';
    default:
      return 'View detail';
  }
}

export function getOfferingLaunchBadge(offering: ProfileOffering) {
  const launchState = getOfferingLaunchState(offering);
  if (launchState === 'scheduled') return 'Launches soon';
  if (launchState === 'live') return 'Launch live';
  const now = Date.now();
  const end = offering.launchWindowEndsAt ? Date.parse(offering.launchWindowEndsAt) : NaN;
  if (Number.isFinite(end) && end > now && end - now <= 1000 * 60 * 60 * 24 * 3) return 'Closing soon';
  return '';
}

export function getOfferingLeadLabel(offering: ProfileOffering) {
  switch (offering.ctaPreset) {
    case 'book-now':
      return 'Book this';
    case 'enroll-now':
      return 'Learn here';
    case 'request-quote':
      return 'Request pricing';
    case 'message-first':
      return 'Start here';
    default:
      return 'Collector pick';
  }
}

export function getBundleActionLabel(item: ProfileOffering | undefined, mode: 'item' | 'bundle') {
  if (!item) return mode === 'bundle' ? 'Ask about this bundle' : 'Open item';
  switch (item.ctaMode) {
    case 'buy':
      return mode === 'bundle' ? 'Buy bundle items' : 'Buy now';
    case 'book':
      return mode === 'bundle' ? 'Book this path' : 'Book now';
    case 'enroll':
      return mode === 'bundle' ? 'Start learning' : 'Enroll now';
    case 'quote':
      return mode === 'bundle' ? 'Request bundle quote' : 'Request quote';
    case 'message':
      return mode === 'bundle' ? 'Ask about this bundle' : 'Message creator';
    default:
      return mode === 'bundle' ? 'View bundle items' : 'View detail';
  }
}
