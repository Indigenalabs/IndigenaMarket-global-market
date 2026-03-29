'use client';

import { useState } from 'react';
import AdvocacyFrame from '../components/AdvocacyFrame';
import { donateToCampaign } from '@/app/lib/advocacyLegalClientStore';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function EmergencyLegalDefenseFundPage() {
  const [amount, setAmount] = useState(100);
  const [donorName, setDonorName] = useState('Emergency Supporter');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const onDonate = async () => {
    if (amount <= 0) {
      setStatus({ type: 'error', message: 'Contribution amount must be greater than zero.' });
      return;
    }
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('contribute to the emergency legal defense fund');
      const donation = await donateToCampaign({
        campaignId: 'emergency-legal-defense-fund',
        campaignTitle: 'Emergency Legal Defense Fund',
        amount,
        donorName: donorName.trim() || 'Emergency Supporter'
      });
      setStatus({ type: 'success', message: `Contribution confirmed: $${amount.toLocaleString()}. Receipt ${donation.receiptId || 'issued'}.` });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Contribution failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdvocacyFrame title="Emergency Legal Defense Fund" subtitle="Rapid-response fund for urgent rights defense and safety litigation.">
      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(18,18,18,0.97),rgba(10,10,10,0.97))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <p className="text-xs uppercase tracking-[0.34em] text-[#d4af37]/70">Emergency Fund</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">Fund the first legal move before communities lose time</h2>
          <p className="mt-4 text-sm leading-8 text-gray-300">
            This fund is built for the moment before a full campaign can even mobilize: emergency filings, protective orders, urgent retainer gaps, legal observers, and the first response needed to stop a window from closing.
          </p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-black/40"><div className="h-full w-[64%] bg-[#d4af37]" /></div>
          <p className="mt-2 text-sm text-[#d4af37]">$1,280,000 raised of $2,000,000 target</p>

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Recent Rapid Response</p>
            <div className="mt-4 space-y-4">
              {[
                ['March 11, 2026', 'Emergency filing support unlocked for a coastal access defense matter.'],
                ['March 5, 2026', 'Safety counsel deployment covered for a fast-moving land defense escalation.'],
                ['February 27, 2026', 'Retainer gap closed so a community injunction package could proceed.']
              ].map(([date, summary]) => (
                <div key={date} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]/65">{date}</p>
                  <p className="mt-2 text-sm leading-7 text-gray-200">{summary}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Where It Deploys Fast</p>
            <div className="mt-4 space-y-3">
              {[
                'Emergency injunction preparation',
                'Rapid safety and observation counsel',
                'Immediate filings before a deadline closes'
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-sm text-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <h3 className="mt-6 font-semibold text-white">Donate Now</h3>
          <input value={donorName} onChange={(e) => setDonorName(e.target.value)} className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Donor name" />
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {[25, 50, 100, 250].map((x) => (
              <button key={x} type="button" onClick={() => setAmount(x)} className={`rounded-lg border px-3 py-2 ${amount === x ? 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#d4af37]' : 'border-[#d4af37]/35 text-[#d4af37] hover:bg-[#d4af37]/10'}`}>${x}</button>
            ))}
          </div>
          <input value={amount} onChange={(e) => setAmount(Number(e.target.value || 0))} type="number" min={1} className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Custom amount" />
          <button disabled={submitting} onClick={() => void onDonate()} className="mt-3 w-full rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Recording...' : 'Contribute'}</button>
          {status.type !== 'idle' ? <p className={`mt-2 text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{status.message}</p> : null}

          <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Why Emergency Donations Matter</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-300">
              {[
                'Early intervention can change whether a case gets traction at all.',
                'Fast legal movement reduces the cost of waiting for public fundraising to catch up.',
                'Communities facing immediate risk often need speed before they need scale.'
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </section>
    </AdvocacyFrame>
  );
}
