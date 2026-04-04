import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { updateCreatorProfileBasics } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid profile basics payload.' }, { status: 400 });

  const slug = asText(body.slug);
  if (!slug) return NextResponse.json({ message: 'Profile slug is required.' }, { status: 400 });

  const nextBasics = {
    displayName: asText(body.displayName),
    username: asText(body.username),
    location: asText(body.location),
    nation: asText(body.nation),
    bioShort: asText(body.bioShort),
    bioLong: asText(body.bioLong),
    website: asText(body.website),
    languages: asArray(body.languages),
    avatar: asText(body.avatar),
    cover: asText(body.cover)
  };

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to update profile basics.',
    forbiddenMessage: 'You can only update your own profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  if (owner.supabase) {
    const { error } = await owner.supabase
      .from('creator_profiles')
      .update({
        display_name: nextBasics.displayName,
        username: nextBasics.username,
        location: nextBasics.location,
        nation: nextBasics.nation,
        bio_short: nextBasics.bioShort,
        bio_long: nextBasics.bioLong,
        website_url: nextBasics.website,
        languages: nextBasics.languages,
        avatar_url: nextBasics.avatar,
        cover_url: nextBasics.cover,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to update profile basics.' }, { status: 500 });
    }
  }

  return NextResponse.json({ data: { ok: true, profile: updateCreatorProfileBasics(slug, nextBasics) } });
}



