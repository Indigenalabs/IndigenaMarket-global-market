'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, MapPin, Sparkles, Users, Wallet } from 'lucide-react';
import type {
  PlatformAccountMemberRecord,
  PlatformAccountRecord,
  RevenueSplitRuleRecord
} from '@/app/lib/platformAccounts';
import type { CommunityEntityPresentation } from '@/app/lib/communityEntityPresentation';
import { StorefrontHeroFrame, StorefrontTabBar } from '@/app/components/storefront/StorefrontSurface';
import StorefrontOfferCard from '@/app/components/storefront/StorefrontOfferCard';

type NationStorefrontTab = 'shop' | 'about' | 'representatives' | 'treasury';

const PILLAR_FILTER_ORDER = [
  'All',
  'Digital Arts',
  'Physical items',
  'Courses + events',
  'Community support',
  'Cultural tourism',
  'Language & heritage',
  'Education resources',
  'Freelancing + education',
  'Advocacy & legal'
] as const;

function supportProgress(currentAmount: number, targetAmount: number) {
  return Math.min(100, Math.round((currentAmount / targetAmount) * 100));
}

function describeRouteHint(href: string) {
  if (href.includes('/physical-items?item=')) return 'Opens live product panel';
  if (href.includes('/freelancing?service=')) return 'Opens live service detail';
  if (href.includes('/launchpad/')) return 'Opens live backing flow';
  if (href.includes('/cultural-tourism/')) return 'Opens booking flow';
  if (href.includes('/courses/')) return 'Opens course detail';
  if (href.includes('/language-heritage/')) return 'Opens recording detail';
  if (href.includes('/advocacy-legal/')) return 'Opens resource detail';
  if (href.includes('/materials-tools/')) return 'Opens product detail';
  return 'Opens live storefront flow';
}

export default function NationStorefrontClient({
  account,
  members,
  splitRules,
  presentation,
  initialTab = 'shop'
}: {
  account: PlatformAccountRecord;
  members: PlatformAccountMemberRecord[];
  splitRules: RevenueSplitRuleRecord[];
  presentation: CommunityEntityPresentation;
  initialTab?: NationStorefrontTab;
}) {
  const [activeTab, setActiveTab] = useState<NationStorefrontTab>(initialTab);
  const [shopFilter, setShopFilter] = useState<string>('All');

  const featuredItems = useMemo(() => presentation.storefrontItems.slice(0, 3), [presentation.storefrontItems]);
  const visibleItems = useMemo(() => {
    if (shopFilter === 'All') return presentation.storefrontItems;
    return presentation.storefrontItems.filter((item) => item.pillarLabel === shopFilter);
  }, [presentation.storefrontItems, shopFilter]);

  const activePillarFilters = useMemo(() => {
    const available = new Set(presentation.storefrontItems.map((item) => item.pillarLabel));
    return PILLAR_FILTER_ORDER.filter((entry) => entry === 'All' || available.has(entry));
  }, [presentation.storefrontItems]);

  const scrollToShop = () => {
    setActiveTab('shop');
    const target = document.getElementById('nation-storefront-shop');
    if (!target) return;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="space-y-4">
      <StorefrontHeroFrame
        cover={presentation.banner}
        coverAlt={account.displayName}
        badgeLabel="Nation storefront"
        manageHref="/creator-hub"
        manageLabel="Creator Hub mode switch"
        identity={
          <div className="flex gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-[20px] border-4 border-[#101010] bg-[#1b1b1b] shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:h-24 md:w-24">
                <img src={presentation.avatar} alt={account.displayName} className="h-full w-full object-cover" />
              </div>
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-white md:text-3xl">{account.displayName}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#B51D19]/15 px-2.5 py-1 text-xs font-medium text-[#ff7a75]">
                    <BadgeCheck size={13} />
                    {account.verificationStatus}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#d3cfc6]">Verified nation/community seller account</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#d4af37]" />
                    {account.location}
                  </span>
                  <span>{account.nation}</span>
                  <span>{members.length} representatives</span>
                  <span>{presentation.activePillars.length} active pillars</span>
                </div>
              </div>
            </div>
        }
        actions={
          <div className="flex flex-wrap gap-3">
              <button
                onClick={scrollToShop}
                className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm text-[#f3d780] hover:border-[#d4af37]/55 hover:bg-[#d4af37]/15"
              >
                <Sparkles size={14} />
                See storefront
              </button>
              <Link
                href={`/communities/${account.slug}/support`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35 hover:bg-[#d4af37]/10"
              >
                <Wallet size={14} />
                Support goals
              </Link>
              <Link
                href={`/communities/${account.slug}/treasury`}
                className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
              >
                <Users size={14} />
                Treasury
              </Link>
            </div>
        }
        mainContent={
          <>
            <p className="max-w-3xl text-sm leading-6 text-[#d9d4cb] md:text-base">{account.storefrontHeadline || account.description}</p>
            <div className="mt-4 flex flex-wrap gap-5 border-t border-white/10 pt-4 text-sm">
              <div className="text-left">
                <span className="font-semibold text-white">{presentation.storefrontItems.length}</span>
                <span className="ml-2 text-gray-400">storefront offers</span>
              </div>
              <div className="text-left">
                <span className="font-semibold text-white">{presentation.supportGoals.length}</span>
                <span className="ml-2 text-gray-400">support goals</span>
              </div>
              <div className="text-left">
                <span className="font-semibold text-white">{splitRules.length}</span>
                <span className="ml-2 text-gray-400">split rules</span>
              </div>
            </div>
            <div className="mt-4 rounded-[22px] border border-[#d4af37]/15 bg-[#0f0c08]/70 p-4 text-sm text-[#ddd2bf]">
              This storefront belongs to the nation or community account itself. Orders, bookings, and backing from here can follow treasury routing and split rules instead of defaulting to one individual seller.
            </div>
          </>
        }
        sideContent={
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(20,20,20,0.9))] p-3.5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Active in</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presentation.activePillars.map((pillar) => (
                <span
                  key={pillar}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-black/30 px-3 py-2 text-xs text-white"
                >
                  <span>{pillar}</span>
                </span>
              ))}
            </div>
          </div>
        }
        quickStrip={
          <div className="rounded-[22px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),rgba(0,0,0,0.22))] p-3.5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Quick shop</p>
                <p className="mt-1 text-sm text-[#ddd6c8]">Shop across this nation storefront with treasury and split rules already applied.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {featuredItems.map((item) => (
                  <Link
                    key={`jump-${item.id}`}
                    href={item.href}
                    className="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-xs text-gray-200 hover:border-[#d4af37]/35 hover:text-white"
                  >
                    {item.ctaLabel}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        }
      />

      <StorefrontTabBar
        tabs={[
          { id: 'shop', label: 'Shop' },
          { id: 'about', label: 'About' },
          { id: 'representatives', label: 'Representatives' },
          { id: 'treasury', label: 'Treasury' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'shop' && (
        <section id="nation-storefront-shop" className="scroll-mt-28 rounded-[24px] border border-white/10 bg-[#101010] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Unified shop</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Everything this nation account can sell across pillars</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/20 p-1">
                {activePillarFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setShopFilter(filter)}
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      shopFilter === filter ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {featuredItems.length > 0 && (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <Link
                  key={`lead-${item.id}`}
                  href={item.href}
                  className="rounded-[20px] border border-[#d4af37]/18 bg-[linear-gradient(135deg,rgba(212,175,55,0.09),rgba(0,0,0,0.24))] p-4 hover:border-[#d4af37]/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">{item.pillarLabel}</p>
                      <p className="mt-2 text-base font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-400">{item.subtitle}</p>
                    </div>
                    <span className="rounded-full border border-[#d4af37]/25 bg-black/20 px-2.5 py-1 text-[11px] text-[#f2d27f]">
                      Featured
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#f3d780]">{describeRouteHint(item.href)}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[#d4af37]">{item.priceLabel}</span>
                    <span className="text-gray-300">{item.ctaLabel}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <StorefrontOfferCard
                key={item.id}
                href={item.href}
                image={item.image}
                title={item.title}
                typeLabel={item.subtitle}
                pillarLabel={item.pillarLabel}
                priceLabel={item.priceLabel}
                ctaLabel={item.ctaLabel}
                blurb={item.description}
                metadata={[item.splitLabel]}
                actionHint={describeRouteHint(item.href)}
                badges={[
                  {
                    id: 'nation-route',
                    label: 'Treasury-aware sale',
                    className: 'rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] text-[#f2d27f]'
                  }
                ]}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === 'about' && (
        <section className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Entity story</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">About this storefront</h2>
            <p className="mt-4 text-base leading-8 text-[#d7d1c6]">{account.story}</p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Featured support goals</p>
            <div className="mt-5 space-y-4">
              {presentation.supportGoals.map((goal) => (
                <Link key={goal.id} href={goal.ctaHref} className="block rounded-[24px] border border-white/10 bg-black/20 p-4 hover:border-[#d4af37]/28">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/64">{goal.summary}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#d4af37]">{supportProgress(goal.currentAmount, goal.targetAmount)}%</p>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#f3dfb1,#d7a04d,#bf7a1f)]"
                      style={{ width: `${supportProgress(goal.currentAmount, goal.targetAmount)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-white/62">
                    <span>${goal.currentAmount.toLocaleString()} raised</span>
                    <span>${goal.targetAmount.toLocaleString()} target</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === 'representatives' && (
        <section className="rounded-[24px] border border-white/10 bg-[#101010] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Representatives</p>
            <h2 className="mt-1 text-xl font-semibold text-white">People operating the nation storefront</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {presentation.representativeProfiles.map((profile) => (
              <article key={profile.actorId} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-black/20">
                    <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/62">{profile.role}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/66">{profile.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.focusAreas.map((focus) => (
                        <span key={focus} className="rounded-full border border-[#d4af37]/18 bg-[#d4af37]/8 px-3 py-1 text-xs text-[#f6deb2]">
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'treasury' && (
        <section className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
          <article className="rounded-[24px] border border-white/10 bg-[#101010] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Treasury</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{account.treasuryLabel}</h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Sales from this storefront can route through treasury and split rules instead of defaulting to one individual creator.
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/66">
              <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                <p className="text-white">Payout wallet</p>
                <p className="mt-2 text-[#d4af37]">{account.payoutWallet}</p>
              </div>
              <Link href={`/communities/${account.slug}/treasury`} className="inline-flex rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                Open treasury dashboard
              </Link>
            </div>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-[#101010] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Operating split rules</p>
            <div className="mt-4 space-y-3">
              {splitRules.map((rule) => (
                <div key={rule.id} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{rule.offeringLabel}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {rule.pillar} | {rule.ruleType} | {rule.status}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#d4af37]/18 bg-[#d4af37]/8 px-3 py-1 text-xs text-[#f6deb2]">
                      {rule.beneficiaries.reduce((sum, entry) => sum + entry.percentage, 0)}% allocated
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rule.beneficiaries.map((entry) => (
                      <span key={entry.id} className="rounded-full border border-white/10 bg-[#141414] px-3 py-1 text-xs text-white/72">
                        {entry.label} {entry.percentage}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}
