import Link from 'next/link';

const posts = [
  { title: 'Why provenance matters for Indigenous commerce', href: '/materials-tools' },
  { title: 'How premium placements now work live-only', href: '/creator-hub' },
  { title: 'Archive access, research tools, and consent controls', href: '/language-heritage/archive' }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Indigena journal</p>
          <h1 className="mt-2 text-4xl font-semibold">News, platform notes, and field stories</h1>
        </section>
        <section className="grid gap-4">
          {posts.map((post) => (
            <Link key={post.title} href={post.href} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 hover:border-[#d4af37]/30">
              <p className="text-lg font-semibold text-white">{post.title}</p>
              <p className="mt-2 text-sm text-gray-400">Open the live product surface tied to this story.</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
