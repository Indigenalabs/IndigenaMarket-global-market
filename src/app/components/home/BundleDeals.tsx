'use client';

import { useState } from 'react';
import { Package, Tag, ChevronRight, Check, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface BundleItem {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  creator: string;
  items: BundleItem[];
  totalOriginalPrice: number;
  bundlePrice: number;
  savings: number;
  currency: string;
  timeLeft: string;
}

const bundles: Bundle[] = [
  {
    id: 'bundle-1',
    name: 'Heritage Collection Pack',
    description: '5 traditional art pieces celebrating Indigenous culture',
    creator: 'Maria Redfeather',
    items: [
      { id: '1', name: 'Eagle Spirit', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop', originalPrice: 0.3 },
      { id: '2', name: 'Wolf Wisdom', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop', originalPrice: 0.25 },
      { id: '3', name: 'Bear Strength', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop', originalPrice: 0.35 },
      { id: '4', name: 'Turtle Island', image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=200&h=200&fit=crop', originalPrice: 0.28 },
      { id: '5', name: 'Four Directions', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&h=200&fit=crop', originalPrice: 0.32 }
    ],
    totalOriginalPrice: 1.5,
    bundlePrice: 0.99,
    savings: 0.51,
    currency: 'ETH',
    timeLeft: '2 days left'
  },
  {
    id: 'bundle-2',
    name: 'Digital Art Starter Kit',
    description: 'Perfect for new collectors - 3 pieces at beginner-friendly prices',
    creator: 'ThunderVoice',
    items: [
      { id: '6', name: 'Sunrise Ceremony', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop', originalPrice: 0.15 },
      { id: '7', name: 'Moon Dance', image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=200&h=200&fit=crop', originalPrice: 0.12 },
      { id: '8', name: 'Star Stories', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', originalPrice: 0.18 }
    ],
    totalOriginalPrice: 0.45,
    bundlePrice: 0.29,
    savings: 0.16,
    currency: 'ETH',
    timeLeft: '5 days left'
  }
];

export default function BundleDeals() {
  const [hoveredBundle, setHoveredBundle] = useState<string | null>(null);

  return (
    <section className="py-12 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#141414]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#DC143C] to-red-600 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Bundle Deals</h2>
              <p className="text-gray-400 text-sm">Save big with curated collections</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#DC143C]/10 rounded-full">
            <Tag size={16} className="text-[#DC143C]" />
            <span className="text-[#DC143C] text-sm font-medium">Up to 40% off</span>
          </div>
        </div>

        {/* Bundles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bundles.map((bundle) => (
            <div 
              key={bundle.id}
              className="bg-[#141414] rounded-2xl border border-[#d4af37]/10 overflow-hidden hover:border-[#d4af37]/30 transition-all"
              onMouseEnter={() => setHoveredBundle(bundle.id)}
              onMouseLeave={() => setHoveredBundle(null)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Items Preview */}
                <div className="md:w-2/5 p-4 bg-[#0a0a0a]">
                  <div className="grid grid-cols-3 gap-2">
                    {bundle.items.slice(0, 6).map((item, idx) => (
                      <div 
                        key={item.id}
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          idx === 5 && bundle.items.length > 6 ? 'opacity-50' : ''
                        }`}
                      >
                        <img 
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {idx === 5 && bundle.items.length > 6 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">+{bundle.items.length - 6}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Time Left */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <ClockIcon />
                    <span>{bundle.timeLeft}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="md:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#DC143C]/10 text-[#DC143C] text-xs font-bold rounded">
                        SAVE {(bundle.savings / bundle.totalOriginalPrice * 100).toFixed(0)}%
                      </span>
                      <span className="text-gray-400 text-sm">by {bundle.creator}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{bundle.description}</p>

                    {/* Items List */}
                    <div className="space-y-1 mb-4">
                      {bundle.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-[#d4af37]" />
                          <span className="text-gray-300">{item.name}</span>
                        </div>
                      ))}
                      {bundle.items.length > 3 && (
                        <p className="text-gray-500 text-sm pl-5">+{bundle.items.length - 3} more items</p>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 text-sm line-through">
                          {bundle.totalOriginalPrice} {bundle.currency}
                        </span>
                        <span className="text-[#DC143C] text-sm font-medium">
                          -{bundle.savings} {bundle.currency}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">{bundle.bundlePrice}</span>
                        <span className="text-[#d4af37] font-medium">{bundle.currency}</span>
                      </div>
                    </div>
                    
                    <Link href={`/bundles?bundle=${bundle.id}`} className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors">
                      <ShoppingCart size={18} />
                      Get Bundle
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-8 text-center">
          <Link 
            href="/bundles"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#d4af37]/30 rounded-full text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
          >
            Browse All Bundles
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
    </svg>
  );
}
