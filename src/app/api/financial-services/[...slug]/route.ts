import { NextRequest, NextResponse } from 'next/server';
import { createBnplApplication, listFinancialServices, purchaseTaxReport, requestInstantPayout } from '@/app/lib/financialServices';
import { ensureFinancialServiceAccess, recordGovernanceAuditEvent } from '@/app/lib/complianceGovernance';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';

function text(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }
function numberValue(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  if (slug[0] !== 'dashboard') return NextResponse.json({ message: 'Unsupported financial services endpoint' }, { status: 404 });
  const data = await listFinancialServices();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const actorId = resolveRequestActorId(req);
  const walletAddress = resolveRequestWallet(req);
  if (actorId === 'guest') {
    return NextResponse.json({ message: 'Sign in is required for financial services.' }, { status: 401 });
  }
  if (slug[0] === 'instant-payout') {
    await ensureFinancialServiceAccess({ actorId, walletAddress, service: 'instant-payout' });
    const payout = await requestInstantPayout({ actorId, walletAddress: walletAddress || text(body.walletAddress), amount: numberValue(body.amount) });
    await recordGovernanceAuditEvent({ actorId, domain: 'financial-services', action: 'instant-payout-requested', targetId: payout.id, metadata: { amount: payout.amount, feeAmount: payout.feeAmount } });
    return NextResponse.json({ data: { payout } }, { status: 201 });
  }
  if (slug[0] === 'bnpl') {
    await ensureFinancialServiceAccess({ actorId, walletAddress, service: 'bnpl' });
    const application = await createBnplApplication({ actorId, orderId: text(body.orderId), amount: numberValue(body.amount) });
    await recordGovernanceAuditEvent({ actorId, domain: 'financial-services', action: 'bnpl-submitted', targetId: application.id, metadata: { orderId: application.orderId, amount: application.amount } });
    return NextResponse.json({ data: { application } }, { status: 201 });
  }
  if (slug[0] === 'tax-reports') {
    await ensureFinancialServiceAccess({ actorId, walletAddress, service: 'tax-report' });
    const report = await purchaseTaxReport({ actorId, taxYear: numberValue(body.taxYear) || new Date().getUTCFullYear() });
    await recordGovernanceAuditEvent({ actorId, domain: 'financial-services', action: 'tax-report-purchased', targetId: report.id, metadata: { taxYear: report.taxYear } });
    return NextResponse.json({ data: { report } }, { status: 201 });
  }
  return NextResponse.json({ message: 'Unsupported financial services endpoint' }, { status: 404 });
}



