'use client';

import { useState } from 'react';
import { Users, Building2, Globe, Check, ArrowRight, Zap } from 'lucide-react';
import { TEAM_PLANS } from '@/app/lib/monetization';
import { startSubscriptionCheckout } from '@/app/lib/profileApi';

const ICONS = {
  collective: Users,
  hub: Building2,
  organization: Globe
} as const;

export default function TeamPlans() {
  const [workingPlanId, setWorkingPlanId] = useState('');
  const [message, setMessage] = useState('');

  async function handleCheckout(planId: string, isCustomPlan: boolean) {
    if (isCustomPlan) {
      window.location.href = '/creator-hub?tab=partnerships';
      return;
    }
    setWorkingPlanId(planId);
    setMessage('');
    const result = await startSubscriptionCheckout({
      family: 'team',
      planId,
      billingCadence: 'monthly',
      paymentMethod: 'card'
    }).catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Team checkout failed.');
      return null;
    });
    setWorkingPlanId('');
    if (result?.mode === 'redirect') {
      window.location.href = result.checkoutUrl;
      return;
    }
    if (result?.mode === 'activated') setMessage('Team plan activated.');
  }

  return (
    <section className="bg-[#141414] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-4 py-2">
            <Users size={16} className="text-[#d4af37]" />
            <span className="text-sm font-medium text-[#d4af37]">Team and community plans</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">For collectives and organizations</h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Shared seats, shared analytics, and shared workflows. Team plans now sit under the creator product line instead of being mixed into consumer memberships.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TEAM_PLANS.map((plan) => {
            const Icon = ICONS[plan.id as keyof typeof ICONS] ?? Users;
            const isCustomPlan = plan.monthlyPrice === null;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 transition-all hover:scale-105 ${
                  plan.highlighted
                    ? 'border-2 border-[#d4af37] bg-gradient-to-b from-[#d4af37]/20 to-[#0a0a0a]'
                    : 'border border-[#d4af37]/10 bg-[#0a0a0a] hover:border-[#d4af37]/30'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 right-4 rounded-full bg-[#DC143C] px-3 py-1 text-xs font-bold text-white">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${plan.highlighted ? 'bg-[#d4af37] text-black' : 'bg-[#d4af37]/10 text-[#d4af37]'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{plan.seatCount}</p>
                    <p className="text-xs text-gray-400">included</p>
                  </div>
                </div>

                <h3 className="mb-1 text-xl font-bold text-white">{plan.name}</h3>
                <p className="mb-4 text-sm text-gray-400">{plan.description}</p>
                <div className="mb-4 flex items-baseline gap-2">
                  {plan.monthlyPrice !== null ? (
                    <>
                      <span className="text-3xl font-bold text-[#d4af37]">${plan.monthlyPrice}</span>
                      <span className="text-gray-400">/month</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-[#d4af37]">Custom</span>
                  )}
                </div>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 flex-shrink-0 text-[#d4af37]" />
                      <span className="text-sm text-gray-300">{feature.label}</span>
                    </li>
                  ))}
                </ul>

                  <button
                    type="button"
                    onClick={() => handleCheckout(plan.id, isCustomPlan)}
                    disabled={workingPlanId === plan.id}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.highlighted
                      ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]'
                      : 'border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20'
                  }`}
                >
                  {workingPlanId === plan.id ? 'Opening checkout...' : plan.ctaLabel}
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-[#0a0a0a] px-4 py-3 text-sm text-white">
            {message}
          </div>
        ) : null}

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#d4af37]/10 bg-[#0a0a0a] p-4 text-center">
            <Zap className="mx-auto mb-2 h-8 w-8 text-[#d4af37]" />
            <p className="text-sm font-medium text-white">Art collectives</p>
          </div>
          <div className="rounded-xl border border-[#d4af37]/10 bg-[#0a0a0a] p-4 text-center">
            <Building2 className="mx-auto mb-2 h-8 w-8 text-[#d4af37]" />
            <p className="text-sm font-medium text-white">Cultural centers</p>
          </div>
          <div className="rounded-xl border border-[#d4af37]/10 bg-[#0a0a0a] p-4 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-[#d4af37]" />
            <p className="text-sm font-medium text-white">Cooperatives</p>
          </div>
          <div className="rounded-xl border border-[#d4af37]/10 bg-[#0a0a0a] p-4 text-center">
            <Globe className="mx-auto mb-2 h-8 w-8 text-[#d4af37]" />
            <p className="text-sm font-medium text-white">Nations and tribes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

