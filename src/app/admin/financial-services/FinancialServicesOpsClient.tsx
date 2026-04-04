'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchFinancialServicesDashboard, updateFinancialServiceRecord } from '@/app/lib/financialServicesApi';
import type { FinancialOrderReconciliation, FinancialServicesDashboard } from '@/app/lib/financialServices';

export default function FinancialServicesOpsClient() {
  const [data, setData] = useState<FinancialServicesDashboard>({ payouts: [], bnplApplications: [], taxReports: [], indiWithdrawals: [], royalties: [], marketplaceOrders: [], orderReconciliation: [] });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchFinancialServicesDashboard().then(setData).catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load financial services.'));
  }, []);

  const summary = useMemo(() => ({
    payoutUsage: data.payouts.length,
    withdrawalOps: data.indiWithdrawals.length,
    royaltyQueue: data.royalties.filter((entry) => entry.status !== 'settled').length,
    settlementQueue: data.orderReconciliation.filter((entry) => entry.orderStatus !== 'settled').length,
    escrowVolume: data.bnplApplications.reduce((sum, entry) => sum + entry.amount, 0),
    taxReportPurchases: data.taxReports.length
  }), [data]);

  async function update(entity: 'payout' | 'indi-withdrawal' | 'royalty' | 'marketplace-order' | 'bnpl' | 'tax-report', id: string, status: string) {
    const json = await updateFinancialServiceRecord({ entity, id, status });
    if (entity === 'payout') setData((current) => ({ ...current, payouts: current.payouts.map((entry) => entry.id === id ? json.payout : entry) }));
    if (entity === 'indi-withdrawal') setData((current) => ({ ...current, indiWithdrawals: current.indiWithdrawals.map((entry) => entry.id === id ? json.withdrawal : entry) }));
    if (entity === 'royalty') setData((current) => ({ ...current, royalties: current.royalties.map((entry) => entry.id === id ? json.royalty : entry) }));
    if (entity === 'marketplace-order') {
      setData((current) => {
        const nextMarketplaceOrders = current.marketplaceOrders.map((entry) => entry.id === id ? json.order : entry);
        const nextRoyalties = current.royalties.map((entry) => {
          const updated = Array.isArray(json.ledgerEntries) ? json.ledgerEntries.find((candidate: { id: string }) => candidate.id === entry.id) : null;
          return updated || entry;
        });
        return {
          ...current,
          marketplaceOrders: nextMarketplaceOrders,
          royalties: nextRoyalties,
          orderReconciliation: current.orderReconciliation.map((entry) => entry.orderId === id ? reconcileRow(entry, json.order, json.ledgerEntries || []) : entry)
        };
      });
    }
    if (entity === 'bnpl') setData((current) => ({ ...current, bnplApplications: current.bnplApplications.map((entry) => entry.id === id ? json.application : entry) }));
    if (entity === 'tax-report') setData((current) => ({ ...current, taxReports: current.taxReports.map((entry) => entry.id === id ? json.report : entry) }));
  }

  function reconcileRow(current: FinancialOrderReconciliation, order: FinancialServicesDashboard['marketplaceOrders'][number], ledgerEntries: FinancialServicesDashboard['royalties']) {
    return {
      ...current,
      orderStatus: order.status,
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

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Instant payouts</h2>
          <div className="mt-4 space-y-3">
            {data.payouts.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.walletAddress}</p>
                <p className="mt-1 text-xs text-gray-500">${entry.amount.toFixed(2)} gross · fee ${entry.feeAmount.toFixed(2)} · net ${entry.netAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('payout', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['requested', 'processing', 'paid', 'failed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">INDI withdrawals</h2>
          <div className="mt-4 space-y-3">
            {data.indiWithdrawals.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.destinationLabel || entry.destinationType}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.actorId} · {entry.amount.toFixed(2)} INDI · net {entry.netAmount.toFixed(2)} · {entry.destinationType}</p>
                <select value={entry.status} onChange={(e) => void update('indi-withdrawal', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['requested', 'queued', 'reviewing', 'processing', 'paid', 'failed', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Royalty ledger</h2>
          <div className="mt-4 space-y-3">
            {data.royalties.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.item}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.pillar} · gross {entry.grossAmount.toFixed(2)} · net {entry.creatorNetAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('royalty', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['paid', 'pending_payout', 'settled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">BNPL partner lane</h2>
          <div className="mt-4 space-y-3">
            {data.bnplApplications.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.orderId}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.partner} · ${entry.amount.toFixed(2)} · fee ${entry.feeAmount.toFixed(2)}</p>
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
                <p className="mt-1 text-xs text-gray-500">{entry.actorId} · fee ${entry.feeAmount.toFixed(2)}</p>
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
            <h2 className="text-lg font-semibold text-white">Marketplace order reconciliation</h2>
            <p className="mt-1 text-sm text-gray-400">Tie digital art orders back to royalty ledger rows, payout readiness, and settlement state.</p>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{data.orderReconciliation.length} tracked orders</p>
        </div>
        <div className="mt-4 grid gap-3">
          {data.orderReconciliation.map((entry) => (
            <div key={entry.orderId} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{entry.orderId} · {entry.orderKind} · {entry.amountPaid.toFixed(2)} {entry.currency}</p>
                  <p className="mt-1 text-xs text-gray-500">seller {entry.sellerActorId || 'n/a'} · creator {entry.creatorActorId || 'n/a'}</p>
                </div>
                <select value={entry.orderStatus} onChange={(e) => void update('marketplace-order', entry.orderId, e.target.value)} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['captured', 'pending_settlement', 'settled', 'refunded', 'disputed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="mt-3 grid gap-3 text-xs text-gray-400 md:grid-cols-4">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
