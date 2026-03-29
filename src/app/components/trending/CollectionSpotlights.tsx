'use client';

import { Layers, ArrowRight, Users, Package, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface CollectionSpotlightsProps {
  limit?: number;
}

const spotlightCollections = [
  {
    id: 'collection-1',
    name: 'Sacred Geometry Masters',
    creator: 'Heritage Arts Foundation',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=400&fit=crop',
    description: 'A curated collection of traditional geometric patterns from master artisans across Turtle Island.',
    items: 150,
    owners: 89,
    floorPrice: 250,
    volume: 125000,
    currency: 'INDI',
    featured: [
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=200&h=200&fit=crop'
    ],
    badge: 'Featured',
    sponsor: 'Native Arts Council'
  },
  {
    id: 'collection-2',
    name: 'Coastal Nations Series',
    creator: 'Pacific Arts Network',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=400&fit=crop',
    description: 'Celebrating the rich artistic traditions of Pacific Northwest Indigenous communities.',
    items: 89,
    owners: 56,
    floorPrice: 380,
    volume: 89000,
    currency: 'INDI',
    featured: [
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop'
    ],
    badge: 'Trending',
    sponsor: 'PNW Cultural Center'
  },
  {
    id: 'collection-3',
    name: 'Desert Traditions',
    creator: 'Southwest Heritage',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=400&fit=crop',
    description: 'Ancient techniques and contemporary expressions from Southwest Indigenous artists.',
    items: 120,
    owners: 78,
    floorPrice: 195,
    volume: 67000,
    currency: 'INDI',
    featured: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=200&h=200&fit=crop'
    ],
    badge: 'New',
    sponsor: 'Desert Arts Initiative'
  }
];

export default function CollectionSpotlights({ limit = 3 }: CollectionSpotlightsProps) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Layers size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Collection Spotlights</h3>
            <p className="text-xs text-gray-400">Curated drops from verified organizations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#d4af37]/60 bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
            Sponsored
          </span>
          <Link 
            href="/collections"
            className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {spotlightCollections.slice(0, limit).map((collection) => (
          <Link 
            key={collection.id}
            href={`/collection/${collection.id}`}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all hover:shadow-lg hover:shadow-[#d4af37]/10"
          >
            {/* Cover Image */}
            <div className="relative h-32 overflow-hidden">
              <img 
                src={collection.coverImage}
                alt={collection.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />

              {/* Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-black text-xs font-bold rounded">
                <Crown size={10} />
                {collection.badge}
              </div>

              {/* Sponsor */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
                {collection.sponsor}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Creator */}
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={collection.creatorAvatar}
                  alt={collection.creator}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs text-[#d4af37]">{collection.creator}</span>
              </div>

              {/* Name & Description */}
              <h4 className="text-white font-semibold mb-2 group-hover:text-[#d4af37] transition-colors">
                {collection.name}
              </h4>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{collection.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <Package size={14} />
                  <span>{collection.items} items</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Users size={14} />
                  <span>{collection.owners} owners</span>
                </div>
              </div>

              {/* Featured Items Preview */}
              <div className="flex items-center gap-2 mb-4">
                {collection.featured.map((img, idx) => (
                  <div 
                    key={idx}
                    className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#141414] -ml-2 first:ml-0"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center text-xs text-gray-400">
                  +{collection.items - 4}
                </div>
              </div>

              {/* Floor Price & Volume */}
              <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
                <div>
                  <p className="text-xs text-gray-500">Floor Price</p>
                  <p className="text-[#d4af37] font-bold">{collection.floorPrice} INDI</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Volume</p>
                  <p className="text-white font-medium">
                    {collection.volume >= 1000 ? `${(collection.volume / 1000).toFixed(0)}K` : collection.volume} INDI
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Collection CTA */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#DC143C]/10 rounded-xl border border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-white font-medium">Launch Your Collection</p>
              <p className="text-gray-400 text-sm">Create a curated drop and reach thousands of collectors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/collections/create"
              className="px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37]/30 transition-colors"
            >
              Create Collection
            </Link>
            <Link 
              href="/collections/promote"
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
            >
              Get Spotlight
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
