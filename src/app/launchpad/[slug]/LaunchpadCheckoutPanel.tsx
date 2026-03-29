'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LaunchpadCadence, LaunchpadCampaign } from '@/app/lib/launchpad';
import { calculateLaunchpadQuote, getLaunchpadSupportTiers } from '@/app/lib/launchpad';

function cadenceLabel(cadence: LaunchpadCadence) {
  return cadence === 'monthly' ? 'Monthly' : 'One-time';
}

export default function LaunchpadCheckoutPanel({ campaign }: { campaign: LaunchpadCampaign }) {
  const router = useRouter();
  const [cadence, setCadence] = useState<LaunchpadCadence>('one-time');
  const [tierId, setTierId] = useState(campaign.supportTiers.oneTime[1]?.id || campaign.supportTiers.oneTime[0]?.id || '');
  const [amount, setAmount] = useState<number>(campaign.supportTiers.oneTime[1]?.amount || campaign.supportTiers.oneTime[0]?.amount || 25);
  const [supporterName, setSupporterName] = useState('');
  const [supporterEmail, setSupporterEmail] = useState('');
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [idempotencyKey] = useState(() => `launchpad-${campaign.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const tiers = useMemo(() => getLaunchpadSupportTiers(campaign, cadence), [campaign, cadence]);
  const quote = useMemo(() => calculateLaunchpadQuote(amount), [amount]);

  const chooseCadence = (nextCadence: LaunchpadCadence) => {
    const nextTiers = getLaunchpadSupportTiers(campaign, nextCadence);
    const nextTier = nextTiers[1] || nextTiers[0];
    setCadence(nextCadence);
    setTierId(nextTier?.id || '');
    setAmount(nextTier?.amount || amount);
  };

  const chooseTier = (nextTierId: string) => {
    const tier = tiers.find((entry) => entry.id === nextTierId);
    setTierId(nextTierId);
    if (tier) setAmount(tier.amount);
  };

  const submit = async () => {
    if (!supporterName.trim() || !supporterEmail.trim()) {
      setError('Supporter name and email are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/launchpad/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignSlug: campaign.slug,
          cadence,
          tierId,
          amount,
          supporterName,
          supporterEmail,
          note,
          visibility,
          idempotencyKey
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to complete Launchpad support.');
      }
      router.push(payload.redirectUrl || `/launchpad/receipts/${payload.data?.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to complete Launchpad support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#d4af37]/18 bg-[linear-gradient(180deg,rgba(30,17,10,0.92),rgba(13,10,9,0.96))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_26%)]" />
      <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Support this campaign</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Complete your backing</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/72">{campaign.sponsorCount} backers</div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {(['one-time', 'monthly'] as LaunchpadCadence[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => chooseCadence(option)}
            className={`rounded-[22px] border px-4 py-4 text-left transition-all ${
              cadence === option ? 'border-[#d4af37] bg-[#d4af37]/14' : 'border-white/10 bg-black/20 hover:border-[#d4af37]/32'
            }`}
          >
            <p className="text-sm font-semibold text-white">{cadenceLabel(option)}</p>
            <p className="mt-1 text-xs leading-6 text-white/62">
              {option === 'monthly' ? 'Keep this campaign moving each month.' : 'Back it once with a single contribution.'}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Backer tiers</p>
            <p className="mt-1 text-sm text-white/60">Choose a tier or enter your own amount.</p>
          </div>
          <p className="text-xs text-white/52">{cadenceLabel(cadence)} backing</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => chooseTier(tier.id)}
              className={`rounded-[22px] border p-4 text-left transition-all ${
                tierId === tier.id ? 'border-[#d4af37] bg-[#d4af37]/14' : 'border-white/10 bg-black/20 hover:border-[#d4af37]/28'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{tier.label}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">{tier.badge}</p>
                </div>
                <p className="text-xl font-semibold text-white">${tier.amount}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/62">{tier.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-white/80">
          Amount
          <input
            type="number"
            min={5}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value || 0))}
            className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/80">
            Backer name
            <input
              value={supporterName}
              onChange={(event) => setSupporterName(event.target.value)}
              className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/80">
            Backer email
            <input
              type="email"
              value={supporterEmail}
              onChange={(event) => setSupporterEmail(event.target.value)}
              className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm text-white/80">
            Message to organizer
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition focus:border-[#d4af37]"
            placeholder="Share encouragement or context for the beneficiary."
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['public', 'private'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setVisibility(mode)}
              className={`rounded-[18px] border px-4 py-3 text-sm transition-all ${
                visibility === mode ? 'border-[#d4af37] bg-[#d4af37]/12 text-white' : 'border-white/10 bg-black/20 text-white/68 hover:border-[#d4af37]/25'
              }`}
            >
              {mode === 'public' ? 'Show my backing publicly' : 'Keep my backing private'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/24 p-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Fee breakdown</p>
        <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-white/72"><span>Contribution amount</span><span>${quote.subtotal.toFixed(2)}</span></div>
          <div className="flex items-center justify-between text-white/72"><span>Launchpad platform fee (5%)</span><span>${quote.platformFee.toFixed(2)}</span></div>
          <div className="flex items-center justify-between text-white/72"><span>Processor fee</span><span>${quote.processorFee.toFixed(2)}</span></div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3 font-semibold text-white"><span>Total you pay</span><span>${quote.total.toFixed(2)}</span></div>
          <div className="flex items-center justify-between font-medium text-[#d4af37]"><span>Estimated beneficiary net</span><span>${quote.beneficiaryNet.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-[#d4af37]/16 bg-[#0f0d09]/80 p-4 text-sm text-[#ddd2bf]">
        <p className="font-medium text-white">Backer confidence</p>
        <p className="mt-2 leading-6">
          Every backing creates a receipt, keeps the fee split visible before payment, and routes the net amount to the linked beneficiary or treasury record.
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-[#ff9d84]">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="mt-6 w-full rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Creating receipt...' : `Complete ${cadenceLabel(cadence).toLowerCase()} backing`}
      </button>
      </div>
    </div>
  );
}
