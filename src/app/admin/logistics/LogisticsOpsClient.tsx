'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchLogisticsDashboard, updateLogisticsRecord } from '@/app/lib/logisticsApi';
import { fetchMaterialsToolsOperations, updateMaterialsToolsReview } from '@/app/lib/materialsToolsOpsApi';
import type {
  LogisticsDashboardData,
  LogisticsFulfillmentRecord,
  LogisticsInsuranceClaim,
} from '@/app/lib/logisticsOps';
import type { MaterialsToolsOperationsDashboard, MaterialsToolsReviewStatus } from '@/app/lib/materialsToolsOps';
import type { MaterialsToolsLaunchAuditResponse } from '@/app/lib/materialsToolsApi';

export default function LogisticsOpsClient() {
  const [data, setData] = useState<LogisticsDashboardData>({
    quotes: [],
    claims: [],
    tags: [],
    fulfillment: [],
    inventorySubscriptions: [],
  });
  const [materialsDashboard, setMaterialsDashboard] = useState<MaterialsToolsOperationsDashboard | null>(null);
  const [materialsAudit, setMaterialsAudit] = useState<MaterialsToolsLaunchAuditResponse | null>(null);
  const [feedback, setFeedback] = useState('');
  const [materialsFeedback, setMaterialsFeedback] = useState('');

  useEffect(() => {
    fetchLogisticsDashboard()
      .then(setData)
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load logistics ops.'));
    fetchMaterialsToolsOperations()
      .then((json) => {
        setMaterialsDashboard(json.dashboard);
        setMaterialsAudit(json.audit);
      })
      .catch((error) =>
        setMaterialsFeedback(error instanceof Error ? error.message : 'Unable to load Materials & Tools operations.'),
      );
  }, []);

  const summary = useMemo(
    () => ({
      shippingMargin: data.quotes.reduce((sum, entry) => sum + entry.markupAmount, 0),
      fulfillmentUsage: data.fulfillment.length,
      claimsRate: data.fulfillment.length > 0 ? (data.claims.length / data.fulfillment.length) * 100 : 0,
    }),
    [data],
  );

  async function updateClaim(id: string, status: LogisticsInsuranceClaim['status']) {
    const json = await updateLogisticsRecord({ entity: 'claim', id, status });
    setData((current) => ({
      ...current,
      claims: current.claims.map((entry) => (entry.id === id ? json.claim : entry)),
    }));
  }

  async function updateFulfillment(id: string, status: LogisticsFulfillmentRecord['status']) {
    const json = await updateLogisticsRecord({ entity: 'fulfillment', id, status });
    setData((current) => ({
      ...current,
      fulfillment: current.fulfillment.map((entry) => (entry.id === id ? json.fulfillment : entry)),
    }));
  }

  async function updateMaterialsAction(id: string, status: MaterialsToolsReviewStatus, note: string) {
    const action = await updateMaterialsToolsReview({ id, status, note });
    setMaterialsDashboard((current) =>
      current
        ? {
            ...current,
            queue: current.queue.map((entry) => (entry.id === id ? action : entry)),
            counts: {
              total: current.queue.length,
              pending: current.queue.map((entry) => (entry.id === id ? action : entry)).filter((entry) => entry.reviewStatus === 'pending').length,
              inReview: current.queue.map((entry) => (entry.id === id ? action : entry)).filter((entry) => entry.reviewStatus === 'in-review').length,
              approved: current.queue.map((entry) => (entry.id === id ? action : entry)).filter((entry) => entry.reviewStatus === 'approved').length,
              rejected: current.queue.map((entry) => (entry.id === id ? action : entry)).filter((entry) => entry.reviewStatus === 'rejected').length,
            },
            byType: current.byType.map((item) => {
              const scoped = current.queue.map((entry) => (entry.id === id ? action : entry)).filter((entry) => entry.actionType === item.actionType);
              return {
                ...item,
                total: scoped.length,
                pending: scoped.filter((entry) => entry.reviewStatus === 'pending').length,
                approved: scoped.filter((entry) => entry.reviewStatus === 'approved').length,
                rejected: scoped.filter((entry) => entry.reviewStatus === 'rejected').length,
              };
            }),
          }
        : current,
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Shipping margin</p>
          <p className="mt-2 text-2xl font-semibold text-white">${summary.shippingMargin.toFixed(2)}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Fulfillment usage</p>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.fulfillmentUsage}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Claims rate</p>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.claimsRate.toFixed(1)}%</p>
        </div>
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
                    <p className="text-xs text-gray-500">
                      {claim.claimantName} · ${claim.amount.toFixed(2)}
                    </p>
                  </div>
                  <select
                    value={claim.status}
                    onChange={(e) => void updateClaim(claim.id, e.target.value as LogisticsInsuranceClaim['status'])}
                    className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none"
                  >
                    {['submitted', 'reviewing', 'approved', 'rejected', 'paid'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
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
                    <p className="text-xs text-gray-500">
                      {record.warehouse} · storage ${record.storageFee.toFixed(2)} · handling ${record.handlingFee.toFixed(2)}
                    </p>
                  </div>
                  <select
                    value={record.status}
                    onChange={(e) => void updateFulfillment(record.id, e.target.value as LogisticsFulfillmentRecord['status'])}
                    className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none"
                  >
                    {['received', 'picked', 'packed', 'shipped', 'delivered'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
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
            {data.tags.map((tag) => (
              <div key={tag.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
                <p className="text-white">{tag.listingId}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {tag.status} · ${tag.unitFee.toFixed(2)} per item
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Inventory tools</h2>
          <div className="mt-4 space-y-3">
            {data.inventorySubscriptions.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
                <p className="text-white">{entry.actorId}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {entry.catalogSize} catalog items · ${entry.monthlyFee.toFixed(2)}/month · {entry.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Materials &amp; Tools launch readiness</h2>
            <p className="mt-1 text-sm text-gray-400">
              Review supplier verification, tool-library intake, elder approvals, and launch configuration in one place.
            </p>
          </div>
          {materialsAudit ? (
            <span className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs text-[#f3deb1]">
              {materialsAudit.productionLike ? 'Production-like' : 'Preview mode'}
            </span>
          ) : null}
        </div>

        {materialsAudit ? (
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ['Listings', String(materialsAudit.counts.listings)],
              ['Suppliers', String(materialsAudit.counts.suppliers)],
              ['Orders', String(materialsAudit.counts.orders)],
              ['Commitments', String(materialsAudit.counts.commitments)],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </article>
            ))}
          </div>
        ) : null}

        {materialsDashboard ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d4af37]">Application mix</h3>
              {materialsDashboard.byType.map((item) => (
                <div key={item.actionType} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {item.total} total · {item.pending} pending · {item.approved} approved · {item.rejected} rejected
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8fd7dc]">Approval queue</h3>
              {materialsDashboard.queue.slice(0, 8).map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{entry.summaryTitle}</p>
                      <p className="mt-1 text-sm text-gray-400">{entry.summaryDetail}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">
                        {entry.actionType} · {entry.reviewStatus}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void updateMaterialsAction(entry.id, 'in-review', 'Ops started review')}
                        className="rounded-full border border-[#1d6b74]/35 px-3 py-1.5 text-xs text-[#9fe5ea] hover:bg-[#1d6b74]/10"
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateMaterialsAction(entry.id, 'approved', 'Approved for the next lane')}
                        className="rounded-full border border-emerald-400/35 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/10"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateMaterialsAction(entry.id, 'rejected', 'Needs more documentation before approval')}
                        className="rounded-full border border-rose-400/35 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/10"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  {entry.reviewNote ? <p className="mt-3 text-sm text-[#f4c766]">Latest note: {entry.reviewNote}</p> : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
      {materialsFeedback ? <p className="text-sm text-[#9fe5ea]">{materialsFeedback}</p> : null}
    </section>
  );
}
