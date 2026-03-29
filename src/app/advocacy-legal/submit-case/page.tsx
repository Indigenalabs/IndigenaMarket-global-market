'use client';

import { useState } from 'react';
import AdvocacyFrame from '../components/AdvocacyFrame';
import { submitCaseIntake } from '@/app/lib/advocacyLegalClientStore';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function SubmitCaseRequestHelpPage() {
  const [communityName, setCommunityName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [issueSummary, setIssueSummary] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityName.trim() || !contactEmail.trim() || !issueSummary.trim()) {
      setStatus({ type: 'error', message: 'Community name, contact email, and issue summary are required.' });
      return;
    }
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('submit a legal help request');
      await submitCaseIntake({
        communityName: communityName.trim(),
        contactEmail: contactEmail.trim(),
        jurisdiction: jurisdiction.trim() || undefined,
        urgency,
        issueSummary: issueSummary.trim()
      });
      setStatus({ type: 'success', message: 'Secure intake submitted. Your case is now in legal triage.' });
      setCommunityName('');
      setContactEmail('');
      setJurisdiction('');
      setIssueSummary('');
      setUrgency('high');
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Secure intake failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdvocacyFrame title="Submit a Case / Request Legal Help" subtitle="Share case details securely and get matched to legal support.">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Secure Intake</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Start with a protected legal triage path</h2>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-gray-300">
            This page is for communities, organizers, artists, and advocates who need legal support but do not yet know the right attorney, campaign path, or next step. The goal is to get the matter into a structured triage flow without making users guess where they belong first.
          </p>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/15 bg-[#101112] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">What Happens After Submission</p>
          <div className="mt-4 space-y-3">
            {[
              'Your matter enters secure legal triage',
              'Urgency and jurisdiction are reviewed first',
              'The team routes you to the best next support path'
            ].map((item, index) => (
              <div key={item} className="rounded-xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/60">Step {index + 1}</p>
                <p className="mt-2 text-sm text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={communityName} onChange={(e) => setCommunityName(e.target.value)} placeholder="Organization or Community Name" className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="Primary Contact Email" className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Jurisdiction (optional)" className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
              <select value={urgency} onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high' | 'critical')} className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white">
                <option value="low">Low urgency</option>
                <option value="medium">Medium urgency</option>
                <option value="high">High urgency</option>
                <option value="critical">Critical urgency</option>
              </select>
            </div>
            <textarea value={issueSummary} onChange={(e) => setIssueSummary(e.target.value)} placeholder="Describe the legal issue, what is urgent, who is affected, and where the matter is happening" className="h-40 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
            <button disabled={submitting} className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Submitting secure intake...' : 'Submit Secure Intake'}</button>
            {status.type !== 'idle' ? <p className={`text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{status.message}</p> : null}
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#0f1012] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Why People Use This</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {[
                'They need help but do not know which attorney category is right',
                'The issue is urgent and needs routing quickly',
                'They want one trusted intake path instead of guessing across the marketplace'
              ].map((item) => <li key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" /><span>{item}</span></li>)}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#d4af37]/15 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%),#0f1012] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Confidentiality Notes</p>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              Keep the summary focused and useful. Share enough to explain the issue, urgency, and jurisdiction, but avoid including sensitive details that should wait for a legal professional unless needed for immediate triage.
            </p>
          </section>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
