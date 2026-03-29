'use client';

import { useState } from 'react';
import { Zap, ChevronRight } from 'lucide-react';

const spotlightCategories = [
  {
    id: 'translation',
    name: 'Translation Services',
    tagline: 'Preserving Indigenous Languages',
    icon: '🗣️',
    color: '#d4af37',
    services: 67,
    avgPrice: 45
  },
  {
    id: 'cultural-guidance',
    name: 'Cultural Guidance',
    tagline: 'Traditional Knowledge Keepers',
    icon: '🏛️',
    color: '#DC143C',
    services: 45,
    avgPrice: 150
  },
  {
    id: 'craftsmanship',
    name: 'Craftsmanship',
    tagline: 'Handcrafted Excellence',
    icon: '🔨',
    color: '#d4af37',
    services: 78,
    avgPrice: 200
  }
];

export default function CategorySpotlightStrip() {
  const [activeSpotlight, setActiveSpotlight] = useState(0);

  const spotlight = spotlightCategories[activeSpotlight];

  return (
    <div className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 mb-6">
      {/* Premium badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-[#d4af37]" />
          <span className="text-[#d4af37] text-xs font-medium">CATEGORY SPOTLIGHT • $200/wk</span>
        </div>
        <div className="flex gap-1">
          {spotlightCategories.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSpotlight(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeSpotlight ? 'bg-[#d4af37] w-4' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Spotlight content */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${spotlight.color}20` }}
        >
          {spotlight.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold">{spotlight.name}</h3>
          <p className="text-gray-400 text-sm">{spotlight.tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">{spotlight.services} services</p>
          <p className="text-[#d4af37] font-medium">Avg. ${spotlight.avgPrice}</p>
        </div>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-[#d4af37]/20 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/30 transition-colors text-sm font-medium"
        >
          Explore
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
