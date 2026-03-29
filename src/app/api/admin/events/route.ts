import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listCommunityEventRegistrations, listCommunityEvents, updateCommunityEvent, updateCommunityEventRegistration } from '@/app/lib/eventTicketing';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const [events, registrations] = await Promise.all([
    listCommunityEvents({ includeDrafts: true }),
    listCommunityEventRegistrations()
  ]);
  return NextResponse.json({ events, registrations });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id || '').trim();
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });
  const event = await updateCommunityEvent({
    id,
    status: body.status ? (String(body.status).trim() as never) : undefined,
    featured: typeof body.featured === 'boolean' ? body.featured : undefined,
    sponsor: typeof body.sponsor === 'string' ? body.sponsor.trim() : undefined
  });
  return NextResponse.json({ event });
}

export async function PUT(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id || '').trim();
  const status = String(body.status || '').trim() as never;
  if (!id || !status) return NextResponse.json({ message: 'id and status are required' }, { status: 400 });
  const registration = await updateCommunityEventRegistration({ id, status });
  return NextResponse.json({ registration });
}
