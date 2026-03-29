'use client';

import { useMemo, useState } from 'react';
import AdvocacyFrame from '../components/AdvocacyFrame';
import { subscribeRapidAlerts } from '@/app/lib/advocacyLegalClientStore';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

const TOPICS = ['Treaty Cases', 'Land Defense', 'ICIP', 'Legislative Votes', 'Emergency Hearings'];

export default function RapidAlertsNotificationsPage() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [topics, setTopics] = useState<string[]>(['Treaty Cases', 'Land Defense']);
  const [sms, setSms] = useState(true);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const channels = useMemo(() => (sms ? (['email', 'sms'] as const) : (['email'] as const)), [sms]);

  const toggleTopic = (topic: string) => {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((x) => x !== topic) : [...prev, topic]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || topics.length === 0) {
      setStatus({ type: 'error', message: 'Email and at least one topic are required.' });
      return;
    }
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('activate rapid legal alerts');
      await subscribeRapidAlerts({ email: email.trim(), mobile: mobile.trim() || undefined, topics, channels: [...channels] });
      setStatus({ type: 'success', message: 'Rapid alerts activated. You will receive the next critical update.' });
      setEmail('');
      setMobile('');
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Alert activation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdvocacyFrame title="Rapid Alert Sign-Up & Notifications" subtitle="Get immediate action alerts for hearings, votes, and urgent legal moments.">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Rapid Alerts</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Stay ahead of urgent legal moments before they pass</h2>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-gray-300">
            Rapid alerts are for people who need to know when hearings, votes, filings, and emergency legal moments are happening in time to act. This works best for organizers, supporters, and community members who want a fast signal when the response window is short.
          </p>
        </article>

        <article className="rounded-2xl border border-[#d4af37]/15 bg-[#101112] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Example Alert Flow</p>
          <div className="mt-4 space-y-3">
            {[
              'Critical hearing scheduled',
              'Alert goes out by email or SMS',
              'Supporters move into action center, campaigns, or hearings'
            ].map((item, index) => (
              <div key={item} className="rounded-xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/60">Alert {index + 1}</p>
                <p className="mt-2 text-sm text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile (optional)" className="rounded-lg border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <input id="sms-alerts" type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
              <label htmlFor="sms-alerts">Enable SMS critical alerts</label>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {TOPICS.map((topic) => {
                const active = topics.includes(topic);
                return (
                  <button key={topic} type="button" onClick={() => toggleTopic(topic)} className={`rounded-full border px-3 py-2 ${active ? 'border-[#d4af37]/55 bg-[#d4af37]/15 text-[#d4af37]' : 'border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/10'}`}>
                    {topic}
                  </button>
                );
              })}
            </div>
            <button disabled={submitting} className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Activating alerts...' : 'Activate Alerts'}</button>
            {status.type !== 'idle' ? <p className={`text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{status.message}</p> : null}
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#0f1012] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Best For</p>
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {[
                'People following fast-moving legal moments',
                'Supporters who want clear action prompts',
                'Organizers coordinating turnout and response'
              ].map((item) => <li key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#d4af37]" /><span>{item}</span></li>)}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#d4af37]/15 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_60%),#0f1012] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]/70">Delivery Expectation</p>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              Email is the default channel. SMS should be reserved for truly urgent notifications, especially where hearings, votes, or time-sensitive mobilization windows are short.
            </p>
          </section>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
