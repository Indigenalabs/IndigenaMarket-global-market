'use client';

import { useState } from 'react';
import { createInsightApiSubscriptionApi, createInsightProductApi } from '@/app/lib/dataInsightsApi';
import type { InsightProductRecord } from '@/app/lib/dataInsights';

export default function InsightsPage() {
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({
    buyerName: '',
    buyerEmail: '',
    usagePurpose: '',
    region: 'North America',
    pillar: 'cross-pillar',
    contractTerm: 'annual',
    apiKeyLabel: 'research-lab',
    consentAccepted: false
  });

  async function orderProduct(productType: InsightProductRecord['productType']) {
    const record = await createInsightProductApi({
      productType,
      buyerName: form.buyerName,
      buyerEmail: form.buyerEmail,
      usagePurpose: form.usagePurpose,
      consentAccepted: form.consentAccepted,
      scopes: ['aggregated-market-data'],
      region: form.region,
      pillar: form.pillar,
      contractTerm: form.contractTerm
    });
    setFeedback(`Insight order created: ${record.productType} for ${record.priceAmount.toFixed(2)} USD. Governance review is now tracking the consent request.`);
  }

  async function activateApi() {
    const record = await createInsightApiSubscriptionApi({
      buyerName: form.buyerName,
      buyerEmail: form.buyerEmail,
      apiKeyLabel: form.apiKeyLabel,
      usagePurpose: form.usagePurpose,
      consentAccepted: form.consentAccepted,
      scopes: ['api-access', 'aggregated-market-data']
    });
    setFeedback(`API subscription created at ${record.monthlyPrice.toFixed(2)} USD/month. Governance review is now tracking the consent request.`);
  }

  const canSubmit = form.buyerName.trim().length > 1 && /\S+@\S+\.\S+/.test(form.buyerEmail) && form.usagePurpose.trim().length > 8 && form.consentAccepted;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Data & insights</p>
          <h1 className="mt-2 text-4xl font-semibold">Reports, research, forecasting, API access</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">Phase 7 adds governance-backed consent controls for all monetized insight products and API access.</p>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
          <h2 className="text-lg font-semibold text-white">Data-use request profile</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={form.buyerName} onChange={(e) => setForm((current) => ({ ...current, buyerName: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Organization or buyer name" />
            <input value={form.buyerEmail} onChange={(e) => setForm((current) => ({ ...current, buyerEmail: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Contact email" />
            <input value={form.region} onChange={(e) => setForm((current) => ({ ...current, region: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Region" />
            <input value={form.pillar} onChange={(e) => setForm((current) => ({ ...current, pillar: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Pillar or scope" />
            <input value={form.contractTerm} onChange={(e) => setForm((current) => ({ ...current, contractTerm: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Contract term" />
            <input value={form.apiKeyLabel} onChange={(e) => setForm((current) => ({ ...current, apiKeyLabel: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="API key label" />
            <textarea value={form.usagePurpose} onChange={(e) => setForm((current) => ({ ...current, usagePurpose: e.target.value }))} className="min-h-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2" placeholder="Describe the intended use, audience, and governance context for the requested data product." />
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.consentAccepted} onChange={(e) => setForm((current) => ({ ...current, consentAccepted: e.target.checked }))} className="mt-1" />
            <span>I confirm this request is for aggregated, community-consented data use and understand that governance approval is required before delivery.</span>
          </label>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <button disabled={!canSubmit} onClick={() => void orderProduct('annual-report')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left disabled:opacity-50"><p className="text-white font-semibold">Annual report</p><p className="mt-2 text-sm text-gray-400">$5,000 market report purchase.</p></button>
          <button disabled={!canSubmit} onClick={() => void orderProduct('custom-research')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left disabled:opacity-50"><p className="text-white font-semibold">Custom research</p><p className="mt-2 text-sm text-gray-400">$25,000 tailored analysis for regions and pillars.</p></button>
          <button disabled={!canSubmit} onClick={() => void orderProduct('regional-analysis')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left disabled:opacity-50"><p className="text-white font-semibold">Regional analysis</p><p className="mt-2 text-sm text-gray-400">$10,000 region-specific economic deep dive.</p></button>
          <button disabled={!canSubmit} onClick={() => void orderProduct('trend-forecast')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left disabled:opacity-50"><p className="text-white font-semibold">Trend forecast</p><p className="mt-2 text-sm text-gray-400">$500 predictive forecast subscription lane.</p></button>
          <button disabled={!canSubmit} onClick={() => void activateApi()} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left md:col-span-2 disabled:opacity-50"><p className="text-white font-semibold">API access</p><p className="mt-2 text-sm text-gray-400">$1,000/month real-time market data subscription.</p></button>
        </div>
        {feedback ? <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-sm text-[#f3deb1]">{feedback}</section> : null}
      </div>
    </main>
  );
}