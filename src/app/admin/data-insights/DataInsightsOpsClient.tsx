'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchInsightsDashboard, updateInsightProductApi } from '@/app/lib/dataInsightsApi';
import type { InsightsDashboard, InsightProductRecord } from '@/app/lib/dataInsights';

export default function DataInsightsOpsClient() {
  const [data, setData] = useState<InsightsDashboard>({ products: [], apiSubscriptions: [] });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchInsightsDashboard().then(setData).catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load insights ops.'));
  }, []);

  const totals = useMemo(() => ({
    contracts: data.products.reduce((sum, entry) => sum + entry.priceAmount, 0),
    apiMrr: data.apiSubscriptions.reduce((sum, entry) => sum + entry.monthlyPrice, 0)
  }), [data]);

  async function updateStatus(id: string, status: InsightProductRecord['status']) {
    const json = await updateInsightProductApi({ id, status });
    setData((current) => ({ ...current, products: current.products.map((entry) => entry.id === id ? json.record : entry) }));
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Contract value</p><p className="mt-2 text-2xl font-semibold text-white">${totals.contracts.toFixed(2)}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">API MRR</p><p className="mt-2 text-2xl font-semibold text-white">${totals.apiMrr.toFixed(2)}</p></div>
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
                    <p className="text-xs text-gray-500">{entry.buyerName} · {entry.pillar || entry.region || 'general'} · ${entry.priceAmount.toFixed(2)}</p>
                  </div>
                  <select value={entry.status} onChange={(e) => void updateStatus(entry.id, e.target.value as InsightProductRecord['status'])} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                    {['requested', 'in_progress', 'delivered', 'active'].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">API subscriptions</h2>
          <div className="mt-4 space-y-3">
            {data.apiSubscriptions.map((entry) => <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-white">{entry.apiKeyLabel}</p><p className="mt-1 text-xs text-gray-500">{entry.buyerName} · ${entry.monthlyPrice.toFixed(2)}/month · {entry.status}</p></div>)}
          </div>
        </div>
      </div>
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
