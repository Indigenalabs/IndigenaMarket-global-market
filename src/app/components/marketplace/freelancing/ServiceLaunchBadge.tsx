'use client';

import { Sparkles, Zap } from 'lucide-react';

const newServices = [
  {
    id: '1',
    title: 'Traditional Birch Bark Biting Art',
    freelancer: 'Maya Wabano',
    nation: 'Ojibwe',
    price: 85,
    category: 'Craftsmanship',
    isNew: true
  },
  {
    id: '2',
    title: 'Inuktitut Translation Services',
    freelancer: 'Nanuq Tatannuq',
    nation: 'Inuit',
    price: 45,
    category: 'Translation',
    isNew: true
  },
  {
    id: '3',
    title: 'Indigenous Food Consulting',
    freelancer: 'Chef Maria Running Wolf',
    nation: 'Cheyenne',
    price: 120,
    category: 'Consulting',
    isNew: true
  }
];

export default function ServiceLaunchBadge() {
  return (
    <div className="bg-gradient-to-r from-[#DC143C]/10 via-[#141414] to-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl p-4 mb-6">
      {/* Premium badge */}
      <div className="flex items-center gap-1 mb-3">
        <Zap size={10} className="text-[#DC143C]" />
        <span className="text-[#DC143C] text-xs font-medium">SERVICE LAUNCH BADGE • $75/launch</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-[#d4af37]" />
        <h3 className="text-white font-medium">New Services This Week</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {newServices.map((service) => (
          <div
            key={service.id}
            className="flex-shrink-0 bg-[#0f0f0f] border border-[#d4af37]/30 rounded-lg p-3 hover:border-[#d4af37] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1.5 py-0.5 bg-[#DC143C] text-white text-[10px] font-bold rounded">
                NEW
              </span>
              <span className="px-1.5 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-[10px] rounded">
                {service.category}
              </span>
            </div>
            <p className="text-white text-sm font-medium mb-1 group-hover:text-[#d4af37] transition-colors">
              {service.title}
            </p>
            <p className="text-gray-500 text-xs mb-1">
              {service.freelancer} • {service.nation}
            </p>
            <p className="text-[#d4af37] text-sm font-bold">From ${service.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
