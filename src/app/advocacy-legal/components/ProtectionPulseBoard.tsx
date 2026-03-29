'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchAdvocacyServerSnapshot, getDashboardSnapshot } from '@/app/lib/advocacyLegalClientStore';

type DonationRow = {
  id: string;
  campaignTitle: string;
  amount: number;
  donorName: string;
  createdAt: string;
};

type ActionRow = {
  id: string;
  title: string;
  actionType: 'letter' | 'petition' | 'hearing-rsvp';
  actorName: string;
  createdAt: string;
};

type CaseRow = {
  id: string;
  communityName: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
};

type ServerSnapshot = {
  caseIntakes?: number;
  proBonoRequests?: number;
  consultationRequests?: number;
  totalContributed?: number;
  recentDonations?: DonationRow[];
  recentActions?: ActionRow[];
  recentCaseIntakes?: CaseRow[];
};

const urgencyTone: Record<CaseRow['urgency'], string> = {
  low: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
  medium: 'text-sky-300 border-sky-400/30 bg-sky-500/10',
  high: 'text-amber-300 border-amber-400/30 bg-amber-500/10',
  critical: 'text-red-300 border-red-400/35 bg-red-500/15'
};

function formatAgo(iso: string) {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return 'recent';
  const deltaMins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (deltaMins < 1) return 'just now';
  if (deltaMins < 60) return `${deltaMins}m ago`;
  const hours = Math.floor(deltaMins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ProtectionPulseBoard() {
  const [server, setServer] = useState<ServerSnapshot | null>(null);
  const local = useMemo(() => getDashboardSnapshot(), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const snap = (await fetchAdvocacyServerSnapshot()) as ServerSnapshot | null;
      if (mounted && snap) setServer(snap);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalContributed = server?.totalContributed ?? local.totalContributed;
  const caseIntakes = server?.caseIntakes ?? local.caseIntakes;
  const proBonoRequests = server?.proBonoRequests ?? local.proBonoRequests;
  const consultations = server?.consultationRequests ?? local.consultationRequests;
  const donations = (server?.recentDonations ?? local.recentDonations).slice(0, 4);
  const actions = (server?.recentActions ?? local.recentActions).slice(0, 4);
  const cases = (server?.recentCaseIntakes ?? []).slice(0, 4);

  return (
    <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Protection Pulse</h3>
        <span className="rounded-full border border-[#d4af37]/30 px-2 py-0.5 text-[11px] text-[#d4af37]">Live Activity</span>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Case Intake Queue</p>
          <p className="mt-1 text-xl font-semibold text-white">{caseIntakes}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Pro Bono Queue</p>
          <p className="mt-1 text-xl font-semibold text-white">{proBonoRequests}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Consultation Requests</p>
          <p className="mt-1 text-xl font-semibold text-white">{consultations}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Community Contributions</p>
          <p className="mt-1 text-xl font-semibold text-white">${Number(totalContributed || 0).toLocaleString()}</p>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs font-semibold text-white">Recent Donations</p>
          <div className="mt-2 space-y-2">
            {donations.length ? donations.map((row) => (
              <div key={row.id} className="rounded-lg border border-white/10 px-2 py-1.5 text-xs">
                <p className="text-gray-100">{row.campaignTitle}</p>
                <p className="text-[#d4af37]">${row.amount.toLocaleString()} • {row.donorName}</p>
              </div>
            )) : (
              <p className="text-xs text-gray-400">No donation activity yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs font-semibold text-white">Recent Policy Actions</p>
          <div className="mt-2 space-y-2">
            {actions.length ? actions.map((row) => (
              <div key={row.id} className="rounded-lg border border-white/10 px-2 py-1.5 text-xs">
                <p className="text-gray-100">{row.title}</p>
                <p className="text-gray-400">{row.actionType} • {row.actorName} • {formatAgo(row.createdAt)}</p>
              </div>
            )) : (
              <p className="text-xs text-gray-400">No policy actions yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs font-semibold text-white">Urgency Intake Feed</p>
          <div className="mt-2 space-y-2">
            {cases.length ? cases.map((row) => (
              <div key={row.id} className="rounded-lg border border-white/10 px-2 py-1.5 text-xs">
                <p className="text-gray-100">{row.communityName}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${urgencyTone[row.urgency]}`}>{row.urgency}</span>
                  <span className="text-gray-400">{formatAgo(row.createdAt)}</span>
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-400">No intake updates yet.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

