import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner, requirePlatformAccountAccess, requireVerifiedSellerForActor } from '@/app/lib/creatorProfileAccess';
import { buildCommunityPublishingMetadata, resolveCommunitySplitRule } from '@/app/lib/communityPublishing';
import type { PlatformAccountRecord } from '@/app/lib/platformAccounts';
import { updateCreatorProfileOfferingDetails, type ProfileOffering } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid listing payload.' }, { status: 400 });

  const slug = asText(body.slug);
  const offeringId = asText(body.offeringId);
  const accountSlug = asText(body.accountSlug);
  if (!slug || !offeringId) {
    return NextResponse.json({ message: 'Profile slug and offering id are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to edit a listing.',
    forbiddenMessage: 'You can only edit your own listings.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  const status = asText(body.status);
  const featured = Boolean(body.featured);
  const requiresVerifiedSeller = ['Active', 'Bookable', 'Enrolling', 'Waitlist'].includes(status) || featured;
  let publishingAccount: { account: PlatformAccountRecord } | null = null;
  let selectedSplitRule = null;
  if (accountSlug) {
    const accountAccess = await requirePlatformAccountAccess(req, accountSlug, {
      guestMessage: 'Sign in to publish for a community storefront.',
      forbiddenMessage: 'You are not allowed to publish for this community storefront.',
      requiredPermissions: ['publish']
    });
    if ('error' in accountAccess) return accountAccess.error;
    publishingAccount = accountAccess;
    selectedSplitRule = resolveCommunitySplitRule(accountAccess.splitRules, asText(body.splitRuleId) || undefined);
    if (asText(body.splitRuleId) && !selectedSplitRule) {
      return NextResponse.json({ message: 'Select an active community split rule for this storefront.' }, { status: 400 });
    }
    if (requiresVerifiedSeller && accountAccess.account.verificationStatus !== 'approved') {
      return NextResponse.json({ message: 'This community storefront must be approved before you can publish listings under it.' }, { status: 403 });
    }
  }
  if (requiresVerifiedSeller) {
    const sellerGate = await requireVerifiedSellerForActor(owner.actorId, {
      forbiddenMessage: 'Verification approval is required before you can publish or feature a listing.'
    });
    if ('error' in sellerGate) return sellerGate.error;
  }

  const fallbackMetadata = owner.fallbackProfile.offerings.find((entry) => entry.id === offeringId)?.metadata || [];
  let nextMetadata = buildCommunityPublishingMetadata(fallbackMetadata, publishingAccount?.account || null, selectedSplitRule);

  if (owner.supabase) {
    const { data: existingOffering } = await owner.supabase
      .from('creator_profile_offerings')
      .select('metadata')
      .eq('id', offeringId)
      .eq('profile_slug', slug)
      .maybeSingle();
    nextMetadata = buildCommunityPublishingMetadata(
      (existingOffering?.metadata as string[] | undefined) || fallbackMetadata,
      publishingAccount?.account || null,
      selectedSplitRule
    );

    const { error } = await owner.supabase
      .from('creator_profile_offerings')
      .update({
        title: asText(body.title),
        blurb: asText(body.blurb),
        price_label: asText(body.priceLabel),
        status: asText(body.status),
        cover_image_url: asText(body.coverImage),
        cta_mode: ['view', 'buy', 'book', 'enroll', 'quote', 'message'].includes(asText(body.ctaMode)) ? asText(body.ctaMode) : 'view',
        cta_preset: ['collect-now', 'book-now', 'enroll-now', 'request-quote', 'message-first'].includes(asText(body.ctaPreset)) ? asText(body.ctaPreset) : null,
        merchandising_rank: Number.isFinite(Number(body.merchandisingRank)) ? Number(body.merchandisingRank) : 0,
        gallery_order: Array.isArray(body.galleryOrder) ? body.galleryOrder : [],
        launch_window_starts_at: asText(body.launchWindowStartsAt) || null,
        launch_window_ends_at: asText(body.launchWindowEndsAt) || null,
        availability_label: asText(body.availabilityLabel),
        availability_tone: (['default', 'success', 'warning', 'danger'].includes(asText(body.availabilityTone)) ? asText(body.availabilityTone) : 'default'),
        featured: Boolean(body.featured),
        metadata: nextMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', offeringId)
      .eq('profile_slug', slug);

    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to save listing changes.' }, { status: 500 });
    }
  }

  const profile = updateCreatorProfileOfferingDetails(slug, offeringId, {
    title: asText(body.title),
    blurb: asText(body.blurb),
    priceLabel: asText(body.priceLabel),
    status: asText(body.status),
    coverImage: asText(body.coverImage),
    ctaMode: (['view', 'buy', 'book', 'enroll', 'quote', 'message'].includes(asText(body.ctaMode)) ? asText(body.ctaMode) : 'view') as ProfileOffering['ctaMode'],
    ctaPreset: (['collect-now', 'book-now', 'enroll-now', 'request-quote', 'message-first'].includes(asText(body.ctaPreset)) ? asText(body.ctaPreset) : undefined) as ProfileOffering['ctaPreset'],
    merchandisingRank: Number.isFinite(Number(body.merchandisingRank)) ? Number(body.merchandisingRank) : 0,
    galleryOrder: Array.isArray(body.galleryOrder) ? (body.galleryOrder as string[]) : [],
    launchWindowStartsAt: asText(body.launchWindowStartsAt),
    launchWindowEndsAt: asText(body.launchWindowEndsAt),
    availabilityLabel: asText(body.availabilityLabel),
    availabilityTone: (['default', 'success', 'warning', 'danger'].includes(asText(body.availabilityTone)) ? asText(body.availabilityTone) : 'default') as 'default' | 'success' | 'warning' | 'danger',
    featured: Boolean(body.featured),
    metadata: nextMetadata
  });

  return NextResponse.json({ data: { ok: true, profile } });
}



