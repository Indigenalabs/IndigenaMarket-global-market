'use client';

import { ArrowRight, Images } from 'lucide-react';
import Link from 'next/link';

const collections = [
  {
    id: '1',
    name: 'Sacred Geometry',
    creator: 'PlainsElder',
    description: 'Exploring the mathematical patterns found in nature and Indigenous art traditions.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
    itemCount: 24,
    floorPrice: 180
  },
  {
    id: '2',
    name: 'Coastal Spirits',
    creator: 'CoastalArtist',
    description: 'A collection honoring the ocean guardians and marine life of the Pacific Northwest.',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=400&fit=crop',
    itemCount: 18,
    floorPrice: 220
  },
  {
    id: '3',
    name: 'Desert Dreams',
    creator: 'HopiVision',
    description: 'Visionary art inspired by the landscapes and stories of the Southwest.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    itemCount: 32,
    floorPrice: 150
  }
];

export default function FeaturedCollections() {
  return (
    <section className="bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/10">
              <Images size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Featured <span className="secondary-gradient">Collections</span>
              </h2>
              <p className="text-sm text-gray-500">
                Curated selections from top artists. <span className="text-[#d4af37]/60">Sponsored collection lane</span>
              </p>
            </div>
          </div>
          <Link href="/collections" className="flex items-center gap-2 text-[#d4af37] transition-colors hover:text-[#f4e4a6]">
            <span className="text-sm">View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group relative overflow-hidden rounded-xl border border-[#d4af37]/10 bg-[#141414] transition-all hover:border-[#d4af37]/30 hover:shadow-xl hover:shadow-[#d4af37]/10"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-[#d4af37]/30 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
                  Sponsored
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="mb-1 text-xl font-bold text-white">{collection.name}</h3>
                  <p className="text-sm text-[#d4af37]">by {collection.creator}</p>
                </div>
              </div>

              <div className="p-4">
                <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#d4af37]/70">
                  Featured collection placement
                </p>
                <p className="mb-4 line-clamp-2 text-sm text-gray-400">{collection.description}</p>

                <div className="mb-4 flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{collection.itemCount}</p>
                    <p className="text-xs text-gray-500">Items</p>
                  </div>
                  <div className="h-8 w-px bg-[#d4af37]/20" />
                  <div className="text-center">
                    <p className="text-lg font-bold secondary-gradient">{collection.floorPrice} INDI</p>
                    <p className="text-xs text-gray-500">Floor Price</p>
                  </div>
                </div>

                <Link
                  href={`/collection/${collection.id}`}
                  className="block w-full rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 py-2.5 text-center font-medium text-[#d4af37] transition-all hover:bg-[#d4af37] hover:text-black"
                >
                  View Collection
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

