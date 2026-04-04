import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import {
  type ProfilePresentationSettings,
  updateCreatorProfilePresentation
} from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asBool(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid profile presentation payload.' }, { status: 400 });
  }

  const slug = asText(body.slug);
  if (!slug) {
    return NextResponse.json({ message: 'Profile slug is required.' }, { status: 400 });
  }

  const nextPresentation: ProfilePresentationSettings = {
    leadTab: (['shop', 'about', 'bundles', 'collections', 'activity'].includes(asText(body.leadTab))
      ? asText(body.leadTab)
      : 'shop') as ProfilePresentationSettings['leadTab'],
    leadSection: (['story', 'reviews', 'bundles'].includes(asText(body.leadSection))
      ? asText(body.leadSection)
      : 'story') as ProfilePresentationSettings['leadSection'],
    featuredBundleId: asText(body.featuredBundleId) || undefined,
    featuredOfferingIds: asStringArray(body.featuredOfferingIds),
    showFeaturedReviews: asBool(body.showFeaturedReviews, true),
    showTrustSignals: asBool(body.showTrustSignals, true)
  };

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to update profile presentation.',
    forbiddenMessage: 'You can only customize your own profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  if (owner.supabase) {
    const { error } = await owner.supabase
      .from('creator_profiles')
      .update({
        presentation_settings: nextPresentation,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to save profile presentation.' }, { status: 500 });
    }
  }

  return NextResponse.json({ data: { ok: true, presentation: nextPresentation } });
}



