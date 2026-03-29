import Link from 'next/link';
import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import { getArtworkById, getArtistById, collections } from '@/app/digital-arts/data/pillar1Showcase';
import { ArtworkTile, CollectionTile } from '@/app/digital-arts/components/DigitalArtsCards';

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtworkById(id);
  const artist = getArtistById(artwork.artistId);

  return (
    <DigitalArtsFrame title={artwork.title} subtitle={`By ${artwork.artist} • ${artwork.nation}`}>
      <section className="grid gap-5 lg:grid-cols-[1.4fr,1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101010]">
          <img src={artwork.image} alt={artwork.title} className="h-[420px] w-full object-cover" />
        </article>
        <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Artwork Detail • Premium Viewer Slot</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{artwork.title}</h2>
          <p className="mt-2 text-sm text-gray-300">{artwork.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-white/10 bg-black/30 p-3"><p className="text-gray-400">Price</p><p className="text-[#d4af37]">{artwork.price} INDI</p></div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3"><p className="text-gray-400">Edition</p><p className="text-white">{artwork.edition}</p></div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3"><p className="text-gray-400">Media</p><p className="text-white">{artwork.mediaType}</p></div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3"><p className="text-gray-400">Views</p><p className="text-white">{artwork.views.toLocaleString()}</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/digital-arts/commission-request" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">Request Similar Commission</Link>
            <Link href="/digital-arts/licensing-inquiry" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Licensing Inquiry</Link>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
        <div className="flex items-center gap-3">
          <img src={artist.avatar} alt={artist.name} className="h-16 w-16 rounded-full object-cover" />
          <div>
            <p className="text-lg font-semibold text-white">{artist.name}</p>
            <p className="text-sm text-gray-400">{artist.nation} • {artist.specialty}</p>
          </div>
          <Link href={`/digital-arts/artist/${artist.id}`} className="ml-auto rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">View Artist Profile</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {collections.map((collection) => (
          <CollectionTile key={collection.id} collection={collection} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[getArtworkById('aw-102'), getArtworkById('aw-105')].map((item) => (
          <ArtworkTile key={item.id} artwork={item} />
        ))}
      </section>
    </DigitalArtsFrame>
  );
}

