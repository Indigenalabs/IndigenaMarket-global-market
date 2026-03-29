'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCommunityEvent, registerCommunityEvent } from '@/app/lib/eventsApi';
import type { CommunityEventRecord, CommunityEventRegistrationRecord } from '@/app/lib/eventTicketing';

export default function CommunityEventDetailClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<CommunityEventRecord | null>(null);
  const [registrations, setRegistrations] = useState<CommunityEventRegistrationRecord[]>([]);
  const [form, setForm] = useState({ attendeeName: '', attendeeEmail: '', tier: 'general' as CommunityEventRegistrationRecord['tier'], quantity: '1' });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchCommunityEvent(eventId)
      .then((data) => {
        if (cancelled) return;
        setEvent(data.event);
        setRegistrations(data.registrations);
      })
      .catch((error) => {
        if (!cancelled) setFeedback(error instanceof Error ? error.message : 'Unable to load event.');
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function handleRegister() {
    if (!event) return;
    try {
      const result = await registerCommunityEvent({
        eventId: event.id,
        attendeeName: form.attendeeName,
        attendeeEmail: form.attendeeEmail,
        tier: form.tier,
        quantity: Number(form.quantity || 1)
      });
      setRegistrations((current) => [result.registration, ...current]);
      setFeedback(`Registered for ${result.event.title}. Host payout estimate on this booking: ${result.registration.currency} ${result.registration.hostPayout.toFixed(2)}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Registration failed.');
    }
  }

  if (!event) {
    return <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white"><div className="mx-auto max-w-5xl text-sm text-gray-400">Loading event...</div></main>;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/community/events" className="text-sm text-[#d4af37]">← Back to events</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <section>
            <img src={event.image} alt={event.title} className="h-72 w-full rounded-[28px] object-cover" />
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[#d4af37]">{event.eventType} • {event.eventMode}</p>
            <h1 className="mt-2 text-4xl font-semibold">{event.title}</h1>
            <p className="mt-4 text-sm leading-7 text-gray-400">{event.description}</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-[#111111] p-4 text-sm text-gray-300">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">When</p>
                <p className="mt-2 text-white">{new Date(event.startsAt).toLocaleString()}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#111111] p-4 text-sm text-gray-300">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Where</p>
                <p className="mt-2 text-white">{event.location}</p>
              </div>
            </div>
          </section>
          <aside className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
            <h2 className="text-xl font-semibold">Register</h2>
            <div className="mt-4 space-y-3">
              <input value={form.attendeeName} onChange={(e) => setForm((current) => ({ ...current, attendeeName: e.target.value }))} placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              <input value={form.attendeeEmail} onChange={(e) => setForm((current) => ({ ...current, attendeeEmail: e.target.value }))} placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              <select value={form.tier} onChange={(e) => setForm((current) => ({ ...current, tier: e.target.value as CommunityEventRegistrationRecord['tier'] }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                <option value="general">General admission</option>
                <option value="vip">VIP access</option>
                {event.livestreamEnabled ? <option value="livestream">Livestream pass</option> : null}
              </select>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm((current) => ({ ...current, quantity: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              <button onClick={() => void handleRegister()} className="w-full rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black">Complete registration</button>
              {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
            </div>
            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Revenue lane</p>
              <p className="mt-2">Per-ticket platform fee and host payout are calculated on every registration.</p>
              <p className="mt-3 text-xs text-gray-500">{registrations.length} registrations recorded</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
