import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import { ArtistTile, ArtworkTile, CollectionTile } from '@/app/digital-arts/components/DigitalArtsCards';
import { getArtistById, getArtworksByArtist, collections } from '@/app/digital-arts/data/pillar1Showcase';

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = getArtistById(id);
  const works = getArtworksByArtist(artist.id);

  return (
    <DigitalArtsFrame title={artist.name} subtitle={`${artist.nation} • ${artist.specialty}`}>
      <section className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101010]">
        <div className="relative h-[320px]">
          <img src={artist.cover} alt={artist.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-end gap-4">
            <img src={artist.avatar} alt={artist.name} className="h-20 w-20 rounded-full border-2 border-[#111111] object-cover" />
            <div>
              <p className="text-2xl font-semibold text-white">{artist.name}</p>
              <p className="text-sm text-gray-200">{artist.bio}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Followers', value: artist.followers.toLocaleString() },
          { label: 'Total Sales', value: artist.totalSales },
          { label: 'Rank', value: `#${artist.rank}` },
          { label: 'Listed Works', value: works.length.toString() }
        ].map((item) => (
          <article key={item.label} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {works.map((work) => (
          <ArtworkTile key={work.id} artwork={work} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {collections.map((collection) => (
          <CollectionTile key={collection.id} collection={collection} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ArtistTile artist={artist} />
      </section>
    </DigitalArtsFrame>
  );
}

