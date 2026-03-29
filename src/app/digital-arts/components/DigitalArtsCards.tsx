import Link from 'next/link';
import { artists, artworks, collections, type DigitalArtist, type DigitalArtwork, type DigitalCollection } from '@/app/digital-arts/data/pillar1Showcase';

export function ArtistTile({ artist }: { artist: DigitalArtist }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#111111] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/40">
      <div className="relative h-28">
        <img src={artist.cover} alt={artist.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="-mt-10 mb-3 flex items-end justify-between">
          <img src={artist.avatar} alt={artist.name} className="h-16 w-16 rounded-full border-2 border-[#111111] object-cover" />
          <span className="rounded-full border border-[#d4af37]/35 px-2 py-0.5 text-xs text-[#d4af37]">#{artist.rank}</span>
        </div>
        <p className="text-sm font-semibold text-white">{artist.name}</p>
        <p className="text-xs text-gray-400">{artist.nation} • {artist.specialty}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-400">{artist.followers.toLocaleString()} followers</span>
          <span className="text-[#d4af37]">{artist.totalSales}</span>
        </div>
        <Link href={`/digital-arts/artist/${artist.id}`} className="mt-3 block rounded-lg border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20">
          View Profile
        </Link>
      </div>
    </article>
  );
}

export function ArtworkTile({ artwork }: { artwork: DigitalArtwork }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#101010] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/40">
      <div className="relative h-48 overflow-hidden">
        <img src={artwork.image} alt={artwork.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        <div className="absolute left-2 top-2 rounded-full border border-black/40 bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]">
          {artwork.auction ? 'Auction' : 'Buy Now'}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-white">{artwork.title}</p>
        <p className="text-xs text-gray-400">{artwork.artist} • {artwork.nation}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-400">{artwork.likes.toLocaleString()} likes</span>
          <span className="text-[#d4af37]">{artwork.price} INDI</span>
        </div>
        <Link href={`/digital-arts/artwork/${artwork.id}`} className="mt-3 block rounded-lg border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20">
          View Artwork
        </Link>
      </div>
    </article>
  );
}

export function CollectionTile({ collection }: { collection: DigitalCollection }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#101010] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/40">
      <img src={collection.cover} alt={collection.title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <p className="text-sm font-semibold text-white">{collection.title}</p>
        <p className="text-xs text-gray-400">Curated by {collection.curator}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-black/30 p-2">
            <p className="text-gray-400">Items</p>
            <p className="text-white">{collection.itemCount}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-2">
            <p className="text-gray-400">Floor</p>
            <p className="text-white">{collection.floorPrice}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-2">
            <p className="text-gray-400">24h Vol</p>
            <p className="text-white">{collection.volume24h}</p>
          </div>
        </div>
        <Link href={`/digital-arts/collection/${collection.id}`} className="mt-3 block rounded-lg border border-[#d4af37]/35 bg-[#d4af37]/10 py-2 text-center text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20">
          Open Collection
        </Link>
      </div>
    </article>
  );
}

export function SpotlightStrip() {
  return (
    <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Featured Keepers • Premium Slot</h3>
        <Link href="/digital-arts/artists" className="text-xs text-[#d4af37] hover:underline">View all artists</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artists.slice(0, 3).map((artist) => (
          <article key={artist.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3">
            <img src={artist.avatar} alt={artist.name} className="h-14 w-14 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-white">{artist.name}</p>
              <p className="text-xs text-gray-400">{artist.specialty}</p>
              <p className="text-xs text-[#d4af37]">{artist.followers.toLocaleString()} followers</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceStatsBand() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Active Artists', value: artists.length.toString() },
        { label: 'Live Listings', value: artworks.length.toString() },
        { label: 'Collections', value: collections.length.toString() },
        { label: '24h Transactions', value: '1,284' }
      ].map((item) => (
        <article key={item.label} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
        </article>
      ))}
    </section>
  );
}

