import Link from 'next/link';
import DigitalArtsFrame from '@/app/digital-arts/components/DigitalArtsFrame';
import { ArtworkTile } from '@/app/digital-arts/components/DigitalArtsCards';
import { artworks } from '@/app/digital-arts/data/pillar1Showcase';

export default function MyCollectionPage() {
  const owned = artworks.slice(0, 5);
  return (
    <DigitalArtsFrame title="My Collection" subtitle="Track purchased works, watchlist movement, and portfolio value.">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Owned Works', value: owned.length.toString() },
          { label: 'Estimated Value', value: '1,765 INDI' },
          { label: 'Unrealized Gain', value: '+14.8%' },
          { label: 'Watchlist Alerts', value: '9' }
        ].map((item) => (
          <article key={item.label} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {owned.map((item) => (
          <ArtworkTile key={item.id} artwork={item} />
        ))}
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Collection Actions</h3>
        <div className="mt-3 flex flex-wrap gap-2.5">
          <Link href="/digital-arts/licensing-inquiry" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Request Licensing</Link>
          <Link href="/digital-arts/commission-request" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">Request New Commission</Link>
        </div>
      </section>
    </DigitalArtsFrame>
  );
}

