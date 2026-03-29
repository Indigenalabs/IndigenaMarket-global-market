import { NextRequest, NextResponse } from 'next/server';
import { listEnterpriseContractAccessLogs } from '@/app/lib/enterpriseContractAccessLog';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';

export async function GET(req: NextRequest) {
  const admin = await requirePlatformAdmin(req);
  if (admin.error) return admin.error;
  const limit = Math.max(1, Math.min(200, Number(req.nextUrl.searchParams.get('limit') || 50) || 50));
  const path = String(req.nextUrl.searchParams.get('path') || '').trim();
  const logs = await listEnterpriseContractAccessLogs({
    limit,
    contractStoragePath: path || undefined
  });
  return NextResponse.json({ data: { logs } }, { status: 200 });
}
