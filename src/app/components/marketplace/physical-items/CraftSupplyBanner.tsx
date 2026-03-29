'use client';

import { ExternalLink, Package, Brush, Scissors } from 'lucide-react';

const supplyPartners = [
  {
    id: '1',
    name: 'IndigenousCraft Supply',
    logo: 'IS',
    tagline: 'Ethically sourced raw materials: sinew, natural dyes, deer hide, and cedar slabs delivered to any hub.',
    discount: '15% off first order',
    badge: 'Craft Supplier',
    icon: Scissors,
    href: '/partners/indigenouscraftsupply',
    color: 'from-amber-900/30 to-transparent'
  },
  {
    id: '2',
    name: 'ArtPack Indigenous',
    logo: 'AP',
    tagline: 'Professional packaging and display kits designed for cultural goods, with story card inserts and QR labels.',
    discount: 'Free samples for verified makers',
    badge: 'Packaging',
    icon: Package,
    href: '/partners/artpack',
    color: 'from-indigo-900/30 to-transparent'
  },
  {
    id: '3',
    name: 'NativeToolworks',
    logo: 'NT',
    tagline: 'Traditional and modern tools for beadwork, carving, pottery, and weaving.',
    discount: '10% INDI token cashback',
    badge: 'Toolmaker',
    icon: Brush,
    href: '/partners/nativetoolworks',
    color: 'from-emerald-900/30 to-transparent'
  }
];

export default function CraftSupplyBanner() {
  return (
    <div className="mb-8 mt-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-semibold text-[#d4af37]">Craft Supply Partners</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {supplyPartners.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.id}
              href={p.href}
              className={`group relative overflow-hidden rounded-2xl border border-[#d4af37]/15 bg-[#141414] bg-gradient-to-br ${p.color} p-4 transition-all hover:border-[#d4af37]/50`}
            >
              <div className="absolute inset-0 -z-10 bg-[#141414]" />

              <div className="mb-3 flex items-start gap-3">
                <span className="text-sm font-semibold text-[#d4af37]">{p.logo}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <span className="rounded border border-[#d4af37]/20 bg-[#d4af37]/15 px-1.5 py-0.5 text-[10px] text-[#d4af37]">
                      {p.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-green-400">{p.discount}</p>
                </div>
                <Icon size={14} className="ml-auto mt-0.5 flex-shrink-0 text-gray-600 transition-colors group-hover:text-[#d4af37]" />
              </div>

              <p className="mb-3 line-clamp-2 text-xs text-gray-400">{p.tagline}</p>

              <div className="flex items-center gap-1.5 text-xs font-medium text-[#d4af37] transition-all group-hover:gap-2.5">
                <ExternalLink size={11} />
                Shop now
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
