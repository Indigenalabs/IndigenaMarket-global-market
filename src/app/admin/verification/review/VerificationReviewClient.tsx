'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { VerificationPurchaseEventRecord, VerificationPurchaseRecord } from '@/app/lib/verificationPurchases';
import type { ElderSignatureRequestEventRecord, ElderSignatureRequestRecord } from '@/app/lib/elderSignatureRequests';

export default function VerificationReviewClient() {
  const [purchases, setPurchases] = useState<VerificationPurchaseRecord[]>([]);
  const [elderRequests, setElderRequests] = useState<ElderSignatureRequestRecord[]>([]);
  const [purchaseEvents, setPurchaseEvents] = useState<VerificationPurchaseEventRecord[]>([]);
  const [elderRequestEvents, setElderRequestEvents] = useState<ElderSignatureRequestEventRecord[]>([]);
  const [feedback, setFeedback] = useState('');
  const [busyKey, setBusyKey] = useState('');

  async function load() {
    const res = await fetchWithTimeout('/api/admin/verification/review', { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load verification review'));
    const json = (await res.json()) as {
      purchases?: VerificationPurchaseRecord[];
      elderRequests?: ElderSignatureRequestRecord[];
      purchaseEvents?: VerificationPurchaseEventRecord[];
      elderRequestEvents?: ElderSignatureRequestEventRecord[];
    };
    setPurchases(json.purchases || []);
    setElderRequests(json.elderRequests || []);
    setPurchaseEvents(json.purchaseEvents || []);
    setElderRequestEvents(json.elderRequestEvents || []);
  }

  useEffect(() => {
    load().catch((error) => setFeedback(error instanceof Error ? error.message : 'Failed to load verification review'));
  }, []);

  const purchaseRevenue = useMemo(
    () => purchases.filter((entry) => entry.status === 'paid').reduce((sum, entry) => sum + entry.amount, 0),
    [purchases]
  );

  async function updatePurchase(id: string, status: VerificationPurchaseRecord['status']) {
    try {
      setBusyKey(id);
      setFeedback('');
      const res = await fetchWithTimeout('/api/admin/verification/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'purchase', id, status })
      });
      if (!res.ok) throw new Error(await parseApiError(res, 'Failed to update verification purchase'));
      const json = (await res.json()) as { purchase?: VerificationPurchaseRecord | null };
      if (json.purchase) setPurchases((current) => current.map((entry) => (entry.id === id ? json.purchase! : entry)));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to update purchase');
    } finally {
      setBusyKey('');
    }
  }

  async function updateElderRequest(id: string, status: ElderSignatureRequestRecord['status']) {
    try {
      setBusyKey(id);
      setFeedback('');
      const res = await fetchWithTimeout('/api/admin/verification/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'elder-request', id, status })
      });
      if (!res.ok) throw new Error(await parseApiError(res, 'Failed to update elder request'));
      const json = (await res.json()) as { elderRequest?: ElderSignatureRequestRecord | null };
      if (json.elderRequest) {
        setElderRequests((current) => current.map((entry) => (entry.id === id ? json.elderRequest! : entry)));
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Failed to update elder request');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
        <h1 className="text-2xl font-semibold text-white">Verification Review</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          Review paid verification products and elder-signature approval requests from one admin queue.
        </p>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Paid purchases" value={String(purchases.filter((entry) => entry.status === 'paid').length)} />
          <Metric label="Pending purchases" value={String(purchases.filter((entry) => entry.status === 'pending').length)} />
          <Metric label="Pending elder requests" value={String(elderRequests.filter((entry) => entry.status === 'pending').length)} />
          <Metric label="Verification revenue" value={`$${Math.round(purchaseRevenue).toLocaleString()}`} />
        </div>
        {feedback && <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p>}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
        <h2 className="text-lg font-semibold text-white">Verification Purchases</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.24em] text-gray-500">
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Profile</th>
                <th className="px-3 py-3">Actor</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {purchases.map((entry) => (
                <tr key={entry.id} className="text-gray-300">
                  <td className="px-3 py-3">{entry.productName}</td>
                  <td className="px-3 py-3">{entry.profileSlug}</td>
                  <td className="px-3 py-3">{entry.actorId}</td>
                  <td className="px-3 py-3">{entry.status}</td>
                  <td className="px-3 py-3">{`${entry.currency} ${entry.amount}`}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updatePurchase(entry.id, 'paid')} disabled={busyKey === entry.id} className="rounded-full border border-emerald-500/25 px-3 py-1 text-xs text-emerald-300 disabled:opacity-50">Mark paid</button>
                      <button onClick={() => updatePurchase(entry.id, 'cancelled')} disabled={busyKey === entry.id} className="rounded-full border border-red-500/25 px-3 py-1 text-xs text-red-300 disabled:opacity-50">Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 space-y-2">
          <p className="text-sm font-semibold text-white">Purchase event history</p>
          {purchaseEvents.slice(0, 8).map((entry) => (
            <div key={entry.id} className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
              <span className="font-medium text-white">{entry.purchaseId}</span>
              {` • ${entry.status} • ${entry.note} • ${entry.actorId} • ${new Date(entry.createdAt).toLocaleString()}`}
            </div>
          ))}
          {purchaseEvents.length === 0 && <p className="text-sm text-gray-500">No purchase events yet.</p>}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
        <h2 className="text-lg font-semibold text-white">Elder-Signature Requests</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.24em] text-gray-500">
                <th className="px-3 py-3">Requester</th>
                <th className="px-3 py-3">Listing</th>
                <th className="px-3 py-3">Purpose</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {elderRequests.map((entry) => (
                <tr key={entry.id} className="text-gray-300">
                  <td className="px-3 py-3">
                    <div>{entry.requesterName}</div>
                    <div className="text-xs text-gray-500">{entry.affiliation}</div>
                  </td>
                  <td className="px-3 py-3">{entry.listingId}</td>
                  <td className="px-3 py-3">{entry.purpose || 'Not provided'}</td>
                  <td className="px-3 py-3">{entry.status}</td>
                  <td className="px-3 py-3">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'n/a'}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateElderRequest(entry.id, 'approved')} disabled={busyKey === entry.id} className="rounded-full border border-emerald-500/25 px-3 py-1 text-xs text-emerald-300 disabled:opacity-50">Approve</button>
                      <button onClick={() => updateElderRequest(entry.id, 'rejected')} disabled={busyKey === entry.id} className="rounded-full border border-red-500/25 px-3 py-1 text-xs text-red-300 disabled:opacity-50">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 space-y-2">
          <p className="text-sm font-semibold text-white">Elder-signature event history</p>
          {elderRequestEvents.slice(0, 8).map((entry) => (
            <div key={entry.id} className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
              <span className="font-medium text-white">{entry.requestId}</span>
              {` • ${entry.status} • ${entry.note} • ${entry.actorId} • ${new Date(entry.createdAt).toLocaleString()}`}
            </div>
          ))}
          {elderRequestEvents.length === 0 && <p className="text-sm text-gray-500">No elder-signature events yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
