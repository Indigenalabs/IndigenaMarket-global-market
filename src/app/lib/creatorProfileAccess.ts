import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import { getSellerPermissionsForActor } from '@/app/lib/indigenousVerification';
import { getCreatorProfileBySlug } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export async function requireCreatorProfileOwner(
  req: NextRequest,
  slug: string,
  options?: {
    guestMessage?: string;
    forbiddenMessage?: string;
    select?: string;
  }
) {
  const actorId = resolveRequestActorId(req);
  if (actorId === 'guest') {
    return {
      error: NextResponse.json(
        { message: options?.guestMessage || 'Sign in to manage this creator profile.' },
        { status: 401 }
      )
    };
  }

  const fallbackProfile = getCreatorProfileBySlug(slug);
  const fallbackOwnerActorId = fallbackProfile.slug;

  if (!isSupabaseServerConfigured()) {
    return {
      actorId,
      fallbackProfile,
      fallbackOwnerActorId,
      supabase: null,
      profileRow: null
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: profileRow, error } = await supabase
    .from('creator_profiles')
    .select(options?.select || '*')
    .eq('slug', slug)
    .single();

  if (error || !profileRow) {
    return {
      error: NextResponse.json({ message: 'Creator profile not found.' }, { status: 404 })
    };
  }

  const profileRecord = profileRow as unknown as Record<string, unknown>;
  const ownerActorId = asText(profileRecord.owner_actor_id, fallbackOwnerActorId);
  if (actorId !== ownerActorId) {
    return {
      error: NextResponse.json(
        { message: options?.forbiddenMessage || 'You can only manage your own creator profile.' },
        { status: 403 }
      )
    };
  }

  return {
    actorId,
    fallbackProfile,
    fallbackOwnerActorId,
    supabase,
    profileRow: profileRecord
  };
}

export async function requireVerifiedSellerForActor(
  actorId: string,
  options?: {
    forbiddenMessage?: string;
  }
) {
  const permissions = await getSellerPermissionsForActor({ actorId });
  if (!permissions.canSell) {
    return {
      error: NextResponse.json(
        {
          message:
            options?.forbiddenMessage ||
            'Verification approval is required before you can publish or sell through this creator profile.'
        },
        { status: 403 }
      )
    };
  }

  return { permissions };
}
