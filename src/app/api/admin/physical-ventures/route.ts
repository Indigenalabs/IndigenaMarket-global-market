import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listPhysicalVentures, updatePhysicalVentureStatus } from '@/app/lib/physicalVentures';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  return NextResponse.json({ data: await listPhysicalVentures() });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const record = await updatePhysicalVentureStatus(String(body.id || '').trim(), String(body.status || '').trim() as never);
  return NextResponse.json({ record });
}
