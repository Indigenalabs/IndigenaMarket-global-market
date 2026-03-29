'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchEventOpsData, updateCommunityEventRecord, updateEventRegistrationStatus } from '@/app/lib/eventsApi';
import type { CommunityEventRecord, CommunityEventRegistrationRecord } from '@/app/lib/eventTicketing';

const EVENT_STATUS_ORDER: CommunityEventRecord['status'][] = ['draft', 'published', 'sold-out', 'cancelled', 'completed'];
const REGISTRATION_STATUS_ORDER: CommunityEventRegistrationRecord['status'][] = ['registered', 'attended', 'refunded', 'cancelled'];

export default function EventsOpsClient() {
  const [events, setEvents] = useState<CommunityEventRecord[]>([]);
  const [registrations, setRegistrations] = useState<CommunityEventRegistrationRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [draft, setDraft] = useState({ status: 'draft' as CommunityEventRecord['status'], featured: false, sponsor: '' });

  useEffect(() => {
    fetchEventOpsData()
      .then((data) => {
        setEvents(data.events);
        setRegistrations(data.registrations);
        if (data.events[0]) setSelectedId(data.events[0].id);
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load events ops.'));
  }, []);

  const selected = useMemo(() => events.find((entry) => entry.id === selectedId) ?? events[0] ?? null, [events, selectedId]);
  const selectedRegistrations = useMemo(() => registrations.filter((entry) => entry.eventId === selected?.id), [registrations, selected]);
  const revenueSummary = useMemo(() => selectedRegistrations.reduce((summary, entry) => ({
    gross: summary.gross + entry.subtotal,
    fees: summary.fees + entry.platformFee,
    payout: summary.payout + entry.hostPayout
  }), { gross: 0, fees: 0, payout: 0 }), [selectedRegistrations]);

  useEffect(() => {
    if (!selected) return;
    setDraft({ status: selected.status, featured: selected.featured, sponsor: selected.sponsor });
  }, [selected]);

  async function handleEventSave() {
    if (!selected) return;
    try {
      setFeedback('');
      const updated = await updateCommunityEventRecord({ id: selected.id, status: draft.status, featured: draft.featured, sponsor: draft.sponsor });
      setEvents((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setFeedback(`Updated ${updated.title}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update event.');
    }
  }

  async function handleRegistrationStatus(id: string, status: CommunityEventRegistrationRecord['status']) {
    try {
      setFeedback('');
      const updated = await updateEventRegistrationStatus({ id, status });
      setRegistrations((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setFeedback(`Registration ${updated.id} moved to ${updated.status}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update registration.');
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr]">
      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <h2 className="text-lg font-semibold text-white">Event Queue</h2>
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <button key={event.id} onClick={() => setSelectedId(event.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === event.id ? 'border-[#d4af37]/50 bg-[#d4af37]/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{event.title}</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">{event.status}</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">{event.eventType} · {event.hostName} · {new Date(event.startsAt).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        {!selected ? <p className="text-sm text-gray-400">Select an event to review.</p> : (
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Ticketing ops</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{selected.title}</h2>
              <p className="mt-2 text-sm leading-7 text-gray-400">{selected.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Gross</p><p className="mt-2 text-white">{selected.currency} {revenueSummary.gross.toFixed(2)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Platform fees</p><p className="mt-2 text-white">{selected.currency} {revenueSummary.fees.toFixed(2)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Host payout</p><p className="mt-2 text-white">{selected.currency} {revenueSummary.payout.toFixed(2)}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm text-gray-300">
                Event status
                <select value={draft.status} onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value as CommunityEventRecord['status'] }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                  {EVENT_STATUS_ORDER.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-gray-300">
                Sponsor
                <input value={draft.sponsor} onChange={(e) => setDraft((current) => ({ ...current, sponsor: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
                <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft((current) => ({ ...current, featured: e.target.checked }))} />
                Featured event
              </label>
            </div>
            <button onClick={() => void handleEventSave()} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black">Save event ops</button>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Registrations</p>
              <div className="mt-3 space-y-3">
                {selectedRegistrations.map((registration) => (
                  <div key={registration.id} className="rounded-2xl border border-white/10 px-4 py-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{registration.attendeeName}</p>
                        <p className="text-xs text-gray-500">{registration.attendeeEmail} · {registration.tier} · qty {registration.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-[#d4af37]">{registration.currency} {registration.subtotal.toFixed(2)}</p>
                        <select value={registration.status} onChange={(e) => void handleRegistrationStatus(registration.id, e.target.value as CommunityEventRegistrationRecord['status'])} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                          {REGISTRATION_STATUS_ORDER.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedRegistrations.length === 0 ? <p className="text-sm text-gray-500">No registrations yet.</p> : null}
              </div>
            </div>
            {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
