'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Wallet, CreditCard, Coins, Check, Sparkles, Star, Heart, Zap, Crown, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import PillarPasses from '../components/home/PillarPasses';
import PromoBundles from '../components/home/PromoBundles';
import TeamPlans from '../components/home/TeamPlans';
import LifetimeMembership from '../components/home/LifetimeMembership';
import { ACCESS_PLANS, CREATOR_PLANS, MEMBER_PLANS, getAnnualSavings } from '@/app/lib/monetization';
import { cancelSubscriptionFamily, fetchSubscriptionEntitlements, startSubscriptionCheckout } from '@/app/lib/profileApi';

const PAYMENT_DISCOUNTS = {
  card: 0,
  indi: 15,
  staked: 25
} as const;

const MEMBER_ICONS = {
  free: Star,
  community: Heart,
  patron: Crown,
  'all-access': Sparkles
} as const;

const CREATOR_ICONS = {
  free: Star,
  creator: Zap,
  studio: Users
} as const;

const ACCESS_ICONS = {
  pillar: Sparkles,
  archive: BookOpen,
  'all-access': Crown
} as const;

function getDiscountedPrice(price: number, paymentMethod: keyof typeof PAYMENT_DISCOUNTS) {
  if (price === 0) return '0.00';
  const discount = PAYMENT_DISCOUNTS[paymentMethod];
  return (price * (1 - discount / 100)).toFixed(2);
}

export default function SubscriptionPage() {
  const [paymentMethod, setPaymentMethod] = useState<keyof typeof PAYMENT_DISCOUNTS>('card');
  const [isAnnual, setIsAnnual] = useState(false);
  const [memberPlanId, setMemberPlanId] = useState<string>('free');
  const [creatorPlanId, setCreatorPlanId] = useState<string>('free');
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<{
    activeCount: number;
    cancelledCount: number;
    churnCount: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    oneTimeRevenue: number;
    featureAdoption: {
      creatorAnalyticsUnlocked: boolean;
      unlimitedListingsUnlocked: boolean;
      teamWorkspaceUnlocked: boolean;
      archiveAccessUnlocked: boolean;
    };
  } | null>(null);
  const [workingKey, setWorkingKey] = useState('');
  const [message, setMessage] = useState('');

  const memberPlans = useMemo(() => MEMBER_PLANS.filter((plan) => plan.id !== 'free'), []);
  const creatorPlans = useMemo(() => CREATOR_PLANS, []);
  const archivePlans = useMemo(() => ACCESS_PLANS.filter((plan) => plan.scope === 'archive'), []);

  useEffect(() => {
    let active = true;
    async function loadEntitlements() {
      const payload = await fetchSubscriptionEntitlements().catch(() => null);
      if (!active || !payload) return;
      setMemberPlanId(payload.memberPlanId || 'free');
      setCreatorPlanId(payload.creatorPlanId || 'free');
      setSubscriptionMetrics(payload.metrics || null);
    }
    void loadEntitlements();
    return () => {
      active = false;
    };
  }, []);

  async function subscribe(
    family: 'member' | 'creator' | 'access',
    planId: string,
    billingCadence: 'monthly' | 'annual'
  ) {
    const key = `${family}:${planId}:${billingCadence}`;
    setWorkingKey(key);
    setMessage('');
    const result = await startSubscriptionCheckout({
      family,
      planId,
      billingCadence,
      paymentMethod
    }).catch(() => null);
    if (!result) {
      setWorkingKey('');
      setMessage('Could not update subscription state.');
      return;
    }
    if (result.mode === 'redirect') {
      window.location.href = result.checkoutUrl;
      return;
    }
    setMemberPlanId(result.entitlements.memberPlanId || 'free');
    setCreatorPlanId(result.entitlements.creatorPlanId || 'free');
    setSubscriptionMetrics(result.entitlements.metrics || null);
    setWorkingKey('');
    setMessage('Subscription state updated.');
  }

  async function cancelFamily(family: 'member' | 'creator' | 'access' | 'team' | 'lifetime') {
    const key = `cancel:${family}`;
    setWorkingKey(key);
    setMessage('');
    try {
      const result = await cancelSubscriptionFamily({
        family,
        cancelAtPeriodEnd: true,
        reason: 'User requested cancellation'
      });
      setMemberPlanId(result.entitlements.memberPlanId || 'free');
      setCreatorPlanId(result.entitlements.creatorPlanId || 'free');
      setSubscriptionMetrics(result.entitlements.metrics || null);
      setMessage('Cancellation updated. Existing access remains active until the current paid period ends.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Subscription cancellation failed.');
    } finally {
      setWorkingKey('');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-50 border-b border-[#d4af37]/20 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-400 transition-colors hover:text-[#d4af37]">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Indigena" className="h-8 w-8 rounded-full" />
            <span className="font-semibold text-white">INDIGENA</span>
          </div>

          <div className="w-24" />
        </div>
      </header>

      <section className="px-6 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-4 py-2">
          <Sparkles size={16} className="text-[#d4af37]" />
          <span className="text-sm font-medium text-[#d4af37]">Subscriptions split by product family</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Choose the right revenue lane</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Members, creators, and archive users now have separate plan families. That keeps pricing cleaner and entitlement logic simpler.
        </p>
        {subscriptionMetrics ? (
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-4">
            <Metric label="Active plans" value={String(subscriptionMetrics.activeCount)} />
            <Metric label="MRR" value={`$${Math.round(subscriptionMetrics.monthlyRecurringRevenue).toLocaleString()}`} />
            <Metric label="ARR" value={`$${Math.round(subscriptionMetrics.annualRecurringRevenue).toLocaleString()}`} />
            <Metric label="Churned plans" value={String(subscriptionMetrics.churnCount)} />
          </div>
        ) : null}

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#141414] p-1">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${paymentMethod === 'card' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <CreditCard size={16} />
            Card
          </button>
          <button
            onClick={() => setPaymentMethod('indi')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${paymentMethod === 'indi' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <Coins size={16} />
            INDI Token
            <span className="rounded bg-[#DC143C] px-1.5 py-0.5 text-xs text-white">15% off</span>
          </button>
          <button
            onClick={() => setPaymentMethod('staked')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${paymentMethod === 'staked' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            <Wallet size={16} />
            Staked INDI
            <span className="rounded bg-[#DC143C] px-1.5 py-0.5 text-xs text-white">25% off</span>
          </button>
        </div>

        <div className="mt-6 inline-flex items-center gap-4 rounded-full border border-[#d4af37]/20 bg-[#141414] p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${!isAnnual ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all ${isAnnual ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Annual
            <span className="rounded-full bg-[#DC143C] px-2 py-0.5 text-xs text-white">Save more</span>
          </button>
        </div>

        {paymentMethod !== 'card' && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#DC143C]/30 bg-[#DC143C]/10 px-4 py-2">
            <Check size={16} className="text-[#DC143C]" />
            <span className="text-sm font-medium text-[#DC143C]">{PAYMENT_DISCOUNTS[paymentMethod]}% discount applied to recurring plans</span>
          </div>
        )}

        {message && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#141414] px-4 py-2">
            <Check size={16} className="text-[#d4af37]" />
            <span className="text-sm font-medium text-white">{message}</span>
          </div>
        )}
      </section>

      <section className="bg-gradient-to-b from-[#0a0a0a] to-[#141414] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Member plans" detail="For supporters, collectors, and broad-access members." icon={Heart} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {memberPlans.map((plan) => {
              const Icon = MEMBER_ICONS[plan.id as keyof typeof MEMBER_ICONS] ?? Heart;
              const basePrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const price = getDiscountedPrice(basePrice, paymentMethod);
              const savings = getAnnualSavings(plan.monthlyPrice, plan.annualPrice);
              const cadence = isAnnual ? 'annual' : 'monthly';
              return (
                <PlanCard
                  key={plan.id}
                  title={plan.name}
                  description={plan.description}
                  price={price}
                  period={isAnnual ? 'year' : 'month'}
                  features={plan.features.map((feature) => feature.label)}
                  badge={isAnnual && savings > 0 ? `Save $${savings.toFixed(2)}/year` : plan.badge}
                  emphasized={plan.popular}
                  Icon={Icon}
                  ctaLabel={memberPlanId === plan.id ? 'Current plan' : isAnnual ? 'Choose annual' : 'Choose monthly'}
                  disabled={memberPlanId === plan.id || workingKey === `member:${plan.id}:${cadence}`}
                  onSelect={() => subscribe('member', plan.id, cadence)}
                />
              );
            })}
          </div>
          {memberPlanId !== 'free' ? (
            <button
              onClick={() => void cancelFamily('member')}
              disabled={workingKey === 'cancel:member'}
              className="mt-5 rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
            >
              {workingKey === 'cancel:member' ? 'Updating...' : 'Cancel member plan at period end'}
            </button>
          ) : null}
        </div>
      </section>

      <section className="bg-[#141414] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Creator plans" detail="For sellers, studios, and teams that want lower fees and stronger operating tools." icon={Zap} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {creatorPlans.map((plan) => {
              const Icon = CREATOR_ICONS[plan.id as keyof typeof CREATOR_ICONS] ?? Zap;
              const basePrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const price = getDiscountedPrice(basePrice, paymentMethod);
              const savings = getAnnualSavings(plan.monthlyPrice, plan.annualPrice);
              const cadence = basePrice === 0 ? 'monthly' : isAnnual ? 'annual' : 'monthly';
              return (
                <PlanCard
                  key={plan.id}
                  title={plan.name}
                  description={plan.description}
                  price={price}
                  period={basePrice === 0 ? 'forever' : isAnnual ? 'year' : 'month'}
                  features={plan.features.map((feature) => feature.label)}
                  badge={isAnnual && savings > 0 ? `Save $${savings.toFixed(2)}/year` : plan.badge}
                  emphasized={plan.popular}
                  Icon={Icon}
                  ctaLabel={
                    creatorPlanId === plan.id
                      ? 'Current plan'
                      : basePrice === 0
                        ? 'Start free'
                        : isAnnual
                          ? 'Choose annual'
                          : 'Choose monthly'
                  }
                  disabled={creatorPlanId === plan.id || workingKey === `creator:${plan.id}:${cadence}`}
                  onSelect={() => subscribe('creator', plan.id, cadence)}
                />
              );
            })}
          </div>
          {creatorPlanId !== 'free' ? (
            <button
              onClick={() => void cancelFamily('creator')}
              disabled={workingKey === 'cancel:creator'}
              className="mt-5 rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white disabled:opacity-60"
            >
              {workingKey === 'cancel:creator' ? 'Updating...' : 'Cancel creator plan at period end'}
            </button>
          ) : null}
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Archive access" detail="Separate archive products for researchers, institutions, and premium heritage access." icon={BookOpen} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {archivePlans.map((plan) => {
              const Icon = ACCESS_ICONS[plan.scope];
              const basePrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const price = getDiscountedPrice(basePrice, paymentMethod);
              const savings = getAnnualSavings(plan.monthlyPrice, plan.annualPrice);
              const cadence = isAnnual ? 'annual' : 'monthly';
              return (
                <PlanCard
                  key={plan.id}
                  title={plan.name}
                  description={plan.description}
                  price={price}
                  period={isAnnual ? 'year' : 'month'}
                  features={plan.features.map((feature) => feature.label)}
                  badge={isAnnual && savings > 0 ? `Save $${savings.toFixed(2)}/year` : plan.badge}
                  emphasized={plan.scope === 'archive' && plan.id === 'researcher-access'}
                  Icon={Icon}
                  ctaLabel={workingKey === `access:${plan.id}:${cadence}` ? 'Saving...' : isAnnual ? 'Choose annual' : 'Choose monthly'}
                  disabled={workingKey === `access:${plan.id}:${cadence}`}
                  onSelect={() => subscribe('access', plan.id, cadence)}
                />
              );
            })}
          </div>
        </div>
      </section>

      <PillarPasses />
      <TeamPlans />
      <PromoBundles />
      <LifetimeMembership />
    </div>
  );
}

function SectionHeader({ title, detail, icon: Icon }: { title: string; detail: string; icon: typeof Heart }) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-4 py-2">
        <Icon size={16} className="text-[#d4af37]" />
        <span className="text-sm font-medium text-[#d4af37]">{title}</span>
      </div>
      <p className="mx-auto max-w-2xl text-gray-400">{detail}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/15 bg-[#141414] px-5 py-4 text-left">
      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function PlanCard({
  title,
  description,
  price,
  period,
  features,
  badge,
  emphasized,
  Icon,
  ctaLabel,
  disabled,
  onSelect
}: {
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  emphasized?: boolean;
  Icon: typeof Heart;
  ctaLabel: string;
  disabled?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div className={`relative rounded-2xl p-6 transition-all hover:scale-[1.02] ${emphasized ? 'border-2 border-[#d4af37] bg-gradient-to-b from-[#d4af37]/20 to-[#141414]' : 'border border-[#d4af37]/20 bg-[#141414]'}`}>
      {badge && <div className="absolute right-4 top-4 rounded-full bg-[#DC143C]/20 px-2 py-1 text-xs text-[#DC143C]">{badge}</div>}
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${emphasized ? 'bg-[#d4af37] text-black' : 'bg-[#d4af37]/10 text-[#d4af37]'}`}>
        <Icon size={22} />
      </div>
      <h3 className="mb-1 text-xl font-bold text-white">{title}</h3>
      <p className="mb-4 text-sm text-gray-400">{description}</p>
      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{price === '0.00' ? 'Free' : `$${price}`}</span>
        {period !== 'forever' && price !== '0.00' && <span className="text-sm text-gray-400">/{period}</span>}
      </div>
      <ul className="mb-6 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check size={14} className="mt-0.5 flex-shrink-0 text-[#d4af37]" />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${emphasized ? 'bg-[#d4af37] text-black hover:bg-[#f4e4a6]' : 'border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20'}`}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
