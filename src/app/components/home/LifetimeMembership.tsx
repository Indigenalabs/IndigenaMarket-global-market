'use client';

import { Infinity, Gift, Award, Star, Check, Sparkles } from 'lucide-react';
import { LIFETIME_PLANS } from '@/app/lib/monetization';

const ICONS = {
  founder: Star,
  elder: Award
} as const;

const COLORS = {
  founder: 'from-[#d4af37] to-amber-600',
  elder: 'from-[#DC143C] to-purple-600'
} as const;

export default function LifetimeMembership({
  lifetimePlanIds,
  workingKey,
  message,
  onCheckout
}: {
  lifetimePlanIds: string[];
  workingKey: string;
  message: string;
  onCheckout: (planId: string) => void;
}) {
  const ownedPlans = new Set(lifetimePlanIds);

  return (
    <section id="lifetime" className="bg-gradient-to-b from-[#141414] via-[#0a0a0a] to-[#141414] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-4 py-2">
            <Infinity size={16} className="text-[#d4af37]" />
            <span className="text-sm font-medium text-[#d4af37]">Legacy membership</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Join for life</h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Lifetime plans stay separate from recurring subscriptions. They are long-horizon support products with recognition,
            access, and legacy value.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-3 gap-6">
          <Stat label="Founder spots available" value="10,000" />
          <Stat label="Potential founding capital" value="$5M" />
          <Stat label="Legacy term" value="Forever" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {LIFETIME_PLANS.map((tier) => {
            const Icon = ICONS[tier.id as keyof typeof ICONS] ?? Star;
            const isOwned = ownedPlans.has(tier.id);
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-8 transition-all hover:scale-105 ${
                  tier.featured
                    ? 'border-2 border-[#DC143C] bg-gradient-to-br from-[#DC143C]/20 via-[#141414] to-[#d4af37]/10'
                    : 'border border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/10 via-[#141414] to-[#141414]'
                }`}
              >
                {tier.badge && (
                  <div
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-bold ${
                      tier.featured ? 'bg-[#DC143C] text-white' : 'bg-[#d4af37] text-black'
                    }`}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${COLORS[tier.id as keyof typeof COLORS]} text-white`}>
                  <Icon size={32} />
                </div>

                <h3 className="mb-2 text-center text-2xl font-bold text-white">{tier.name}</h3>
                <p className="mx-auto mb-6 max-w-md text-center text-sm text-gray-400">{tier.description}</p>
                <div className="mb-6 text-center">
                  <span className="text-5xl font-bold text-[#d4af37]">${tier.price}</span>
                  <span className="ml-2 text-gray-400">one-time</span>
                </div>
                {tier.valueLabel ? (
                  <div className="mb-6 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/10 px-3 py-1 text-sm text-[#d4af37]">
                      <Sparkles size={14} />
                      {tier.valueLabel}
                    </span>
                  </div>
                ) : null}

                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-3">
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${tier.featured ? 'bg-[#DC143C] text-white' : 'bg-[#d4af37] text-black'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-300">{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onCheckout(tier.id)}
                  disabled={isOwned || workingKey === `lifetime:${tier.id}:one-time`}
                  className={`w-full rounded-xl py-4 text-lg font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    tier.featured
                      ? 'bg-gradient-to-r from-[#DC143C] to-purple-600 text-white hover:opacity-90'
                      : 'bg-gradient-to-r from-[#d4af37] to-amber-600 text-black hover:opacity-90'
                  }`}
                >
                  {isOwned ? 'Already owned' : workingKey === `lifetime:${tier.id}:one-time` ? 'Opening checkout...' : `Join ${tier.name}`}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">30-day money-back guarantee · Transferable to family</p>
              </div>
            );
          })}
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-[#0a0a0a] px-4 py-3 text-sm text-white">
            {message}
          </div>
        ) : null}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-[#d4af37]" />
            <span>Annual gifts on legacy tiers</span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#d4af37]" />
            <span>Permanent recognition</span>
          </div>
          <div className="flex items-center gap-2">
            <Infinity size={18} className="text-[#d4af37]" />
            <span>Never pay again</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d4af37]/10 bg-[#141414] p-4 text-center">
      <p className="text-3xl font-bold text-[#d4af37]">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
