'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSevaCorporateMatchApi, createSevaDonorToolApi, createSevaImpactReportApi, createSevaProjectAdminApi, fetchSevaImpactDashboard } from '@/app/lib/sevaImpactApi';
import type { SevaImpactDashboard, SevaDonorToolRecord } from '@/app/lib/sevaImpactServices';
import { fetchHybridFundingOverview } from '@/app/lib/hybridFundingApi';
import type { HybridFundingSummary } from '@/app/lib/phase8HybridFunding';

export default function SevaOperationsClient() {
  const [data, setData] = useState<SevaImpactDashboard>({ projectAdmin: [], corporateMatches: [], impactReports: [], donorTools: [] });
  const [fundingSummary, setFundingSummary] = useState<HybridFundingSummary | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    Promise.all([
      fetchSevaImpactDashboard(),
      fetchHybridFundingOverview('seva')
    ])
      .then(([dashboard, summary]) => {
        setData(dashboard);
        setFundingSummary(summary);
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load Seva operations.'));
  }, []);

  const summary = useMemo(() => ({
    fundsManaged: data.projectAdmin.reduce((sum, entry) => sum + entry.fundsManaged, 0),
    donorRetention: data.projectAdmin.length > 0 ? data.projectAdmin.reduce((sum, entry) => sum + entry.donorRetentionRate, 0) / data.projectAdmin.length : 0,
    reportingContracts: data.impactReports.reduce((sum, entry) => sum + entry.contractAmount, 0)
  }), [data]);

  async function seedProjectAdmin() {
    const record = await createSevaProjectAdminApi({ requestId: 'seed-request', projectId: 'seed-project', fundsManaged: 250000, donorCount: 480 });
    setData((current) => ({ ...current, projectAdmin: [record, ...current.projectAdmin] }));
  }
  async function seedCorporateMatch() {
    const record = await createSevaCorporateMatchApi({ companyName: 'Reciprocity Holdings', projectId: 'seed-project', committedAmount: 100000, matchedAmount: 20000 });
    setData((current) => ({ ...current, corporateMatches: [record, ...current.corporateMatches] }));
  }
  async function seedImpactReport() {
    const record = await createSevaImpactReportApi({ clientName: 'Global Museum Trust', projectId: 'seed-project', contractAmount: 5000 });
    setData((current) => ({ ...current, impactReports: [record, ...current.impactReports] }));
  }
  async function seedDonorTool() {
    const record = await createSevaDonorToolApi({ actorId: 'seva-donor', projectId: 'seed-project', toolType: 'impact-digest' as SevaDonorToolRecord['toolType'] });
    setData((current) => ({ ...current, donorTools: [record, ...current.donorTools] }));
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Funds managed</p><p className="mt-2 text-2xl font-semibold text-white">${summary.fundsManaged.toFixed(2)}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Donor retention</p><p className="mt-2 text-2xl font-semibold text-white">{(summary.donorRetention * 100).toFixed(1)}%</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Reporting contracts</p><p className="mt-2 text-2xl font-semibold text-white">${summary.reportingContracts.toFixed(2)}</p></div>
      </div>

      {fundingSummary ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-[#d4af37]/15 bg-[linear-gradient(180deg,rgba(212,175,55,0.10),rgba(0,0,0,0.20))] p-5"><p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Hybrid receipts</p><p className="mt-2 text-2xl font-semibold text-white">{fundingSummary.totalReceipts}</p></div>
          <div className="rounded-[24px] border border-[#d4af37]/15 bg-[linear-gradient(180deg,rgba(212,175,55,0.10),rgba(0,0,0,0.20))] p-5"><p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Gross donated</p><p className="mt-2 text-2xl font-semibold text-white">${fundingSummary.totalGrossAmount.toFixed(2)}</p></div>
          <div className="rounded-[24px] border border-[#d4af37]/15 bg-[linear-gradient(180deg,rgba(212,175,55,0.10),rgba(0,0,0,0.20))] p-5"><p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Service layer</p><p className="mt-2 text-2xl font-semibold text-white">${fundingSummary.totalServiceFees.toFixed(2)}</p></div>
          <div className="rounded-[24px] border border-[#d4af37]/15 bg-[linear-gradient(180deg,rgba(212,175,55,0.10),rgba(0,0,0,0.20))] p-5"><p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Net to projects</p><p className="mt-2 text-2xl font-semibold text-white">${fundingSummary.totalNetAmount.toFixed(2)}</p></div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <button onClick={() => void seedProjectAdmin()} className="rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black">Create project admin</button>
        <button onClick={() => void seedCorporateMatch()} className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white">Create corporate match</button>
        <button onClick={() => void seedImpactReport()} className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white">Create impact report</button>
        <button onClick={() => void seedDonorTool()} className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white">Activate donor tool</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Project administration</h2>
          <div className="mt-4 space-y-3">
            {data.projectAdmin.map((entry) => <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-white">{entry.projectId}</p><p className="mt-1 text-xs text-gray-500">${entry.fundsManaged.toFixed(2)} managed · fee ${entry.serviceFeeAmount.toFixed(2)} · {entry.status}</p></div>)}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Corporate matching</h2>
          <div className="mt-4 space-y-3">
            {data.corporateMatches.map((entry) => <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-white">{entry.companyName}</p><p className="mt-1 text-xs text-gray-500">${entry.committedAmount.toFixed(2)} committed · fee ${entry.adminFeeAmount.toFixed(2)} · {entry.status}</p></div>)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Impact reports</h2>
          <div className="mt-4 space-y-3">
            {data.impactReports.map((entry) => <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-white">{entry.clientName}</p><p className="mt-1 text-xs text-gray-500">${entry.contractAmount.toFixed(2)} contract · {entry.status}</p></div>)}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Donor tools</h2>
          <div className="mt-4 space-y-3">
            {data.donorTools.map((entry) => <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-white">{entry.toolType}</p><p className="mt-1 text-xs text-gray-500">{entry.actorId} · {entry.projectId} · {entry.status}</p></div>)}
          </div>
        </div>
      </div>
      {fundingSummary ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
            <h2 className="text-lg font-semibold text-white">Sacred fund lanes</h2>
            <div className="mt-4 space-y-3">
              {fundingSummary.byLane.filter((entry) => entry.count > 0).map((entry) => (
                <div key={entry.key} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white">{entry.label}</p>
                    <span className="text-xs text-[#d4af37]">{entry.count} receipts</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">${entry.grossAmount.toFixed(2)} gross · ${entry.netAmount.toFixed(2)} net</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
            <h2 className="text-lg font-semibold text-white">Recent donor receipts</h2>
            <div className="mt-4 space-y-3">
              {fundingSummary.recentReceipts.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white">{entry.sevaProjectTitle || entry.beneficiaryLabel}</p>
                    <span className="text-xs text-[#d4af37]">{entry.laneLabel}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{entry.supporterName} · ${entry.amountGross.toFixed(2)} gross · ${entry.beneficiaryNet.toFixed(2)} net</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
