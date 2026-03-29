'use client';

import { fetchWithTimeout, parseApiError } from './apiClient';
import { getStoredWalletAddress } from './walletStorage';
import type { CreatorMessageThread, CreatorProfileRecord, CreatorShippingSettings, ProfileBundle, ProfileConnection } from '@/app/profile/data/profileShowcase';
import type { MarketingCampaignRun } from '@/app/profile/data/marketingInventory';

export interface PublicProfileResponse {
  profile: CreatorProfileRecord;
  isFollowing: boolean;
}

export interface CreatorDashboardResponse {
  profile: CreatorProfileRecord;
  isFollowing: boolean;
  followers: ProfileConnection[];
  following: ProfileConnection[];
  messageThreads: CreatorMessageThread[];
}

export interface SubscriptionEntitlementsResponse {
  memberPlanId: string;
  creatorPlanId: string;
  accessPlanIds: string[];
  teamPlanIds: string[];
  lifetimePlanIds: string[];
  records?: Array<Record<string, unknown>>;
  metrics?: {
    activeCount: number;
    cancelledCount: number;
    churnCount: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    oneTimeRevenue: number;
    featureAdoption: {
      creatorAnalyticsUnlocked: boolean;
      unlimitedListingsUnlocked: boolean;
      teamWorkspaceUnlocked: boolean;
      archiveAccessUnlocked: boolean;
    };
  };
}

export interface VerificationPurchaseRecord {
  id: string;
  actorId: string;
  walletAddress: string;
  profileSlug: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchPublicProfile(slug: string): Promise<PublicProfileResponse> {
  const res = await fetchWithTimeout(`/api/profile/public/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Profile request failed'));
  const json = await res.json();
  return (json?.data ?? json) as PublicProfileResponse;
}

export async function fetchCreatorDashboard(slug: string): Promise<CreatorDashboardResponse> {
  const res = await fetchWithTimeout(`/api/profile/dashboard?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Creator dashboard request failed'));
  const json = await res.json();
  return (json?.data ?? json) as CreatorDashboardResponse;
}

export async function fetchSubscriptionEntitlements(): Promise<SubscriptionEntitlementsResponse> {
  const res = await fetchWithTimeout('/api/subscriptions', { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Subscription state request failed'));
  return (await res.json()) as SubscriptionEntitlementsResponse;
}

export async function assertLegacyListingPublishAllowed(profileSlug: string, isEditMode = false) {
  if (isEditMode) return;
  const [entitlements, profile] = await Promise.all([
    fetchSubscriptionEntitlements(),
    fetchPublicProfile(profileSlug)
  ]);
  if (entitlements.creatorPlanId !== 'free') return;
  const maxListings = 12;
  if ((profile.profile.offerings?.length || 0) >= maxListings) {
    throw new Error(`Creator Free supports up to ${maxListings} active listings. Upgrade to Creator or Studio for unlimited listings.`);
  }
}

export async function cancelSubscriptionFamily(payload: {
  family: 'member' | 'creator' | 'access' | 'team' | 'lifetime';
  cancelAtPeriodEnd?: boolean;
  reason?: string;
}) {
  const params = new URLSearchParams({
    family: payload.family,
    ...(payload.cancelAtPeriodEnd ? { cancelAtPeriodEnd: 'true' } : {}),
    ...(payload.reason ? { reason: payload.reason } : {})
  });
  const res = await fetchWithTimeout(`/api/subscriptions?${params.toString()}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Subscription cancellation failed'));
  return (await res.json()) as { success: true; entitlements: SubscriptionEntitlementsResponse };
}

export async function startSubscriptionCheckout(payload: {
  family: 'member' | 'creator' | 'access' | 'team' | 'lifetime';
  planId: string;
  billingCadence: 'monthly' | 'annual' | 'one-time';
  paymentMethod?: 'card' | 'indi' | 'staked';
}) {
  const res = await fetchWithTimeout('/api/subscriptions/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Subscription checkout failed'));
  return (await res.json()) as
    | { mode: 'redirect'; checkoutUrl: string; checkoutSessionId: string }
    | { mode: 'activated'; entitlements: SubscriptionEntitlementsResponse };
}

export async function fetchProfileConnections(slug: string, kind: 'followers' | 'following') {
  const res = await fetchWithTimeout(`/api/profile/public/${encodeURIComponent(slug)}/${kind}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Profile connections request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { slug: string; kind: 'followers' | 'following'; connections: ProfileConnection[] };
}

export async function fetchProfileThreads(slug: string) {
  const res = await fetchWithTimeout(`/api/profile/messages?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Inbox request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { slug: string; threads: CreatorMessageThread[] };
}

export async function toggleProfileFollow(profileSlug: string, shouldFollow: boolean) {
  const res = await fetchWithTimeout('/api/profile/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileSlug, action: shouldFollow ? 'follow' : 'unfollow' })
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Follow request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { profileSlug: string; isFollowing: boolean; followerCount: number };
}

export async function sendProfileMessage(payload: {
  profileSlug: string;
  subject: string;
  body: string;
  pillar?: string;
  recipientActorId?: string;
  intent?: string;
}) {
  const res = await fetchWithTimeout('/api/profile/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Message request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; messageId: string };
}

export async function updateProfileBasics(payload: {
  slug: string;
  displayName: string;
  username: string;
  location: string;
  nation: string;
  bioShort: string;
  bioLong: string;
  website: string;
  languages: string[];
  avatar: string;
  cover: string;
}) {
  const res = await fetchWithTimeout('/api/profile/basics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Profile basics update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; profile: CreatorProfileRecord };
}

export async function uploadProfileMedia(payload: {
  slug: string;
  kind: 'avatar' | 'cover';
  file: File;
}) {
  const formData = new FormData();
  formData.append('slug', payload.slug);
  formData.append('kind', payload.kind);
  formData.append('file', payload.file);
  const res = await fetchWithTimeout('/api/profile/media', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Profile media upload failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; url: string };
}

export async function updateProfileShipping(payload: {
  slug: string;
  shippingSettings: CreatorShippingSettings;
}) {
  const res = await fetchWithTimeout('/api/profile/shipping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Shipping settings update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; shippingSettings: CreatorShippingSettings };
}

export async function updateProfileNotifications(payload: {
  slug: string;
  notifications: CreatorProfileRecord['notifications'];
}) {
  const res = await fetchWithTimeout('/api/profile/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Notification settings update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; notifications: CreatorProfileRecord['notifications'] };
}

export async function fetchProfileBundle(slug: string, bundleId: string) {
  const res = await fetchWithTimeout(`/api/profile/public/${encodeURIComponent(slug)}/bundles/${encodeURIComponent(bundleId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Bundle request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { profile: CreatorProfileRecord; bundle: CreatorProfileRecord['bundles'][number] | null };
}

export async function updateProfilePresentation(payload: {
  slug: string;
  leadTab: 'shop' | 'about' | 'bundles' | 'collections' | 'activity';
  leadSection: 'story' | 'reviews' | 'bundles';
  featuredBundleId?: string;
  featuredOfferingIds?: string[];
  showFeaturedReviews: boolean;
  showTrustSignals: boolean;
}) {
  const res = await fetchWithTimeout('/api/profile/presentation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Profile presentation update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; presentation: CreatorProfileRecord['presentation'] };
}

export async function updateProfileOfferingsBulk(payload: {
  slug: string;
  offeringIds: string[];
  operation:
    | 'activate'
    | 'pause'
    | 'archive'
    | 'feature'
    | 'unfeature'
    | 'set-available'
    | 'set-limited'
    | 'set-waitlist'
    | 'set-bookable'
    | 'set-enrolling';
}) {
  const res = await fetchWithTimeout('/api/profile/offerings/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Bulk listing update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; profile: CreatorProfileRecord };
}

export async function updateProfileOffering(payload: {
  slug: string;
  offeringId: string;
  title: string;
  blurb: string;
  priceLabel: string;
  status: string;
  coverImage: string;
  ctaMode: 'view' | 'buy' | 'book' | 'enroll' | 'quote' | 'message';
  ctaPreset?: 'collect-now' | 'book-now' | 'enroll-now' | 'request-quote' | 'message-first';
  merchandisingRank: number;
  galleryOrder?: string[];
  launchWindowStartsAt?: string;
  launchWindowEndsAt?: string;
  availabilityLabel: string;
  availabilityTone: 'default' | 'success' | 'warning' | 'danger';
  featured: boolean;
}) {
  const res = await fetchWithTimeout('/api/profile/offerings/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Listing update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; profile: CreatorProfileRecord };
}

export async function saveProfileBundle(payload: {
  slug: string;
  bundle: ProfileBundle;
}) {
  const res = await fetchWithTimeout('/api/profile/bundles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Bundle save failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; profile: CreatorProfileRecord; bundle: ProfileBundle };
}

export async function updateProfileCollectionsBulk(payload: {
  slug: string;
  collectionIds?: string[];
  bundleId?: string;
  operation: 'publish' | 'hide' | 'feature-bundle' | 'clear-featured-bundle';
}) {
  const res = await fetchWithTimeout('/api/profile/collections/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Collection merchandising update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; profile: CreatorProfileRecord };
}

export async function updateProfileVerification(payload: {
  slug: string;
  workflowId: string;
  action: 'submit' | 'request-info' | 'approve';
}) {
  const res = await fetchWithTimeout('/api/profile/verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Verification update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; profile: CreatorProfileRecord };
}

export async function fetchVerificationPurchases(slug: string) {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    const wallet = getStoredWalletAddress();
    const jwt = (window.localStorage.getItem('indigena_user_jwt') || '').trim();
    const adminSigned = (window.localStorage.getItem('indigena_admin_signed') || '').trim().toLowerCase() === 'true';
    if (!wallet && !jwt && !adminSigned) {
      return { purchases: [] as VerificationPurchaseRecord[] };
    }
  }
  const res = await fetchWithTimeout(`/api/profile/verification/purchases?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store'
  });
  if (res.status === 401 || res.status === 403) {
    return { purchases: [] as VerificationPurchaseRecord[] };
  }
  if (!res.ok) throw new Error(await parseApiError(res, 'Verification purchases request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { purchases: VerificationPurchaseRecord[] };
}

export async function startVerificationCheckout(payload: {
  slug: string;
  productId: string;
}) {
  const res = await fetchWithTimeout('/api/profile/verification/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Verification checkout failed'));
  return (await res.json()) as { mode: 'redirect'; checkoutUrl: string; checkoutSessionId: string };
}

export async function createProfileSupportRequest(payload: {
  slug: string;
  title: string;
  detail: string;
  channel: 'chat' | 'callback' | 'tutorial' | 'compliance';
}) {
  const res = await fetchWithTimeout('/api/profile/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Support request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; profile: CreatorProfileRecord };
}

export async function createQuickProfileDraft(payload: {
  slug: string;
  pillar: 'freelancing' | 'language-heritage' | 'land-food' | 'advocacy-legal' | 'materials-tools';
  fields: Record<string, string>;
}) {
  const res = await fetchWithTimeout('/api/profile/quick-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Quick draft creation failed'));
  const json = await res.json();
  return (json?.data ?? json) as {
    ok: true;
    draftId: string;
    href: string;
    offering: CreatorProfileRecord['offerings'][number];
  };
}

export async function fetchMarketingCampaigns(slug: string) {
  const res = await fetchWithTimeout(`/api/profile/marketing/campaigns?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Marketing campaign request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { campaigns: MarketingCampaignRun[] };
}

export async function reserveMarketingCampaign(payload: {
  slug: string;
  offeringId: string;
  placementId: string;
  launchWeek: string;
  creative?: {
    headline: string;
    subheadline: string;
    cta: string;
    image?: string;
  };
}) {
  const res = await fetchWithTimeout('/api/profile/marketing/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Campaign reservation failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; campaign: MarketingCampaignRun };
}

export async function updateMarketingCampaign(payload: {
  campaignId: string;
  action:
    | 'start-checkout'
    | 'complete-checkout'
    | 'pause'
    | 'resume'
    | 'update-creative'
    | 'submit-creative'
    | 'approve-creative'
    | 'request-creative-changes'
    | 'reject-campaign';
  reviewNotes?: string;
  creative?: {
    headline: string;
    subheadline: string;
    cta: string;
    image?: string;
  };
}) {
  const res = await fetchWithTimeout('/api/profile/marketing/campaigns', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Campaign update failed'));
  const json = await res.json();
  return (json?.data ?? json) as { ok: true; campaign: MarketingCampaignRun; checkoutUrl?: string };
}

export async function fetchMarketingReviewQueue() {
  const res = await fetchWithTimeout('/api/profile/marketing/campaigns?mode=review', { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Marketing review queue request failed'));
  const json = await res.json();
  return (json?.data ?? json) as { campaigns: MarketingCampaignRun[] };
}

export async function trackProfileAnalyticsEvent(payload: {
  profileSlug: string;
  eventName: 'storefront_view' | 'offer_open' | 'bundle_view' | 'reviews_view' | 'message_open';
  pageKind: 'profile' | 'bundle' | 'reviews';
  offeringId?: string;
  bundleId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/profile/analytics/event', blob);
      return;
    }
    await fetchWithTimeout('/api/profile/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    });
  } catch {
    // Analytics must never break user actions.
  }
}
