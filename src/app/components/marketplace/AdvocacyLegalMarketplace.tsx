'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdvocacyHero from '@/app/advocacy-legal/components/AdvocacyHero';
import { AttorneyCard, CampaignCard, LegalStatsStrip, QuickActionRail, ResourceCard, usePillar9Data, VictoryCard } from '@/app/advocacy-legal/components/AdvocacyCards';
import ProtectionPulseBoard from '@/app/advocacy-legal/components/ProtectionPulseBoard';
import { fetchAdvocacyPublicData } from '@/app/lib/advocacyLegalClientStore';
import type { Attorney, Campaign, Resource, Victory } from '@/app/advocacy-legal/data/pillar9Data';

type Mode = 'attorneys' | 'campaigns' | 'resources';
type SlotTheme = { badge: string; ring: string };

export default function AdvocacyLegalMarketplace() {
  const fallback = usePillar9Data();
  const [publicData, setPublicData] = useState<{
    attorneys: Attorney[];
    campaigns: Campaign[];
    resources: Resource[];
    victories: Victory[];
    stats?: {
      activeProfessionals: number;
      liveCampaigns: number;
      resources: number;
      emergencyFundUsd: number;
    };
  } | null>(null);
  const [mode, setMode] = useState<Mode>('attorneys');
  const [search, setSearch] = useState('');
  const slotTheme: Record<string, SlotTheme> = {
    sticky: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35', ring: 'border-emerald-400/35' },
    hero: { badge: 'bg-amber-500/15 text-amber-300 border-amber-400/35', ring: 'border-amber-400/35' },
    keepers: { badge: 'bg-sky-500/15 text-sky-300 border-sky-400/35', ring: 'border-sky-400/35' },
    trending: { badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/35', ring: 'border-fuchsia-400/35' },
    sponsored: { badge: 'bg-rose-500/15 text-rose-300 border-rose-400/35', ring: 'border-rose-400/35' },
    spotlight: { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/35', ring: 'border-cyan-400/35' },
    institutional: { badge: 'bg-violet-500/15 text-violet-300 border-violet-400/35', ring: 'border-violet-400/35' }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await fetchAdvocacyPublicData();
      if (!active || !data || typeof data !== 'object') return;
      setPublicData(data as {
        attorneys: Attorney[];
        campaigns: Campaign[];
        resources: Resource[];
        victories: Victory[];
        stats?: {
          activeProfessionals: number;
          liveCampaigns: number;
          resources: number;
          emergencyFundUsd: number;
        };
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  const attorneys = publicData?.attorneys ?? fallback.attorneys;
  const campaigns = publicData?.campaigns ?? fallback.campaigns;
  const resources = publicData?.resources ?? fallback.resources;
  const victories = publicData?.victories ?? fallback.victories;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return { attorneys, campaigns, resources };
    return {
      attorneys: attorneys.filter((x) => `${x.name} ${x.specialty} ${x.nation}`.toLowerCase().includes(q)),
      campaigns: campaigns.filter((x) => `${x.title} ${x.summary} ${x.region}`.toLowerCase().includes(q)),
      resources: resources.filter((x) => `${x.title} ${x.summary} ${x.kind}`.toLowerCase().includes(q))
    };
  }, [search, attorneys, campaigns, resources]);

  return (
    <div className="space-y-8 p-1 md:p-2">
      <section className="sticky top-0 z-30 rounded-2xl border border-[#d4af37]/30 bg-gradient-to-r from-[#2a1216] via-[#121212] to-[#2a1b10] px-5 py-3 text-sm text-[#f3e3b0] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">
            <span className={`mr-2 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${slotTheme.sticky.badge}`}>Featured</span>
            Emergency legal hotline grants now matching donations 1:1 this week.
          </span>
          <button type="button" className="rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">View</button>
        </div>
      </section>

      <AdvocacyHero
        title="Protect Rights, Defend Lands, Fund Justice"
        description="Find Indigenous rights attorneys, back live legal defense campaigns, and access know-your-rights legal resources from one trusted marketplace."
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1800&h=900&fit=crop"
        
      />

      <LegalStatsStrip stats={publicData?.stats} />
      <ProtectionPulseBoard />

      <section className={`rounded-[28px] border bg-[#101112] p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] ${slotTheme.trending.ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">
            <span className={`mr-2 rounded-full border px-2 py-0.5 text-[10px] ${slotTheme.trending.badge}`}>Featured</span>
            Trending Legal Actions
          </h3>
          <button type="button" className="text-xs text-[#d4af37] hover:underline">View</button>
        </div>
        <p className="mb-4 max-w-3xl text-sm leading-7 text-gray-300">
          A fast scan of the most active policy, campaign, and legal-pressure moments on the pillar right now. This should feel like the pulse of the marketplace, not a generic placement block.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { title: 'Pipeline Injunction Filing', meta: 'Action spike +42%' },
            { title: 'Treaty Access Hearing', meta: 'Top supporter mobilization' },
            { title: 'ICIP License Breach Notice', meta: 'Most shared legal update' }
          ].map((x) => (
            <article key={x.title} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-sm font-semibold text-white">{x.title}</p>
              <p className="mt-1 text-xs text-[#d4af37]">{x.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
        <div className="grid gap-5 md:grid-cols-[1fr,430px]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Marketplace Search</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attorneys, campaigns, rights guides"
              className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/45"
            />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Discovery Mode</p>
            <div className="flex flex-wrap gap-2">
            {([
              ['attorneys', 'Attorneys'],
              ['campaigns', 'Campaigns'],
              ['resources', 'Resources']
            ] as Array<[Mode, string]>).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${mode === id ? 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#d4af37]' : 'border-white/20 text-gray-300 hover:border-[#d4af37]/30'}`}
              >
                {label}
              </button>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`rounded-[28px] border bg-[#101112] p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] ${slotTheme.keepers.ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">
            <span className={`mr-2 rounded-full border px-2 py-0.5 text-[10px] ${slotTheme.keepers.badge}`}>Featured</span>
            Featured Keepers
          </h3>
          <button type="button" className="text-xs text-[#d4af37] hover:underline">View</button>
        </div>
        <p className="mb-4 max-w-3xl text-sm leading-7 text-gray-300">
          These are the high-trust profiles that should greet users before they dive into the full discovery feed. The section needs to feel curated and intentional.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {attorneys.slice(0, 3).map((item) => <AttorneyCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className={`rounded-[28px] border bg-[#101112] p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] ${slotTheme.sponsored.ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">
            <span className={`mr-2 rounded-full border px-2 py-0.5 text-[10px] ${slotTheme.sponsored.badge}`}>Featured</span>
            Discovery Spotlight Card
          </h3>
          <button type="button" className="text-xs text-[#d4af37] hover:underline">View</button>
        </div>
        <article className="overflow-hidden rounded-xl border border-[#d4af37]/30 bg-[#111214] shadow-md shadow-[#d4af37]/10">
          <div className="relative h-36">
            <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&h=600&fit=crop" alt="Sponsored legal placement" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute left-2 top-2 rounded-full border border-[#d4af37]/40 bg-black/65 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]">
              Spotlight
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-white">Policy Impact Brief Sponsorship</p>
            <p className="mt-1 text-xs text-gray-300">Sponsored card injected in discovery feed and case-resource rails.</p>
          </div>
        </article>
      </section>

      {mode === 'attorneys' ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Attorney Discovery</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Match the issue to the right legal profile</h3>
          </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.attorneys.map((item) => (
            <div key={item.id}>
              <AttorneyCard item={item} />
            </div>
          ))}
          {filtered.attorneys.length === 0 ? (
            <article className="md:col-span-2 xl:col-span-3 rounded-xl border border-white/15 bg-black/25 p-6 text-center">
              <p className="text-base font-semibold text-white">No attorneys match your search</p>
              <p className="mt-1 text-sm text-gray-400">Try searching by nation, specialty, or jurisdiction.</p>
              <div className="mt-3 flex justify-center gap-2">
                <Link href="/advocacy-legal/pro-bono-application" className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">Apply for Pro Bono</Link>
                <Link href="/advocacy-legal/submit-case" className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">Submit Case</Link>
              </div>
            </article>
          ) : null}
        </div>
        </section>
      ) : null}

      {mode === 'campaigns' ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Campaign Discovery</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Back the legal fights that need support right now</h3>
          </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.campaigns.map((item) => <CampaignCard key={item.id} item={item} />)}
          {filtered.campaigns.length === 0 ? (
            <article className="md:col-span-2 xl:col-span-3 rounded-xl border border-white/15 bg-black/25 p-6 text-center">
              <p className="text-base font-semibold text-white">No campaigns match your search</p>
              <p className="mt-1 text-sm text-gray-400">Try broader keywords or open the emergency defense fund.</p>
              <div className="mt-3 flex justify-center">
                <Link href="/advocacy-legal/emergency-defense-fund" className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">Emergency Defense Fund</Link>
              </div>
            </article>
          ) : null}
        </div>
        </section>
      ) : null}

      {mode === 'resources' ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Resource Discovery</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Open practical rights tools that lead somewhere useful</h3>
          </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.resources.map((item) => <ResourceCard key={item.id} item={item} />)}
          {filtered.resources.length === 0 ? (
            <article className="md:col-span-2 xl:col-span-3 rounded-xl border border-white/15 bg-black/25 p-6 text-center">
              <p className="text-base font-semibold text-white">No resources match your search</p>
              <p className="mt-1 text-sm text-gray-400">Try another keyword or visit the policy action center.</p>
              <div className="mt-3 flex justify-center">
                <Link href="/advocacy-legal/action-center" className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">Open Action Center</Link>
              </div>
            </article>
          ) : null}
        </div>
        </section>
      ) : null}

      <section className={`rounded-[28px] border bg-[#101112] p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] ${slotTheme.spotlight.ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">
            <span className={`mr-2 rounded-full border px-2 py-0.5 text-[10px] ${slotTheme.spotlight.badge}`}>Featured</span>
            Campaign Spotlight
          </h3>
          <button type="button" className="text-xs text-[#d4af37] hover:underline">View</button>
        </div>
        <p className="mb-4 max-w-3xl text-sm leading-7 text-gray-300">
          This spotlight area should reinforce which public cases are carrying momentum, urgency, and a credible funding path, without feeling repetitive.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {campaigns.map((item) => <CampaignCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className={`rounded-[28px] border bg-[#101112] p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] ${slotTheme.institutional.ring}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">
            <span className={`mr-2 rounded-full border px-2 py-0.5 text-[10px] ${slotTheme.institutional.badge}`}>Featured</span>
            Institution / Clinic Partner Strip
          </h3>
          <button type="button" className="text-xs text-[#d4af37] hover:underline">View</button>
        </div>
        <p className="mb-4 max-w-3xl text-sm leading-7 text-gray-300">
          A signal that this marketplace is connected to clinics, universities, pro bono networks, and institutions that help expand real legal capacity.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {['Indigenous Law Clinics', 'University Law Schools', 'Pro Bono Networks', 'Policy Institutes', 'Rights Foundations', 'Community Legal Aid'].map((x) => (
            <span key={x} className="rounded-full border border-white/20 px-3 py-1 text-gray-200">{x}</span>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#d4af37]/25 bg-[#101112] p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Completed Cases & Victories</h3>
          <button type="button" className="text-xs text-[#d4af37] hover:underline">View</button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {victories.map((item) => <VictoryCard key={item.id} item={item} />)}
        </div>
      </section>

      <QuickActionRail />

      <div className="flex justify-center">
        <Link href="/advocacy-legal" className="rounded-full border border-[#d4af37]/40 px-6 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
          Open Pillar 9 Home
        </Link>
      </div>
    </div>
  );
}



