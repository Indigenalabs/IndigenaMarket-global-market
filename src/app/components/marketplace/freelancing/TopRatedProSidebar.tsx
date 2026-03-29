'use client';

import { Star, BadgeCheck, MessageCircle, Zap } from 'lucide-react';

const topPros = [
  {
    id: '1',
    name: 'Grandfather William Crow',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    nation: 'Crow',
    title: 'Traditional Ceremony Guidance',
    rating: 5.0,
    reviews: 28,
    verification: 'Platinum',
    jobs: 156,
    responseTime: '< 6h'
  },
  {
    id: '2',
    name: 'Rose Many Feathers',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    nation: 'Haudenosaunee',
    title: 'Custom Regalia & Ceremonial Items',
    rating: 4.9,
    reviews: 67,
    verification: 'Gold',
    jobs: 45,
    responseTime: '< 12h'
  },
  {
    id: '3',
    name: 'Dr. Sarah Whitehorse',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    nation: 'Lakota',
    title: 'Cultural Consulting',
    rating: 4.9,
    reviews: 47,
    verification: 'Platinum',
    jobs: 32,
    responseTime: '< 2h'
  }
];

const verificationColors: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2'
};

export default function TopRatedProSidebar() {
  return (
    <div className="sticky top-4">
      {/* Premium badge */}
      <div className="flex items-center gap-1 mb-3 px-1">
        <Zap size={10} className="text-[#d4af37]" />
        <span className="text-[#d4af37] text-xs font-medium">TOP-RATED PROS • $250/wk</span>
      </div>

      <div className="space-y-3">
        {topPros.map((pro, idx) => (
          <div
            key={pro.id}
            className="bg-[#141414] border border-[#d4af37]/20 rounded-xl p-4 hover:border-[#d4af37]/50 transition-all cursor-pointer group"
          >
            {/* Rank badge */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center text-black text-xs font-bold">
                  #{idx + 1}
                </div>
                <div
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: verificationColors[pro.verification], color: 'black' }}
                >
                  {pro.verification}
                </div>
              </div>
              <BadgeCheck size={14} style={{ color: verificationColors[pro.verification] }} />
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 mb-2">
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-10 h-10 rounded-full object-cover border-2"
                style={{ borderColor: verificationColors[pro.verification] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-[#d4af37] transition-colors">
                  {pro.name}
                </p>
                <p className="text-gray-500 text-xs">{pro.nation} Nation</p>
              </div>
            </div>

            {/* Service */}
            <p className="text-gray-300 text-xs mb-2 line-clamp-1">{pro.title}</p>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Star size={10} className="text-[#d4af37] fill-[#d4af37]" />
                <span className="text-white">{pro.rating}</span>
                <span>({pro.reviews})</span>
              </span>
              <span>{pro.jobs} jobs</span>
              <span>{pro.responseTime}</span>
            </div>

            {/* CTA */}
            <button className="w-full py-2 bg-[#d4af37]/10 text-[#d4af37] text-xs font-medium rounded-lg hover:bg-[#d4af37]/20 transition-colors flex items-center justify-center gap-1">
              <MessageCircle size={12} />
              Contact
            </button>
          </div>
        ))}
      </div>

      {/* View all link */}
      <button className="w-full mt-3 py-2 text-[#d4af37] text-sm hover:underline">
        View all top pros →
      </button>
    </div>
  );
}
