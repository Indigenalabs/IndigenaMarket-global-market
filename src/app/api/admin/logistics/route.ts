import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listLogisticsData, updateFulfillmentStatus, updateInsuranceClaimStatus } from '@/app/lib/logisticsOps';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const data = await listLogisticsData();
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const entity = String(body.entity || '').trim();
  const id = String(body.id || '').trim();
  const status = String(body.status || '').trim();
  if (!entity || !id || !status) return NextResponse.json({ message: 'entity, id, and status are required' }, { status: 400 });
  if (entity === 'claim') {
    const claim = await updateInsuranceClaimStatus(id, status as never);
    return NextResponse.json({ claim });
  }
  if (entity === 'fulfillment') {
    const fulfillment = await updateFulfillmentStatus(id, status as never);
    return NextResponse.json({ fulfillment });
  }
  return NextResponse.json({ message: 'Unsupported logistics entity' }, { status: 400 });
}
