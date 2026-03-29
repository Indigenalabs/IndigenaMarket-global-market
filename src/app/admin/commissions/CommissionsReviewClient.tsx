'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchCustomWorkRequests, updateCustomWorkRequestRecord } from '@/app/lib/customWorkApi';
import type { CustomWorkRequestRecord } from '@/app/lib/customWork';

const STATUS_ORDER: CustomWorkRequestRecord['status'][] = ['submitted', 'matching', 'proposal-sent', 'accepted', 'in-progress', 'disputed', 'cancelled', 'completed', 'closed'];

export default function CommissionsReviewClient() {
  const [requests, setRequests] = useState<CustomWorkRequestRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [draft, setDraft] = useState({
    status: 'submitted' as CustomWorkRequestRecord['status'],
    assignedCreator: '',
    matchedCreators: '',
    cancellationReason: ''
  });

  useEffect(() => {
    fetchCustomWorkRequests()
      .then((data) => {
        setRequests(data);
        if (data[0]) setSelectedId(data[0].id);
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load commissions queue.'));
  }, []);

  const selected = useMemo(() => requests.find((entry) => entry.id === selectedId) ?? requests[0] ?? null, [requests, selectedId]);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      status: selected.status,
      assignedCreator: selected.assignedCreator,
      matchedCreators: selected.matchedCreators.join(', '),
      cancellationReason: selected.cancellationReason
    });
  }, [selected]);

  async function handleSave() {
    if (!selected) return;
    try {
      setFeedback('');
      const updated = await updateCustomWorkRequestRecord({
        id: selected.id,
        status: draft.status,
        assignedCreator: draft.assignedCreator,
        matchedCreators: draft.matchedCreators.split(',').map((entry) => entry.trim()).filter(Boolean),
        cancellationReason: draft.cancellationReason
      });
      setRequests((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setFeedback(`Updated ${updated.title}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update commission request.');
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr]">
      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <h2 className="text-lg font-semibold text-white">Request Queue</h2>
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <button key={request.id} onClick={() => setSelectedId(request.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === request.id ? 'border-[#d4af37]/50 bg-[#d4af37]/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{request.title}</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">{request.status}</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">{request.channel} · {request.currency} {request.budget.toFixed(2)} · {request.buyerName}</p>
            </button>
          ))}
          {requests.length === 0 ? <p className="text-sm text-gray-500">No custom work requests yet.</p> : null}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        {!selected ? <p className="text-sm text-gray-400">Select a request to review.</p> : (
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Custom work</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{selected.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-400">{selected.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Budget</p><p className="mt-2 text-white">{selected.currency} {selected.budget.toFixed(2)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Platform fee</p><p className="mt-2 text-white">{selected.currency} {selected.facilitationFee.toFixed(2)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Creator net</p><p className="mt-2 text-white">{selected.currency} {selected.creatorNetEstimate.toFixed(2)}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-gray-300">
                Status
                <select value={draft.status} onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value as CustomWorkRequestRecord['status'] }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                  {STATUS_ORDER.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-gray-300">
                Assigned creator
                <input value={draft.assignedCreator} onChange={(e) => setDraft((current) => ({ ...current, assignedCreator: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="creator handle or actor id" />
              </label>
              <label className="grid gap-2 text-sm text-gray-300 md:col-span-2">
                Matched creators
                <input value={draft.matchedCreators} onChange={(e) => setDraft((current) => ({ ...current, matchedCreators: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="comma-separated matches" />
              </label>
              <label className="grid gap-2 text-sm text-gray-300 md:col-span-2">
                Cancellation or dispute note
                <textarea value={draft.cancellationReason} onChange={(e) => setDraft((current) => ({ ...current, cancellationReason: e.target.value }))} className="min-h-24 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="reason, scope dispute note, or cancellation explanation" />
              </label>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Milestones</p>
              <div className="mt-3 space-y-3 text-sm text-gray-300">
                {selected.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-4 py-3">
                    <div>
                      <p className="text-white">{milestone.title}</p>
                      <p className="text-xs text-gray-500">{milestone.status}</p>
                    </div>
                    <p className="text-[#d4af37]">{selected.currency} {milestone.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
            <button onClick={() => void handleSave()} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black">Save review updates</button>
          </div>
        )}
      </div>
    </section>
  );
}
