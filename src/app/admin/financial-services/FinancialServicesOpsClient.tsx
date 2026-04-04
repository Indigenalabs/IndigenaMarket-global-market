'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchFinancialServicesDashboard, updateFinancialServiceRecord } from '@/app/lib/financialServicesApi';
import { buildFinancialAuditHistory, buildFinancialReconciliationReport } from '@/app/lib/financialServicesPresentation';
import type { FinancialOrderReconciliation, FinancialServicesDashboard } from '@/app/lib/financialServices';

type FinancialEntity = 'payout' | 'indi-withdrawal' | 'royalty' | 'marketplace-order' | 'settlement-case' | 'bnpl' | 'tax-report';

export default function FinancialServicesOpsClient() {
  const [data, setData] = useState<FinancialServicesDashboard>({
    payouts: [],
    bnplApplications: [],
    taxReports: [],
    indiWithdrawals: [],
    royalties: [],
    marketplaceOrders: [],
    orderReconciliation: []
  });
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'payouts' | 'withdrawals' | 'royalties' | 'settlements'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');

  useEffect(() => {
    fetchFinancialServicesDashboard()
      .then(setData)
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load financial services.'));
  }, []);

  const summary = useMemo(
    () => ({
      payoutUsage: data.payouts.length,
      withdrawalOps: data.indiWithdrawals.length,
      royaltyQueue: data.royalties.filter((entry) => entry.status !== 'settled').length,
      settlementQueue: data.orderReconciliation.filter((entry) => entry.orderStatus !== 'settled').length,
      escrowVolume: data.bnplApplications.reduce((sum, entry) => sum + entry.amount, 0),
      taxReportPurchases: data.taxReports.length
    }),
    [data]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const availablePillars = useMemo(
    () =>
      Array.from(new Set([...data.royalties.map((entry) => entry.pillar), ...data.orderReconciliation.map((entry) => entry.pillar)])).sort(),
    [data]
  );

  function matchesSearch(values: Array<string | number | undefined>) {
    if (!normalizedSearch) return true;
    return values.some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
  }

  const filteredPayouts = useMemo(
    () =>
      data.payouts.filter((entry) => {
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
        return matchesSearch([entry.walletAddress, entry.actorId, entry.amount, entry.netAmount]);
      }),
    [data.payouts, normalizedSearch, statusFilter]
  );

  const filteredWithdrawals = useMemo(
    () =>
      data.indiWithdrawals.filter((entry) => {
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
        return matchesSearch([entry.destinationLabel, entry.destinationType, entry.actorId, entry.referenceId, entry.amount]);
      }),
    [data.indiWithdrawals, normalizedSearch, statusFilter]
  );

  const filteredRoyalties = useMemo(
    () =>
      data.royalties.filter((entry) => {
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
        if (pillarFilter !== 'all' && entry.pillar !== pillarFilter) return false;
        return matchesSearch([
          entry.item,
          entry.actorId,
          entry.sourceId,
          entry.sourceType,
          String(entry.metadata?.orderId || ''),
          String(entry.metadata?.receiptId || ''),
          String(entry.metadata?.bookingId || '')
        ]);
      }),
    [data.royalties, normalizedSearch, pillarFilter, statusFilter]
  );

  const filteredSettlements = useMemo(
    () =>
      data.orderReconciliation.filter((entry) => {
        if (statusFilter !== 'all' && entry.orderStatus !== statusFilter) return false;
        if (pillarFilter !== 'all' && entry.pillar !== pillarFilter) return false;
        return matchesSearch([entry.title, entry.sourceReference, entry.sourceType, entry.sourceLabel, entry.sellerActorId, entry.creatorActorId, entry.pillar]);
      }),
    [data.orderReconciliation, normalizedSearch, pillarFilter, statusFilter]
  );
  const reconciliationReport = useMemo(() => buildFinancialReconciliationReport(filteredSettlements), [filteredSettlements]);
  const auditHistory = useMemo(() => buildFinancialAuditHistory(data), [data]);

  async function update(entity: FinancialEntity, id: string, status: string) {
    const json = await updateFinancialServiceRecord({ entity, id, status });
    if (entity === 'payout') {
      setData((current) => ({ ...current, payouts: current.payouts.map((entry) => (entry.id === id ? json.payout : entry)) }));
      return;
    }
    if (entity === 'indi-withdrawal') {
      setData((current) => ({ ...current, indiWithdrawals: current.indiWithdrawals.map((entry) => (entry.id === id ? json.withdrawal : entry)) }));
      return;
    }
    if (entity === 'royalty') {
      setData((current) => ({ ...current, royalties: current.royalties.map((entry) => (entry.id === id ? json.royalty : entry)) }));
      return;
    }
    if (entity === 'marketplace-order' || entity === 'settlement-case') {
      setData((current) => {
        const nextMarketplaceOrders = current.marketplaceOrders.map((entry) => (json.order && entry.id === id ? json.order : entry));
        const nextRoyalties = current.royalties.map((entry) => {
          const updated = Array.isArray(json.ledgerEntries) ? json.ledgerEntries.find((candidate: { id: string }) => candidate.id === entry.id) : null;
          return updated || entry;
        });
        return {
          ...current,
          marketplaceOrders: nextMarketplaceOrders,
          royalties: nextRoyalties,
          orderReconciliation: current.orderReconciliation.map((entry) =>
            entry.settlementId === id ? reconcileRow(entry, json.order, json.settlementCase, json.ledgerEntries || []) : entry
          )
        };
      });
      return;
    }
    if (entity === 'bnpl') {
      setData((current) => ({ ...current, bnplApplications: current.bnplApplications.map((entry) => (entry.id === id ? json.application : entry)) }));
      return;
    }
    if (entity === 'tax-report') {
      setData((current) => ({ ...current, taxReports: current.taxReports.map((entry) => (entry.id === id ? json.report : entry)) }));
    }
  }

  function reconcileRow(
    current: FinancialOrderReconciliation,
    order: FinancialServicesDashboard['marketplaceOrders'][number] | undefined,
    settlementCase: FinancialOrderReconciliation | undefined,
    ledgerEntries: FinancialServicesDashboard['royalties']
  ) {
    return {
      ...current,
      orderStatus: settlementCase?.orderStatus || order?.status || current.orderStatus,
      saleLedgerStatuses: ledgerEntries.filter((entry) => entry.type === 'sale').map((entry) => entry.status),
      royaltyLedgerStatuses: ledgerEntries.filter((entry) => entry.type === 'royalty').map((entry) => entry.status)
    } satisfies FinancialOrderReconciliation;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Instant payout usage</p><p className="mt-2 text-2xl font-semibold text-white">{summary.payoutUsage}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">INDI withdrawal ops</p><p className="mt-2 text-2xl font-semibold text-white">{summary.withdrawalOps}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Royalty queue</p><p className="mt-2 text-2xl font-semibold text-white">{summary.royaltyQueue}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Settlement queue</p><p className="mt-2 text-2xl font-semibold text-white">{summary.settlementQueue}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">BNPL / escrow volume</p><p className="mt-2 text-2xl font-semibold text-white">${summary.escrowVolume.toFixed(2)}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Tax report purchases</p><p className="mt-2 text-2xl font-semibold text-white">{summary.taxReportPurchases}</p></div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Search queues</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, actor, receipt, booking, or order"
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600"
            />
          </label>
          <label className="flex min-w-[170px] flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Queue</span>
            <select value={queueFilter} onChange={(event) => setQueueFilter(event.target.value as typeof queueFilter)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none">
              <option value="all">All queues</option>
              <option value="payouts">Instant payouts</option>
              <option value="withdrawals">INDI withdrawals</option>
              <option value="royalties">Royalty ledger</option>
              <option value="settlements">Settlement cases</option>
            </select>
          </label>
          <label className="flex min-w-[170px] flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none">
              <option value="all">All statuses</option>
              <option value="requested">Requested</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="reviewing">Reviewing</option>
              <option value="paid">Paid</option>
              <option value="pending_payout">Pending payout</option>
              <option value="pending_settlement">Pending settlement</option>
              <option value="settled">Settled</option>
              <option value="captured">Captured</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
            </select>
          </label>
          <label className="flex min-w-[170px] flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Pillar</span>
            <select value={pillarFilter} onChange={(event) => setPillarFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none">
              <option value="all">All pillars</option>
              {availablePillars.map((pillar) => (
                <option key={pillar} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Reconciliation reports</h2>
            <p className="mt-1 text-sm text-gray-400">Export the current finance picture or review the last 200 audit snapshots generated from payouts, withdrawals, royalties, and settlement cases.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/admin/financial-services/report?format=json"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
            >
              Open JSON
            </a>
            <a
              href="/api/admin/financial-services/report?format=csv"
              className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] transition hover:bg-[#d4af37]/10"
            >
              Export CSV
            </a>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reconciliationReport.map((row) => (
            <div key={row.pillar} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{row.pillar}</p>
              <p className="mt-2 text-lg font-semibold text-white">{row.caseCount} cases</p>
              <p className="mt-2 text-sm text-gray-300">Gross {row.grossAmount.toFixed(2)}</p>
              <p className="mt-1 text-xs text-gray-500">Pending {row.pendingCount} • Settled {row.settledCount} • Disputed {row.disputedCount}</p>
            </div>
          ))}
          {reconciliationReport.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-gray-400">
              No reconciliation report rows match the current filters.
            </div>
          ) : null}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">Audit history</h3>
            <p className="text-xs text-gray-500">{auditHistory.length} entries</p>
          </div>
          <div className="mt-3 space-y-2">
            {auditHistory.slice(0, 12).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{entry.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.entity} • {entry.pillar} • {entry.sourceReference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{entry.amount.toFixed(2)} {entry.currency}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.status}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">{entry.note} • {entry.actorId} • {entry.occurredAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {(queueFilter === 'all' || queueFilter === 'payouts') ? <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Instant payouts</h2>
          <div className="mt-4 space-y-3">
            {filteredPayouts.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.walletAddress}</p>
                <p className="mt-1 text-xs text-gray-500">${entry.amount.toFixed(2)} gross - fee ${entry.feeAmount.toFixed(2)} - net ${entry.netAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('payout', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['requested', 'processing', 'paid', 'failed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div> : null}

        {(queueFilter === 'all' || queueFilter === 'withdrawals') ? <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">INDI withdrawals</h2>
          <div className="mt-4 space-y-3">
            {filteredWithdrawals.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.destinationLabel || entry.destinationType}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.actorId} - {entry.amount.toFixed(2)} INDI - net {entry.netAmount.toFixed(2)} - {entry.destinationType}</p>
                <select value={entry.status} onChange={(e) => void update('indi-withdrawal', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['requested', 'queued', 'reviewing', 'processing', 'paid', 'failed', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div> : null}

        {(queueFilter === 'all' || queueFilter === 'royalties') ? <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Royalty ledger</h2>
          <div className="mt-4 space-y-3">
            {filteredRoyalties.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.item}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.pillar} - gross {entry.grossAmount.toFixed(2)} - net {entry.creatorNetAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('royalty', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['paid', 'pending_payout', 'settled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div> : null}

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">BNPL partner lane</h2>
          <div className="mt-4 space-y-3">
            {data.bnplApplications.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.orderId}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.partner} - ${entry.amount.toFixed(2)} - fee ${entry.feeAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('bnpl', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['submitted', 'approved', 'declined'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Tax reporting</h2>
          <div className="mt-4 space-y-3">
            {data.taxReports.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.taxYear} report</p>
                <p className="mt-1 text-xs text-gray-500">{entry.actorId} - fee ${entry.feeAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('tax-report', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['purchased', 'generated'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Marketplace settlement reconciliation</h2>
            <p className="mt-1 text-sm text-gray-400">Track orders, receipts, bookings, royalties, and payout readiness across the selling pillars.</p>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{filteredSettlements.length} matching cases</p>
        </div>
        <div className="mt-4 grid gap-3">
          {(queueFilter === 'all' || queueFilter === 'settlements') ? filteredSettlements.map((entry) => (
            <div key={`${entry.settlementEntity}-${entry.settlementId}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{entry.sourceLabel} {entry.sourceReference} - {entry.amountPaid.toFixed(2)} {entry.currency}</p>
                  <p className="mt-1 text-xs text-gray-500">seller {entry.sellerActorId || 'n/a'} - creator {entry.creatorActorId || 'n/a'}</p>
                </div>
                <select value={entry.orderStatus} onChange={(e) => void update(entry.settlementEntity, entry.settlementId, e.target.value)} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['captured', 'pending_settlement', 'settled', 'refunded', 'disputed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="mt-3 grid gap-3 text-xs text-gray-400 md:grid-cols-5">
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Pillar</p>
                  <p className="mt-2 text-sm text-white">{entry.pillar}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{entry.settlementEntity === 'marketplace-order' ? entry.orderKind : entry.sourceLabel}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Royalty</p>
                  <p className="mt-2 text-sm text-white">{entry.royaltyAmount.toFixed(2)} {entry.currency}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Platform fee</p>
                  <p className="mt-2 text-sm text-white">{entry.platformFeeAmount.toFixed(2)} {entry.currency}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Sale ledger</p>
                  <p className="mt-2 text-sm text-white">{entry.saleLedgerStatuses.join(', ') || 'none'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Royalty / withdrawals</p>
                  <p className="mt-2 text-sm text-white">{entry.royaltyLedgerStatuses.join(', ') || 'none'}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{entry.withdrawalStatuses.join(', ') || 'no linked withdrawals'}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{entry.linkedLedgerEntryIds.length} linked ledger rows</p>
                </div>
              </div>
            </div>
          )) : []}
          {(queueFilter === 'all' || queueFilter === 'settlements') && filteredSettlements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-sm text-gray-400">
              No settlement cases match the current filters.
            </div>
          ) : null}
        </div>
      </div>

      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
