import Link from 'next/link';
import MaterialsToolsFrame from './components/MaterialsToolsFrame';
import MaterialsToolsHero from './components/MaterialsToolsHero';
import {
  StatsStrip,
  SupplyChainBand,
  FeaturedCollectionsBand,
  SampleListings,
  SupplierShowcase,
  ToolLibraryShowcase,
  ServiceShowcase,
  CoopShowcase
} from './components/MaterialsToolsCards';

export default function MaterialsToolsHomePage() {
  const rankings = [
    { name: 'Red Ochre Materials Collective', label: 'Best provenance depth', score: 98 },
    { name: 'Awa Fibre House', label: 'Top co-op fulfillment', score: 95 },
    { name: 'Prairie Bead & Hide Exchange', label: 'Highest repeat orders', score: 93 }
  ];

  return (
    <MaterialsToolsFrame title="Materials & Tools" subtitle="Supply chain economy marketplace for traceable materials, trusted tools, and community-run supplier networks.">
      <MaterialsToolsHero
        eyebrow="Pillar 10"
        title="From harvest and forge to finished artwork, keep the supply chain sovereign."
        description="Source culturally respectful materials, rent expensive equipment, join group buying runs, and work with suppliers who understand protocol, sustainability, and studio realities."
        image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1800&h=900&fit=crop"
        chips={['Traceable origin stories', 'Tool library access', 'Co-op buying power']}
        premiumLabel="Premium Hero Banner"
        actions={[
          { href: '/materials-tools/marketplace', label: 'Explore Marketplace' },
          { href: '/materials-tools/suppliers', label: 'View Suppliers', tone: 'secondary' }
        ]}
      />

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Buyer shortcuts</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Go straight to materials, suppliers, tool access, or co-op buying</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              ['/materials-tools/marketplace', 'Marketplace'],
              ['/materials-tools/suppliers', 'Suppliers'],
              ['/materials-tools/rentals', 'Tool libraries'],
              ['/materials-tools/bulk-coop', 'Bulk co-op'],
              ['/materials-tools/wishlist', 'Wishlists'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full border border-[#9b6b2b]/35 px-3 py-1.5 text-[#f0d7aa] hover:bg-[#9b6b2b]/12">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StatsStrip />
      <SampleListings />

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Trending workshop demand</h3>
          <span className="text-xs text-[#bcae99]">Recent demand signals</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Ceremonial Ochre Pigment Set', '+216 saves this week'],
            ['Backstrap Loom Starter Set', 'Fastest growing rentals adjacencies'],
            ['Regalia Bead Spectrum Kit', 'Top surplus request'],
            ['Studio Capture Tablet Bundle', 'Most shared equipment listing']
          ].map(([title, metric]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-base font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-[#9fe5ea]">{metric}</p>
            </article>
          ))}
        </div>
      </section>

      <SupplierShowcase />
      <ToolLibraryShowcase />

      <section className="grid gap-4 md:grid-cols-3">
        {rankings.map((rank, index) => (
          <article key={rank.name} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">Rank #{index + 1}</p>
            <p className="mt-2 text-lg font-semibold text-white">{rank.name}</p>
            <p className="mt-1 text-sm text-[#d5cab8]">{rank.label}</p>
            <p className="mt-3 text-sm text-[#9fe5ea]">Score {rank.score}</p>
          </article>
        ))}
      </section>

      <ServiceShowcase />
      <CoopShowcase />
      <SupplyChainBand />
      <FeaturedCollectionsBand />

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09]">
          <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&h=900&fit=crop" alt="Materials story" className="h-60 w-full object-cover" />
          <div className="space-y-3 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">What Pillar 10 is</p>
            <h3 className="text-2xl font-semibold text-white">A sovereign supply chain for makers, studios, and cultural production.</h3>
            <p className="text-sm leading-7 text-[#d5cab8]">
              Pillar 10 closes the loop between harvested raw material, trusted fabrication tools, and finished creative work. It gives Indigenous creators better access to inputs while opening direct revenue routes for communities stewarding those materials.
            </p>
          </div>
        </article>
        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">How it works</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">1. Discover verified suppliers, rentals, and co-op orders by category or studio need.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">2. Review traceability, harvest protocol, and fulfillment trust signals before buying.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">3. Join a tool library, post a materials wishlist, or bundle purchases through a co-op.</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">4. Reorder, rent, or re-home surplus materials without leaving the Indigenous maker economy.</div>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Action hub</h3>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {[
            ['/materials-tools/marketplace', 'Browse all materials & tools'],
            ['/materials-tools/bulk-coop', 'Join bulk co-op'],
            ['/materials-tools/rentals', 'Find tool libraries'],
            ['/materials-tools/wishlist', 'Post sourcing wishlist'],
            ['/materials-tools/verified-supplier-application', 'Become a verified supplier'],
            ['/materials-tools/settings-verification', 'Open verification settings'],
            ['/materials-tools/supplier-dashboard', 'Supplier dashboard']
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border border-[#9b6b2b]/35 px-3 py-1.5 text-[#f0d7aa] hover:bg-[#9b6b2b]/12">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </MaterialsToolsFrame>
  );
}
