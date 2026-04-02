import { NextRequest, NextResponse } from 'next/server';
import { createCommunityEvent, listCommunityEvents } from '@/app/lib/eventTicketing';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET() {
  const events = await listCommunityEvents();
  return NextResponse.json({ data: { events } }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid event payload.' }, { status: 400 });
  const actorId = resolveRequestActorId(req);
  if (actorId === 'guest') {
    return NextResponse.json({ message: 'Sign in is required to create an event.' }, { status: 401 });
  }
  const event = await createCommunityEvent({
    title: text(body.title),
    description: text(body.description),
    hostName: text(body.hostName),
    hostAvatar: text(body.hostAvatar),
    createdByActorId: actorId,
    eventType: (text(body.eventType) as never) || 'workshop',
    eventMode: (text(body.eventMode) as never) || 'virtual',
    location: text(body.location),
    startsAt: text(body.startsAt),
    endsAt: text(body.endsAt) || null,
    basePrice: numberValue(body.basePrice),
    currency: text(body.currency) || 'USD',
    capacity: body.capacity === null || body.capacity === undefined ? null : numberValue(body.capacity),
    livestreamEnabled: Boolean(body.livestreamEnabled),
    vipAddonPrice: numberValue(body.vipAddonPrice),
    image: text(body.image),
    sponsor: text(body.sponsor)
  });
  return NextResponse.json({ data: { event } }, { status: 201 });
}



