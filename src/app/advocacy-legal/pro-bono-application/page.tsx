'use client';

import { useState } from 'react';
import AdvocacyFrame from '../components/AdvocacyFrame';
import { submitProBonoRequest } from '@/app/lib/advocacyLegalClientStore';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function ProBonoMatchingApplicationPage() {
  const [caseName, setCaseName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !jurisdiction.trim() || !details.trim()) {
      setStatus({ type: 'error', message: 'Case name, jurisdiction, and details are required.' });
      return;
    }
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('submit a pro bono matching request');
      await submitProBonoRequest({ caseName: caseName.trim(), jurisdiction: jurisdiction.trim(), details: details.trim(), urgency });
      setStatus({ type: 'success', message: 'Pro bono request submitted and queued for matching.' });
      setCaseName('');
      setJurisdiction('');
      setDetails('');
      setUrgency('high');
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Pro bono request failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdvocacyFrame title="Pro Bono Matching Application" subtitle="Match urgent community cases with legal professionals offering reduced-fee support.">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Matching Network</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Request lower-access legal support with clearer expectations</h2>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-gray-300">
            This page is for matters that need real legal help but may not have the budget for standard counsel. The matching system is designed to route urgent and mission-aligned requests toward pro bono or reduced-fee legal professionals where capacity exists.
          </p>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/15 bg-[#101112] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">What Improves A Match</p>
          <div className="mt-4 space-y-3">
            {[
              'Clear urgency and jurisdiction details',
              'Specific description of the legal need',
              'Enough context to understand whether the request fits pro bono capacity'
            ].map((item, index) => (
              <div key={item} className="rounded-xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/60">Signal {index + 1}</p>
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
              <input value={caseName} onChange={(e) => setCaseName(e.target.value)} placeholder="Case name or matter summary" className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
              <input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Jurisdiction" className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
            </div>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high' | 'critical')} className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white">
              <option value="low">Low urgency</option>
              <option value="medium">Medium urgency</option>
              <option value="high">High urgency</option>
              <option value="critical">Critical urgency</option>
            </select>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the matter, why matching support is needed, and what kind of legal help would make the biggest difference" className="h-36 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
            <button disabled={submitting} className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Submitting for match...' : 'Submit for Match'}</button>
            {status.type !== 'idle' ? <p className={`text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{status.message}</p> : null}
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#0f1012] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">How Matching Works</p>
            <div className="mt-5 space-y-4">
              {[
                'The request is reviewed for urgency and fit',
                'Available pro bono or reduced-fee profiles are checked',
                'The best next support path is returned to the applicant'
              ].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-sm font-semibold text-[#d4af37]">{index + 1}</div>
                  <p className="pt-1 text-sm leading-7 text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d4af37]/15 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%),#0f1012] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Good Fit For This Route</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {[
                'Urgent community matters with limited legal budget',
                'Artists or organizers needing initial protection advice',
                'Cases that need triage before full paid representation'
              ].map((item) => <li key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" /><span>{item}</span></li>)}
            </ul>
          </section>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
