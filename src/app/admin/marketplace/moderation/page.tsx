'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  decideFreelanceReport,
  decidePhysicalReport,
  fetchFreelancingModerationQueue,
  fetchPhysicalModerationQueue,
  type FreelanceModerationReport,
  type PhysicalModerationReport
} from '@/app/lib/moderationAdminApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

type Decision = 'resolve' | 'dismiss' | 'review';
type QueueStatus = 'open' | 'under_review' | 'resolved' | 'dismissed' | 'all';

export default function MarketplaceModerationPage() {
  const [adminWalletInput, setAdminWalletInput] = useState('');
  const [activeAdminWallet, setActiveAdminWallet] = useState('');
  const [tab, setTab] = useState<'physical' | 'freelancing'>('physical');
  const [statusFilter, setStatusFilter] = useState<QueueStatus>('open');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [physical, setPhysical] = useState<PhysicalModerationReport[]>([]);
  const [freelancing, setFreelancing] = useState<FreelanceModerationReport[]>([]);
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved =
      window.localStorage.getItem('indigena_admin_wallet') ||
      window.localStorage.getItem('indigena_wallet_address') ||
      '';
    setAdminWalletInput(saved);
    setActiveAdminWallet(saved || 'demo-admin-wallet');
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, f] = await Promise.all([
        fetchPhysicalModerationQueue(statusFilter),
        fetchFreelancingModerationQueue(statusFilter)
      ]);
      setPhysical(p.data.reports || []);
      setFreelancing(f.data.reports || []);
    } catch (e) {
      setError((e as Error).message || 'Failed to load moderation queues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const filteredPhysical = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return physical;
    return physical.filter((r) =>
      `${r.itemId} ${r.reason} ${r.details || ''} ${r.reporterAddress || ''}`.toLowerCase().includes(q)
    );
  }, [physical, search]);

  const filteredFreelancing = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return freelancing;
    return freelancing.filter((r) =>
      `${r.serviceId} ${r.reason} ${r.details || ''} ${r.reporterAddress || ''}`.toLowerCase().includes(q)
    );
  }, [freelancing, search]);

  const applyDecision = async (reportId: string, decision: Decision) => {
    const notes = noteById[reportId] || '';
    try {
      if (tab === 'physical') {
        await decidePhysicalReport(reportId, decision, notes);
      } else {
        await decideFreelanceReport(reportId, decision, notes);
      }
      await load();
    } catch (e) {
      setError((e as Error).message || 'Failed to apply decision');
    }
  };

  const saveAdminWallet = async () => {
    let wallet = adminWalletInput.trim();
    if (!wallet) {
      try {
        wallet = (await requireWalletAction('access the marketplace moderation console')).wallet;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Sign in to access the moderation console.');
        return;
      }
    }
    window.localStorage.setItem('indigena_admin_wallet', wallet);
    setActiveAdminWallet(wallet);
    void load();
  };

  const rows = tab === 'physical' ? filteredPhysical : filteredFreelancing;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Marketplace Moderation</h1>
            <p className="text-gray-400 text-sm">Physical + freelancing report queue with resolve/reject actions</p>
          </div>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-[#141414] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10"
          >
            Refresh
          </button>
        </div>

        <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[240px]">
            <p className="text-xs text-gray-400">Active Admin Wallet</p>
            <p className="text-sm text-[#d4af37] break-all">{activeAdminWallet || 'not set'}</p>
          </div>
          <input
            value={adminWalletInput}
            onChange={(e) => setAdminWalletInput(e.target.value)}
            placeholder="Enter admin wallet address"
            className="flex-1 min-w-[260px] bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
          />
          <button
            onClick={() => void saveAdminWallet()}
            className="px-4 py-2 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-sm"
          >
            Save Wallet
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg border border-[#d4af37]/20 overflow-hidden">
            <button
              onClick={() => setTab('physical')}
              className={`px-4 py-2 text-sm ${tab === 'physical' ? 'bg-[#d4af37] text-black' : 'bg-[#141414] text-gray-300'}`}
            >
              Physical Reports ({physical.length})
            </button>
            <button
              onClick={() => setTab('freelancing')}
              className={`px-4 py-2 text-sm ${tab === 'freelancing' ? 'bg-[#d4af37] text-black' : 'bg-[#141414] text-gray-300'}`}
            >
              Freelancing Reports ({freelancing.length})
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QueueStatus)}
            className="bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All</option>
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search id, reason, reporter"
            className="w-72 bg-[#141414] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
          />
        </div>

        {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{error}</div>}
        {loading && <div className="text-sm text-gray-400">Loading moderation queue...</div>}

        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r._id} className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-white font-medium">
                    {tab === 'physical' ? `Item ${'itemId' in r ? r.itemId : ''}` : `Service ${'serviceId' in r ? r.serviceId : ''}`}
                  </p>
                  <p className="text-xs text-gray-400">Report {r._id} - {new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-[#d4af37]/20 text-[#d4af37] uppercase">{r.status}</span>
              </div>

              <div className="text-sm text-gray-300">
                <p><span className="text-gray-400">Reason:</span> {r.reason}</p>
                {r.details ? <p className="mt-1"><span className="text-gray-400">Details:</span> {r.details}</p> : null}
                <p className="mt-1"><span className="text-gray-400">Reporter:</span> {r.reporterAddress || 'anonymous'}</p>
              </div>

              <textarea
                value={noteById[r._id] || ''}
                onChange={(e) => setNoteById((prev) => ({ ...prev, [r._id]: e.target.value }))}
                placeholder="Moderator note"
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                rows={2}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyDecision(r._id, 'resolve')}
                  className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-600/50 text-green-300 text-sm"
                >
                  Resolve
                </button>
                <button
                  onClick={() => applyDecision(r._id, 'review')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm"
                >
                  Under Review
                </button>
                <button
                  onClick={() => applyDecision(r._id, 'dismiss')}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/50 text-red-300 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}

          {!loading && rows.length === 0 && (
            <div className="text-gray-400 text-sm">No reports found for the selected filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}



