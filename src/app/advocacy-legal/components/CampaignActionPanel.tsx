'use client';

import { useState } from 'react';
import { donateToCampaign } from '@/app/lib/advocacyLegalClientStore';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function CampaignActionPanel({ campaignId, campaignTitle }: { campaignId: string; campaignTitle: string }) {
  const [donorName, setDonorName] = useState('Community Supporter');
  const [amount, setAmount] = useState(120);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [submitting, setSubmitting] = useState(false);

  const donate = async () => {
    if (amount <= 0) {
      setStatus({ type: 'error', message: 'Donation amount must be greater than zero.' });
      return;
    }
    setSubmitting(true);
    setStatus({ type: 'idle' });
    try {
      await requireWalletAction('donate to this campaign');
      const donation = await donateToCampaign({ campaignId, campaignTitle, amount, donorName: donorName.trim() || 'Community Supporter' });
      setStatus({ type: 'success', message: `Donation confirmed: $${amount.toLocaleString()} recorded. Receipt ${donation.receiptId || 'issued'}.` });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Donation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-[#d4af37]/20 bg-black/20 p-4">
      <h4 className="text-sm font-semibold text-white">Contribute to this case</h4>
      <div className="grid gap-3 md:grid-cols-2">
        <input value={donorName} onChange={(e) => setDonorName(e.target.value)} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Donor name" />
        <input value={amount} onChange={(e) => setAmount(Number(e.target.value || 0))} type="number" min={1} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Amount" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[50, 100, 250, 500].map((preset) => (
          <button key={preset} type="button" onClick={() => setAmount(preset)} className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
            ${preset}
          </button>
        ))}
      </div>
      <button disabled={submitting} onClick={() => void donate()} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Recording...' : 'Donate to Case'}</button>
      {status.type !== 'idle' ? <p className={`text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>{status.message}</p> : null}
    </div>
  );
}
