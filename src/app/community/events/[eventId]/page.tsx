import CommunityEventDetailClient from '@/app/community/events/CommunityEventDetailClient';

export default async function CommunityEventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <CommunityEventDetailClient eventId={eventId} />;
}
