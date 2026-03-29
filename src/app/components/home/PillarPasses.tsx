'use client';

import { useState } from 'react';
import { Palette, BookOpen, Heart, MapPin, Briefcase, Users, Check, Sparkles } from 'lucide-react';
import { ACCESS_PLANS, getAnnualSavings } from '@/app/lib/monetization';
import { startSubscriptionCheckout } from '@/app/lib/profileApi';

const ICONS = {
  'digital-arts-pass': Palette,
  'heritage-archive-pass': BookOpen,
  'seva-impact-pass': Heart,
  'tourism-explorer-pass': MapPin,
  'creative-pro-pass': Briefcase,
  'all-access-pass': Sparkles
} as const;

const ACCESS_CARD_ORDER = [
  'digital-arts-pass',
  'heritage-archive-pass',
  'seva-impact-pass',
  'tourism-explorer-pass',
  'creative-pro-pass',
  'all-access-pass'
] as const;

const COLOR_CLASSES: Record<(typeof ACCESS_CARD_ORDER)[number], string> = {
  'digital-arts-pass': 'from-purple-500 to-pink-500',
  'heritage-archive-pass': 'from-amber-500 to-orange-500',
  'seva-impact-pass': 'from-red-500 to-rose-500',
  'tourism-explorer-pass': 'from-green-500 to-emerald-500',
  'creative-pro-pass': 'from-blue-500 to-cyan-500',
  'all-access-pass': 'from-[#d4af37] to-[#DC143C]'
};

const passes = ACCESS_CARD_ORDER.map((id) => ACCESS_PLANS.find((plan) => plan.id === id)!);

export default function PillarPasses() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [workingPlanId, setWorkingPlanId] = useState('');
  const [message, setMessage] = useState('');

  async function handleCheckout(planId: string) {
    setWorkingPlanId(planId);
    setMessage('');
    const result = await startSubscriptionCheckout({
      family: 'access',
      planId,
      billingCadence: isAnnual ? 'annual' : 'monthly',
      paymentMethod: 'card'
    }).catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Access pass checkout failed.');
      return null;
    });
    setWorkingPlanId('');
    if (!result) return;
    if (result.mode === 'redirect') {
      window.location.href = result.checkoutUrl;
      return;
    }
    setMessage('Access pass activated.');
  }

  return (
    <section className="bg-[#0a0a0a] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-4 py-2">
            <Users size={16} className="text-[#d4af37]" />
            <span className="text-sm font-medium text-[#d4af37]">Access passes</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">Subscribe to what you actually use</h2>
          <p className="mx-auto mb-6 max-w-2xl text-gray-400">
            Pillar passes stay separate from creator plans. Members can buy one focused access lane or take the full all-access path.
          </p>

          <div className="inline-flex items-center gap-4 rounded-full border border-[#d4af37]/20 bg-[#141414] p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                !isAnnual ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all ${
                isAnnual ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="rounded-full bg-[#DC143C] px-2 py-0.5 text-xs text-white">Save more</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {passes.map((pass) => {
            const Icon = ICONS[pass.id as keyof typeof ICONS] ?? Sparkles;
            const price = isAnnual ? pass.annualPrice : pass.monthlyPrice;
            const savings = getAnnualSavings(pass.monthlyPrice, pass.annualPrice);
            const featured = pass.id === 'all-access-pass';

            return (
              <div
                key={pass.id}
                className={`relative rounded-2xl p-6 transition-all hover:scale-105 ${
                  featured
                    ? 'border-2 border-[#d4af37] bg-gradient-to-br from-[#d4af37]/20 to-[#DC143C]/10'
                    : 'border border-[#d4af37]/10 bg-[#141414] hover:border-[#d4af37]/30'
                }`}
              >
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#DC143C] px-3 py-1 text-xs font-bold text-black">
                    Best value
                  </div>
                )}

                {isAnnual && savings > 0 && (
                  <div className="absolute right-4 top-4 rounded-full bg-[#DC143C]/20 px-2 py-1 text-xs text-[#DC143C]">
                    Save ${savings.toFixed(2)}
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${COLOR_CLASSES[pass.id as keyof typeof COLOR_CLASSES]} text-white`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{pass.name}</h3>
                    <p className="text-2xl font-bold text-[#d4af37]">
                      ${price}
                      <span className="text-sm font-normal text-gray-400">/{isAnnual ? 'year' : 'mo'}</span>
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-sm text-gray-400">{pass.description}</p>
                {pass.highlight && <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#d4af37]">{pass.highlight}</p>}

                <ul className="mb-6 space-y-2">
                  {pass.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 flex-shrink-0 text-[#d4af37]" />
                      <span className="text-sm text-gray-300">{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleCheckout(pass.id)}
                  disabled={workingPlanId === pass.id}
                  className={`w-full rounded-xl py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    featured
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#DC143C] text-white hover:opacity-90'
                      : 'border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20'
                  }`}
                >
                  {workingPlanId === pass.id ? 'Opening checkout...' : featured ? 'Choose all-access' : 'Choose pass'}
                </button>
              </div>
            );
          })}
        </div>
        {message ? (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#d4af37]/20 bg-[#141414] px-4 py-3 text-center text-sm text-white">
            {message}
          </div>
        ) : null}
      </div>
    </section>
  );
}

