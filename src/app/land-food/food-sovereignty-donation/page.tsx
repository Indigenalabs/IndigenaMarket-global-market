'use client';

import { useState } from 'react';
import { Heart, Leaf, Sprout } from 'lucide-react';
import LandFoodFrame from '../components/LandFoodFrame';
import { donateSeva } from '@/app/lib/sevaApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

const donationTiers = [
  { amount: 25, label: 'Seed Bundle', impact: 'Helps stock a community seed bank.' },
  { amount: 100, label: 'Harvest Circle', impact: 'Supports youth food-growing sessions and shared tools.' },
  { amount: 250, label: 'Sovereignty Grant', impact: 'Backs gardens, food distribution, and cultural food education.' }
];

export default function FoodSovereigntyDonationPage() {
  const [customAmount, setCustomAmount] = useState(50);
  const [donating, setDonating] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const handleDonate = async (amount: number, label: string) => {
    if (amount <= 0) {
      setStatus({ type: 'error', message: 'Donation amount must be greater than zero.' });
      return;
    }
    setDonating(label);
    setStatus({ type: 'idle' });
    try {
      const { wallet } = await requireWalletAction('support food sovereignty programs');
      await donateSeva(wallet, 'food-sovereignty-programs', amount, label);
      setStatus({
        type: 'success',
        message: `Food sovereignty contribution confirmed: $${amount.toLocaleString()} recorded.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to complete this donation right now.'
      });
    } finally {
      setDonating('');
    }
  };

  return (
    <LandFoodFrame title="Donation to Food Sovereignty Programs" subtitle="Direct Seva-aligned support for Indigenous food security initiatives.">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,16,10,0.96))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d4af37]/70">Food Sovereignty</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Fund growing power, not just emergency relief</h2>
          <p className="mt-4 text-sm leading-8 text-gray-300">
            These contributions support Indigenous seed banks, youth food education, community gardens, seasonal harvesting, and emergency food distribution rooted in local cultural practice.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { icon: Sprout, label: 'Seed banks', copy: 'Keep heirloom and climate-resilient food systems alive.' },
              { icon: Leaf, label: 'Community growing', copy: 'Back gardens, orchards, and regenerative food plots.' },
              { icon: Heart, label: 'Food access', copy: 'Support direct distribution during high-need periods.' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Icon size={18} className="text-[#d4af37]" />
                  <p className="mt-3 text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-xs leading-6 text-gray-400">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#10110f] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Choose Your Impact</p>
          <div className="mt-4 space-y-3">
            {donationTiers.map((tier) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => void handleDonate(tier.amount, tier.label)}
                disabled={donating === tier.label}
                className="w-full rounded-2xl border border-[#d4af37]/25 bg-black/20 p-4 text-left transition-colors hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{tier.label}</p>
                    <p className="mt-1 text-xs leading-6 text-gray-400">{tier.impact}</p>
                  </div>
                  <span className="text-lg font-semibold text-[#d4af37]">${tier.amount}</span>
                </div>
                <p className="mt-3 text-xs text-[#d4af37]">{donating === tier.label ? 'Opening secure checkout...' : 'Donate with secure Sign in'}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]/70">Custom Amount</p>
            <input
              type="number"
              min={1}
              value={customAmount}
              onChange={(e) => setCustomAmount(Math.max(1, Number(e.target.value || 1)))}
              className="mt-3 w-full rounded-xl border border-[#d4af37]/20 bg-[#0a0a0a] px-3 py-3 text-sm text-white"
            />
            <button
              type="button"
              onClick={() => void handleDonate(customAmount, 'Custom Food Sovereignty Donation')}
              disabled={donating === 'Custom Food Sovereignty Donation'}
              className="mt-3 w-full rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {donating === 'Custom Food Sovereignty Donation' ? 'Opening secure checkout...' : 'Donate Custom Amount'}
            </button>
          </div>

          {status.type !== 'idle' && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-300' : 'border-red-500/30 bg-red-900/10 text-red-300'}`}>
              {status.message}
            </div>
          )}
        </article>
      </section>
    </LandFoodFrame>
  );
}



