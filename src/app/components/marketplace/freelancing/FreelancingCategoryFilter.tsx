'use client';

interface Category {
  id: string;
  name: string;
  emoji: string;
  count?: number;
}

const categories: Category[] = [
  { id: 'all', name: 'All Services', emoji: '🪶' },
  { id: 'consulting', name: 'Consulting', emoji: '🪶', count: 124 },
  { id: 'design', name: 'Design', emoji: '🧵', count: 89 },
  { id: 'translation', name: 'Translation', emoji: '🗣️', count: 67 },
  { id: 'cultural-guidance', name: 'Cultural Guidance', emoji: '🔥', count: 45 },
  { id: 'craftsmanship', name: 'Craftsmanship', emoji: '🪵', count: 78 },
  { id: 'tech', name: 'Tech', emoji: '🧭', count: 156 },
  { id: 'marketing', name: 'Marketing', emoji: '📯', count: 92 },
];

interface FreelancingCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function FreelancingCategoryFilter({ activeCategory, onCategoryChange }: FreelancingCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === category.id
              ? 'bg-[#d4af37] text-black'
              : 'bg-[#141414] text-gray-300 border border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:text-white'
          }`}
        >
          <span>{category.emoji}</span>
          <span>{category.name}</span>
          {category.count && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeCategory === category.id ? 'bg-black/20 text-black' : 'bg-[#d4af37]/20 text-[#d4af37]'
            }`}>
              {category.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
