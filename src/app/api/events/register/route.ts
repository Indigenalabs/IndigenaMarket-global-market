import { NextRequest, NextResponse } from 'next/server';
import { registerForCommunityEvent } from '@/app/lib/eventTicketing';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(req: NextRequest) {
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
