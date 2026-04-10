import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestIdentity } from '@/app/lib/requestIdentity';
import { getSellerPermissionsForActor } from '@/app/lib/indigenousVerification';
import { getCreatorProfileBySlug } from '@/app/profile/data/profileShowcase';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';

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

export async function requirePlatformAccountAccess(
  req: NextRequest,
  accountSlug: string,
  options?: {
    guestMessage?: string;
    forbiddenMessage?: string;
    requiredPermissions?: string[];
  }
) {
  const identity = await resolveRequestIdentity(req).catch(() => null);
  const actorId = identity?.actorId || resolveRequestActorId(req);
  if (!actorId || actorId === 'guest') {
    return {
      error: NextResponse.json(
        { message: options?.guestMessage || 'Sign in to manage this community storefront.' },
        { status: 401 }
      )
    };
  }

  const accountData = await getPlatformAccountBySlug(accountSlug);
  if (!accountData) {
    return {
      error: NextResponse.json({ message: 'Community storefront not found.' }, { status: 404 })
    };
  }

  const member = accountData.members.find((entry) => entry.actorId.trim().toLowerCase() === actorId.trim().toLowerCase()) || null;
  if (!member) {
    return {
      error: NextResponse.json(
        { message: options?.forbiddenMessage || 'You are not an authorized operator for this community storefront.' },
        { status: 403 }
      )
    };
  }

  const requiredPermissions = options?.requiredPermissions || [];
  if (requiredPermissions.length && !requiredPermissions.every((permission) => member.permissions.includes(permission))) {
    return {
      error: NextResponse.json(
        { message: options?.forbiddenMessage || 'You do not have permission to perform this community storefront action.' },
        { status: 403 }
      )
    };
  }

  return {
    actorId,
    account: accountData.account,
    member,
    verification: accountData.verification,
    splitRules: accountData.splitRules
  };
}
