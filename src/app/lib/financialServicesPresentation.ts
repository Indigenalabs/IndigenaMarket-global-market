import type {
  FinancialOrderReconciliation,
  FinancialReconciliationReportRow,
  FinancialServicesDashboard,
  FinancialAuditHistoryEntry,
  FinancialPayoutAuditHistoryEntry,
  FinancialPayoutReportRow,
  FinancialRoyaltyAuditHistoryEntry,
  FinancialRoyaltyReportRow
} from '@/app/lib/financialServices';

export interface FinancialReportFilters {
  pillar?: string;
  startDate?: string;
  endDate?: string;
  queue?: string;
  status?: string;
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

export function buildPayoutReconciliationReport(
  data: Pick<FinancialServicesDashboard, 'payouts' | 'indiWithdrawals'>,
  filters: FinancialReportFilters = {}
): FinancialPayoutReportRow[] {
  const grouped = new Map<string, FinancialPayoutReportRow>();
  const queueFilter = String(filters.queue || '').trim();
  const statusFilter = String(filters.status || '').trim();

  for (const entry of data.payouts) {
    if (queueFilter && queueFilter !== 'all' && queueFilter !== 'instant-payouts') continue;
    if (statusFilter && statusFilter !== 'all' && entry.status !== statusFilter) continue;
    if (!withinDateRange(entry.createdAt, filters)) continue;
    const key = `instant-payouts:${entry.status}`;
    const current = grouped.get(key) || {
      queue: 'instant-payouts' as const,
      status: entry.status,
      requestCount: 0,
      grossAmount: 0,
      feeAmount: 0,
      netAmount: 0
    };
    current.requestCount += 1;
    current.grossAmount += entry.amount;
    current.feeAmount += entry.feeAmount;
    current.netAmount += entry.netAmount;
    grouped.set(key, current);
  }

  for (const entry of data.indiWithdrawals) {
    if (queueFilter && queueFilter !== 'all' && queueFilter !== 'indi-withdrawals') continue;
    if (statusFilter && statusFilter !== 'all' && entry.status !== statusFilter) continue;
    if (!withinDateRange(entry.completedAt || entry.updatedAt || entry.requestedAt, filters)) continue;
    const key = `indi-withdrawals:${entry.status}`;
    const current = grouped.get(key) || {
      queue: 'indi-withdrawals' as const,
      status: entry.status,
      requestCount: 0,
      grossAmount: 0,
      feeAmount: 0,
      netAmount: 0
    };
    current.requestCount += 1;
    current.grossAmount += entry.amount;
    current.feeAmount += entry.feeAmount;
    current.netAmount += entry.netAmount;
    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort((left, right) => right.netAmount - left.netAmount);
}

export function buildPayoutAuditHistory(
  data: Pick<FinancialServicesDashboard, 'payouts' | 'indiWithdrawals'>,
  filters: FinancialReportFilters = {}
): FinancialPayoutAuditHistoryEntry[] {
  const queueFilter = String(filters.queue || '').trim();
  const statusFilter = String(filters.status || '').trim();

  const payoutEntries: FinancialPayoutAuditHistoryEntry[] = data.payouts
    .filter((entry) => {
      if (queueFilter && queueFilter !== 'all' && queueFilter !== 'instant-payouts') return false;
      if (statusFilter && statusFilter !== 'all' && entry.status !== statusFilter) return false;
      return withinDateRange(entry.createdAt, filters);
    })
    .map((entry) => ({
      id: `payout-audit-${entry.id}`,
      queue: 'instant-payouts',
      status: entry.status,
      actorId: entry.actorId,
      destination: entry.walletAddress,
      sourceReference: entry.id,
      amount: entry.amount,
      feeAmount: entry.feeAmount,
      netAmount: entry.netAmount,
      currency: 'USD',
      note: 'Instant payout lifecycle update',
      occurredAt: entry.createdAt
    }));

  const withdrawalEntries: FinancialPayoutAuditHistoryEntry[] = data.indiWithdrawals
    .filter((entry) => {
      if (queueFilter && queueFilter !== 'all' && queueFilter !== 'indi-withdrawals') return false;
      if (statusFilter && statusFilter !== 'all' && entry.status !== statusFilter) return false;
      return withinDateRange(entry.completedAt || entry.updatedAt || entry.requestedAt, filters);
    })
    .map((entry) => ({
      id: `withdrawal-audit-${entry.id}`,
      queue: 'indi-withdrawals',
      status: entry.status,
      actorId: entry.actorId,
      destination: entry.destinationLabel || entry.destinationType,
      sourceReference: entry.referenceId || entry.id,
      amount: entry.amount,
      feeAmount: entry.feeAmount,
      netAmount: entry.netAmount,
      currency: entry.currency,
      note: entry.note || 'Withdrawal lifecycle update',
      occurredAt: entry.completedAt || entry.updatedAt || entry.requestedAt
    }));

  return [...payoutEntries, ...withdrawalEntries]
    .sort((left, right) => String(right.occurredAt).localeCompare(String(left.occurredAt)))
    .slice(0, 200);
}

export function buildRoyaltyReconciliationReport(
  data: Pick<FinancialServicesDashboard, 'royalties'>,
  filters: FinancialReportFilters = {}
): FinancialRoyaltyReportRow[] {
  const grouped = new Map<string, FinancialRoyaltyReportRow>();
  const pillarFilter = String(filters.pillar || '').trim();
  const statusFilter = String(filters.status || '').trim();

  for (const entry of data.royalties) {
    if (pillarFilter && pillarFilter !== 'all' && entry.pillar !== pillarFilter) continue;
    if (statusFilter && statusFilter !== 'all' && entry.status !== statusFilter) continue;
    if (!withinDateRange(entry.createdAt, filters)) continue;
    const key = `${entry.pillar}:${entry.status}`;
    const current = grouped.get(key) || {
      pillar: entry.pillar,
      status: entry.status,
      entryCount: 0,
      grossAmount: 0,
      platformFeeAmount: 0,
      creatorNetAmount: 0
    };
    current.entryCount += 1;
    current.grossAmount += entry.grossAmount;
    current.platformFeeAmount += entry.platformFeeAmount;
    current.creatorNetAmount += entry.creatorNetAmount;
    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort((left, right) => right.creatorNetAmount - left.creatorNetAmount);
}

export function buildRoyaltyAuditHistory(
  data: Pick<FinancialServicesDashboard, 'royalties'>,
  filters: FinancialReportFilters = {}
): FinancialRoyaltyAuditHistoryEntry[] {
  const pillarFilter = String(filters.pillar || '').trim();
  const statusFilter = String(filters.status || '').trim();

  return data.royalties
    .filter((entry) => {
      if (entry.type !== 'sale' && entry.type !== 'royalty') return false;
      if (pillarFilter && pillarFilter !== 'all' && entry.pillar !== pillarFilter) return false;
      if (statusFilter && statusFilter !== 'all' && entry.status !== statusFilter) return false;
      return withinDateRange(entry.createdAt, filters);
    })
    .map((entry): FinancialRoyaltyAuditHistoryEntry => ({
      id: `royalty-audit-${entry.id}`,
      pillar: entry.pillar,
      status: entry.status,
      type: entry.type === 'sale' ? 'sale' : 'royalty',
      actorId: entry.actorId,
      item: entry.item,
      sourceReference:
        String(entry.metadata?.orderId || '') ||
        String(entry.metadata?.receiptId || '') ||
        String(entry.metadata?.bookingId || '') ||
        entry.id,
      grossAmount: entry.grossAmount,
      platformFeeAmount: entry.platformFeeAmount,
      creatorNetAmount: entry.creatorNetAmount,
      currency: String(entry.metadata?.currency || 'INDI'),
      note: entry.type === 'royalty' ? 'Royalty lifecycle update' : 'Sale ledger lifecycle update',
      occurredAt:
        String(entry.metadata?.settlementCaseUpdatedAt || '') ||
        String(entry.metadata?.orderSettlementUpdatedAt || '') ||
        String(entry.metadata?.royaltyStatusUpdatedAt || '') ||
        entry.createdAt
    }))
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
