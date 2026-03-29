'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchLogisticsDashboard, updateLogisticsRecord } from '@/app/lib/logisticsApi';
import type { LogisticsDashboardData, LogisticsFulfillmentRecord, LogisticsInsuranceClaim } from '@/app/lib/logisticsOps';

export default function LogisticsOpsClient() {
  const [data, setData] = useState<LogisticsDashboardData>({ quotes: [], claims: [], tags: [], fulfillment: [], inventorySubscriptions: [] });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchLogisticsDashboard().then(setData).catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load logistics ops.'));
  }, []);

  const summary = useMemo(() => ({
    shippingMargin: data.quotes.reduce((sum, entry) => sum + entry.markupAmount, 0),
    fulfillmentUsage: data.fulfillment.length,
    claimsRate: data.fulfillment.length > 0 ? (data.claims.length / data.fulfillment.length) * 100 : 0
  }), [data]);

  async function updateClaim(id: string, status: LogisticsInsuranceClaim['status']) {
    const json = await updateLogisticsRecord({ entity: 'claim', id, status });
    setData((current) => ({ ...current, claims: current.claims.map((entry) => entry.id === id ? json.claim : entry) }));
  }

  async function updateFulfillment(id: string, status: LogisticsFulfillmentRecord['status']) {
    const json = await updateLogisticsRecord({ entity: 'fulfillment', id, status });
    setData((current) => ({ ...current, fulfillment: current.fulfillment.map((entry) => entry.id === id ? json.fulfillment : entry) }));
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Shipping margin</p><p className="mt-2 text-2xl font-semibold text-white">${summary.shippingMargin.toFixed(2)}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Fulfillment usage</p><p className="mt-2 text-2xl font-semibold text-white">{summary.fulfillmentUsage}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Claims rate</p><p className="mt-2 text-2xl font-semibold text-white">{summary.claimsRate.toFixed(1)}%</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Insurance claims</h2>
          <div className="mt-4 space-y-3">
            {data.claims.map((claim) => (
              <div key={claim.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{claim.orderId}</p>
                    <p className="text-xs text-gray-500">{claim.claimantName} · ${claim.amount.toFixed(2)}</p>
                  </div>
                  <select value={claim.status} onChange={(e) => void updateClaim(claim.id, e.target.value as LogisticsInsuranceClaim['status'])} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                    {['submitted', 'reviewing', 'approved', 'rejected', 'paid'].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <p className="mt-3 text-sm text-gray-400">{claim.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Fulfillment queue</h2>
          <div className="mt-4 space-y-3">
            {data.fulfillment.map((record) => (
              <div key={record.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{record.orderId}</p>
                    <p className="text-xs text-gray-500">{record.warehouse} · storage ${record.storageFee.toFixed(2)} · handling ${record.handlingFee.toFixed(2)}</p>
                  </div>
                  <select value={record.status} onChange={(e) => void updateFulfillment(record.id, e.target.value as LogisticsFulfillmentRecord['status'])} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                    {['received', 'picked', 'packed', 'shipped', 'delivered'].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">NFC authenticity tags</h2>
          <div className="mt-4 space-y-3">
            {data.tags.map((tag) => <div key={tag.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-white">{tag.listingId}</p><p className="mt-1 text-xs text-gray-500">{tag.status} · ${tag.unitFee.toFixed(2)} per item</p></div>)}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Inventory tools</h2>
          <div className="mt-4 space-y-3">
            {data.inventorySubscriptions.map((entry) => <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-white">{entry.actorId}</p><p className="mt-1 text-xs text-gray-500">{entry.catalogSize} catalog items · ${entry.monthlyFee.toFixed(2)}/month · {entry.status}</p></div>)}
          </div>
        </div>
      </div>
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
