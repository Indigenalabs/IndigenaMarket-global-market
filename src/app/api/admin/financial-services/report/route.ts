import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listFinancialServices } from '@/app/lib/financialServices';
import { buildFinancialAuditHistory, buildFinancialReconciliationReport, filterFinancialAuditHistory, filterFinancialReconciliation } from '@/app/lib/financialServicesPresentation';

function esc(value: string | number) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;

  const format = (req.nextUrl.searchParams.get('format') || 'json').trim().toLowerCase();
  const data = await listFinancialServices();
  const filters = {
    pillar: (req.nextUrl.searchParams.get('pillar') || '').trim(),
    startDate: (req.nextUrl.searchParams.get('startDate') || '').trim(),
    endDate: (req.nextUrl.searchParams.get('endDate') || '').trim()
  };
  const filteredReconciliation = filterFinancialReconciliation(data.orderReconciliation, filters);
  const reportRows = buildFinancialReconciliationReport(filteredReconciliation);
  const auditRows = filterFinancialAuditHistory(buildFinancialAuditHistory(data), filters);

  if (format === 'csv') {
    const reportCsv = [
      'section,pillar,case_count,gross_amount,royalty_amount,platform_fee_amount,seller_net_amount,pending_count,settled_count,disputed_count',
      ...reportRows.map((row) =>
        [
          'reconciliation',
          row.pillar,
          row.caseCount,
          row.grossAmount,
          row.royaltyAmount,
          row.platformFeeAmount,
          row.sellerNetAmount,
          row.pendingCount,
          row.settledCount,
          row.disputedCount
        ].map(esc).join(',')
      ),
      '',
      'section,entity,entity_id,pillar,title,status,actor_id,source_reference,amount,currency,note,occurred_at',
      ...auditRows.map((row) =>
        [
          'audit-history',
          row.entity,
          row.entityId,
          row.pillar,
          row.title,
          row.status,
          row.actorId,
          row.sourceReference,
          row.amount,
          row.currency,
          row.note,
          row.occurredAt
        ].map(esc).join(',')
      )
    ].join('\n');
    return new NextResponse(reportCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="financial-services-reconciliation-report.csv"'
      }
    });
  }

  return NextResponse.json({
    data: {
      generatedAt: new Date().toISOString(),
      filters,
      reportRows,
      auditRows
    }
  });
}
