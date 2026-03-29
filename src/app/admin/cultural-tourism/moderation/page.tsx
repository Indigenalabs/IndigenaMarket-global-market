'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  decideTourismModerationItem,
  exportTourismModerationAudit,
  fetchTourismFunnelMetrics,
  fetchTourismModerationQueue,
  fetchTourismOpsDashboard,
  runTourismSyntheticCheck,
  type TourismFunnelMetrics,
  type TourismModerationItem
} from '@/app/lib/culturalTourismApi';

type StatusFilter = TourismModerationItem['status'] | 'all';

function isAdminWallet(wallet: string) {
  if (typeof window === 'undefined') return false;
  const saved = (window.localStorage.getItem('indigena_admin_wallets') || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const single = (window.localStorage.getItem('indigena_admin_wallet') || '').trim().toLowerCase();
  if (single) saved.push(single);
  return wallet.trim().length > 0 && saved.includes(wallet.trim().toLowerCase());
}

export default function CulturalTourismModerationPage() {
  const [walletInput, setWalletInput] = useState('');
  const [activeWallet, setActiveWallet] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState<TourismModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ops, setOps] = useState<null | {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    paymentFailures: number;
    openModeration: number;
    commsQueued: number;
    conversion: number;
    alerts: string[];
  }>(null);
  const [funnel, setFunnel] = useState<TourismFunnelMetrics | null>(null);
  const [synth, setSynth] = useState<Array<{ id: string; ok: boolean; detail: string }>>([]);
  const [exportText, setExportText] = useState('');

  const canModerate = isAdminWallet(activeWallet);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTourismModerationQueue(status);
      setQueue(data);
    } catch (e) {
      setError((e as Error).message || 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved =
      window.localStorage.getItem('indigena_admin_wallet') ||
      window.localStorage.getItem('indigena_wallet_address') ||
      '';
    setWalletInput(saved);
    setActiveWallet(saved);
    load();
  }, [status]);

  useEffect(() => {
    if (!canModerate) return;
    const loadOps = async () => {
      try {
        const [opsData, funnelData, synthData] = await Promise.all([
          fetchTourismOpsDashboard(),
          fetchTourismFunnelMetrics(),
          runTourismSyntheticCheck()
        ]);
        setOps(opsData);
        setFunnel(funnelData);
        setSynth(synthData.checks || []);
      } catch (e) {
        setError((e as Error).message || 'Failed to load ops metrics');
      }
    };
    void loadOps();
  }, [canModerate]);

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return queue;
    return queue.filter((x) => `${x.listingTitle} ${x.reason} ${x.issueType}`.toLowerCase().includes(q));
  }, [queue, search]);

  const decide = async (id: string, decision: 'resolve' | 'dismiss' | 'review') => {
    if (!canModerate) {
      setError('Role-gated: only admin wallets can moderate.');
      return;
    }
    try {
      await decideTourismModerationItem(id, decision);
      await load();
    } catch (e) {
      setError((e as Error).message || 'Decision failed');
    }
  };

  const saveWallet = () => {
    const w = walletInput.trim();
    if (!w) return;
    window.localStorage.setItem('indigena_admin_wallet', w);
    setActiveWallet(w);
  };

  const exportAudit = async () => {
    if (!canModerate) {
      setError('Role-gated: only admin wallets can export audit.');
      return;
    }
    try {
      const data = await exportTourismModerationAudit('csv');
      setExportText(String(data || ''));
    } catch (e) {
      setError((e as Error).message || 'Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl text-white font-bold">Cultural Tourism Moderation Queue</h1>
          <p className="text-sm text-gray-400">Phase 2 trust/compliance: protocol, authenticity, safety, and content moderation.</p>
        </div>

        <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4 flex flex-wrap gap-3 items-center">
          <input value={walletInput} onChange={(e) => setWalletInput(e.target.value)} placeholder="Admin wallet address" className="flex-1 min-w-[280px] px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#d4af37]/20 text-white text-sm" />
          <button onClick={saveWallet} className="px-4 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-sm">Save Wallet</button>
          <span className={`text-xs px-2 py-1 rounded-full border ${canModerate ? 'border-emerald-500/40 text-emerald-300' : 'border-red-500/40 text-red-300'}`}>{canModerate ? 'Admin access enabled' : 'Read-only (non-admin wallet)'}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="px-3 py-2 rounded-lg bg-[#141414] border border-[#d4af37]/20 text-white text-sm">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search queue" className="px-3 py-2 rounded-lg bg-[#141414] border border-[#d4af37]/20 text-white text-sm" />
          <button onClick={load} className="px-4 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-sm">Refresh</button>
          <button onClick={exportAudit} className="px-4 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-sm" disabled={!canModerate}>Export Audit CSV</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
            <p className="text-xs text-gray-400">Booking Conversion</p>
            <p className="text-2xl text-white font-semibold">{ops ? `${(ops.conversion * 100).toFixed(1)}%` : '--'}</p>
            <p className="text-xs text-gray-500 mt-1">Confirmed: {ops?.confirmedBookings ?? '--'} / Total: {ops?.totalBookings ?? '--'}</p>
          </div>
          <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
            <p className="text-xs text-gray-400">Open Moderation</p>
            <p className="text-2xl text-white font-semibold">{ops?.openModeration ?? '--'}</p>
            <p className="text-xs text-gray-500 mt-1">Pending bookings: {ops?.pendingBookings ?? '--'}</p>
          </div>
          <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
            <p className="text-xs text-gray-400">Synthetic Checks</p>
            <p className="text-2xl text-white font-semibold">{synth.filter((x) => x.ok).length}/{synth.length || '--'}</p>
            <p className="text-xs text-gray-500 mt-1">Failures: {synth.filter((x) => !x.ok).length}</p>
          </div>
        </div>

        {(ops?.alerts?.length || 0) > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-900/10 p-3">
            <p className="text-xs text-red-300">Ops Alerts: {ops?.alerts.join(', ')}</p>
          </div>
        )}

        {funnel && (
          <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4 text-xs text-gray-300 grid grid-cols-2 md:grid-cols-6 gap-2">
            <span>Searches: {funnel.searches}</span>
            <span>Views: {funnel.views}</span>
            <span>Starts: {funnel.starts}</span>
            <span>Completed: {funnel.completed}</span>
            <span>Start Rate: {(funnel.startRate * 100).toFixed(1)}%</span>
            <span>Completion: {(funnel.completionRate * 100).toFixed(1)}%</span>
          </div>
        )}

        {error && <p className="text-sm text-red-300">{error}</p>}
        {loading && <p className="text-sm text-gray-400">Loading queue...</p>}

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-white font-medium">{row.listingTitle}</p>
                <span className="text-xs px-2 py-1 rounded-full border border-[#d4af37]/30 text-[#d4af37] uppercase">{row.status}</span>
              </div>
                <p className="text-sm text-gray-300"><span className="text-gray-400">Issue:</span> {row.issueType}</p>
              <p className="text-sm text-gray-300"><span className="text-gray-400">Queue:</span> {row.queue || 'trust_safety'} | <span className="text-gray-400">Priority:</span> {row.priority || 'p2'} | <span className="text-gray-400">Escalation:</span> {row.escalationLevel ?? 0}</p>
              <p className="text-sm text-gray-300"><span className="text-gray-400">Reason:</span> {row.reason}</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => decide(row.id, 'resolve')} className="px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 text-xs" disabled={!canModerate}>Resolve</button>
                <button onClick={() => decide(row.id, 'review')} className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-300 text-xs" disabled={!canModerate}>Review</button>
                <button onClick={() => decide(row.id, 'dismiss')} className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 text-xs" disabled={!canModerate}>Dismiss</button>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 && <p className="text-sm text-gray-400">No moderation items found.</p>}
        </div>

        {exportText && (
          <div className="rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4">
            <p className="text-xs text-gray-400 mb-2">Export Preview (CSV)</p>
            <pre className="text-xs text-gray-300 overflow-auto max-h-56 whitespace-pre-wrap">{exportText.slice(0, 4000)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
