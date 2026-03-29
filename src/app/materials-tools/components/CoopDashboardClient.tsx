'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import {
  fetchMaterialsToolsCoopDashboard,
  updateMaterialsCoopCommitment,
  type MaterialsToolsCoopDashboardResponse
} from '@/app/lib/materialsToolsApi';

export default function CoopDashboardClient() {
  const [data, setData] = useState<MaterialsToolsCoopDashboardResponse | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const load = useCallback(async () => {
    const next = await fetchMaterialsToolsCoopDashboard();
    setData(next);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateCommitment = async (
    commitmentId: string,
    contributionStatus: 'confirmed' | 'awaiting-payment' | 'invoice-issued' | 'invoice-settled' | 'dispatch-ready' | 'closed',
    paymentWindow: string,
    invoiceId?: string,
    dispatchStatus?: 'ready' | 'in-transit' | 'closed'
  ) => {
    setBusyKey(commitmentId);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('update co-op settlement lane');
      await updateMaterialsCoopCommitment({
        commitmentId,
        contributionStatus,
        paymentWindow,
        invoiceId,
        invoiceArtifactUrl: invoiceId ? `/materials-tools/coop/${data?.yourCommitments.find((item) => item.id === commitmentId)?.orderId}?invoice=${invoiceId}` : undefined,
        dispatchStatus
      });
      await load();
      setStatus({
        type: 'success',
        message: `Commitment ${commitmentId} moved into ${contributionStatus.replace(/-/g, ' ')}.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update the co-op commitment.'
      });
    } finally {
      setBusyKey(null);
    }
  };

  if (!data) {
    return <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm text-[#d5cab8]">Loading co-op operating view...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Open runs', String(data.stats.openRuns)],
          ['Your commitments', String(data.stats.yourCommitments)],
          ['Closing soon', String(data.stats.closingSoon)],
          ['Average progress', `${data.stats.avgProgress}%`]
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#bcae99]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Live co-op runs</h3>
            <span className="text-xs text-[#9fe5ea]">{data.source === 'api' ? 'Shared commitment data' : 'Preview co-op state'}</span>
          </div>
          <div className="mt-4 space-y-3">
            {data.openOrders.map((item) => {
              const percent = Math.round((item.committedUnits / Math.max(1, item.targetUnits)) * 100);
              return (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.committedUnits} / {item.targetUnits} units • closes {item.closeDate}</p>
                    </div>
                    <Link href={`/materials-tools/coop/${item.id}`} className="rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-4 py-2 text-sm text-[#f2cb7d] hover:bg-[#d4af37]/18">
                      Open run
                    </Link>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#1d6b74]" style={{ width: `${Math.min(100, percent)}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8fd7dc]">Your commitment queue</h3>
          <div className="mt-4 space-y-3">
            {data.yourCommitments.map((item) => {
              const isBusy = busyKey === item.id;
              return (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-base font-semibold text-white">{item.orderTitle}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.units} units • {item.contributionStatus}</p>
                  <p className="mt-3 text-sm text-[#d7f0f2]">{item.paymentWindow}</p>
                  <p className="mt-2 text-sm text-[#9fe5ea]">{item.freightLane}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy || item.contributionStatus === 'invoice-settled' || item.contributionStatus === 'closed'}
                      onClick={() => void updateCommitment(item.id, 'invoice-settled', 'Invoice settled - pooled dispatch now booking freight windows.', item.invoiceId || `mt-invoice-${item.id.slice(-4)}`, 'ready')}
                      className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f0c96f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? 'Updating...' : item.contributionStatus === 'invoice-settled' || item.contributionStatus === 'dispatch-ready' || item.contributionStatus === 'closed' ? 'Invoice settled' : 'Mark invoice settled'}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void updateCommitment(item.id, 'dispatch-ready', 'Dispatch scheduled - freight bundle closes in 48 hours.', item.invoiceId || `mt-invoice-${item.id.slice(-4)}`, 'in-transit')}
                      className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] transition hover:bg-[#1d6b74]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Move to dispatch
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void updateCommitment(item.id, 'closed', 'Dispatch closeout signed. Local hubs can release member pickups.', item.invoiceId || `mt-invoice-${item.id.slice(-4)}`, 'closed')}
                      className="rounded-full border border-emerald-400/35 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Close dispatch
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#d5cab8] md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">Invoice: {item.invoiceId || 'Releases when pooled counts lock'}</div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">Dispatch: {item.dispatchStatus || 'not-started'}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Milestones and close windows</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.milestones.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.date}</p>
              <p className="mt-2 text-base font-semibold text-white">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-[#d5cab8]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {status.type !== 'idle' ? (
        <div className={`rounded-2xl border p-4 text-sm ${status.type === 'success' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/30 bg-rose-500/10 text-rose-200'}`}>
          {status.message}
        </div>
      ) : null}
    </div>
  );
}
