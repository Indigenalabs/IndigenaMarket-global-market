'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { ArchiveAccessAction, ArchiveAccessAnomaly, ArchiveAccessLogRecord } from '@/app/lib/archiveAccessLogs';

const ACTIONS: Array<{ id: '' | ArchiveAccessAction; label: string }> = [
  { id: '', label: 'All actions' },
  { id: 'recording-download', label: 'Recording downloads' },
  { id: 'citation-export', label: 'Citation exports' },
  { id: 'offline-pack', label: 'Offline packs' },
  { id: 'citation-bundle', label: 'Citation bundles' }
];
type ArchiveAuditActionFilter = (typeof ACTIONS)[number]['id'];

export default function ArchiveAccessAuditClient() {
  const [logs, setLogs] = useState<ArchiveAccessLogRecord[]>([]);
  const [anomalies, setAnomalies] = useState<ArchiveAccessAnomaly[]>([]);
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState<ArchiveAuditActionFilter>('');
  const [feedback, setFeedback] = useState('');

  async function load(nextActorId = actorId, nextAction = action) {
    const params = new URLSearchParams();
    if (nextActorId) params.set('actorId', nextActorId);
    if (nextAction) params.set('action', nextAction);
    const res = await fetchWithTimeout(`/api/admin/language-heritage/access-audit${params.toString() ? `?${params.toString()}` : ''}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load archive audit'));
    const json = (await res.json()) as { logs?: ArchiveAccessLogRecord[]; anomalies?: ArchiveAccessAnomaly[] };
    setLogs(json.logs || []);
    setAnomalies(json.anomalies || []);
  }

  useEffect(() => {
    load().catch((error) => setFeedback(error instanceof Error ? error.message : 'Failed to load archive audit'));
  }, []);

  const summary = useMemo(
    () => ({
      total: logs.length,
      downloads: logs.filter((entry) => entry.action === 'recording-download').length,
      citations: logs.filter((entry) => entry.action === 'citation-export').length,
      bundles: logs.filter((entry) => entry.action === 'offline-pack' || entry.action === 'citation-bundle').length
    }),
    [logs]
  );

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
      <div className="flex flex-wrap gap-3">
        <input
          value={actorId}
          onChange={(event) => setActorId(event.target.value)}
          placeholder="Filter by actor or wallet"
          className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none"
        />
        <select
          value={action}
          onChange={(event) => setAction(event.target.value as ArchiveAuditActionFilter)}
          className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none"
        >
          {ACTIONS.map((option) => (
            <option key={option.label} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => load(actorId, action).catch((error) => setFeedback(error instanceof Error ? error.message : 'Failed to filter audit logs'))}
          className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black"
        >
          Apply filters
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Metric label="Total logs" value={String(summary.total)} />
        <Metric label="Recording downloads" value={String(summary.downloads)} />
        <Metric label="Citation exports" value={String(summary.citations)} />
        <Metric label="Library bundles" value={String(summary.bundles)} />
      </div>

      <div className="mt-6 rounded-[22px] border border-[#d4af37]/20 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">Anomaly flags</p>
        <div className="mt-3 space-y-2">
          {anomalies.map((entry) => (
            <div key={entry.actorId} className="rounded-[18px] border border-white/10 bg-[#111111] p-3 text-sm text-gray-300">
              <span className="font-medium text-white">{entry.actorId}</span>
              {` • ${entry.accessCount} accesses • ${entry.distinctListings} assets • ${entry.recentBurstCount} in the last hour`}
            </div>
          ))}
          {anomalies.length === 0 && <p className="text-sm text-gray-500">No anomaly flags in the current filter set.</p>}
        </div>
      </div>

      {feedback && <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-gray-500">
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Actor</th>
              <th className="px-3 py-3">Listing</th>
              <th className="px-3 py-3">Access</th>
              <th className="px-3 py-3">File</th>
              <th className="px-3 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((entry) => (
              <tr key={entry.id} className="text-gray-300">
                <td className="px-3 py-3">{entry.action}</td>
                <td className="px-3 py-3">{entry.actorId || entry.walletAddress || 'unknown'}</td>
                <td className="px-3 py-3">{entry.listingId || 'library-bundle'}</td>
                <td className="px-3 py-3">{entry.accessLevel}</td>
                <td className="px-3 py-3">{entry.fileName || 'n/a'}</td>
                <td className="px-3 py-3">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'n/a'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
