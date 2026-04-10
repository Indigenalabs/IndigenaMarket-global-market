import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner, requirePlatformAccountAccess, requireVerifiedSellerForActor } from '@/app/lib/creatorProfileAccess';
import { buildCommunityPublishingMetadata } from '@/app/lib/communityPublishing';
import {
  updateCreatorProfileOfferingsBulk,
  updateCreatorProfilePresentation
} from '@/app/profile/data/profileShowcase';

type BulkOperation =
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

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function resolveNextState(operation: BulkOperation) {
  switch (operation) {
    case 'activate':
      return { status: 'Active', availabilityLabel: 'Available now', availabilityTone: 'success' as const };
    case 'pause':
      return { status: 'Paused', availabilityLabel: 'Temporarily paused', availabilityTone: 'default' as const };
    case 'archive':
      return { status: 'Archived', availabilityLabel: 'Archived', availabilityTone: 'danger' as const };
    case 'feature':
      return { featured: true };
    case 'unfeature':
      return { featured: false };
    case 'set-available':
      return { status: 'Active', availabilityLabel: 'Available now', availabilityTone: 'success' as const };
    case 'set-limited':
      return { status: 'Active', availabilityLabel: 'Limited release', availabilityTone: 'warning' as const };
    case 'set-waitlist':
      return { status: 'Waitlist', availabilityLabel: 'Join waitlist', availabilityTone: 'warning' as const };
    case 'set-bookable':
      return { status: 'Bookable', availabilityLabel: 'Bookable now', availabilityTone: 'success' as const };
    case 'set-enrolling':
      return { status: 'Enrolling', availabilityLabel: 'Open enrollment', availabilityTone: 'success' as const };
    default:
      return {};
  }
}

function operationRequiresVerifiedSeller(operation: BulkOperation) {
  return [
    'activate',
    'feature',
    'set-available',
    'set-limited',
    'set-waitlist',
    'set-bookable',
    'set-enrolling'
  ].includes(operation);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid bulk listing payload.' }, { status: 400 });
  }

  const slug = asText(body.slug);
  const accountSlug = asText(body.accountSlug);
  const offeringIds = asStringArray(body.offeringIds);
  const operation = asText(body.operation) as BulkOperation;

  if (
    !slug ||
    !offeringIds.length ||
    ![
      'activate',
      'pause',
      'archive',
      'feature',
      'unfeature',
      'set-available',
      'set-limited',
      'set-waitlist',
      'set-bookable',
      'set-enrolling'
    ].includes(operation)
  ) {
    return NextResponse.json({ message: 'Valid slug, offering ids, and bulk operation are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to manage listings.',
    forbiddenMessage: 'You can only manage your own listings.',
    select: 'owner_actor_id, presentation_settings'
  });
  if ('error' in owner) return owner.error;

  if (operationRequiresVerifiedSeller(operation)) {
    if (accountSlug) {
      const accountAccess = await requirePlatformAccountAccess(req, accountSlug, {
        guestMessage: 'Sign in to publish for a community storefront.',
        forbiddenMessage: 'You are not allowed to publish for this community storefront.',
        requiredPermissions: ['publish']
      });
      if ('error' in accountAccess) return accountAccess.error;
      if (accountAccess.account.verificationStatus !== 'approved') {
        return NextResponse.json({ message: 'This community storefront must be approved before you can publish listings under it.' }, { status: 403 });
      }
    }
    const sellerGate = await requireVerifiedSellerForActor(owner.actorId, {
      forbiddenMessage: 'Verification approval is required before you can publish or feature listings.'
    });
    if ('error' in sellerGate) return sellerGate.error;
  }

  const nextState = resolveNextState(operation);
  let nextFeaturedIds = [...(owner.fallbackProfile.presentation.featuredOfferingIds ?? [])];

  if (operation === 'feature') {
    nextFeaturedIds = Array.from(new Set([...offeringIds, ...nextFeaturedIds])).slice(0, 3);
  } else if (operation === 'unfeature') {
    nextFeaturedIds = nextFeaturedIds.filter((id) => !offeringIds.includes(id));
  }

  if (owner.supabase) {
    let offeringsError: { message?: string } | null = null;
    if (accountSlug) {
      const accountAccess = await requirePlatformAccountAccess(req, accountSlug, {
        guestMessage: 'Sign in to publish for a community storefront.',
        forbiddenMessage: 'You are not allowed to publish for this community storefront.',
        requiredPermissions: ['publish']
      });
      if ('error' in accountAccess) return accountAccess.error;

      const { data: rows } = await owner.supabase
        .from('creator_profile_offerings')
        .select('id,metadata')
        .in('id', offeringIds)
        .eq('profile_slug', slug);

      await Promise.all(
        (rows || []).map(async (row) => {
          const { error } = await owner.supabase
            .from('creator_profile_offerings')
            .update({
              ...(nextState.status ? { status: nextState.status } : {}),
              ...(nextState.availabilityLabel ? { availability_label: nextState.availabilityLabel } : {}),
              ...(nextState.availabilityTone ? { availability_tone: nextState.availabilityTone } : {}),
              ...(typeof nextState.featured === 'boolean' ? { featured: nextState.featured } : {}),
              metadata: buildCommunityPublishingMetadata((row.metadata as string[] | undefined) || [], accountAccess.account),
              updated_at: new Date().toISOString()
            })
            .eq('id', String(row.id || ''))
            .eq('profile_slug', slug);
          if (error && !offeringsError) offeringsError = error;
        })
      );
    } else {
      const { error } = await owner.supabase
        .from('creator_profile_offerings')
        .update({
          ...(nextState.status ? { status: nextState.status } : {}),
          ...(nextState.availabilityLabel ? { availability_label: nextState.availabilityLabel } : {}),
          ...(nextState.availabilityTone ? { availability_tone: nextState.availabilityTone } : {}),
          ...(typeof nextState.featured === 'boolean' ? { featured: nextState.featured } : {}),
          updated_at: new Date().toISOString()
        })
        .in('id', offeringIds)
        .eq('profile_slug', slug);
      offeringsError = error;
    }

    if (offeringsError) {
      return NextResponse.json({ message: offeringsError.message || 'Unable to update listings.' }, { status: 500 });
    }

    if (operation === 'feature' || operation === 'unfeature') {
      const existingPresentation =
        owner.profileRow && typeof owner.profileRow.presentation_settings === 'object' && owner.profileRow.presentation_settings
          ? { ...(owner.profileRow.presentation_settings as Record<string, unknown>) }
          : {};
      const { error: presentationError } = await owner.supabase
        .from('creator_profiles')
        .update({
          presentation_settings: {
            ...existingPresentation,
            featuredOfferingIds: nextFeaturedIds
          },
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug);
      if (presentationError) {
        return NextResponse.json({ message: presentationError.message || 'Unable to update featured items.' }, { status: 500 });
      }
    }
  }

  const publishingAccount =
    accountSlug
      ? await requirePlatformAccountAccess(req, accountSlug, {
          guestMessage: 'Sign in to publish for a community storefront.',
          forbiddenMessage: 'You are not allowed to publish for this community storefront.',
          requiredPermissions: ['publish']
        }).catch(() => null)
      : null;
  const updatedProfile = updateCreatorProfileOfferingsBulk(slug, offeringIds, {
    ...nextState,
    ...(publishingAccount && !('error' in publishingAccount)
      ? {
          metadata: buildCommunityPublishingMetadata(undefined, publishingAccount.account)
        }
      : {})
  });
  const updatedPresentation =
    operation === 'feature' || operation === 'unfeature'
      ? updateCreatorProfilePresentation(slug, { featuredOfferingIds: nextFeaturedIds }).presentation
      : updatedProfile.presentation;

  return NextResponse.json({
    data: {
      ok: true,
      profile: {
        ...updatedProfile,
        presentation: updatedPresentation
      }
    }
  });
}



