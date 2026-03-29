'use client';

import { useEffect, useState } from 'react';
import {
  Search, SlidersHorizontal, TrendingUp, Clock,
  Flame, Users, ChevronDown, X
} from 'lucide-react';

interface FilterState {
  nation: string;
  style: string;
  medium: string;
  sortBy: string;
  priceRange: { min: string; max: string };
}

interface SearchDiscoveryProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  trendingSearches?: string[];
  recentSearches?: string[];
}

const nations = ['All Nations', 'Lakota', 'Navajo', 'Cherokee', 'Cree', 'Haida', 'Ojibwe', 'Maya'];
const styles = ['All Styles', 'Traditional', 'Contemporary', 'Spiritual', 'Geometric', 'Formline', 'Abstract'];
const mediums = ['All Mediums', 'Digital Painting', '3D Render', 'Generative Art', 'Vector Art', 'Digital Collage'];
const sortOptions = [
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'recent', label: 'Recently Added', icon: Clock },
  { value: 'price-low', label: 'Price: Low to High', icon: null },
  { value: 'price-high', label: 'Price: High to Low', icon: null },
  { value: 'popular', label: 'Most Popular', icon: Users },
  { value: 'auctions', label: 'Live Auctions', icon: Flame }
];

export default function SearchDiscovery({
  onSearch,
  onFilterChange,
  trendingSearches = ['Sacred Buffalo', 'Dreamcatcher', 'Thunderbird', 'Medicine Wheel', 'Totem Pole'],
}: SearchDiscoveryProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNation, setSelectedNation] = useState('All Nations');
  const [selectedStyle, setSelectedStyle] = useState('All Styles');
  const [selectedMedium, setSelectedMedium] = useState('All Mediums');
  const [sortBy, setSortBy] = useState('trending');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const activeFiltersPayload: FilterState = {
    nation: selectedNation,
    style: selectedStyle,
    medium: selectedMedium,
    sortBy,
    priceRange,
  };

  useEffect(() => {
    onFilterChange(activeFiltersPayload);
  }, [selectedNation, selectedStyle, selectedMedium, sortBy, priceRange, onFilterChange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearFilters = () => {
    setSelectedNation('All Nations');
    setSelectedStyle('All Styles');
    setSelectedMedium('All Mediums');
    setPriceRange({ min: '', max: '' });
    setSortBy('trending');
  };

  const hasActiveFilters = selectedNation !== 'All Nations' ||
    selectedStyle !== 'All Styles' ||
    selectedMedium !== 'All Mediums' ||
    priceRange.min || priceRange.max;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artworks, artists, collections..."
          className="w-full bg-[#141414] border border-[#d4af37]/30 rounded-xl pl-12 pr-32 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-[#d4af37] text-black'
              : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-black/20 rounded-full text-xs flex items-center justify-center font-bold">
              {[selectedNation, selectedStyle, selectedMedium].filter(f => !f.startsWith('All')).length + (priceRange.min || priceRange.max ? 1 : 0)}
            </span>
          )}
        </button>
      </form>

      {!query && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-400 text-sm">Trending:</span>
          {trendingSearches.map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-3 py-1 bg-[#141414] text-gray-300 text-sm rounded-full hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {showFilters && (
        <div className="p-4 bg-[#141414] rounded-xl border border-[#d4af37]/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-[#DC143C] hover:underline">Clear All</button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Nation/Tribe</label>
              <select value={selectedNation} onChange={(e) => setSelectedNation(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]">
                {nations.map(nation => <option key={nation} value={nation}>{nation}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Artistic Style</label>
              <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]">
                {styles.map(style => <option key={style} value={style}>{style}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Medium</label>
              <select value={selectedMedium} onChange={(e) => setSelectedMedium(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]">
                {mediums.map(medium => <option key={medium} value={medium}>{medium}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Price Range (INDI)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  placeholder="Min"
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  placeholder="Max"
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#141414] border border-[#d4af37]/30 rounded-lg pl-3 pr-10 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedNation !== 'All Nations' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">
              {selectedNation}
              <button onClick={() => setSelectedNation('All Nations')}>
                <X size={12} />
              </button>
            </span>
          )}
          {selectedStyle !== 'All Styles' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">
              {selectedStyle}
              <button onClick={() => setSelectedStyle('All Styles')}>
                <X size={12} />
              </button>
            </span>
          )}
          {selectedMedium !== 'All Mediums' && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full">
              {selectedMedium}
              <button onClick={() => setSelectedMedium('All Mediums')}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
