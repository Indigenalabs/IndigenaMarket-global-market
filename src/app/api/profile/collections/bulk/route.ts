import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import {
  updateCreatorProfileCollectionsBulk,
  updateCreatorProfileFeaturedBundle
} from '@/app/profile/data/profileShowcase';

type CollectionOperation = 'publish' | 'hide' | 'feature-bundle' | 'clear-featured-bundle';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid collection merchandising payload.' }, { status: 400 });
  }

  const slug = asText(body.slug);
  const collectionIds = asStringArray(body.collectionIds);
  const bundleId = asText(body.bundleId) || undefined;
  const operation = asText(body.operation) as CollectionOperation;

  if (!slug || !['publish', 'hide', 'feature-bundle', 'clear-featured-bundle'].includes(operation)) {
    return NextResponse.json({ message: 'Valid slug and merchandising operation are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Connect your wallet to manage collections.',
    forbiddenMessage: 'You can only manage your own collections.',
    select: 'owner_actor_id, presentation_settings'
  });
  if ('error' in owner) return owner.error;

  let updatedProfile = owner.fallbackProfile;

  if (owner.supabase) {
    if ((operation === 'publish' || operation === 'hide') && collectionIds.length > 0) {
      const { error } = await owner.supabase
        .from('creator_profile_collections')
        .update({
          visibility: operation === 'publish' ? 'public' : 'private',
          updated_at: new Date().toISOString()
        })
        .in('id', collectionIds)
        .eq('profile_slug', slug);

      if (error) {
        return NextResponse.json({ message: error.message || 'Unable to update collection visibility.' }, { status: 500 });
      }
    }

    if (operation === 'feature-bundle' || operation === 'clear-featured-bundle') {
      const existingPresentation =
        owner.profileRow && typeof owner.profileRow.presentation_settings === 'object' && owner.profileRow.presentation_settings
          ? { ...(owner.profileRow.presentation_settings as Record<string, unknown>) }
          : {};
      const { error } = await owner.supabase
        .from('creator_profiles')
        .update({
          presentation_settings: {
            ...existingPresentation,
            ...(operation === 'feature-bundle'
              ? { featuredBundleId: bundleId }
              : { featuredBundleId: null })
          },
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug);

      if (error) {
        return NextResponse.json({ message: error.message || 'Unable to update featured bundle.' }, { status: 500 });
      }
    }
  }

  if ((operation === 'publish' || operation === 'hide') && collectionIds.length > 0) {
    updatedProfile = updateCreatorProfileCollectionsBulk(slug, collectionIds, operation === 'publish' ? 'public' : 'private');
  }

  if (operation === 'feature-bundle' || operation === 'clear-featured-bundle') {
    updatedProfile = updateCreatorProfileFeaturedBundle(slug, operation === 'feature-bundle' ? bundleId : undefined);
  }

  return NextResponse.json({
    data: {
      ok: true,
      profile: updatedProfile
    }
  });
}
