import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import DigitalArtsHero from '@/app/digital-arts/components/DigitalArtsHero';
import { ArtistTile, CollectionTile, MarketplaceStatsBand, SpotlightStrip } from '@/app/digital-arts/components/DigitalArtsCards';
import { artists, collections } from '@/app/digital-arts/data/pillar1Showcase';

export default function ViewAllArtistsPage() {
  return (
    <DigitalArtsFrame title="View All Artists" subtitle="Discover verified creators, track rankings, and explore their collections.">
      <DigitalArtsHero
        eyebrow="Pillar 1"
        title="Meet Indigenous Digital Art Leaders"
        description="Explore artists shaping digital culture through painting, photography, 3D, and motion storytelling."
        image="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1800&h=900&fit=crop"
        chips={['Verified Creators', 'Global Discovery', 'Cultural Protocol Aware']}
        actions={[
          { href: '/digital-arts/categories/digital-paintings', label: 'Browse Paintings' },
          { href: '/digital-arts/artist-portfolio', label: 'Open Artist Dashboard', tone: 'secondary' }
        ]}
      />
      <MarketplaceStatsBand />
      <SpotlightStrip />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <ArtistTile key={artist.id} artist={artist} />
        ))}
      </section>
      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Top Collections • Premium Placement</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {collections.map((collection) => (
            <CollectionTile key={collection.id} collection={collection} />
          ))}
        </div>
      </section>
    </DigitalArtsFrame>
  );
}

