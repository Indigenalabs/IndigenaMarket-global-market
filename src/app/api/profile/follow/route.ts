import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';

export async function POST(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  if (!actorId || actorId === 'guest') {
    return NextResponse.json({ message: 'Sign in required to follow creators.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { profileSlug?: string; action?: 'follow' | 'unfollow' };
  const profileSlug = String(body.profileSlug || '').trim();
  const action = body.action === 'unfollow' ? 'unfollow' : 'follow';

  if (!profileSlug) {
    return NextResponse.json({ message: 'profileSlug is required.' }, { status: 400 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({
      data: {
        profileSlug,
        isFollowing: action === 'follow',
        followerCount: action === 'follow' ? 1235 : 1234
      }
    });
  }

  const supabase = createSupabaseServerClient();

  if (action === 'follow') {
    const { error } = await supabase.from('creator_profile_follows').upsert(
      { profile_slug: profileSlug, follower_actor_id: actorId },
      { onConflict: 'profile_slug,follower_actor_id', ignoreDuplicates: true }
    );
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('creator_profile_follows')
      .delete()
      .eq('profile_slug', profileSlug)
      .eq('follower_actor_id', actorId);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const { count, error: countError } = await supabase
    .from('creator_profile_follows')
    .select('*', { count: 'exact', head: true })
    .eq('profile_slug', profileSlug);
  if (countError) return NextResponse.json({ message: countError.message }, { status: 500 });

  return NextResponse.json({
    data: {
      profileSlug,
      isFollowing: action === 'follow',
      followerCount: Number(count ?? 0)
    }
  });
}



