import { NextRequest, NextResponse } from 'next/server';
import { getCommunityEventById, listCommunityEventRegistrations, listCommunityEvents, registerForCommunityEvent } from '@/app/lib/eventTicketing';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(_: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  if (slug.length === 0) {
    const events = await listCommunityEvents();
    return NextResponse.json({ data: { events } }, { status: 200 });
  }
  const [first] = slug;
  const event = await getCommunityEventById(first);
  if (!event) return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
  const registrations = await listCommunityEventRegistrations(event.id);
  return NextResponse.json({ data: { event, registrations } }, { status: 200 });
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  if (slug[0] !== 'register') return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid registration payload.' }, { status: 400 });
  const result = await registerForCommunityEvent({
    eventId: text(body.eventId),
    attendeeName: text(body.attendeeName),
    attendeeEmail: text(body.attendeeEmail),
    tier: (text(body.tier) as 'general' | 'vip' | 'livestream') || 'general',
    quantity: Math.max(1, numberValue(body.quantity) || 1)
  });
  return NextResponse.json({ data: result }, { status: 201 });
}
