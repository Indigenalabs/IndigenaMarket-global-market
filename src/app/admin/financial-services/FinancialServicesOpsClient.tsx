'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchFinancialServicesDashboard, updateFinancialServiceRecord } from '@/app/lib/financialServicesApi';
import type { FinancialServicesDashboard, InstantPayoutRequest, BnplApplication, TaxReportPurchase } from '@/app/lib/financialServices';

export default function FinancialServicesOpsClient() {
  const [data, setData] = useState<FinancialServicesDashboard>({ payouts: [], bnplApplications: [], taxReports: [] });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchFinancialServicesDashboard().then(setData).catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load financial services.'));
  }, []);

  const summary = useMemo(() => ({
    payoutUsage: data.payouts.length,
    escrowVolume: data.bnplApplications.reduce((sum, entry) => sum + entry.amount, 0),
    taxReportPurchases: data.taxReports.length
  }), [data]);

  async function update(entity: 'payout' | 'bnpl' | 'tax-report', id: string, status: string) {
    const json = await updateFinancialServiceRecord({ entity, id, status });
    if (entity === 'payout') setData((current) => ({ ...current, payouts: current.payouts.map((entry) => entry.id === id ? json.payout : entry) }));
    if (entity === 'bnpl') setData((current) => ({ ...current, bnplApplications: current.bnplApplications.map((entry) => entry.id === id ? json.application : entry) }));
    if (entity === 'tax-report') setData((current) => ({ ...current, taxReports: current.taxReports.map((entry) => entry.id === id ? json.report : entry) }));
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Instant payout usage</p><p className="mt-2 text-2xl font-semibold text-white">{summary.payoutUsage}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">BNPL / escrow volume</p><p className="mt-2 text-2xl font-semibold text-white">${summary.escrowVolume.toFixed(2)}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Tax report purchases</p><p className="mt-2 text-2xl font-semibold text-white">{summary.taxReportPurchases}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
