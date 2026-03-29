import { redirect } from 'next/navigation';

export default async function EventRedirect({
  params
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  redirect(`/community/events/${encodeURIComponent(eventId)}`);
}
