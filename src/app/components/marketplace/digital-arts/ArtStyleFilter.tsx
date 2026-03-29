'use client';

import { Globe, Palette, Brush, X } from 'lucide-react';

interface ArtStyleFilterProps {
  activeFilters: {
    nation: string;
    style: string;
    medium: string;
    priceRange: string;
  };
  onFilterChange: (filters: any) => void;
}

const nations = ['All Nations', 'Lakota', 'Navajo', 'Haida', 'Cree', 'Ojibwe', 'Hopi', 'Anishinaabe', 'Cherokee', 'Inuit', 'Māori'];
const styles = ['All Styles', 'Spiritual', 'Geometric', 'Formline', 'Symbolic', 'Traditional', 'Ceremonial', 'Storytelling', 'Abstract'];
const mediums = ['All Mediums', 'Digital Painting', 'Generative Art', '3D Render', 'Digital Collage', 'Vector Art', 'Illustration', 'Animation'];

export default function ArtStyleFilter({ activeFilters, onFilterChange }: ArtStyleFilterProps) {
  const hasActiveFilters = activeFilters.nation || activeFilters.style || activeFilters.medium;

  const clearFilters = () => {
    onFilterChange({ nation: '', style: '', medium: '', priceRange: '' });
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Globe size={18} className="text-[#d4af37]" />
          Cultural Discovery
        </h3>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-gray-400 hover:text-[#DC143C] text-sm transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nation Filter */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Globe size={12} />
            Nation / Tribe
          </label>
          <div className="flex flex-wrap gap-2">
            {nations.map((nation) => (
              <button
                key={nation}
                onClick={() => onFilterChange({ ...activeFilters, nation: nation === 'All Nations' ? '' : nation })}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  (nation === 'All Nations' && !activeFilters.nation) || activeFilters.nation === nation
                    ? 'bg-[#d4af37] text-black font-medium'
                    : 'bg-[#0a0a0a] text-gray-400 hover:text-white border border-[#d4af37]/20'
                }`}
              >
                {nation}
              </button>
            ))}
          </div>
        </div>

        {/* Style Filter */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Palette size={12} />
            Artistic Style
          </label>
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => onFilterChange({ ...activeFilters, style: style === 'All Styles' ? '' : style })}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  (style === 'All Styles' && !activeFilters.style) || activeFilters.style === style
                    ? 'bg-[#DC143C] text-white font-medium'
                    : 'bg-[#0a0a0a] text-gray-400 hover:text-white border border-[#DC143C]/20'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Medium Filter */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Brush size={12} />
            Medium
          </label>
          <div className="flex flex-wrap gap-2">
            {mediums.map((medium) => (
              <button
                key={medium}
                onClick={() => onFilterChange({ ...activeFilters, medium: medium === 'All Mediums' ? '' : medium })}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  (medium === 'All Mediums' && !activeFilters.medium) || activeFilters.medium === medium
                    ? 'bg-[#0a0a0a] text-[#d4af37] font-medium border border-[#d4af37]'
                    : 'bg-[#0a0a0a] text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {medium}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
