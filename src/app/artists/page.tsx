import Link from 'next/link';

const artists = [
  { name: 'Maria Begay', pillar: 'Digital Arts', href: '/digital-arts' },
  { name: 'Chief Running Water', pillar: 'Courses', href: '/courses' },
  { name: 'Atsidi Sani', pillar: 'Materials & Tools', href: '/materials-tools' },
  { name: 'Cedar Song', pillar: 'Language & Heritage', href: '/language-heritage' }
];

export default function ArtistsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Featured creators</p>
          <h1 className="mt-2 text-4xl font-semibold">Artist directory</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">This hub routes buyers into the active pillar surfaces where featured creators are already merchandised live.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          {artists.map((artist) => (
            <Link key={artist.name} href={artist.href} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 hover:border-[#d4af37]/30">
              <p className="text-lg font-semibold text-white">{artist.name}</p>
              <p className="mt-2 text-sm text-gray-400">Browse live work in {artist.pillar}.</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
