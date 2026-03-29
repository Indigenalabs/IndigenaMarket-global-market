'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageHeroBanner from '../components/HeritageHeroBanner';
import { fetchLanguageDirectory, type HeritageLanguageDirectoryItem } from '@/app/lib/languageHeritageApi';

export default function LanguagesPage() {
  const languageImages = [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&h=600&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1000&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&h=600&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=1000&h=600&fit=crop'
  ];

  const [rows, setRows] = useState<HeritageLanguageDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'items' | 'rating' | 'name'>('items');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const items = await fetchLanguageDirectory();
        if (!mounted) return;
        setRows(items);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message || 'Failed to load language directory');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <LanguageHeritageFrame title="All Languages" subtitle="Browse languages and communities represented across the pillar.">
      <HeritageHeroBanner
        eyebrow="Language Directory"
        title="Explore Communities and Active Language Collections"
        description="Navigate the full language index, compare activity by community, and jump directly into profile-level collections."
        image="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400&h=700&fit=crop"
        chips={['500+ Communities', 'Multi-Region', 'Collection Metrics']}
        placementId="heritage_speaker_spotlight"
      />
      <section className="grid gap-3 rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search language or community"
          className="rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none md:col-span-2"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-white"
        >
          <option value="items">Sort: Most Materials</option>
          <option value="rating">Sort: Best Rated</option>
          <option value="name">Sort: A-Z</option>
        </select>
      </section>
      <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
        {loading ? <p className="text-sm text-gray-400">Loading...</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        {!loading && !error ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows
              .filter((row) => row.name.toLowerCase().includes(query.toLowerCase()) || row.languageId.includes(query.toLowerCase()))
              .sort((a, b) => {
                if (sortBy === 'rating') return b.avgRating - a.avgRating;
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                return b.totalItems - a.totalItems;
              })
              .map((row, idx) => (
              <Link
                key={row.languageId}
                href={`/language-heritage/community/${encodeURIComponent(row.languageId)}`}
                className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b] hover:-translate-y-0.5 hover:border-[#d4af37]/30 transition-all"
              >
                <div className="relative h-28">
                  <img
                    src={languageImages[idx % languageImages.length]}
                    alt={row.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <p className="absolute bottom-2 left-3 text-sm font-semibold text-white">{row.name}</p>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400">
                    {row.totalItems} materials • {row.categories.length} categories
                  </p>
                  <p className="mt-1 text-xs text-[#d4af37]">Avg Rating {row.avgRating.toFixed(1)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        {(rows.slice(0, 3)).map((row, idx) => (
          <div key={`rank-${row.languageId}`} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-[#d4af37]">Rank #{idx + 1}</p>
            <p className="mt-1 text-base font-semibold text-white">{row.name}</p>
            <p className="text-xs text-gray-400">{row.totalItems} materials</p>
          </div>
        ))}
      </section>
    </LanguageHeritageFrame>
  );
}
