'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchLanguageHeritageListings, type LanguageHeritageListing } from '@/app/lib/languageHeritageApi';

type Props = {
  title: string;
  query?: {
    categoryId?: string;
    format?: 'all' | 'audio' | 'video' | 'document' | 'service' | 'experience' | 'software';
    sort?: 'featured' | 'newest' | 'price-low' | 'price-high';
  };
};

function detailHref(item: LanguageHeritageListing) {
  if (item.format === 'audio' || item.format === 'video') {
    return `/language-heritage/recordings/${encodeURIComponent(item.id)}`;
  }
  if (item.format === 'software') {
    return `/language-heritage/tools/${encodeURIComponent(item.id)}`;
  }
  return '/language-heritage/marketplace';
}

export default function HeritageLiveListings({ title, query }: Props) {
  const [items, setItems] = useState<LanguageHeritageListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const memoQuery = useMemo(() => ({ ...query, limit: 8, page: 1 }), [query]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchLanguageHeritageListings(memoQuery);
        if (!mounted) return;
        setItems(response.items);
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message || 'Failed to load listings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [memoQuery]);

  return (
    <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#d4af37]">{title}</h2>
      {loading ? <p className="text-sm text-gray-400">Loading...</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && items.length === 0 ? <p className="text-sm text-gray-500">No items available.</p> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={detailHref(item)}
            className="fade-up-in group overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/30"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="relative h-32 w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute left-2 top-2 rounded-full border border-[#d4af37]/35 bg-black/65 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]">
                {item.format}
              </span>
              <span className="absolute right-2 top-2 rounded-full border border-white/15 bg-black/65 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-200">
                {item.accessLevel}
              </span>
            </div>
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-gray-400">
                {item.nation} • {item.categoryLabel}
              </p>
              <p className="text-xs text-[#d4af37]">
                {item.currency} {item.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
