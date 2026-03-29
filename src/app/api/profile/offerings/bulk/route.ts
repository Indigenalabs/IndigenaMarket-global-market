import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
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

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid bulk listing payload.' }, { status: 400 });
  }

  const slug = asText(body.slug);
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
    guestMessage: 'Connect your wallet to manage listings.',
    forbiddenMessage: 'You can only manage your own listings.',
    select: 'owner_actor_id, presentation_settings'
  });
  if ('error' in owner) return owner.error;

  const nextState = resolveNextState(operation);
  let nextFeaturedIds = [...(owner.fallbackProfile.presentation.featuredOfferingIds ?? [])];

  if (operation === 'feature') {
    nextFeaturedIds = Array.from(new Set([...offeringIds, ...nextFeaturedIds])).slice(0, 3);
  } else if (operation === 'unfeature') {
    nextFeaturedIds = nextFeaturedIds.filter((id) => !offeringIds.includes(id));
  }

  if (owner.supabase) {
    const { error: offeringsError } = await owner.supabase
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

  const updatedProfile = updateCreatorProfileOfferingsBulk(slug, offeringIds, nextState);
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
