'use client';

import { useState } from 'react';
import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import { submitCustomWorkRequest } from '@/app/lib/customWorkApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function CommissionRequestPage() {
  const [form, setForm] = useState({
    buyerName: '',
    buyerEmail: '',
    title: '',
    description: '',
    budget: '',
    deadline: '',
    referenceUrl: '',
    specialInstructions: ''
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setFeedback('');
      await requireWalletAction('submit a commission request');
      const request = await submitCustomWorkRequest({
        channel: 'digital-arts',
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        requestedFor: 'Verified digital artists',
        title: form.title,
        description: form.description,
        budget: Number(form.budget || 0),
        deadline: form.deadline || null,
        referenceUrl: form.referenceUrl,
        specialInstructions: form.specialInstructions,
        matchedCreators: ['verified-digital-artist-pool']
      });
      setFeedback(`Request submitted. Facilitation fee: ${request.currency} ${request.facilitationFee.toFixed(2)}. Estimated creator net: ${request.currency} ${request.creatorNetEstimate.toFixed(2)}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit commission request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DigitalArtsFrame title="Commission Request" subtitle="Submit a custom artwork brief and route it into the commission matching workflow.">
      <section className="grid gap-5 lg:grid-cols-[1.3fr,1fr]">
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Project Brief</h3>
          <form className="mt-4 grid gap-3" onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.buyerName} onChange={(e) => setForm((current) => ({ ...current, buyerName: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Your name" />
              <input value={form.buyerEmail} onChange={(e) => setForm((current) => ({ ...current, buyerEmail: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Email" />
            </div>
            <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Project title" />
            <textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} className="min-h-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Describe your vision, intended use, and cultural context." />
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.budget} onChange={(e) => setForm((current) => ({ ...current, budget: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Budget (USD)" />
              <input type="date" value={form.deadline} onChange={(e) => setForm((current) => ({ ...current, deadline: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" />
            </div>
            <input value={form.referenceUrl} onChange={(e) => setForm((current) => ({ ...current, referenceUrl: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Reference image URL (optional)" />
            <textarea value={form.specialInstructions} onChange={(e) => setForm((current) => ({ ...current, specialInstructions: e.target.value }))} className="min-h-20 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Rights notes, approval requirements, or delivery instructions." />
            {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
            <button type="submit" disabled={isSubmitting} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">{isSubmitting ? 'Submitting...' : 'Submit Commission Request'}</button>
          </form>
        </article>
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">How Matching Works</h3>
          <div className="mt-3 space-y-3 text-sm text-gray-300">
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">1. We route your brief to compatible verified artists.</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">2. Artists respond with proposal and milestone structure.</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">3. Accepted work moves into facilitation-fee and escrow handling.</p>
          </div>
        </article>
      </section>
    </DigitalArtsFrame>
  );
}
