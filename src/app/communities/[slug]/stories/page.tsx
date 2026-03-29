import { redirect } from 'next/navigation';

export default async function CommunityStoriesArchiveLegacyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/communities/${slug}`);
}
