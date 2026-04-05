import { NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { listCommunityMarketplaceOffers } from '@/app/lib/communityMarketplace';

type R = Record<string, unknown>;

function fallbackForums() { return [{ forumId: 'f-1', title: 'Welcome Circle', replyCount: 12, views: 140 }]; }
function fallbackEvents() { return [{ eventId: 'e-1', title: 'Community Gathering' }]; }
function fallbackStories() { return [{ storyId: 's-1', author: { name: 'Community Member', avatar: '', verified: true, role: 'Member' }, content: 'Welcome to Indigena.', likes: 8, comments: 2, shares: 1, tags: ['community'], createdAt: new Date().toISOString() }]; }
function fallbackMentors() { return [{ mentorId: 'm-1', name: 'Mentor' }]; }

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  const url = new URL(_req.url);

  if (!isSupabaseServerConfigured()) {
    if (a === 'marketplace') {
      return NextResponse.json({ data: await listCommunityMarketplaceOffers({ pillar: url.searchParams.get('pillar') || '', search: url.searchParams.get('q') || '' }) });
    }
    if (a === 'forums') return NextResponse.json({ data: fallbackForums(), totalMembers: 1200 });
    if (a === 'events') return NextResponse.json({ data: fallbackEvents() });
    if (a === 'stories') return NextResponse.json({ data: fallbackStories() });
    if (a === 'mentors') return NextResponse.json({ data: fallbackMentors() });
    return NextResponse.json({ message: 'Unsupported community endpoint' }, { status: 404 });
  }

  const supabase = createSupabaseServerClient();
  if (a === 'marketplace') {
    return NextResponse.json({ data: await listCommunityMarketplaceOffers({ pillar: url.searchParams.get('pillar') || '', search: url.searchParams.get('q') || '' }) });
  }
  if (a === 'forums') {
    const { data } = await supabase.from('community_forums').select('*').order('created_at', { ascending: false }).limit(100);
    return NextResponse.json({ data: (data || []).map((r: any) => ({ forumId: r.id, title: r.title, replyCount: Number(r.replies || 0), views: Number(r.views || 0) })), totalMembers: 1200 });
  }
  if (a === 'events') {
    const { data } = await supabase.from('community_events').select('*').order('created_at', { ascending: false }).limit(100);
    return NextResponse.json({ data: (data || []).map((r: any) => ({ eventId: r.id, title: r.title, startsAt: r.starts_at, location: r.location })) });
  }
  if (a === 'stories') {
    const { data } = await supabase.from('community_stories').select('*').order('created_at', { ascending: false }).limit(100);
    return NextResponse.json({ data: (data || []).map((r: any) => ({ storyId: r.id, author: { name: r.author_name, avatar: r.author_avatar, verified: !!r.author_verified, role: r.author_role }, content: r.content, image: r.image, likes: Number(r.likes || 0), comments: Number(r.comments || 0), shares: Number(r.shares || 0), tags: Array.isArray(r.tags) ? r.tags : [], createdAt: r.created_at })) });
  }
  if (a === 'mentors') {
    const { data } = await supabase.from('community_mentors').select('*').order('created_at', { ascending: false }).limit(100);
    return NextResponse.json({ data: (data || []).map((r: any) => ({ mentorId: r.id, name: r.name, skill: r.skill, nation: r.nation })) });
  }

  return NextResponse.json({ message: 'Unsupported community endpoint' }, { status: 404 });
}
