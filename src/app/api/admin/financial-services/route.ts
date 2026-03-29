import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listFinancialServices, updateBnplStatus, updateInstantPayoutStatus, updateTaxReportStatus } from '@/app/lib/financialServices';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const data = await listFinancialServices();
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
  if (entity === 'payout') return NextResponse.json({ payout: await updateInstantPayoutStatus(id, status as never) });
  if (entity === 'bnpl') return NextResponse.json({ application: await updateBnplStatus(id, status as never) });
  if (entity === 'tax-report') return NextResponse.json({ report: await updateTaxReportStatus(id, status as never) });
  return NextResponse.json({ message: 'Unsupported financial services entity' }, { status: 400 });
}
