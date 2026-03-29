import Link from 'next/link';
import LandFoodFrame from './components/LandFoodFrame';
import LandFoodHero from './components/LandFoodHero';
import { ProductCard, ProducerCard, ProjectCard, StatsStrip, RegenerativeImpactBand } from './components/LandFoodCards';
import { products, producers, projects } from './data/pillar8Data';

export default function LandFoodHomePage() {
  const trending = [
    {
      title: 'Wild Rice Harvest Pack',
      metric: '+320 wishlists this week',
      image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1200&h=700&fit=crop'
    },
    {
      title: 'Tepary Seed Kit',
      metric: 'Top barter demand',
      image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1200&h=700&fit=crop'
    },
    {
      title: 'Wetland Carbon Guardianship',
      metric: 'Fastest-funded project',
      image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=700&fit=crop'
    },
    {
      title: 'Native Plant Dye Collection',
      metric: 'Most shared listing',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=700&fit=crop'
    }
  ];

  const rankedCommunities = [
    { name: 'Red River Food Sovereignty Co-op', score: 98, label: 'Top fulfillment quality' },
    { name: 'Te Awa Regenerative Collective', score: 95, label: 'Best stewardship impact' },
    { name: 'Desert Seed Keepers', score: 93, label: 'Highest seed demand' }
  ];

  return (
    <LandFoodFrame title="Land & Food" subtitle="Regenerative economy marketplace for Indigenous food systems and land stewardship.">
      <LandFoodHero
        eyebrow="Pillar 8"
        title="Food Sovereignty Meets Regenerative Commerce"
        description="Buy verified Indigenous products, fund conservation projects, and contract stewardship services rooted in traditional land guardianship."
        image="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1800&h=900&fit=crop"
        chips={['Community Verified', 'Traceability First', 'Direct-to-Community Payments']}
        actions={[
          { href: '/land-food/marketplace', label: 'Explore Marketplace' },
          { href: '/land-food/services/conservation-carbon-projects', label: 'View Conservation Projects', tone: 'secondary' }
        ]}
      />

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Buyer shortcuts</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Go straight to products, wholesale, projects, or seasonal supply</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['/land-food/marketplace', 'Marketplace'],
              ['/land-food/harvest-calendar', 'Harvest calendar'],
              ['/land-food/wholesale-inquiry', 'Wholesale'],
              ['/land-food/services/conservation-carbon-projects', 'Projects'],
              ['/land-food/seed-swap', 'Seed swap'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full border border-[#d4af37]/30 bg-black/30 px-4 py-2 text-sm text-[#d4af37] transition-colors hover:bg-[#d4af37]/10">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StatsStrip />

      <section className="grid gap-4 md:grid-cols-3">
        {products.slice(0, 3).map((item) => <ProductCard key={item.id} item={item} />)}
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Trending Now</h3>
          <span className="text-xs text-gray-400">Live buyer signals</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {trending.map((item) => (
            <article key={item.title} className="min-w-[250px] max-w-[250px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0c0a]">
              <img src={item.image} alt={item.title} className="h-32 w-full object-cover" />
              <div className="p-3">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-[#d4af37]">{item.metric}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">For Buyers</p>
          <p className="mt-1 text-sm text-gray-300">Shop traceable traditional foods and verified natural materials by season.</p>
          <Link href="/land-food/marketplace" className="mt-3 inline-block text-sm text-[#d4af37] hover:underline">Start shopping</Link>
        </article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">For Institutions</p>
          <p className="mt-1 text-sm text-gray-300">Source wholesale volumes with producer verification and procurement support.</p>
          <Link href="/land-food/wholesale-inquiry" className="mt-3 inline-block text-sm text-[#d4af37] hover:underline">Request wholesale</Link>
        </article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">For Funders</p>
          <p className="mt-1 text-sm text-gray-300">Back stewardship projects and direct food sovereignty outcomes with transparency.</p>
          <Link href="/land-food/services/conservation-carbon-projects" className="mt-3 inline-block text-sm text-[#d4af37] hover:underline">Fund projects</Link>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {producers.map((item) => <ProducerCard key={item.id} item={item} />)}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {projects.map((item) => <ProjectCard key={item.id} item={item} />)}
      </section>

      <RegenerativeImpactBand />

      <section className="grid gap-4 md:grid-cols-3">
        {rankedCommunities.map((community, idx) => (
          <article key={community.name} className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-4">
            <p className="text-xs uppercase tracking-wide text-[#d4af37]">Rank #{idx + 1}</p>
            <p className="mt-1 text-base font-semibold text-white">{community.name}</p>
            <p className="mt-1 text-xs text-gray-400">{community.label}</p>
            <p className="mt-2 text-sm text-[#d4af37]">Community Score: {community.score}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#10110f]">
          <img
            src="https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?w=1600&h=900&fit=crop"
            alt="Land and food story"
            className="h-56 w-full object-cover"
          />
          <div className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-wider text-[#d4af37]">What Pillar 8 Is</p>
            <h3 className="text-xl font-semibold text-white">A regenerative commerce layer for land, food, and stewardship</h3>
            <p className="text-sm text-gray-300">
              Pillar 8 combines product sales, seed systems, ecological services, and conservation finance so communities can earn from
              protecting biodiversity and traditional food systems.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-gray-200">Products + Services</span>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-gray-200">Verified Origins</span>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-gray-200">Direct Community Revenue</span>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <p className="text-xs uppercase tracking-wider text-[#d4af37]">How It Works</p>
          <div className="mt-3 space-y-3 text-sm text-gray-300">
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">1. Discover verified producers, products, and stewardship services.</div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">2. Check harvest windows, traceability, and protocol notes.</div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">3. Purchase, contract, or co-fund projects with direct community payout.</div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">4. Track seasonal supply, impact outcomes, and reorder cycles.</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/land-food/marketplace" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Start Exploring</Link>
            <Link href="/land-food/harvest-calendar" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">See Seasonal Supply</Link>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#10110f] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Action Hub</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[
            ['/land-food/marketplace', 'Marketplace'],
            ['/land-food/communities', 'View All Communities'],
            ['/land-food/wholesale-inquiry', 'Bulk / Wholesale Inquiry'],
            ['/land-food/seed-swap', 'Seed & Plant Swap'],
            ['/land-food/food-sovereignty-donation', 'Donate to Food Sovereignty']
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-[#d4af37] hover:bg-[#d4af37]/10">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </LandFoodFrame>
  );
}
