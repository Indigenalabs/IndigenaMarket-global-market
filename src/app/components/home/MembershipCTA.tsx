'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Crown, Check, Star, Zap, Shield, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { CREATOR_PLANS, MEMBER_PLANS, getAnnualSavings } from '@/app/lib/monetization';
import { startSubscriptionCheckout } from '@/app/lib/profileApi';

const ICONS = {
  free: Star,
  community: Heart,
  creator: Zap,
  'all-access': Crown
} as const;

const DISPLAY_PLANS = [
  MEMBER_PLANS.find((plan) => plan.id === 'free')!,
  MEMBER_PLANS.find((plan) => plan.id === 'community')!,
  CREATOR_PLANS.find((plan) => plan.id === 'creator')!,
  MEMBER_PLANS.find((plan) => plan.id === 'all-access')!
];

export default function MembershipCTA() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [workingPlanId, setWorkingPlanId] = useState('');
  const [message, setMessage] = useState('');

  const cards = useMemo(
    () =>
      DISPLAY_PLANS.map((plan) => {
        const Icon = ICONS[plan.id as keyof typeof ICONS] ?? Sparkles;
        const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
        const savings = getAnnualSavings(plan.monthlyPrice, plan.annualPrice);
        return { plan, Icon, price, savings };
      }),
    [isAnnual]
  );

  async function handlePlanSelect(planId: string) {
    setWorkingPlanId(planId);
    setMessage('');
    const family = planId === 'creator' ? 'creator' : 'member';
    const result = await startSubscriptionCheckout({
      family,
      planId,
      billingCadence: isAnnual ? 'annual' : 'monthly',
      paymentMethod: 'card'
    }).catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Subscription checkout failed.');
      return null;
    });
    setWorkingPlanId('');
    if (!result) return;
    if (result.mode === 'redirect') {
      window.location.href = result.checkoutUrl;
      return;
    }
    setMessage('Plan activated. Billing details are available in the subscription hub.');
  }

  return (
    <section className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-4 py-2">
            <Sparkles size={16} className="text-[#d4af37]" />
            <span className="text-sm font-medium text-[#d4af37]">Member + creator plans</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Choose the right plan family</h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-400">
            Start free, support the platform as a member, or step into the creator plan when you need lower fees and deeper tools.
          </p>

          <div className="inline-flex items-center gap-4 rounded-full border border-[#d4af37]/20 bg-[#0a0a0a] p-1">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ plan, Icon, price, savings }) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 transition-all hover:scale-105 ${
                plan.id === 'creator'
                  ? 'border-2 border-[#d4af37] bg-gradient-to-b from-[#d4af37]/20 to-[#141414]'
                  : 'border border-[#d4af37]/20 bg-[#141414] hover:border-[#d4af37]/40'
              }`}
            >
              {(plan.id === 'creator' || plan.id === 'all-access') && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#d4af37] px-4 py-1 text-sm font-bold text-black">
                  {plan.id === 'creator' ? 'Best creator plan' : 'Best member value'}
                </div>
              )}

              {isAnnual && savings > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-[#DC143C]/20 px-2 py-1 text-xs text-[#DC143C]">
                  Save ${savings.toFixed(2)}/year
                </div>
              )}

              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  plan.id === 'creator'
                    ? 'bg-[#d4af37] text-black'
                    : plan.id === 'community'
                      ? 'bg-pink-500/20 text-pink-400'
                      : plan.id === 'all-access'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-[#d4af37]/10 text-[#d4af37]'
                }`}
              >
                <Icon size={24} />
              </div>

              <h3 className="mb-1 text-lg font-bold text-white">{plan.name}</h3>
              <p className="mb-4 text-xs text-gray-400">{plan.description}</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{price === 0 ? 'Free' : `$${price}`}</span>
                {price > 0 && <span className="text-sm text-gray-400">/{isAnnual ? 'year' : 'month'}</span>}
              </div>

              <ul className="mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                        plan.id === 'creator'
                          ? 'bg-[#d4af37] text-black'
                          : 'bg-[#d4af37]/20 text-[#d4af37]'
                      }`}
                    >
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className={`text-xs ${feature.emphasis ? 'font-medium text-white' : 'text-gray-300'}`}>{feature.label}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanSelect(plan.id)}
                disabled={workingPlanId === plan.id}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.id === 'creator'
                    ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                    : price === 0
                      ? 'border border-[#d4af37]/30 bg-[#0a0a0a] text-white hover:border-[#d4af37]'
                      : 'border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20'
                }`}
              >
                {workingPlanId === plan.id ? 'Opening checkout...' : price === 0 ? 'Get started' : isAnnual ? 'Choose annual' : 'Choose monthly'}
              </button>
            </div>
          ))}
        </div>

        {message ? (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#d4af37]/20 bg-[#141414] px-4 py-3 text-center text-sm text-white">
            {message}
          </div>
        ) : null}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#d4af37]" />
            <span>Clear billing and fee visibility</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={18} className="text-[#d4af37]" />
            <span>Annual savings shown upfront</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#d4af37]" />
            <span>Separate member and creator paths</span>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#141414] px-8 py-4 font-semibold text-[#d4af37] transition-all hover:border-[#d4af37] hover:bg-[#d4af37]/10"
          >
            View full pricing families
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

