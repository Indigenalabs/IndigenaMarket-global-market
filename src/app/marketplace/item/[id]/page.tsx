import Link from 'next/link';

const ITEMS: Record<string, { title: string; creator: string; price: string; summary: string; href: string; cta: string }> = {
  'featured-1': { title: 'Sacred Eagle Collection', creator: 'Thunderbird Arts', price: '850 INDI', summary: 'Featured marketplace detail for a promoted digital arts collection.', href: '/collection/thunderbird-rising', cta: 'Open collection' },
  'featured-2': { title: 'Dreamweaver Series', creator: 'Navajo Masters', price: '620 INDI', summary: 'Featured marketplace detail for a promoted creator drop.', href: '/artist/maria-begay', cta: 'Open artist' },
  'featured-3': { title: 'Spirit Bear Totem', creator: 'Coastal Nations', price: '1200 INDI', summary: 'Featured marketplace detail for a promoted cultural artwork drop.', href: '/digital-arts', cta: 'Browse digital arts' },
  'gainer-1': { title: 'Sacred Buffalo Spirit', creator: 'LakotaDreams', price: '450 INDI', summary: 'One of the strongest movers on the trending board.', href: '/digital-arts', cta: 'Browse collection' },
  'gainer-2': { title: 'Thunderbird Rising', creator: 'CoastalArtist', price: '620 INDI', summary: 'Rapid-growth listing highlighted in trend velocity.', href: '/collection/thunderbird-rising', cta: 'Open collection' },
  'gainer-3': { title: 'Medicine Wheel', creator: 'PlainsElder', price: '750 INDI', summary: 'Trending gainer detail page for marketplace momentum tracking.', href: '/digital-arts', cta: 'Browse digital arts' },
  'gainer-4': { title: 'Eagle Feather Ceremony', creator: 'HopiVision', price: '520 INDI', summary: 'Trending gainer detail page for discovery and pricing context.', href: '/digital-arts', cta: 'Browse digital arts' },
  'loser-1': { title: 'Winter Solstice', creator: 'ArcticVisions', price: '180 INDI', summary: 'Cooling listing detail page for market comparison.', href: '/digital-arts', cta: 'Browse digital arts' },
  'loser-2': { title: 'Desert Bloom', creator: 'SouthwestArt', price: '145 INDI', summary: 'Price-softening listing detail page for trend context.', href: '/digital-arts', cta: 'Browse digital arts' },
  'loser-3': { title: 'Forest Spirit', creator: 'WoodlandCrafts', price: '200 INDI', summary: 'Lower-momentum listing detail page retained for market visibility.', href: '/digital-arts', cta: 'Browse digital arts' },
  'new-1': { title: 'Northern Lights Spirit', creator: 'ArcticVisions', price: '350 INDI', summary: 'Fresh listing detail page for new marketplace arrivals.', href: '/digital-arts', cta: 'Browse digital arts' },
  'new-2': { title: 'Desert Rose Collection', creator: 'SouthwestJewelry', price: '280 INDI', summary: 'Fresh listing detail page for newly published creator work.', href: '/digital-arts', cta: 'Browse digital arts' },
  'new-3': { title: 'Coastal Wolf Pack', creator: 'PacificNorthwest', price: '520 INDI', summary: 'Fresh listing detail page for recent collector interest.', href: '/digital-arts', cta: 'Browse digital arts' },
  'new-4': { title: 'Prairie Thunder', creator: 'PlainsArtistry', price: '195 INDI', summary: 'Fresh listing detail page for newly listed work.', href: '/digital-arts', cta: 'Browse digital arts' },
  'new-5': { title: 'Mountain Spirit Guide', creator: 'RockyMountain', price: '425 INDI', summary: 'Fresh listing detail page for recently published work.', href: '/digital-arts', cta: 'Browse digital arts' },
  'new-6': { title: 'River Otter Play', creator: 'WetlandsArt', price: '165 INDI', summary: 'Fresh listing detail page for recent low-price discovery.', href: '/digital-arts', cta: 'Browse digital arts' },
  'gem-1': { title: 'Collector Gem 1', creator: 'Rising Studio', price: '210 INDI', summary: 'Undervalued listing detail page for collectors watching pricing anomalies.', href: '/digital-arts', cta: 'Browse digital arts' },
  'gem-2': { title: 'Collector Gem 2', creator: 'Rising Studio', price: '240 INDI', summary: 'Undervalued listing detail page for collectors watching pricing anomalies.', href: '/digital-arts', cta: 'Browse digital arts' },
  'gem-3': { title: 'Collector Gem 3', creator: 'Rising Studio', price: '275 INDI', summary: 'Undervalued listing detail page for collectors watching pricing anomalies.', href: '/digital-arts', cta: 'Browse digital arts' },
  'gem-4': { title: 'Collector Gem 4', creator: 'Rising Studio', price: '190 INDI', summary: 'Undervalued listing detail page for collectors watching pricing anomalies.', href: '/digital-arts', cta: 'Browse digital arts' }
};

export default async function MarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = ITEMS[id] || {
    title: id.replace(/[-_]/g, ' '),
    creator: 'Marketplace Creator',
    price: 'Open listing',
    summary: 'Marketplace detail stub for legacy trending and discovery links.',
    href: '/digital-arts',
    cta: 'Browse digital arts'
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#d4af37]/20 bg-[#141414] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Marketplace item</p>
        <h1 className="mt-4 text-4xl font-semibold">{item.title}</h1>
        <p className="mt-2 text-sm text-[#d4af37]">by {item.creator}</p>
        <p className="mt-5 text-base leading-8 text-gray-300">{item.summary}</p>
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-[#d4af37]/15 bg-[#0a0a0a] p-5">
          <span className="text-xl font-semibold text-[#d4af37]">{item.price}</span>
          <Link href={item.href} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">
            {item.cta}
          </Link>
        </div>
      </div>
    </main>
  );
}
