'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createCommunityEvent } from '@/app/lib/eventsApi';
import type { CommunityEventRecord } from '@/app/lib/eventTicketing';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function CreateCommunityEventPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    hostName: '',
    hostAvatar: '',
    eventType: 'workshop' as CommunityEventRecord['eventType'],
    eventMode: 'virtual' as CommunityEventRecord['eventMode'],
    location: '',
    startsAt: '',
    endsAt: '',
    basePrice: '',
    capacity: '',
    vipAddonPrice: '',
    image: '',
    sponsor: '',
    livestreamEnabled: true
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setFeedback('');
      const identity = await requireWalletAction('create an event draft');
      const event = await createCommunityEvent({
        title: form.title,
        description: form.description,
        hostName: form.hostName,
        hostAvatar: form.hostAvatar,
        createdByActorId: identity.actorId,
        eventType: form.eventType,
        eventMode: form.eventMode,
        location: form.location,
        startsAt: form.startsAt,
        endsAt: form.endsAt || null,
        basePrice: Number(form.basePrice || 0),
        capacity: form.capacity ? Number(form.capacity) : null,
        vipAddonPrice: Number(form.vipAddonPrice || 0),
        image: form.image,
        sponsor: form.sponsor,
        livestreamEnabled: form.livestreamEnabled
      });
      setFeedback(`Event submitted as ${event.status}. Ops can review and publish it from the events admin queue.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to create event.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Host workflow</p>
            <h1 className="mt-2 text-4xl font-semibold">Create an event or livestream</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
              Build a ticketed event, livestream, or VIP experience. New events enter the ops queue as drafts and can be published after review.
            </p>
          </div>
          <Link href="/community/events" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white">Back to events</Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
            <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
              <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Event title" />
              <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} className="min-h-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Describe the event, access, and what attendees receive." />
              <div className="grid gap-4 md:grid-cols-2">
                <input value={form.hostName} onChange={(e) => setForm((current) => ({ ...current, hostName: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Host name" />
                <input value={form.hostAvatar} onChange={(e) => setForm((current) => ({ ...current, hostAvatar: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Host avatar URL" />
                <select value={form.eventType} onChange={(e) => setForm((current) => ({ ...current, eventType: e.target.value as CommunityEventRecord['eventType'] }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                  <option value="workshop">Workshop</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="market">Market</option>
                  <option value="festival">Festival</option>
                  <option value="livestream">Livestream</option>
                </select>
                <select value={form.eventMode} onChange={(e) => setForm((current) => ({ ...current, eventMode: e.target.value as CommunityEventRecord['eventMode'] }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                  <option value="virtual">Virtual</option>
                  <option value="in-person">In-person</option>
                </select>
                <input value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2" placeholder="Location or livestream destination" />
                <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((current) => ({ ...current, startsAt: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm((current) => ({ ...current, endsAt: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
                <input value={form.basePrice} onChange={(e) => setForm((current) => ({ ...current, basePrice: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Base ticket price (USD)" />
                <input value={form.vipAddonPrice} onChange={(e) => setForm((current) => ({ ...current, vipAddonPrice: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="VIP add-on price" />
                <input value={form.capacity} onChange={(e) => setForm((current) => ({ ...current, capacity: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Capacity" />
                <input value={form.image} onChange={(e) => setForm((current) => ({ ...current, image: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" placeholder="Hero image URL" />
                <input value={form.sponsor} onChange={(e) => setForm((current) => ({ ...current, sponsor: e.target.value }))} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2" placeholder="Sponsor (optional)" />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
                <input type="checkbox" checked={form.livestreamEnabled} onChange={(e) => setForm((current) => ({ ...current, livestreamEnabled: e.target.checked }))} />
                Enable livestream or stream-access tier
              </label>
              {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
              <button type="submit" disabled={isSubmitting} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black disabled:opacity-60">
                {isSubmitting ? 'Submitting...' : 'Create event draft'}
              </button>
            </form>
          </article>

          <aside className="rounded-[28px] border border-white/10 bg-[#111111] p-6">
            <h2 className="text-lg font-semibold text-white">Revenue controls</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <p className="rounded-2xl border border-white/10 bg-black/20 p-4">Per-ticket platform fees apply by event type.</p>
              <p className="rounded-2xl border border-white/10 bg-black/20 p-4">VIP pricing and livestream access become separate monetization tiers at registration.</p>
              <p className="rounded-2xl border border-white/10 bg-black/20 p-4">Draft events stay out of the public marketplace until ops review publishes them.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
