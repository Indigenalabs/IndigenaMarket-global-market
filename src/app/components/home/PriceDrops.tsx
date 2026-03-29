'use client';

import { useState } from 'react';
import { TrendingDown, Clock, ChevronRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import HomeMarketplaceModal, { type HomeMarketplaceItem } from './HomeMarketplaceModal';

interface PriceDrop {
  id: string;
  name: string;
  image: string;
  creator: string;
  originalPrice: number;
  salePrice: number;
  currency: string;
  discount: number;
  timeLeft: string;
  quantityLeft: number;
}

const priceDrops: PriceDrop[] = [
  {
    id: 'drop-1',
    name: 'Spirit Bear Collection',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
    creator: 'Maria Redfeather',
    originalPrice: 1.5,
    salePrice: 0.99,
    currency: 'ETH',
    discount: 34,
    timeLeft: '6 hours',
    quantityLeft: 12
  },
  {
    id: 'drop-2',
    name: 'Digital Dreamcatcher',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    creator: 'ThunderVoice',
    originalPrice: 0.8,
    salePrice: 0.5,
    currency: 'ETH',
    discount: 37,
    timeLeft: '12 hours',
    quantityLeft: 5
  },
  {
    id: 'drop-3',
    name: 'Sacred Patterns',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop',
    creator: 'Elena Rivers',
    originalPrice: 2.0,
    salePrice: 1.4,
    currency: 'ETH',
    discount: 30,
    timeLeft: '1 day',
    quantityLeft: 8
  },
  {
    id: 'drop-4',
    name: 'Tribal Fusion Art',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
    creator: 'DesertRose',
    originalPrice: 1.2,
    salePrice: 0.75,
    currency: 'ETH',
    discount: 37,
    timeLeft: '2 days',
    quantityLeft: 15
  }
];

export default function PriceDrops() {
  const [activeItem, setActiveItem] = useState<HomeMarketplaceItem | null>(null);

  return (
    <section className="py-12 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#141414]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Price Drops</h2>
              <p className="text-gray-400 text-sm">Limited time discounts</p>
            </div>
          </div>
          <Link 
            href="/deals"
            className="flex items-center gap-1 text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
          >
            View All Deals
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {priceDrops.map((item) => (
            <div 
              key={item.id}
              className="group bg-[#141414] rounded-xl border border-[#d4af37]/10 overflow-hidden hover:border-[#d4af37]/30 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-[#DC143C] rounded-full">
                  <span className="text-white text-sm font-bold">-{item.discount}%</span>
                </div>

                {/* Time Left */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                  <Clock size={12} className="text-[#d4af37]" />
                  <span className="text-white text-xs">{item.timeLeft}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 truncate">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-3">by {item.creator}</p>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-white">{item.salePrice} {item.currency}</span>
                  <span className="text-gray-500 text-sm line-through">{item.originalPrice} {item.currency}</span>
                </div>

                {/* Stock */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Only {item.quantityLeft} left</span>
                    <span className="text-[#DC143C]">Selling fast</span>
                  </div>
                  <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#DC143C] to-red-400 rounded-full"
                      style={{ width: `${Math.min(100, (item.quantityLeft / 20) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveItem({
                      id: item.id,
                      title: item.name,
                      creator: item.creator,
                      image: item.image,
                      price: item.salePrice,
                      currency: item.currency,
                      description: `${item.name} is currently discounted ${item.discount}% for a limited time, with only ${item.quantityLeft} pieces left at the sale price.`,
                      detailHref: '/deals',
                      artistHref: `/artist/${item.creator.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                    })
                  }
                  className="w-full py-2.5 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Grab Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <HomeMarketplaceModal item={activeItem} mode="buy" isOpen={Boolean(activeItem)} onClose={() => setActiveItem(null)} />
    </section>
  );
}
