'use client';

import { useState } from 'react';
import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import { createEnterpriseInquiry } from '@/app/lib/enterpriseApi';

export default function LicensingInquiryPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    artwork: '',
    scope: '',
    territory: '',
    budget: '',
    detail: ''
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setFeedback('');
      await createEnterpriseInquiry({
        channel: 'licensing',
        name: form.name,
        email: form.email,
        organization: form.organization,
        scope: `${form.artwork} | ${form.scope} | ${form.territory}`,
        budget: form.budget,
        detail: form.detail
      });
      setForm({ name: '', email: '', organization: '', artwork: '', scope: '', territory: '', budget: '', detail: '' });
      setFeedback('Licensing inquiry submitted.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit licensing inquiry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DigitalArtsFrame title="Licensing Inquiry" subtitle="Request usage rights for digital artworks across media, campaigns, and events.">
      <section className="grid gap-5 lg:grid-cols-[1.3fr,1fr]">
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">License Request Form</h3>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Your name" />
              <input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Work email" />
            </div>
            <input value={form.organization} onChange={(e) => setForm((current) => ({ ...current, organization: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Organization / brand" />
            <input value={form.artwork} onChange={(e) => setForm((current) => ({ ...current, artwork: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Artwork ID or title" />
            <div className="grid gap-3 md:grid-cols-2">
              <input value={form.scope} onChange={(e) => setForm((current) => ({ ...current, scope: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Usage channel (web, print, event)" />
              <input value={form.territory} onChange={(e) => setForm((current) => ({ ...current, territory: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Territory (global, regional)" />
            </div>
            <input value={form.budget} onChange={(e) => setForm((current) => ({ ...current, budget: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Budget range" />
            <textarea value={form.detail} onChange={(e) => setForm((current) => ({ ...current, detail: e.target.value }))} className="min-h-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/45" placeholder="Describe your campaign, audience, usage rights, and legal constraints." />
            {feedback ? <div className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{feedback}</div> : null}
            <button type="button" onClick={handleSubmit} disabled={submitting || !form.name || !form.email || !form.detail} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Licensing Inquiry'}</button>
          </div>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">License Types</h3>
          <div className="mt-3 space-y-3 text-sm text-gray-300">
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Editorial License: non-commercial storytelling.</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Commercial Campaign: ads, promotions, paid placements.</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Event/Installation: stage visuals and festival activations.</p>
            <p className="rounded-lg border border-white/10 bg-black/25 p-3">Extended Rights: merchandise and derivative usage.</p>
          </div>
        </article>
      </section>
    </DigitalArtsFrame>
  );
}
