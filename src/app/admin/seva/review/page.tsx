'use client';

import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { fetchSevaReviewQueue, reviewSevaProjectRequest, type SevaProjectRequest } from '@/app/lib/sevaApi';
import { getStoredWalletAddress, setStoredWalletAddress } from '@/app/lib/walletStorage';
import { ShieldCheck, Send, ClipboardCheck } from 'lucide-react';

type ReviewAction = 'approved' | 'needs_info' | 'rejected';
type FundId = 'rapid-response' | 'land-back' | 'innovation';

const ADMIN_WALLETS = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || process.env.NEXT_PUBLIC_ADVOCACY_ADMIN_WALLETS || '')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

export default function SevaReviewPage() {
  const [wallet, setWallet] = useState('');
  const [requests, setRequests] = useState<SevaProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [funds, setFunds] = useState<Record<string, FundId>>({});
  const [submittingId, setSubmittingId] = useState('');

  const canReview = useMemo(() => !ADMIN_WALLETS.length || ADMIN_WALLETS.includes(wallet.trim().toLowerCase()), [wallet]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchSevaReviewQueue();
      setRequests(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Seva review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setWallet(getStoredWalletAddress());
    void load();
  }, []);

  const handleReview = async (requestId: string, reviewAction: ReviewAction) => {
    if (!canReview) {
      setError('Role-gated: only platform admin wallets can review Seva project requests.');
      return;
    }
    setSubmittingId(requestId);
    setError('');
    try {
      await reviewSevaProjectRequest({
        requestId,
        reviewAction,
        reviewNotes: notes[requestId] || '',
        fundId: funds[requestId] || 'innovation'
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save Seva review right now.');
    } finally {
      setSubmittingId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar activePillar="" onPillarChange={() => {}} isCollapsed={false} onCollapseChange={() => {}} />
      <div className="ml-64 min-h-screen">
        <main className="px-6 py-10">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="rounded-[28px] border border-[#d4af37]/15 bg-[#101010] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
                    <ClipboardCheck size={13} />
                    Platform Review Queue
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold">Review and publish Seva project requests</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
                    Only the platform can publish Seva campaigns. Use this queue to approve requests into the correct Sacred Fund, send them back for more information, or decline them.
                  </p>
                </div>
                <button onClick={() => void load()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10">
                  Refresh queue
                </button>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-[#101010] p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Review Access</p>
                  <p className="mt-2 text-sm text-gray-400">Use an approved platform wallet and keep signed admin mode enabled for publishing.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={wallet}
                    onChange={(e) => {
                      const next = e.target.value;
                      setWallet(next);
                      setStoredWalletAddress(next);
                    }}
                    placeholder="Admin wallet address"
                    className="min-w-[280px] rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35"
                  />
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${canReview ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-300' : 'border-red-500/30 bg-red-900/10 text-red-300'}`}>
                    <ShieldCheck size={13} />
                    {canReview ? 'Admin access enabled' : 'Read-only wallet'}
                  </span>
                </div>
              </div>
            </section>

            {error && <div className="rounded-2xl border border-red-500/30 bg-red-900/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-sm text-gray-400">Loading Seva review queue...</div>
            ) : (
              <div className="space-y-5">
                {requests.map((request) => (
                  <article key={request.requestId} className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#d4af37]">
                          {request.status.replace(/_/g, ' ')}
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold">{request.title}</h2>
                        <p className="mt-2 text-sm text-gray-400">{request.community}{request.nation ? ` • ${request.nation}` : ''} • Requested by {request.requesterLabel || request.requesterWallet || 'community representative'}</p>
                        <p className="mt-4 text-sm leading-7 text-gray-300">{request.summary}</p>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Impact Plan</p>
                          <p className="mt-2 text-sm leading-7 text-gray-300">{request.impactPlan}</p>
                        </div>
                      </div>

                      <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Review Decision</p>
                        <div className="mt-4 space-y-3">
                          <select
                            value={funds[request.requestId] || 'innovation'}
                            onChange={(e) => setFunds((prev) => ({ ...prev, [request.requestId]: e.target.value as FundId }))}
                            className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35"
                          >
                            <option value="rapid-response">Rapid Response Fund</option>
                            <option value="land-back">Land Back Fund</option>
                            <option value="innovation">Innovation Fund</option>
                          </select>
                          <textarea
                            value={notes[request.requestId] || request.reviewNotes || ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [request.requestId]: e.target.value }))}
                            placeholder="Platform review notes, clarification requests, or publication rationale"
                            className="min-h-28 w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/35"
                          />
                          <div className="grid gap-3 sm:grid-cols-3">
                            <button onClick={() => void handleReview(request.requestId, 'needs_info')} disabled={submittingId === request.requestId} className="rounded-xl border border-sky-500/30 bg-sky-900/10 px-4 py-3 text-sm font-medium text-sky-300 hover:border-sky-400/40 disabled:opacity-60">
                              Needs info
                            </button>
                            <button onClick={() => void handleReview(request.requestId, 'rejected')} disabled={submittingId === request.requestId} className="rounded-xl border border-red-500/30 bg-red-900/10 px-4 py-3 text-sm font-medium text-red-300 hover:border-red-400/40 disabled:opacity-60">
                              Reject
                            </button>
                            <button onClick={() => void handleReview(request.requestId, 'approved')} disabled={submittingId === request.requestId} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">
                              <Send size={14} />
                              {submittingId === request.requestId ? 'Publishing...' : 'Approve & publish'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {requests.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-sm text-gray-400">No Seva requests are waiting for review right now.</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
