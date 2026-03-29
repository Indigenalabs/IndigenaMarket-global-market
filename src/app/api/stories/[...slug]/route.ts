import { NextResponse } from 'next/server';
import { getStoryBySlug, listStories, listStoriesByCommunitySlug } from '@/app/lib/storyPlatform';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (!a) return NextResponse.json({ data: await listStories() });
  if (a === 'community' && b) return NextResponse.json({ data: await listStoriesByCommunitySlug(b) });
  if (a === 'post' && b) {
    const data = await getStoryBySlug(b);
    if (!data) return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    return NextResponse.json({ data });
  }
  return NextResponse.json({ message: 'Unsupported stories endpoint' }, { status: 404 });
}
