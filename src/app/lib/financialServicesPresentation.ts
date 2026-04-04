import type { FinancialOrderReconciliation, FinancialReconciliationReportRow, FinancialServicesDashboard, FinancialAuditHistoryEntry } from '@/app/lib/financialServices';

export interface FinancialReportFilters {
  pillar?: string;
  startDate?: string;
  endDate?: string;
}

function normalizeDate(value: string | undefined) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function withinDateRange(value: string, filters: FinancialReportFilters) {
  const occurredDate = normalizeDate(value);
  const startDate = normalizeDate(filters.startDate);
  const endDate = normalizeDate(filters.endDate);
  if (startDate && occurredDate && occurredDate < startDate) return false;
  if (endDate && occurredDate && occurredDate > endDate) return false;
  return true;
}

export function filterFinancialReconciliation(rows: FinancialOrderReconciliation[], filters: FinancialReportFilters = {}) {
  const pillar = String(filters.pillar || '').trim();
  return rows.filter((row) => {
    if (pillar && pillar !== 'all' && row.pillar !== pillar) return false;
    return withinDateRange(row.createdAt, filters);
  });
}

export function buildFinancialReconciliationReport(rows: FinancialOrderReconciliation[]): FinancialReconciliationReportRow[] {
  const grouped = new Map<string, FinancialReconciliationReportRow>();
  for (const row of rows) {
    const current = grouped.get(row.pillar) || {
      pillar: row.pillar,
      caseCount: 0,
      grossAmount: 0,
      royaltyAmount: 0,
      platformFeeAmount: 0,
      sellerNetAmount: 0,
      pendingCount: 0,
      settledCount: 0,
      disputedCount: 0
    };
    current.caseCount += 1;
    current.grossAmount += row.amountPaid;
    current.royaltyAmount += row.royaltyAmount;
    current.platformFeeAmount += row.platformFeeAmount;
    current.sellerNetAmount += row.sellerNetAmount;
    if (row.orderStatus === 'settled') current.settledCount += 1;
    else if (row.orderStatus === 'disputed') current.disputedCount += 1;
    else current.pendingCount += 1;
    grouped.set(row.pillar, current);
  }
  return Array.from(grouped.values()).sort((left, right) => right.grossAmount - left.grossAmount);
}

export function buildFinancialAuditHistory(data: FinancialServicesDashboard): FinancialAuditHistoryEntry[] {
  const payoutEntries: FinancialAuditHistoryEntry[] = data.payouts.map((entry) => ({
    id: `payout-${entry.id}`,
    entity: 'payout',
    entityId: entry.id,
    pillar: 'platform-finance',
    title: entry.walletAddress,
    status: entry.status,
    actorId: entry.actorId,
    sourceReference: entry.id,
    amount: entry.netAmount,
    currency: 'USD',
    note: 'Instant payout queue update',
    occurredAt: entry.createdAt
  }));

  const withdrawalEntries: FinancialAuditHistoryEntry[] = data.indiWithdrawals.map((entry) => ({
    id: `withdrawal-${entry.id}`,
    entity: 'indi-withdrawal',
    entityId: entry.id,
    pillar: 'platform-finance',
    title: entry.destinationLabel || entry.destinationType,
    status: entry.status,
    actorId: entry.actorId,
    sourceReference: entry.referenceId || entry.id,
    amount: entry.netAmount,
    currency: entry.currency,
    note: entry.note || 'Withdrawal lifecycle update',
    occurredAt: entry.completedAt || entry.updatedAt || entry.requestedAt
  }));

  const royaltyEntries: FinancialAuditHistoryEntry[] = data.royalties.map((entry) => ({
    id: `ledger-${entry.id}`,
    entity: 'royalty',
    entityId: entry.id,
    pillar: entry.pillar,
    title: entry.item,
    status: entry.status,
    actorId: entry.actorId,
    sourceReference:
      String(entry.metadata?.orderId || '') ||
      String(entry.metadata?.receiptId || '') ||
      String(entry.metadata?.bookingId || '') ||
      entry.id,
    amount: entry.creatorNetAmount,
    currency: String(entry.metadata?.currency || 'INDI'),
    note: entry.type === 'royalty' ? 'Royalty ledger update' : 'Sale ledger update',
    occurredAt:
      String(entry.metadata?.settlementCaseUpdatedAt || '') ||
      String(entry.metadata?.orderSettlementUpdatedAt || '') ||
      String(entry.metadata?.royaltyStatusUpdatedAt || '') ||
      entry.createdAt
  }));

  const settlementEntries: FinancialAuditHistoryEntry[] = data.orderReconciliation.map((entry) => ({
    id: `settlement-${entry.settlementEntity}-${entry.settlementId}`,
    entity: entry.settlementEntity,
    entityId: entry.settlementId,
    pillar: entry.pillar,
    title: entry.title,
    status: entry.orderStatus,
    actorId: entry.sellerActorId || entry.creatorActorId,
    sourceReference: entry.sourceReference,
    amount: entry.amountPaid,
    currency: entry.currency,
    note: `${entry.sourceLabel} reconciliation snapshot`,
    occurredAt: entry.createdAt
  }));

  return [...payoutEntries, ...withdrawalEntries, ...royaltyEntries, ...settlementEntries]
    .sort((left, right) => String(right.occurredAt).localeCompare(String(left.occurredAt)))
    .slice(0, 200);
}

export function filterFinancialAuditHistory(entries: FinancialAuditHistoryEntry[], filters: FinancialReportFilters = {}) {
  const pillar = String(filters.pillar || '').trim();
  return entries.filter((entry) => {
    if (pillar && pillar !== 'all' && entry.pillar !== pillar) return false;
    return withinDateRange(entry.occurredAt, filters);
  });
}
