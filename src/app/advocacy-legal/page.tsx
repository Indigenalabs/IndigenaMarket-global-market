import Link from 'next/link';
import AdvocacyFrame from './components/AdvocacyFrame';
import AdvocacyHero from './components/AdvocacyHero';
import { AttorneyCard, CampaignCard, LegalStatsStrip, QuickActionRail, ResourceCard, VictoryCard } from './components/AdvocacyCards';
import ProtectionPulseBoard from './components/ProtectionPulseBoard';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function AdvocacyLegalHomePage() {
  const { attorneys, campaigns, resources, victories, stats } = await getAdvocacyPublicData();

  return (
    <AdvocacyFrame
      title="Advocacy & Legal Marketplace"
      subtitle="Protection economy marketplace for Indigenous rights defense, legal services, and policy action."
    >
      <AdvocacyHero
        title="Legal Protection Infrastructure for Indigenous Communities"
        description="Hire trusted legal experts, fund urgent cases, and mobilize policy action through one coordinated defense ecosystem."
        image="https://images.unsplash.com/photo-1528747045269-390fe33c19d3?w=1800&h=900&fit=crop"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/advocacy-legal/attorneys" className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-colors hover:border-[#d4af37]/35">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Get counsel</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Book a vetted attorney or advocate</h2>
          <p className="mt-2 text-sm text-gray-300">Go directly to professionals by specialty, urgency, and access fit.</p>
        </Link>
        <Link href="/advocacy-legal/campaigns" className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-colors hover:border-[#d4af37]/35">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Fund defense</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Back live legal and land-defense campaigns</h2>
          <p className="mt-2 text-sm text-gray-300">See urgent cases first, then move into structured long-term campaigns.</p>
        </Link>
        <Link href="/advocacy-legal/resources" className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-colors hover:border-[#d4af37]/35">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Use resources</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Open templates, rights guides, and training</h2>
          <p className="mt-2 text-sm text-gray-300">Get to practical legal tools without scrolling through institutional context first.</p>
        </Link>
      </section>

      <QuickActionRail />
      <LegalStatsStrip stats={stats} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Start With Counsel</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Verified legal professionals ready for rights defense work</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
        {attorneys.slice(0, 3).map((item) => <AttorneyCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Fund Active Defense</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Fund the cases, land defenses, and policy fights moving right now</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
        {campaigns.map((item) => <CampaignCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Use A Legal Tool</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Know-your-rights tools and legal guides built for immediate use</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {resources.map((item) => <ResourceCard key={item.id} item={item} />)}
        </div>
      </section>

      <ProtectionPulseBoard />

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]/70">Victory Archive</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">See what successful protection work looks like after the fight</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
        {victories.map((item) => <VictoryCard key={item.id} item={item} />)}
        </div>
      </section>
    </AdvocacyFrame>
  );
}



