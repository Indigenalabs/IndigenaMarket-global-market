'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { fetchAdvocacyServerSnapshot, getDashboardSnapshot, refundAdvocacyDonation } from '@/app/lib/advocacyLegalClientStore';

export default function MyAdvocacyDashboardPage() {
  const [snapshot, setSnapshot] = useState(() => getDashboardSnapshot());
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    setSnapshot(getDashboardSnapshot());
    (async () => {
      const server = await fetchAdvocacyServerSnapshot();
      if (active && server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const requestRefund = async (donationId: string, receiptId?: string) => {
    try {
      const refundReason = typeof window !== 'undefined'
        ? window.prompt('Reason for refund request', 'Duplicate support or incorrect donation amount') || undefined
        : undefined;
      await refundAdvocacyDonation({ donationId, receiptId, refundReason });
      setSnapshot(getDashboardSnapshot());
      setStatus(`Refund request submitted for ${donationId}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Refund failed.');
    }
  };

  return (
    <AdvocacyFrame title="My Advocacy Dashboard" subtitle="Track contributions, alerts, and supported legal outcomes.">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Total Contributed', `$${snapshot.totalContributed.toLocaleString()}`],
          ['Campaigns Supported', snapshot.campaignsSupported.toString()],
          ['Action Alerts Completed', snapshot.actionAlertsCompleted.toString()]
        ].map(([k, v]) => (
          <article key={k} className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-4"><p className="text-xs text-gray-400">{k}</p><p className="mt-1 text-xl font-semibold text-white">{v}</p></article>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {snapshot.recentDonations.length === 0 ? (
          <article className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-4 text-sm text-gray-400">No campaign contributions yet.</article>
        ) : (
          snapshot.recentDonations.map((p) => (
            <article key={p.id} className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{p.campaignTitle}</p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    p.status === 'refunded'
                      ? 'border-red-400/35 bg-red-500/10 text-red-300'
                      : p.status === 'refund_requested'
                        ? 'border-amber-400/35 bg-amber-500/10 text-amber-200'
                      : p.status === 'cancelled'
                        ? 'border-gray-400/35 bg-gray-500/10 text-gray-300'
                        : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                  }`}
                >
                  {p.status || 'succeeded'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
              <p className="mt-2 text-sm text-[#d4af37]">${p.amount.toLocaleString()}</p>
              {p.status === 'succeeded' && p.receiptId ? (
                <button
                  type="button"
                  onClick={() => void requestRefund(p.id, p.receiptId)}
                  className="mt-3 rounded-full border border-red-400/35 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                >
                  Request Refund
                </button>
              ) : p.status === 'refund_requested' ? (
                <p className="mt-3 text-xs text-amber-200">Refund request pending legal review.</p>
              ) : null}
            </article>
          ))
        )}
      </section>

      <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Payment Receipts</h3>
            <p className="mt-1 text-sm text-gray-400">Confirmed donation receipts and payment references.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {snapshot.recentDonationReceipts?.length ? snapshot.recentDonationReceipts.map((receipt) => (
            <article key={receipt.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{receipt.campaignTitle}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${
                  receipt.paymentStatus === 'refunded'
                    ? 'border-red-400/35 bg-red-500/10 text-red-300'
                    : receipt.refundReviewStatus === 'pending'
                      ? 'border-amber-400/35 bg-amber-500/10 text-amber-200'
                    : receipt.paymentStatus === 'cancelled'
                      ? 'border-gray-400/35 bg-gray-500/10 text-gray-300'
                      : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                }`}>
                  {receipt.refundReviewStatus === 'pending' ? 'refund pending' : receipt.paymentStatus}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#d4af37]">{receipt.currency} ${receipt.amount.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-400">Receipt ID: {receipt.id}</p>
              <p className="mt-1 text-xs text-gray-500">Payment Ref: {receipt.paymentIntentId}</p>
              {receipt.receiptUrl ? (
                <Link href={`/advocacy-legal/dashboard/my-advocacy/receipt/${receipt.id}`} className="mt-3 inline-flex rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                  View Receipt
                </Link>
              ) : null}
            </article>
          )) : (
            <article className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">
              No payment receipts available yet.
            </article>
          )}
        </div>
      </section>
      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
    </AdvocacyFrame>
  );
}
