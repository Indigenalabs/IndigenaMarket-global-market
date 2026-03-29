import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listEthicalAds, updateEthicalAdStatus } from '@/app/lib/ethicalAdvertising';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  return NextResponse.json({ data: await listEthicalAds() });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const record = await updateEthicalAdStatus(
    String(body.id || '').trim(),
    String(body.status || '').trim() as never,
    String(body.reviewNotes || '').trim()
  );
  return NextResponse.json({ record });
}
