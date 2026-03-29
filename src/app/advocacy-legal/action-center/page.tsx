'use client';

import { useState } from 'react';
import AdvocacyFrame from '../components/AdvocacyFrame';
import { recordPolicyAction } from '@/app/lib/advocacyLegalClientStore';

type AlertRow = {
  id: string;
  title: string;
  region: string;
  status: string;
  supporters: number;
};

export default function PolicyLegislativeActionCenterPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([
    { id: 'Bill-41', title: 'Bill 41 - Cultural Site Access Rules', region: 'State', status: 'Hearing in 6 days', supporters: 1821 },
    { id: 'Act-22', title: 'Language Access in Public Services', region: 'Federal', status: 'Public submissions open', supporters: 2453 },
    { id: 'Rule-17', title: 'Mining Permit Consultation Rule', region: 'Regional', status: 'Comment period closes Friday', supporters: 1198 }
  ]);
  const [status, setStatus] = useState<string>('');
  const [busyId, setBusyId] = useState<string>('');

  const onTakeAction = async (row: AlertRow, actionType: 'letter' | 'petition' | 'hearing-rsvp') => {
    setBusyId(`${row.id}:${actionType}`);
    setStatus('');
    try {
      await recordPolicyAction({ billId: row.id, title: row.title, actionType, actorName: 'Community Member' });
      setAlerts((prev) => prev.map((item) => (item.id === row.id ? { ...item, supporters: item.supporters + 1 } : item)));
      setStatus(`Action recorded for ${row.id}. Community tally updated.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to record action.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <AdvocacyFrame title="Policy & Legislative Action Center" subtitle="Track legal changes, submit advocacy letters, and mobilize community response.">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.97),rgba(10,10,10,0.97))] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <p className="text-xs uppercase tracking-[0.34em] text-[#d4af37]/70">Action Center</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">Turn legal awareness into public pressure</h2>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-gray-300">
            This page is where policy risk becomes organized response. Use it to move people from concern into timed action while a hearing window, comment deadline, or legislative vote still matters.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_58%),#101112] p-7">
          <p className="text-xs uppercase tracking-[0.34em] text-[#d4af37]/70">How It Works</p>
          <div className="mt-5 space-y-3">
            {[
              'Choose a live policy issue with an open response window.',
              'Take the action that fits the moment: letter, petition, or hearing RSVP.',
              'Help push the public tally higher so pressure is visible and coordinated.'
            ].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/60">Step {index + 1}</p>
                <p className="mt-2 text-sm leading-7 text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {alerts.map((item) => (
          <article key={item.id} className="rounded-[24px] border border-[#d4af37]/20 bg-[#101112] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wide text-[#d4af37]">{item.id}</p>
              <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">Live Action</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-gray-400">{item.region}</p>
            <p className="mt-2 text-xs text-emerald-300">{item.status}</p>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              Supporters are already mobilizing around this policy moment. Add your action now while the response window is still open and visible.
            </p>
            <p className="mt-3 text-xs text-gray-400">{item.supporters.toLocaleString()} supporters acted</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button disabled={Boolean(busyId)} onClick={() => void onTakeAction(item, 'letter')} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60">{busyId === `${item.id}:letter` ? 'Sending...' : 'Send Letter'}</button>
              <button disabled={Boolean(busyId)} onClick={() => void onTakeAction(item, 'petition')} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60">{busyId === `${item.id}:petition` ? 'Sending...' : 'Sign Petition'}</button>
              <button disabled={Boolean(busyId)} onClick={() => void onTakeAction(item, 'hearing-rsvp')} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60">{busyId === `${item.id}:hearing-rsvp` ? 'Sending...' : 'RSVP Hearing'}</button>
            </div>
          </article>
        ))}
      </section>
      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
    </AdvocacyFrame>
  );
}
