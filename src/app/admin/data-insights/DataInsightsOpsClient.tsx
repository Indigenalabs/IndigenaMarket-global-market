'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchInsightsDashboard, updateInsightProductApi } from '@/app/lib/dataInsightsApi';
import type { InsightsDashboard, InsightProductRecord } from '@/app/lib/dataInsights';

const EMPTY_DASHBOARD: InsightsDashboard = {
  products: [],
  apiSubscriptions: [],
  subscriptions: {
    metrics: {
      activeCount: 0,
      cancelledCount: 0,
      churnCount: 0,
      monthlyRecurringRevenue: 0,
      annualRecurringRevenue: 0,
      oneTimeRevenue: 0,
      featureAdoption: {
        creatorAnalyticsUnlocked: false,
        unlimitedListingsUnlocked: false,
        teamWorkspaceUnlocked: false,
        archiveAccessUnlocked: false
      }
    },
    familySummary: [],
    recentRecords: []
  }
};

export default function DataInsightsOpsClient() {
  const [data, setData] = useState<InsightsDashboard>(EMPTY_DASHBOARD);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchInsightsDashboard()
      .then(setData)
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load insights ops.'));
  }, []);

  const totals = useMemo(
    () => ({
      contracts: data.products.reduce((sum, entry) => sum + entry.priceAmount, 0),
      apiMrr: data.apiSubscriptions.reduce((sum, entry) => sum + entry.monthlyPrice, 0)
    }),
    [data]
  );

  async function updateStatus(id: string, status: InsightProductRecord['status']) {
    const json = await updateInsightProductApi({ id, status });
    setData((current) => ({
      ...current,
      products: current.products.map((entry) => (entry.id === id ? json.record : entry))
    }));
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Contract value" value={`$${totals.contracts.toFixed(2)}`} />
        <MetricCard label="API MRR" value={`$${totals.apiMrr.toFixed(2)}`} />
        <MetricCard
          label="Subscription MRR"
          value={`$${Math.round(data.subscriptions.metrics.monthlyRecurringRevenue).toLocaleString()}`}
        />
        <MetricCard
          label="Subscription ARR"
          value={`$${Math.round(data.subscriptions.metrics.annualRecurringRevenue).toLocaleString()}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Subscription lanes</h2>
              <p className="mt-1 text-sm text-gray-400">
                Phase 9 premium reporting across member, creator, archive, team, and lifetime families.
              </p>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
              {data.subscriptions.metrics.activeCount} active
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.subscriptions.familySummary.map((entry) => (
              <div key={entry.family} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.label}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {entry.activeCount} active · {entry.cancelledCount} cancelled
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>MRR ${Math.round(entry.monthlyRecurringRevenue).toLocaleString()}</p>
                    <p className="mt-1">ARR ${Math.round(entry.annualRecurringRevenue).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.topPlans.length ? (
                    entry.topPlans.map((planId) => (
                      <span
                        key={planId}
                        className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#f3d780]"
                      >
                        {planId}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No active plans yet.</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">Feature adoption</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <FeatureChip
                label="Creator analytics"
                active={data.subscriptions.metrics.featureAdoption.creatorAnalyticsUnlocked}
              />
              <FeatureChip
                label="Unlimited listings"
                active={data.subscriptions.metrics.featureAdoption.unlimitedListingsUnlocked}
              />
              <FeatureChip
                label="Team workspace"
                active={data.subscriptions.metrics.featureAdoption.teamWorkspaceUnlocked}
              />
              <FeatureChip
                label="Archive access"
                active={data.subscriptions.metrics.featureAdoption.archiveAccessUnlocked}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Recent subscription activity</h2>
          <div className="mt-4 space-y-3">
            {data.subscriptions.recentRecords.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {entry.family} · {entry.planId}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {entry.actorId} · {entry.billingCadence} · {entry.paymentMethod}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
                      entry.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
            {data.subscriptions.recentRecords.length === 0 ? (
              <p className="text-sm text-gray-500">No subscription activity recorded yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Insight products</h2>
          <div className="mt-4 space-y-3">
            {data.products.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.productType}</p>
                    <p className="text-xs text-gray-500">
                      {entry.buyerName} · {entry.pillar || entry.region || 'general'} · $
                      {entry.priceAmount.toFixed(2)}
                    </p>
                  </div>
                  <select
                    value={entry.status}
                    onChange={(e) => void updateStatus(entry.id, e.target.value as InsightProductRecord['status'])}
                    className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none"
                  >
                    {['requested', 'in_progress', 'delivered', 'active'].map((status) => (
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

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">API subscriptions</h2>
          <div className="mt-4 space-y-3">
            {data.apiSubscriptions.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
                <p className="text-white">{entry.apiKeyLabel}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {entry.buyerName} · ${entry.monthlyPrice.toFixed(2)}/month · {entry.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function FeatureChip({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 text-sm ${
        active
          ? 'border-[#d4af37]/25 bg-[#d4af37]/10 text-[#f3d780]'
          : 'border-white/10 bg-black/10 text-gray-400'
      }`}
    >
      {label}
    </div>
  );
}
