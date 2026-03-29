'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Sparkles, Clock, TrendingUp, MapPin, Tag } from 'lucide-react';
import { PHYSICAL_MARKETPLACE_CATEGORIES } from '@/app/physical-items/data/pillar2Catalog';

interface SearchFilters {
  nation: string;
  category: string;
  material: string;
  priceMin: string;
  priceMax: string;
  sortBy: string;
  verifiedOnly: boolean;
  handmadeOnly: boolean;
  inStockOnly: boolean;
  shipsIntl: boolean;
}

interface PhysicalSearchDiscoveryProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
}

const NATIONS = ['All Nations', 'Navajo', 'Lakota', 'Ojibwe', 'Cherokee', 'Haida', 'Inuit', 'Métis', 'Coast Salish', 'Haudenosaunee', 'Blackfoot', 'Zuni'];
const CATEGORIES = ['All Categories', ...PHYSICAL_MARKETPLACE_CATEGORIES.filter((category) => category.id !== 'all').map((category) => category.label)];
const MATERIALS = ['All Materials', 'Silver', 'Turquoise', 'Cedar', 'Soapstone', 'Moose Hide', 'Wool', 'Birchbark', 'Copper'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

const TRENDING_SEARCHES = ['beadwork bracelet', 'soapstone carving', 'regalia fan', 'silver pendant', 'dream catcher'];
const RECENT_SEARCHES = ['Navajo weaving', 'cedar spirit carving', 'moccasins'];

const defaultFilters: SearchFilters = {
  nation: 'All Nations',
  category: 'All Categories',
  material: 'All Materials',
  priceMin: '',
  priceMax: '',
  sortBy: 'popular',
  verifiedOnly: false,
  handmadeOnly: false,
  inStockOnly: false,
  shipsIntl: false,
};

export default function PhysicalSearchDiscovery({ onSearch, onFilterChange }: PhysicalSearchDiscoveryProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeFilterCount = [
    filters.nation !== 'All Nations',
    filters.category !== 'All Categories',
    filters.material !== 'All Materials',
    filters.priceMin !== '',
    filters.priceMax !== '',
    filters.verifiedOnly,
    filters.handmadeOnly,
    filters.inStockOnly,
    filters.shipsIntl,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const clearAll = () => {
    setQuery('');
    setFilters(defaultFilters);
    onSearch('');
    onFilterChange(defaultFilters);
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    setShowSuggestions(false);
    onSearch(q);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('.search-container')?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-[#d4af37]/10">
        <div className="search-container relative">
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-xl px-4 py-2.5 focus-within:border-[#d4af37] transition-colors">
            <Search size={16} className="text-gray-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search items, makers, nations, materials..."
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(''); onSearch(''); }} className="text-gray-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && !query && (
            <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#1a1a1a] border border-[#d4af37]/20 rounded-xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                  <Clock size={11} />
                  Recent searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {RECENT_SEARCHES.map((s) => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="px-2.5 py-1 bg-white/5 text-gray-400 text-xs rounded-full hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                  <TrendingUp size={11} />
                  Trending searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((s) => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="px-2.5 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-full hover:bg-[#d4af37]/20 transition-colors flex items-center gap-1">
                      <Sparkles size={9} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter toggle row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick toggle pills */}
            {[
              { key: 'verifiedOnly' as const, label: 'Verified' },
              { key: 'handmadeOnly' as const, label: 'Handmade' },
              { key: 'inStockOnly' as const, label: 'In Stock' },
              { key: 'shipsIntl' as const, label: 'Ships Intl' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateFilter(key, !filters[key])}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  filters[key]
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                    : 'bg-transparent border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-gray-500 text-xs hover:text-[#d4af37] transition-colors flex items-center gap-1">
                <X size={10} /> Clear all
              </button>
            )}
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                  : 'bg-transparent border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={12} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-[#d4af37] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-white/5">
          {/* Nation */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 block">
              <MapPin size={10} /> Nation
            </label>
            <select
              value={filters.nation}
              onChange={(e) => updateFilter('nation', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              {NATIONS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 block">
              <Tag size={10} /> Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Material</label>
            <select
              value={filters.material}
              onChange={(e) => updateFilter('material', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              {MATERIALS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Price (INDI)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilter('priceMin', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
              <span className="text-gray-600 text-xs">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilter('priceMax', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Sort By</label>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter('sortBy', opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.sortBy === opt.value
                      ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                      : 'bg-[#0a0a0a] text-gray-400 border border-white/5 hover:text-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap bg-[#0a0a0a]">
          <span className="text-gray-600 text-xs">Active:</span>
          {filters.nation !== 'All Nations' && (
            <Chip label={filters.nation} onRemove={() => updateFilter('nation', 'All Nations')} />
          )}
          {filters.category !== 'All Categories' && (
            <Chip label={filters.category} onRemove={() => updateFilter('category', 'All Categories')} />
          )}
          {filters.material !== 'All Materials' && (
            <Chip label={filters.material} onRemove={() => updateFilter('material', 'All Materials')} />
          )}
          {(filters.priceMin || filters.priceMax) && (
            <Chip
              label={`${filters.priceMin || '0'} – ${filters.priceMax || '∞'} INDI`}
              onRemove={() => { updateFilter('priceMin', ''); updateFilter('priceMax', ''); }}
            />
          )}
          {filters.verifiedOnly && <Chip label="Verified" onRemove={() => updateFilter('verifiedOnly', false)} />}
          {filters.handmadeOnly && <Chip label="Handmade" onRemove={() => updateFilter('handmadeOnly', false)} />}
          {filters.inStockOnly && <Chip label="In Stock" onRemove={() => updateFilter('inStockOnly', false)} />}
          {filters.shipsIntl && <Chip label="Ships Intl" onRemove={() => updateFilter('shipsIntl', false)} />}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors"><X size={10} /></button>
    </span>
  );
}



