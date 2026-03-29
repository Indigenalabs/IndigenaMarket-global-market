import Link from 'next/link';
import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import DigitalArtsHero from '@/app/digital-arts/components/DigitalArtsHero';
import { ArtworkTile, SpotlightStrip } from '@/app/digital-arts/components/DigitalArtsCards';
import { categoryMeta, getArtworksByCategory, type DigitalArtwork } from '@/app/digital-arts/data/pillar1Showcase';

export default function DigitalPaintingsCategoryPage() {
  const key: DigitalArtwork['category'] = 'digital-paintings';
  const meta = categoryMeta[key];
  const listings = getArtworksByCategory(key);

  return (
    <DigitalArtsFrame title={meta.label} subtitle={meta.description}>
      <DigitalArtsHero
        eyebrow="Category Showcase"
        title="Digital Paintings With Story and Ceremony"
        description="Browse high-intent collector pieces with edition metadata, cultural context, and licensing pathways."
        image={meta.cover}
        chips={['Primary Sales', 'Auctions', 'Collector-ready metadata']}
        actions={[
          { href: '/digital-arts/commission-request', label: 'Request Commission' },
          { href: '/digital-arts/licensing-inquiry', label: 'Licensing Inquiry', tone: 'secondary' }
        ]}
      />
      <SpotlightStrip />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ArtworkTile key={listing.id} artwork={listing} />
        ))}
      </section>
      <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4 text-sm text-gray-300">
        Need broader discovery? Visit <Link href="/digital-arts/categories/photography" className="text-[#d4af37] hover:underline">Photography</Link>, <Link href="/digital-arts/categories/3d-art" className="text-[#d4af37] hover:underline">3D Art</Link>, or <Link href="/digital-arts/categories/animation-motion-graphics" className="text-[#d4af37] hover:underline">Animation</Link>.
      </section>
    </DigitalArtsFrame>
  );
}

