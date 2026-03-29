'use client';

import { useState } from 'react';
import { Check, ChevronDown, Palette, Ruler, Package, AlertCircle } from 'lucide-react';

export interface Variant {
  id: string;
  type: 'size' | 'color' | 'material' | 'finish';
  label: string;
  value: string;
  priceAdjust?: number;  // + or - from base price
  inStock: boolean;
  stockCount?: number;
}

interface VariantGroup {
  type: Variant['type'];
  label: string;
  variants: Variant[];
}

interface VariantSelectorProps {
  groups: VariantGroup[];
  currency: string;
  onSelectionChange: (selected: Record<string, Variant>) => void;
}

const TYPE_ICONS: Record<Variant['type'], React.ReactNode> = {
  size: <Ruler size={13} className="text-[#d4af37]" />,
  color: <Palette size={13} className="text-[#d4af37]" />,
  material: <Package size={13} className="text-[#d4af37]" />,
  finish: <Check size={13} className="text-[#d4af37]" />,
};

// Colour swatch map for known colours
const COLOR_MAP: Record<string, string> = {
  turquoise: '#30D5C8',
  red: '#DC143C',
  blue: '#1E90FF',
  green: '#228B22',
  black: '#1a1a1a',
  white: '#f5f5f5',
  brown: '#8B4513',
  tan: '#D2B48C',
  gold: '#d4af37',
  silver: '#C0C0C0',
  coral: '#FF6B6B',
  purple: '#8B008B',
  orange: '#FF8C00',
  yellow: '#FFD700',
  natural: '#C4A265',
};

function ColorSwatch({ color }: { color: string }) {
  const hex = COLOR_MAP[color.toLowerCase()] ?? '#555';
  return (
    <span
      className="w-4 h-4 rounded-full border border-white/20 inline-block flex-shrink-0"
      style={{ backgroundColor: hex }}
    />
  );
}

export default function VariantSelector({ groups, currency, onSelectionChange }: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, Variant>>({});

  const handleSelect = (groupType: string, variant: Variant) => {
    if (!variant.inStock) return;
    const next = { ...selected, [groupType]: variant };
    setSelected(next);
    onSelectionChange(next);
  };

  const totalAdjust = Object.values(selected).reduce(
    (sum, v) => sum + (v.priceAdjust ?? 0),
    0
  );

  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.type}>
          <div className="flex items-center gap-1.5 mb-2">
            {TYPE_ICONS[group.type]}
            <span className="text-white text-sm font-medium">{group.label}</span>
            {selected[group.type] && (
              <span className="ml-auto text-gray-400 text-xs">{selected[group.type].label}</span>
            )}
          </div>

          {/* Colour type: show swatches */}
          {group.type === 'color' ? (
            <div className="flex flex-wrap gap-2">
              {group.variants.map((v) => {
                const isSelected = selected[group.type]?.id === v.id;
                return (
                  <button
                    key={v.id}
                    title={v.label}
                    onClick={() => handleSelect(group.type, v)}
                    disabled={!v.inStock}
                    className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                      !v.inStock ? 'opacity-30 cursor-not-allowed' :
                      isSelected ? 'border-[#d4af37] scale-110' : 'border-transparent hover:border-white/40'
                    }`}
                    style={{ backgroundColor: COLOR_MAP[v.value.toLowerCase()] ?? '#555' }}
                  >
                    {isSelected && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          ) : group.type === 'size' && group.variants.length > 5 ? (
            /* Size with many options: dropdown */
            <div className="relative">
              <select
                value={selected[group.type]?.id ?? ''}
                onChange={(e) => {
                  const v = group.variants.find((x) => x.id === e.target.value);
                  if (v) handleSelect(group.type, v);
                }}
                className="w-full appearance-none bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
              >
                <option value="">Select {group.label}</option>
                {group.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.inStock}>
                    {v.label}{!v.inStock ? ' — Out of stock' : ''}{v.priceAdjust ? ` (+${v.priceAdjust} ${currency})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          ) : (
            /* Pill buttons */
            <div className="flex flex-wrap gap-2">
              {group.variants.map((v) => {
                const isSelected = selected[group.type]?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelect(group.type, v)}
                    disabled={!v.inStock}
                    className={`relative px-3 py-1.5 rounded-lg text-sm border transition-all flex items-center gap-1.5 ${
                      !v.inStock
                        ? 'opacity-30 cursor-not-allowed bg-white/5 border-white/10 text-gray-500 line-through'
                        : isSelected
                        ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#d4af37]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {group.type === 'color' && <ColorSwatch color={v.value} />}
                    {v.label}
                    {v.priceAdjust && v.priceAdjust !== 0 && (
                      <span className="text-xs opacity-70">
                        {v.priceAdjust > 0 ? `+${v.priceAdjust}` : v.priceAdjust}
                      </span>
                    )}
                    {isSelected && <Check size={12} className="ml-0.5" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Low stock warning */}
          {selected[group.type] && selected[group.type].stockCount !== undefined && selected[group.type].stockCount! <= 3 && (
            <div className="flex items-center gap-1 mt-1.5">
              <AlertCircle size={11} className="text-amber-400" />
              <span className="text-amber-400 text-xs">Only {selected[group.type].stockCount} left in this variant</span>
            </div>
          )}
        </div>
      ))}

      {/* Price adjustment summary */}
      {totalAdjust !== 0 && (
        <div className="flex items-center justify-between text-sm pt-1 border-t border-white/10">
          <span className="text-gray-400">Variant adjustment</span>
          <span className={totalAdjust > 0 ? 'text-amber-400 font-medium' : 'text-green-400 font-medium'}>
            {totalAdjust > 0 ? '+' : ''}{totalAdjust} {currency}
          </span>
        </div>
      )}
    </div>
  );
}
