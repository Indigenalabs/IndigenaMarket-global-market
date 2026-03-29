'use client';

import { useState } from 'react';
import { Filter, Globe, Sparkles, ChevronDown } from 'lucide-react';
import { PHYSICAL_MARKETPLACE_CATEGORIES } from '@/app/physical-items/data/pillar2Catalog';

const categories = PHYSICAL_MARKETPLACE_CATEGORIES.map((category) => ({
  id: category.id,
  label: category.label,
  icon: category.icon,
}));

const nations = [
  'All Nations', 'Navajo', 'Lakota', 'Hopi', 'Cherokee', 'Ojibwe',
  'Anishinaabe', 'Coast Salish', 'Haudenosaunee', 'Metis', 'Inuit',
];

interface PhysicalCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  activeNation: string;
  onNationChange: (nation: string) => void;
  arOnly: boolean;
  onAROnlyChange: (v: boolean) => void;
  shipsIntl: boolean;
  onShipsIntlChange: (v: boolean) => void;
}

export default function PhysicalCategoryFilter({
  activeCategory,
  onCategoryChange,
  activeNation,
  onNationChange,
  arOnly,
  onAROnlyChange,
  shipsIntl,
  onShipsIntlChange,
}: PhysicalCategoryFilterProps) {
  return (
    <div className="mb-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/30'
                : 'bg-[#141414] text-gray-400 border border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Nation Dropdown */}
        <div className="relative">
          <select
            value={activeNation}
            onChange={(e) => onNationChange(e.target.value)}
            className="appearance-none bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
          >
            {nations.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* AR Preview Only */}
        <button
          onClick={() => onAROnlyChange(!arOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            arOnly
              ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
              : 'bg-[#141414] border-[#d4af37]/20 text-gray-400 hover:border-[#d4af37]/50'
          }`}
        >
          <Sparkles size={14} />
          AR Preview
        </button>

        {/* Ships Internationally */}
        <button
          onClick={() => onShipsIntlChange(!shipsIntl)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            shipsIntl
              ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
              : 'bg-[#141414] border-[#d4af37]/20 text-gray-400 hover:border-[#d4af37]/50'
          }`}
        >
          <Globe size={14} />
          Ships Internationally
        </button>
      </div>
    </div>
  );
}





