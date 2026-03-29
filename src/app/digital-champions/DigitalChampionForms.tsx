'use client';

import { useState } from 'react';
import { SurfaceListStrip, surfaceInputClass, surfacePrimaryActionClass, surfaceTextareaClass } from '@/app/components/phase-surfaces/SurfaceSystem';

function FormShell({ title, description, children, aside }: { title: string; description: string; children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
      <div className="rounded-[34px] border border-white/10 bg-black/20 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm md:p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/46">Submission</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/68">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="space-y-4">{aside}</div>
    </section>
  );
}

export function DigitalChampionApplyClient() {
  const [form, setForm] = useState({ applicantName: '', email: '', region: '', communityAffiliation: '', languages: '', skills: '', story: '' });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/digital-champions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          languages: form.languages.split(',').map((entry) => entry.trim()).filter(Boolean),
          skills: form.skills.split(',').map((entry) => entry.trim()).filter(Boolean)
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Unable to submit application.');
      setFeedback('Application submitted for governance and program review.');
      setForm({ applicantName: '', email: '', region: '', communityAffiliation: '', languages: '', skills: '', story: '' });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit application.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell
      title="Apply to join the network"
      description="Strong applications show regional trust, practical support ability, and how you would help communities stay in control while getting operationally online."
      aside={
        <>
          <SurfaceListStrip eyebrow="What matters" title="Regional credibility" description="Explain the communities you already work with and what support they would trust you to carry." />
          <SurfaceListStrip eyebrow="What matters" title="Operational capacity" description="The role is not abstract advocacy. Show listing support, archive setup, story capture, or treasury literacy skill." />
          <SurfaceListStrip eyebrow="Review path" title="Governance and program review" description="Applications move through review rather than instant acceptance because the network has authority implications." />
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5 text-white">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['applicantName', 'Applicant name'],
            ['email', 'Email'],
            ['region', 'Region'],
            ['communityAffiliation', 'Community affiliation']
          ].map(([key, label]) => (
            <label key={key} className="space-y-2 text-sm">
              <span className="text-white/66">{label}</span>
              <input value={(form as any)[key]} onChange={(e) => setForm((state) => ({ ...state, [key]: e.target.value }))} className={surfaceInputClass} required />
            </label>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm"><span className="text-white/66">Languages</span><input value={form.languages} onChange={(e) => setForm((state) => ({ ...state, languages: e.target.value }))} className={surfaceInputClass} placeholder="Comma separated" /></label>
          <label className="space-y-2 text-sm"><span className="text-white/66">Skills</span><input value={form.skills} onChange={(e) => setForm((state) => ({ ...state, skills: e.target.value }))} className={surfaceInputClass} placeholder="Comma separated" /></label>
        </div>
        <label className="block space-y-2 text-sm"><span className="text-white/66">Why you want to be a Digital Champion</span><textarea value={form.story} onChange={(e) => setForm((state) => ({ ...state, story: e.target.value }))} className={surfaceTextareaClass} required /></label>
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={loading} className={`${surfacePrimaryActionClass} border-0 disabled:opacity-60`}>{loading ? 'Submitting...' : 'Apply to join the network'}</button>
          {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
        </div>
      </form>
    </FormShell>
  );
}

export function DigitalChampionSponsorClient({ options }: { options: Array<{ id: string; name: string; targetAccountId: string; communities: string[] }> }) {
  const [form, setForm] = useState({ championId: options[0]?.id || '', sponsorName: '', sponsorEmail: '', sponsorshipType: 'one-time', amount: '500', note: '' });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const selected = options.find((entry) => entry.id === form.championId);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/digital-champions/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          championId: form.championId,
          sponsorName: form.sponsorName,
          sponsorEmail: form.sponsorEmail,
          sponsorshipType: form.sponsorshipType,
          targetType: 'champion',
          targetAccountId: selected?.targetAccountId || '',
          amount: Number(form.amount || 0),
          note: form.note
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Unable to create sponsorship.');
      setFeedback('Sponsorship created and queued into the champion disbursement flow.');
      setForm((state) => ({ ...state, sponsorName: '', sponsorEmail: '', amount: '500', note: '' }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to create sponsorship.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell
      title="Sponsor a champion"
      description="Sponsor the operational layer directly. This is support for field presence, launch capacity, device setup, and community training."
      aside={
        <>
          {selected ? <SurfaceListStrip eyebrow="Current target" title={selected.name} description={selected.communities.join(' | ')} /> : null}
          <SurfaceListStrip eyebrow="Funding route" title="Treasury-linked" description="Sponsorship is no longer a loose pledge. It enters a disbursement and reporting system." />
          <SurfaceListStrip eyebrow="Best use" title="Capacity, not cosmetics" description="The strongest sponsorships fund travel, training time, archive orientation, device setup, and office hours." />
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5 text-white">
        <label className="block space-y-2 text-sm"><span className="text-white/66">Champion</span><select value={form.championId} onChange={(e) => setForm((state) => ({ ...state, championId: e.target.value }))} className={surfaceInputClass}>{options.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm"><span className="text-white/66">Sponsor name</span><input value={form.sponsorName} onChange={(e) => setForm((state) => ({ ...state, sponsorName: e.target.value }))} className={surfaceInputClass} required /></label>
          <label className="space-y-2 text-sm"><span className="text-white/66">Sponsor email</span><input value={form.sponsorEmail} onChange={(e) => setForm((state) => ({ ...state, sponsorEmail: e.target.value }))} className={surfaceInputClass} required /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm"><span className="text-white/66">Sponsorship type</span><select value={form.sponsorshipType} onChange={(e) => setForm((state) => ({ ...state, sponsorshipType: e.target.value }))} className={surfaceInputClass}><option value="one-time">One-time</option><option value="monthly">Monthly</option></select></label>
          <label className="space-y-2 text-sm"><span className="text-white/66">Amount</span><input value={form.amount} onChange={(e) => setForm((state) => ({ ...state, amount: e.target.value }))} className={surfaceInputClass} required /></label>
        </div>
        <label className="block space-y-2 text-sm"><span className="text-white/66">Note</span><textarea value={form.note} onChange={(e) => setForm((state) => ({ ...state, note: e.target.value }))} className={surfaceTextareaClass} /></label>
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={loading} className={`${surfacePrimaryActionClass} border-0 disabled:opacity-60`}>{loading ? 'Submitting...' : 'Sponsor this champion'}</button>
          {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
        </div>
      </form>
    </FormShell>
  );
}

export function DigitalChampionRequestClient() {
  const [form, setForm] = useState({ requesterName: '', requesterEmail: '', communityName: '', region: '', supportNeeded: '', preferredLanguage: '', urgency: 'medium' });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/digital-champions/request-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Unable to submit support request.');
      setFeedback('Support request submitted to the Champion network queue.');
      setForm({ requesterName: '', requesterEmail: '', communityName: '', region: '', supportNeeded: '', preferredLanguage: '', urgency: 'medium' });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit support request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell
      title="Request Champion support"
      description="Use this when a community needs operational help getting real work live: pages, listings, archive setup, story publishing, role structure, or treasury literacy."
      aside={
        <>
          <SurfaceListStrip eyebrow="Best requests" title="Concrete operational needs" description="Strong requests specify the page, launch, archive, or treasury task that is blocked right now." />
          <SurfaceListStrip eyebrow="Language" title="Prefer local support" description="Call out the preferred language so routing stays regionally sensible." />
          <SurfaceListStrip eyebrow="Urgency" title="Use high urgency sparingly" description="Reserve high urgency for launches, critical onboarding blocks, or time-sensitive community work." />
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5 text-white">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['requesterName', 'Your name'],
            ['requesterEmail', 'Email'],
            ['communityName', 'Community or program'],
            ['region', 'Region']
          ].map(([key, label]) => (
            <label key={key} className="space-y-2 text-sm"><span className="text-white/66">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((state) => ({ ...state, [key]: e.target.value }))} className={surfaceInputClass} required /></label>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm"><span className="text-white/66">Preferred language</span><input value={form.preferredLanguage} onChange={(e) => setForm((state) => ({ ...state, preferredLanguage: e.target.value }))} className={surfaceInputClass} /></label>
          <label className="space-y-2 text-sm"><span className="text-white/66">Urgency</span><select value={form.urgency} onChange={(e) => setForm((state) => ({ ...state, urgency: e.target.value }))} className={surfaceInputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        </div>
        <label className="block space-y-2 text-sm"><span className="text-white/66">Support needed</span><textarea value={form.supportNeeded} onChange={(e) => setForm((state) => ({ ...state, supportNeeded: e.target.value }))} className={surfaceTextareaClass} required /></label>
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={loading} className={`${surfacePrimaryActionClass} border-0 disabled:opacity-60`}>{loading ? 'Submitting...' : 'Request Champion support'}</button>
          {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
        </div>
      </form>
    </FormShell>
  );
}
