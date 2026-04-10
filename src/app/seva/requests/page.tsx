'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { fetchMySevaProjectRequests, type SevaProjectRequest } from '@/app/lib/sevaApi';
import { ClipboardList, Clock3, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

const STATUS_META: Record<string, { label: string; tone: string; icon: ReactNode }> = {
  pending_review: { label: 'Pending Review', tone: 'border-amber-500/30 bg-amber-900/10 text-amber-300', icon: <Clock3 size={14} /> },
  approved: { label: 'Approved & Published', tone: 'border-emerald-500/30 bg-emerald-900/10 text-emerald-300', icon: <CheckCircle2 size={14} /> },
  needs_info: { label: 'Needs More Information', tone: 'border-sky-500/30 bg-sky-900/10 text-sky-300', icon: <AlertCircle size={14} /> },
  rejected: { label: 'Not Accepted', tone: 'border-red-500/30 bg-red-900/10 text-red-300', icon: <XCircle size={14} /> }
};

export default function SevaRequestsPage() {
  const [requests, setRequests] = useState<SevaProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      await requireWalletAction('view your Seva project requests');
      const rows = await fetchMySevaProjectRequests();
      setRequests(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your Seva requests right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar activePillar="seva" onPillarChange={() => {}} isCollapsed={false} onCollapseChange={() => {}} />
      <div className="ml-64 min-h-screen">
        <main className="px-6 py-10">
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="relative overflow-hidden rounded-[32px] border border-[#d4af37]/15 bg-[linear-gradient(135deg,rgba(220,20,60,0.10),rgba(16,16,16,0.98)_38%,rgba(212,175,55,0.12))] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,20,60,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.14),transparent_28%)]" />
              <div className="relative">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
                    <ClipboardList size={13} />
                    Request Status
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold">Track your Seva project requests</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
                    Seva is platform-governed. This dashboard shows whether your request is pending review, needs more detail,
                    or has been approved and published into one of the Sacred Funds.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => void load()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10">
                    Refresh
                  </button>
                  <Link href="/seva" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                    Submit new request
                  </Link>
                </div>
              </div>
              </div>
            </section>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-900/10 px-4 py-3 text-sm text-red-300">{error}</div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-sm text-gray-400">Loading your Seva requests...</div>
            ) : requests.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(8,8,8,0.92))] p-8">
                <p className="text-lg font-medium text-white">No Seva requests yet</p>
                <p className="mt-2 text-sm text-gray-400">Once you submit a project for platform review, it will appear here with governance status and any review notes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const meta = STATUS_META[request.status] ?? STATUS_META.pending_review;
                  return (
                    <article key={request.requestId} className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,16,16,0.96),rgba(8,8,8,0.92))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${meta.tone}`}>
                            {meta.icon}
                            {meta.label}
                          </div>
                          <h2 className="mt-4 text-2xl font-semibold text-white">{request.title}</h2>
                          <p className="mt-2 text-sm text-gray-400">{request.community}{request.nation ? ` | ${request.nation}` : ''} | {request.category.replace(/_/g, ' ')}</p>
                          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-300">{request.summary}</p>
                        </div>
                        <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
                          <p>Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-AU') : 'Recently'}</p>
                          {request.targetAmount > 0 && <p className="mt-1">Target: ${request.targetAmount.toLocaleString()}</p>}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr,1fr]">
                        <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Impact Plan</p>
                          <p className="mt-3 text-sm leading-7 text-gray-300">{request.impactPlan}</p>
                        </div>
                        <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Platform Review Notes</p>
                          <p className="mt-3 text-sm leading-7 text-gray-300">
                            {request.reviewNotes || 'No review notes yet. Platform reviewers will add guidance here if more information is needed.'}
                          </p>
                          {request.publishedProjectId && (
                            <div className="mt-4 space-y-3">
                              <div className="rounded-[18px] border border-[#d4af37]/20 bg-[#d4af37]/10 p-3 text-sm text-[#f3deb1]">
                                Published into the Sacred Fund system. Donor tools and project admin tracking are now active for this request.
                              </div>
                              <Link href="/seva" className="inline-flex items-center gap-2 text-sm font-medium text-[#d4af37] hover:text-[#f4d370]">
                                View live Seva project
                                <ArrowRight size={14} />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
