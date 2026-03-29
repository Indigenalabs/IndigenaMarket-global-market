import Link from 'next/link';
import { getMarketplaceCardMerchandising } from '@/app/components/marketplace/marketplaceCardMerchandising';
import { attorneys, campaigns, legalStats, resources, victories, type Attorney, type Campaign, type Resource, type Victory } from '@/app/advocacy-legal/data/pillar9Data';

function verificationLabel(level: Attorney['verified']) {
  if (level === 'elder-council') return 'Elder Council Verified';
  if (level === 'pro-bono-network') return 'Pro Bono Network';
  return 'Verified';
}

function campaignTrustLabel(item: Campaign) {
  if (item.type === 'land-defense') return 'Sacred Site Protection';
  if (item.type === 'policy-action') return 'Policy Mobilization';
  return 'Legal Defense';
}

export function LegalStatsStrip({
  stats = legalStats
}: {
  stats?: {
    activeProfessionals: number;
    liveCampaigns: number;
    resources: number;
    emergencyFundUsd: number;
  };
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Active Professionals', value: stats.activeProfessionals.toString() },
        { label: 'Live Campaigns', value: stats.liveCampaigns.toString() },
        { label: 'Legal Resources', value: stats.resources.toString() },
        { label: 'Emergency Fund', value: `$${stats.emergencyFundUsd.toLocaleString()}` }
      ].map((x) => (
        <article key={x.label} className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.2)]">
          <p className="text-xs uppercase tracking-wide text-gray-400">{x.label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{x.value}</p>
        </article>
      ))}
    </section>
  );
}

export function AttorneyCard({ item }: { item: Attorney }) {
  const fit = item.proBono ? 'Good fit for urgent review and lower-access intake' : 'Best for strategic paid counsel and structured support';
  const merch = getMarketplaceCardMerchandising({
    title: item.name,
    pillarLabel: 'Advocacy & Legal',
    image: item.image,
    coverImage: item.image,
    galleryOrder: [item.image],
    ctaPreset: 'message-first',
    availabilityLabel: item.proBono ? 'Pro bono available' : item.rateLabel,
    availabilityTone: item.proBono ? 'success' : 'default',
    featured: item.verified === 'elder-council',
    merchandisingRank: item.verified === 'elder-council' ? 4 : 10,
    status: 'Active',
    priceLabel: item.rateLabel,
    blurb: item.bio,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101112] shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all hover:border-[#d4af37]/35 hover:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <img src={merch.image} alt={item.name} className="h-48 w-full object-cover" />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-400">{item.nation} - {item.region}</p>
          </div>
          <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
            {verificationLabel(item.verified)}
          </span>
        </div>

        <p className="mt-4 text-sm font-medium text-[#f4d370]">{item.specialty}</p>
        <p className="mt-3 text-sm leading-7 text-gray-300">{item.bio}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Access</p>
            <p className="mt-2 text-sm text-gray-200">{item.proBono ? 'Pro bono available' : item.rateLabel}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Best Fit</p>
            <p className="mt-2 text-sm text-gray-200">{fit}</p>
          </div>
        </div>

        <Link href={`/advocacy-legal/attorney/${item.id}`} className="mt-5 block rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/10 py-3 text-center text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20">View detail</Link>
      </div>
    </article>
  );
}

export function CampaignCard({ item }: { item: Campaign }) {
  const progress = Math.min(100, Math.round((item.raised / item.target) * 100));
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Advocacy & Legal',
    image: item.image,
    coverImage: item.image,
    galleryOrder: [item.image],
    ctaPreset: 'message-first',
    availabilityLabel: item.urgent ? 'Urgent campaign' : 'Active campaign',
    availabilityTone: item.urgent ? 'warning' : 'default',
    featured: item.urgent,
    merchandisingRank: item.urgent ? 3 : 10,
    status: 'Active',
    priceLabel: `${item.raised.toLocaleString()}`,
    blurb: item.summary,
  });
  const supportersLabel = item.supporters >= 3000 ? 'High momentum' : item.supporters >= 2000 ? 'Growing support' : 'Early momentum';

  return (
    <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101112] shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all hover:border-[#d4af37]/35 hover:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <img src={merch.image} alt={item.title} className="h-52 w-full object-cover" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-400">{item.region}</p>
          </div>
          {item.urgent ? <span className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-red-300">Urgent</span> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em]">
          <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/8 px-3 py-1 text-[#d4af37]">{campaignTrustLabel(item)}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">{supportersLabel}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">{item.supporters.toLocaleString()} supporters</span>
        </div>

        <p className="mt-4 text-sm leading-7 text-gray-300">{item.summary}</p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
          <div className="h-full bg-[#d4af37]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-[#d4af37]">${item.raised.toLocaleString()} raised</span>
          <span className="text-gray-300">Goal ${item.target.toLocaleString()}</span>
        </div>

        <div className="mt-4 rounded-xl border border-white/8 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Trust Signal</p>
          <p className="mt-2 text-sm text-gray-200">{item.urgent ? 'Time-sensitive legal window with active need for fast support.' : 'Structured campaign with a clear policy and advocacy path.'}</p>
        </div>

        <Link href={`/advocacy-legal/campaign/${item.id}`} className="mt-5 block rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/10 py-3 text-center text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20">View detail</Link>
      </div>
    </article>
  );
}

export function ResourceCard({ item }: { item: Resource }) {
  const merch = getMarketplaceCardMerchandising({
    title: item.title,
    pillarLabel: 'Advocacy & Legal',
    image: item.image,
    coverImage: item.image,
    galleryOrder: [item.image],
    ctaPreset: 'message-first',
    availabilityLabel: item.kind,
    availabilityTone: 'default',
    featured: item.kind === 'template',
    merchandisingRank: item.kind === 'template' ? 6 : 10,
    status: 'Active',
    priceLabel: item.language,
    blurb: item.summary,
  });
  return (
    <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101112] shadow-[0_18px_60px_rgba(0,0,0,0.26)] transition-all hover:border-[#d4af37]/35 hover:shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
      <img src={merch.image} alt={item.title} className="h-44 w-full object-cover" />
      <div className="p-5">
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em]">
          <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/8 px-3 py-1 text-[#d4af37]">{item.kind}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">{item.language}</span>
        </div>
        <p className="mt-4 text-lg font-semibold text-white">{item.title}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-400">{item.audience}</p>
        <p className="mt-3 text-sm leading-7 text-gray-300">{item.summary}</p>
        <div className="mt-4 rounded-xl border border-white/8 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Best Use</p>
          <p className="mt-2 text-sm text-gray-200">
            {item.kind === 'template'
              ? 'Use before signing, negotiating, or formal review.'
              : item.kind === 'webinar'
                ? 'Best for team review, training, and coordinated response.'
                : item.kind === 'case-law'
                  ? 'Best for research, precedent checks, and brief preparation.'
                  : 'Best for quick orientation and rights-ready reference.'}
          </p>
        </div>
        <Link href={`/advocacy-legal/resource/${item.id}`} className="mt-5 block rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/10 py-3 text-center text-sm font-medium text-[#d4af37] hover:bg-[#d4af37]/20">View detail</Link>
      </div>
    </article>
  );
}

export function VictoryCard({ item }: { item: Victory }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101112] shadow-[0_18px_60px_rgba(0,0,0,0.26)] transition-all hover:border-[#d4af37]/35 hover:shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
      <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
      <div className="p-5">
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em]">
          <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/8 px-3 py-1 text-[#d4af37]">Victory Story</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">{item.year}</span>
        </div>
        <p className="mt-4 text-lg font-semibold text-white">{item.title}</p>
        <p className="mt-1 text-sm text-[#f4d370]">{item.impact}</p>
        <p className="mt-3 text-sm leading-7 text-gray-300">{item.summary}</p>
        <div className="mt-4 rounded-xl border border-white/8 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">Why It Matters</p>
          <p className="mt-2 text-sm text-gray-200">Use this story as precedent, morale, and proof that coordinated protection work can move from pressure into outcome.</p>
        </div>
        <Link href={`/advocacy-legal/victory/${item.id}`} className="mt-5 block rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/10 py-3 text-center text-sm font-medium text-[#d4af37] hover:bg-[#d4af37]/20">
          Read Impact Story
        </Link>
      </div>
    </article>
  );
}

export function QuickActionRail() {
  return (
    <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Rapid Action Center</h3>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {[
          ['/advocacy-legal/emergency-defense-fund', 'Emergency Fund'],
          ['/advocacy-legal/submit-case', 'Submit Case'],
          ['/advocacy-legal/pro-bono-application', 'Pro Bono Match'],
          ['/advocacy-legal/rapid-alerts', 'Rapid Alerts'],
          ['/advocacy-legal/icip-registry', 'ICIP Registry']
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-[#d4af37] hover:bg-[#d4af37]/10">
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function usePillar9Data() {
  return { attorneys, campaigns, resources, victories };
}
