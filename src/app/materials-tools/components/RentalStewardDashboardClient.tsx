'use client';

import { useCallback, useEffect, useState } from 'react';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import {
  fetchMaterialsToolsRentalDashboard,
  updateMaterialsRentalBooking,
  type MaterialsToolsRentalDashboardResponse
} from '@/app/lib/materialsToolsApi';

export default function RentalStewardDashboardClient() {
  const [data, setData] = useState<MaterialsToolsRentalDashboardResponse | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const load = useCallback(async () => {
    const next = await fetchMaterialsToolsRentalDashboard();
    setData(next);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runWorkflow = async (
    bookingId: string,
    accessStatus: 'confirmed' | 'waitlisted' | 'checked-out' | 'returned',
    depositLabel: string,
    conditionStatus?: 'in-use' | 'returned-good' | 'returned-maintenance',
    conditionNotes?: string
  ) => {
    setBusyKey(bookingId);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('manage tool-library steward queue');
      await updateMaterialsRentalBooking({ bookingId, accessStatus, depositLabel, conditionStatus, conditionNotes });
      await load();
      setStatus({
        type: 'success',
        message: `Booking ${bookingId} moved into ${accessStatus.replace(/-/g, ' ')}.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to update the steward queue.'
      });
    } finally {
      setBusyKey(null);
    }
  };

  if (!data) {
    return <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-sm text-[#d5cab8]">Loading steward queue...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-5">
        {[
          ['Total bookings', String(data.stats.totalBookings)],
          ['Waiting review', String(data.stats.waitingReview)],
          ['Confirmed', String(data.stats.confirmed)],
          ['Checked out', String(data.stats.checkedOut || 0)],
          ['Returned', String(data.stats.returned || 0)]
        ].map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#bcae99]">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            </article>
          ))}
      </section>

      <section className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8fd7dc]">Steward approval queue</h3>
          <span className="text-xs text-[#d7f0f2]">{data.source === 'api' ? 'Live booking queue' : 'Preview booking queue'}</span>
        </div>
        <div className="mt-4 space-y-3">
          {data.bookings.map((item) => {
            const isBusy = busyKey === item.id;
            return (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">{item.rentalTitle}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#c5b7a6]">{item.bookingDate} • {item.sessionWindow}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#d7f0f2]">{item.accessStatus}</span>
                </div>
                  <p className="mt-3 text-sm text-[#d7f0f2]">{item.depositLabel}</p>
                  <p className="mt-2 text-sm text-[#cbd8d9]">Condition lane: {item.conditionStatus || 'not-started'}</p>
                  {item.conditionNotes ? <p className="mt-2 text-sm text-[#9fe5ea]">{item.conditionNotes}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy || item.accessStatus === 'confirmed'}
                      onClick={() => void runWorkflow(item.id, 'confirmed', item.depositLabel.replace('pending approval', 'captured and confirmed'))}
                      className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f0c96f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? 'Updating...' : item.accessStatus === 'confirmed' ? 'Confirmed' : 'Approve slot'}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void runWorkflow(item.id, 'waitlisted', 'Waitlist only - steward is holding this slot for the next release window')}
                      className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] transition hover:bg-[#1d6b74]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Move to waitlist
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || item.accessStatus !== 'confirmed'}
                      onClick={() => void runWorkflow(item.id, 'checked-out', item.depositLabel, 'in-use')}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark checked out
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || (item.accessStatus !== 'checked-out' && item.accessStatus !== 'confirmed')}
                      onClick={() => void runWorkflow(item.id, 'returned', item.depositLabel, 'returned-good', 'Steward checked return condition and signed down the access log.')}
                      className="rounded-full border border-emerald-400/35 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark returned
                    </button>
                  </div>
                </article>
              );
          })}
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
