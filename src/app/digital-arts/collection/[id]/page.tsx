import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import { ArtworkTile, ArtistTile } from '@/app/digital-arts/components/DigitalArtsCards';
import { getCollectionById, artists, artworks } from '@/app/digital-arts/data/pillar1Showcase';

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = getCollectionById(id);
  const collectionArtists = artists.filter((artist) => collection.artistIds.includes(artist.id));

  return (
    <DigitalArtsFrame title={collection.title} subtitle={collection.description}>
      <section className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101010]">
        <div className="relative h-[300px]">
          <img src={collection.cover} alt={collection.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute left-5 top-4 rounded-full border border-[#d4af37]/45 bg-black/70 px-3 py-1 text-xs text-[#d4af37]">
            Collection Hero • Premium Placement
          </div>
          <div className="absolute bottom-5 left-5">
            <h2 className="text-3xl font-bold text-white">{collection.title}</h2>
            <p className="text-sm text-gray-200">Curated by {collection.curator}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Items', value: collection.itemCount.toString() },
          { label: 'Floor', value: `${collection.floorPrice} INDI` },
          { label: '24h Volume', value: `${collection.volume24h} INDI` },
          { label: 'Artists', value: collectionArtists.length.toString() }
        ].map((item) => (
          <article key={item.label} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {artworks.slice(0, 6).map((work) => (
          <ArtworkTile key={work.id} artwork={work} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {collectionArtists.map((artist) => (
          <ArtistTile key={artist.id} artist={artist} />
        ))}
      </section>
    </DigitalArtsFrame>
  );
}

