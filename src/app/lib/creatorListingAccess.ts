import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { getActorEntitlements } from '@/app/lib/subscriptionState';
import { getCreatorPlanCapabilities } from '@/app/lib/creatorEntitlements';
import { getCreatorProfileBySlug } from '@/app/profile/data/profileShowcase';

export async function enforceCreatorListingCapacityForActor(input: {
  actorId: string;
  walletAddress?: string;
  fallbackProfileSlug?: string;
  currentCount?: number;
}) {
  const entitlements = await getActorEntitlements(input.actorId, input.walletAddress || '');
  const capabilities = getCreatorPlanCapabilities(entitlements.creatorPlanId);
  if (capabilities.maxListings === null) {
    return { entitlements, capabilities, currentCount: input.currentCount ?? 0 };
  }

  let currentCount = input.currentCount ?? 0;
  if (typeof input.currentCount !== 'number') {
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const profileRow = await supabase
        .from('creator_profiles')
        .select('slug')
        .eq('owner_actor_id', input.actorId)
        .maybeSingle();
      const profileSlug = String((profileRow.data as { slug?: string } | null)?.slug || input.fallbackProfileSlug || '');
      if (profileSlug) {
        const countRow = await supabase
          .from('creator_profile_offerings')
          .select('*', { count: 'exact', head: true })
          .eq('profile_slug', profileSlug);
        currentCount = Number(countRow.count || 0);
      }
    } else if (input.fallbackProfileSlug) {
      currentCount = getCreatorProfileBySlug(input.fallbackProfileSlug).offerings.length;
    }
  }

  if (currentCount >= capabilities.maxListings) {
    throw new Error(`Creator Free supports up to ${capabilities.maxListings} active listings. Upgrade to Creator or Studio for unlimited listings.`);
  }

  return { entitlements, capabilities, currentCount };
}
