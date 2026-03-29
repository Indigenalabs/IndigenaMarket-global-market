import { NextResponse } from 'next/server';
import { getCommunityEventById, listCommunityEventRegistrations } from '@/app/lib/eventTicketing';

export async function GET(_: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  const event = await getCommunityEventById(eventId);
  if (!event) return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
  const registrations = await listCommunityEventRegistrations(event.id);
  return NextResponse.json({ data: { event, registrations } }, { status: 200 });
}
