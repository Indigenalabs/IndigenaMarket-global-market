import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/app/lib/supabase/server';
import { requireCreatorProfileOwner, requirePlatformAccountAccess, requireVerifiedSellerForActor } from '@/app/lib/creatorProfileAccess';
import { buildCommunityPublishingMetadata, resolveCommunitySplitRule } from '@/app/lib/communityPublishing';
import { appendCreatorProfileOffering, type ProfileOffering, type ProfilePillarId } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asTone(value: unknown): ProfileOffering['availabilityTone'] {
  return ['default', 'success', 'warning', 'danger'].includes(asText(value))
    ? (value as ProfileOffering['availabilityTone'])
    : 'default';
}

function asCtaMode(value: unknown): NonNullable<ProfileOffering['ctaMode']> {
  return ['view', 'buy', 'book', 'enroll', 'quote', 'message'].includes(asText(value))
    ? (value as NonNullable<ProfileOffering['ctaMode']>)
    : 'view';
}

function asCtaPreset(value: unknown): ProfileOffering['ctaPreset'] {
  return ['collect-now', 'book-now', 'enroll-now', 'request-quote', 'message-first'].includes(asText(value))
    ? (value as ProfileOffering['ctaPreset'])
    : undefined;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad('Invalid listing payload.');

  const slug = asText(body.slug);
  const accountSlug = asText(body.accountSlug);
  if (!slug) return bad('Profile slug is required.');

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to create a listing.',
    forbiddenMessage: 'You can only create listings for your own profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  const status = asText(body.status, 'Draft');
  const featured = Boolean(body.featured);
  const requiresVerifiedSeller = ['Active', 'Bookable', 'Enrolling', 'Waitlist', 'Under review'].includes(status) || featured;

  let publishingAccount: Awaited<ReturnType<typeof requirePlatformAccountAccess>> | null = null;
  let splitRule = null;
  if (accountSlug) {
    const accountAccess = await requirePlatformAccountAccess(req, accountSlug, {
      guestMessage: 'Sign in to publish for a community storefront.',
      forbiddenMessage: 'You are not allowed to publish for this community storefront.',
      requiredPermissions: ['publish']
    });
    if ('error' in accountAccess) return accountAccess.error;
    publishingAccount = accountAccess;
    splitRule = resolveCommunitySplitRule(accountAccess.splitRules, asText(body.splitRuleId) || undefined);
    if (asText(body.splitRuleId) && !splitRule) {
      return bad('Select an active community split rule for this storefront.', 400);
    }
    if (requiresVerifiedSeller && accountAccess.account.verificationStatus !== 'approved') {
      return bad('This community storefront must be approved before you can publish listings under it.', 403);
    }
  }

  if (requiresVerifiedSeller) {
    const sellerGate = await requireVerifiedSellerForActor(owner.actorId, {
      forbiddenMessage: 'Verification approval is required before you can publish or feature a listing.'
    });
    if ('error' in sellerGate) return sellerGate.error;
  }

  const offeringId = asText(body.offeringId) || `offering-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const galleryOrder = Array.isArray(body.galleryOrder) ? body.galleryOrder.filter((entry): entry is string => typeof entry === 'string') : [];
  const metadata = buildCommunityPublishingMetadata(
    Array.isArray(body.metadata) ? body.metadata.filter((entry): entry is string => typeof entry === 'string') : [],
    publishingAccount && 'account' in publishingAccount ? publishingAccount.account : null,
    splitRule
  );

  if (owner.supabase) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('creator_profile_offerings').insert({
      id: offeringId,
      profile_slug: slug,
      title: asText(body.title, 'Untitled listing'),
      pillar: asText(body.pillar),
      pillar_label: asText(body.pillarLabel),
      icon: asText(body.icon),
      offering_type: asText(body.offeringType, 'Draft'),
      price_label: asText(body.priceLabel),
      image_url: asText(body.image),
      cover_image_url: asText(body.coverImage) || asText(body.image),
      href: asText(body.href),
      blurb: asText(body.blurb),
      status,
      cta_mode: asCtaMode(body.ctaMode),
      cta_preset: asCtaPreset(body.ctaPreset) || null,
      merchandising_rank: Number.isFinite(Number(body.merchandisingRank)) ? Number(body.merchandisingRank) : 0,
      gallery_order: galleryOrder,
      launch_window_starts_at: asText(body.launchWindowStartsAt) || null,
      launch_window_ends_at: asText(body.launchWindowEndsAt) || null,
      availability_label: asText(body.availabilityLabel),
      availability_tone: asTone(body.availabilityTone),
      featured: featured,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to create listing.' }, { status: 500 });
    }

    await supabase.from('creator_profile_activities').insert({
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      profile_slug: slug,
      type: 'listing',
      title: asText(body.title, 'Untitled listing'),
      detail: `Created a ${asText(body.pillarLabel, 'creator')} listing`,
      ago: 'Just now',
      created_at: new Date().toISOString()
    });
  }

  const offering: ProfileOffering = {
    id: offeringId,
    title: asText(body.title, 'Untitled listing'),
    pillar: asText(body.pillar) as ProfilePillarId,
    pillarLabel: asText(body.pillarLabel),
    icon: asText(body.icon),
    type: asText(body.offeringType, 'Draft'),
    priceLabel: asText(body.priceLabel),
    image: asText(body.image),
    href: asText(body.href),
    blurb: asText(body.blurb),
    status,
    coverImage: asText(body.coverImage) || asText(body.image),
    ctaMode: asCtaMode(body.ctaMode),
    ctaPreset: asCtaPreset(body.ctaPreset),
    merchandisingRank: Number.isFinite(Number(body.merchandisingRank)) ? Number(body.merchandisingRank) : 0,
    galleryOrder,
    launchWindowStartsAt: asText(body.launchWindowStartsAt),
    launchWindowEndsAt: asText(body.launchWindowEndsAt),
    availabilityLabel: asText(body.availabilityLabel),
    availabilityTone: asTone(body.availabilityTone),
    featured,
    metadata
  };

  const profile = appendCreatorProfileOffering(slug, offering, {
    type: 'listing',
    title: offering.title,
    detail: `Created a ${offering.pillarLabel} listing`,
    ago: 'Just now'
  });

  return NextResponse.json({ data: { ok: true, offeringId, offering, profile } });
}
