'use client';

import { useEffect, useState } from 'react';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { submitRentalBooking } from '@/app/lib/materialsToolsApi';
import { fetchWalletSessionMe } from '@/app/lib/walletAuthClient';

function getDefaultBookingDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

export default function RentalBookingPanel({
  rentalId,
  availability
}: {
  rentalId: string;
  availability: string;
}) {
  const [bookingDate, setBookingDate] = useState(getDefaultBookingDate);
  const [sessionWindow, setSessionWindow] = useState('Morning access block');
  const [submitting, setSubmitting] = useState(false);
  const [walletReady, setWalletReady] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  useEffect(() => {
    let active = true;

    const syncWalletState = async () => {
      try {
        const me = await fetchWalletSessionMe();
        if (!active) return;
        setWalletReady(Boolean(me?.walletAddress));
      } catch {
        if (!active) return;
        const storedWallet = typeof window !== 'undefined'
          ? (window.localStorage.getItem('indigena_wallet_address') || '').trim()
          : '';
        setWalletReady(Boolean(storedWallet));
      }
    };

    void syncWalletState();
    const handler = () => { void syncWalletState(); };
    window.addEventListener('indigena-wallet-session-changed', handler);
    return () => {
      active = false;
      window.removeEventListener('indigena-wallet-session-changed', handler);
    };
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('reserve tool-library access');
      const result = await submitRentalBooking({ rentalId, bookingDate, sessionWindow });
      const booking = result?.booking;
      const bookingId = String(booking?.id || '').trim();
      const accessStatus = String(booking?.accessStatus || booking?.access_status || 'orientation-required');
      setStatus({
        type: 'success',
        message:
          accessStatus === 'waitlisted'
            ? `Access request ${bookingId || 'submitted'} is waitlisted for this session. The hub will release deposit instructions if a slot clears.`
            : `Access request ${bookingId || 'submitted'} is in the hub queue. Orientation and deposit confirmation come next.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to submit the rental booking.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Reservation lane</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">Reserve access with a real booking record</h3>
      <p className="mt-3 text-sm leading-7 text-[#d7f0f2]">
        Select a date and session block so the hub can confirm orientation, collect any deposit, and hold the equipment against your booking.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[#d7f0f2]">
          <span>Requested date</span>
          <input
            type="date"
            value={bookingDate}
            onChange={(event) => setBookingDate(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#1d6b74]/55"
          />
        </label>
        <label className="space-y-2 text-sm text-[#d7f0f2]">
          <span>Session window</span>
          <select
            value={sessionWindow}
            onChange={(event) => setSessionWindow(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#1d6b74]/55"
          >
            <option>Morning access block</option>
            <option>Afternoon access block</option>
            <option>Full-day supervised access</option>
          </select>
        </label>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#d7f0f2]">
        Availability snapshot: {availability}
      </div>
      <div className="mt-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 p-4 text-sm text-[#f4df9b]">
        Matching the same day and session window against an existing booking will move the request into the waitlist lane automatically.
      </div>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={submitting}
        className="mt-5 rounded-full bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f0c96f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Reserving...' : walletReady ? 'Reserve access' : 'Sign In and reserve'}
      </button>
      {status.type !== 'idle' ? (
        <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{status.message}</p>
      ) : null}
    </section>
  );
}



