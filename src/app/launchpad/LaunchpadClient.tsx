'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Clock3, HeartHandshake, Radio, Shield, TrendingUp, Users } from 'lucide-react';
import type { LaunchpadCampaign } from '@/app/lib/launchpad';
import { calculateLaunchpadQuote, getLaunchpadCategoryLabel, launchpadCategoryMeta, LAUNCHPAD_PLATFORM_FEE_RATE } from '@/app/lib/launchpad';

const suggestedAmounts = [25, 50, 100, 250];
const launchpadTrustSignals = [
  {
    label: 'Verified identity',
    detail: 'Campaign pages show the beneficiary, campaign lane, and storefront or community link when one exists.'
  },
  {
    label: 'Visible fund flow',
    detail: 'Backers see fees before checkout, then receive a receipt once the backing is recorded.'
  },
  {
    label: 'Review-ready campaigns',
    detail: 'Draft and pending-review states stay out of the public feed until the creator or nation storefront pushes them live.'
  }
];

function ProgressBar({ raisedAmount, goalAmount }: { raisedAmount: number; goalAmount: number }) {
  const width = Math.min(100, Math.round((raisedAmount / goalAmount) * 100));
  return (
    <div className="space-y-2">
      <div className="h-2.5 overflow-hidden rounded-full bg-[#0a0a0a]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-[#f3deb1] to-[#DC143C]" style={{ width: `${width}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{width}% funded</span>
        <span>${raisedAmount.toLocaleString()} raised of ${goalAmount.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function LaunchpadClient({ campaigns }: { campaigns: LaunchpadCampaign[] }) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | LaunchpadCampaign['category']>('all');
  const [selectedAmount, setSelectedAmount] = useState(100);
  const featuredCampaign = campaigns[0];

  const filteredCampaigns = useMemo(() => {
    return selectedCategory === 'all' ? campaigns : campaigns.filter((campaign) => campaign.category === selectedCategory);
  }, [campaigns, selectedCategory]);

  const liveStats = useMemo(() => ({
    raised: campaigns.reduce((sum, item) => sum + item.raisedAmount, 0),
    campaigns: campaigns.length,
    sponsors: campaigns.reduce((sum, item) => sum + item.sponsorCount, 0),
    fullyBacked: campaigns.filter((item) => item.raisedAmount / item.goalAmount >= 0.7).length
  }), [campaigns]);

  const quote = calculateLaunchpadQuote(selectedAmount);

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#DC143C]/18 via-[#0a0a0a] to-[#d4af37]/12 px-6 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,20,60,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.16),transparent_28%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0000] flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#DC143C]/20 rounded-full">
              <Radio size={14} className="text-[#DC143C]" />
              <span className="text-[#DC143C] text-sm font-medium">LIVE CAMPAIGNS</span>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">Solo people</span>
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">Small business</span>
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">Emergency support</span>
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/72">Community builds</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Launchpad <span className="text-[#d4af37]">Crowdfunding</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mb-8">
                Back solo creators, small businesses, travel needs, scholarships, emergencies, and community builds through campaigns with clear goals, visible progress, and real backer support.
              </p>
              <div className="mb-8 grid gap-3 md:grid-cols-3">
                {launchpadTrustSignals.map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="inline-flex items-center gap-2 text-[#d4af37]">
                      <BadgeCheck size={14} />
                      <span className="text-xs uppercase tracking-[0.18em]">{item.label}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-300">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Raised', value: `$${liveStats.raised.toLocaleString()}` },
                  { label: 'Live campaigns', value: String(liveStats.campaigns) },
                  { label: 'Backers', value: String(liveStats.sponsors) },
                  { label: '70%+ funded', value: String(liveStats.fullyBacked) }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[22px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(20,20,20,0.86),rgba(8,8,8,0.82))] p-4 backdrop-blur">
                    <p className="text-2xl font-bold text-[#d4af37]">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(10,10,10,0.92))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <img src="/launchpad/launchpad-hero.svg" alt="Launchpad campaign collage" className="h-44 w-full object-cover" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
                  <Shield size={13} />
                  Backer checkout preview
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/70">
                  <HeartHandshake size={13} />
                  One-time or monthly
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">How backing works</h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">Launchpad supports one-time or monthly backing, tiered contributions, clear fees, and campaign receipts.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmount(amount)}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${selectedAmount === amount ? 'bg-[#d4af37] text-black font-semibold' : 'border border-white/10 bg-white/5 text-white hover:border-[#d4af37]/35'}`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                <div className="flex items-center justify-between text-gray-300"><span>Contribution amount</span><span>${quote.subtotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-gray-300"><span>Launchpad platform fee ({Math.round(LAUNCHPAD_PLATFORM_FEE_RATE * 100)}%)</span><span>${quote.platformFee.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-gray-300"><span>Processor fee</span><span>${quote.processorFee.toFixed(2)}</span></div>
                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-white font-semibold"><span>Total paid</span><span>${quote.total.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-[#d4af37] font-medium"><span>Estimated beneficiary net</span><span>${quote.beneficiaryNet.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {featuredCampaign ? (
        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <article className="overflow-hidden rounded-[32px] border border-[#d4af37]/18 bg-[#121212] shadow-[0_22px_70px_rgba(0,0,0,0.32)]">
              <div className="grid md:grid-cols-[1.05fr,0.95fr]">
                <div className="relative min-h-[320px] overflow-hidden">
                  <img src={featuredCampaign.image} alt={featuredCampaign.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.82))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="inline-flex rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                      Featured campaign
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold text-white">{featuredCampaign.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-white/70">{featuredCampaign.summary}</p>
                  </div>
                </div>
                <div className="space-y-5 p-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Raised</p>
                      <p className="mt-2 text-2xl font-semibold text-white">${featuredCampaign.raisedAmount.toLocaleString()}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Backers</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{featuredCampaign.sponsorCount}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Time left</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{featuredCampaign.closesInLabel}</p>
                    </div>
                  </div>
                  <ProgressBar raisedAmount={featuredCampaign.raisedAmount} goalAmount={featuredCampaign.goalAmount} />
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-[#d4af37]">
                      <Users size={14} />
                      <p className="text-xs uppercase tracking-[0.18em]">Recent backers</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {featuredCampaign.recentBackers.slice(0, 3).map((backer) => (
                        <div key={`${backer.name}-${backer.amount}`} className="flex items-center justify-between gap-3 text-sm">
                          <div>
                            <p className="font-medium text-white">{backer.name}</p>
                            <p className="text-white/52">{backer.note}</p>
                          </div>
                          <p className="font-semibold text-[#d4af37]">${backer.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/launchpad/${featuredCampaign.slug}`} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                      Back this campaign
                    </Link>
                    <button type="button" onClick={() => setSelectedCategory(featuredCampaign.category)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#d4af37]/35">
                      Explore this category
                    </button>
                  </div>
                </div>
              </div>
            </article>
            <div className="space-y-4">
              {campaigns.slice(1, 4).map((campaign) => (
                <article key={campaign.id} className="rounded-[26px] border border-white/10 bg-[#141414] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">{getLaunchpadCategoryLabel(campaign.category)}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{campaign.title}</h3>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/62">{campaign.closesInLabel}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-[18px] border border-white/10 bg-black/18 p-3">
                      <p className="text-white/48">Raised</p>
                      <p className="mt-1 font-semibold text-white">${campaign.raisedAmount.toLocaleString()}</p>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-black/18 p-3">
                      <p className="text-white/48">Backers</p>
                      <p className="mt-1 font-semibold text-white">{campaign.sponsorCount}</p>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-black/18 p-3">
                      <p className="text-white/48">Goal</p>
                      <p className="mt-1 font-semibold text-white">${campaign.goalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/56">
                      <Clock3 size={13} />
                      {campaign.closesInLabel}
                    </div>
                    <Link href={`/launchpad/${campaign.slug}`} className="text-sm font-medium text-[#d4af37] hover:text-[#f4e4a6]">
                      View campaign
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Funding lanes</h2>
              <Link href="/launchpad/create" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
                Start a campaign
              </Link>
            </div>
            <button type="button" onClick={() => setSelectedCategory('all')} className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4e4a6] transition-colors">
              <span className="text-sm">View All</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
            {(['artist', 'athlete', 'scholarship', 'entrepreneurship', 'business-starter', 'travel', 'emergency', 'community', 'digital-champion'] as Array<LaunchpadCampaign['category']>).map((category) => {
              const meta = launchpadCategoryMeta[category];
              const totalRaised = campaigns.filter((campaign) => campaign.category === category).reduce((sum, campaign) => sum + campaign.raisedAmount, 0);
              return (
                <div
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
                  className={`cursor-pointer group overflow-hidden rounded-[26px] border transition-all ${selectedCategory === category ? 'border-[#d4af37] bg-[linear-gradient(180deg,rgba(212,175,55,0.1),rgba(12,12,12,0.92))] shadow-[0_18px_40px_rgba(212,175,55,0.12)]' : 'border-white/8 bg-[linear-gradient(180deg,rgba(20,20,20,0.95),rgba(8,8,8,0.92))] hover:border-[#d4af37]/30'}`}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img src={meta.image} alt={meta.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{meta.label}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{meta.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium text-[#d4af37]">${totalRaised.toLocaleString()} raised</p>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/60">Live</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-[#0d0d0d] border-y border-[#d4af37]/10">
        <div className="max-w-7xl mx-auto grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
            <div className="rounded-[28px] border border-[#d4af37]/15 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(8,8,8,0.92))] p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-medium text-[#d4af37]">
                <Shield size={13} />
                What backers need to see
              </div>
            <h2 className="mt-4 text-2xl font-bold text-white">What makes people back a campaign</h2>
            <p className="mt-3 text-sm leading-7 text-gray-400">Backers look for progress, a real beneficiary, a clear goal, and a reason to act now.</p>
          </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-[#141414] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Backer proof</p>
              <p className="mt-3 text-sm leading-7 text-gray-300">Campaigns need visible traction, recent backers, and urgent milestones so visitors can judge momentum before they give.</p>
            </div>
              <div className="rounded-[24px] border border-white/10 bg-[#141414] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Who can raise funds</p>
              <p className="mt-3 text-sm leading-7 text-gray-300">Launchpad works for artists, athletes, scholarships, startups, travel, emergencies, and community builds.</p>
            </div>
              <div className="rounded-[24px] border border-white/10 bg-[#141414] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">Fee clarity</p>
              <p className="mt-3 text-sm leading-7 text-gray-300">Backers can see exactly what they pay, what the platform takes, and what the beneficiary actually receives.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">{selectedCategory === 'all' ? 'All Launchpad Campaigns' : getLaunchpadCategoryLabel(selectedCategory)}</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign) => (
              <article key={campaign.id} className="group bg-[#141414] border border-[#d4af37]/15 rounded-[28px] overflow-hidden hover:border-[#d4af37]/35 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="relative h-56 overflow-hidden">
                  <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">{campaign.subtitle}</div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-sm text-[#d4af37]">{campaign.urgencyLabel}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{campaign.title}</h3>
                  </div>
                </div>
                <div className="space-y-5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-black/20">
                        <img src={campaign.beneficiaryImage} alt={campaign.beneficiaryName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{campaign.beneficiaryName}</p>
                        <p className="text-sm text-gray-400">{campaign.beneficiaryRole}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>{campaign.location}</p>
                      <p>{campaign.sponsorCount} backers</p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-gray-300">{campaign.summary}</p>
                  <ProgressBar raisedAmount={campaign.raisedAmount} goalAmount={campaign.goalAmount} />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {campaign.supportTiers.oneTime.slice(0, 2).map((tier) => (
                      <div key={tier.id} className="rounded-[18px] border border-white/10 bg-black/18 p-3">
                        <p className="text-white">{tier.label}</p>
                        <p className="mt-1 font-semibold text-[#d4af37]">${tier.amount}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    {campaign.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1">{tag}</span>)}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <p className="text-sm text-[#d4af37]">Launchpad fee {Math.round(LAUNCHPAD_PLATFORM_FEE_RATE * 100)}%</p>
                    <Link href={`/launchpad/${campaign.slug}`} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Back Campaign</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
