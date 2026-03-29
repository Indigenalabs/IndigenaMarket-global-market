import { NextRequest, NextResponse } from 'next/server';
import { listArchiveAccessLogs, summarizeArchiveAccessAnomalies } from '@/app/lib/archiveAccessLogs';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;

  const actorFilter = String(req.nextUrl.searchParams.get('actorId') || '').trim().toLowerCase();
  const actionFilter = String(req.nextUrl.searchParams.get('action') || '').trim();
  const logs = (await listArchiveAccessLogs(250)).filter((entry) => {
    const actorValue = (entry.actorId || entry.walletAddress || '').toLowerCase();
    if (actorFilter && !actorValue.includes(actorFilter)) return false;
    if (actionFilter && entry.action !== actionFilter) return false;
    return true;
  });

  return NextResponse.json({
    logs,
    anomalies: summarizeArchiveAccessAnomalies(logs)
  });
}
