'use client';

import { Truck, Globe2, ShieldCheck, Zap } from 'lucide-react';

const partners = [
  {
    id: '1',
    name: 'NativeShip Pro',
    logo: '📦',
    tagline: 'Free domestic shipping on orders over 150 INDI',
    badge: 'Logistics Partner',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Truck,
    cta: 'Activate Deal',
    ctaHref: '/hub-partners/nativeship',
  },
  {
    id: '2',
    name: 'FedEx Indigenous',
    logo: '✈️',
    tagline: 'Certified international customs clearance for cultural goods',
    badge: 'International',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Globe2,
    cta: 'Learn More',
    ctaHref: '/hub-partners/fedex',
  },
  {
    id: '3',
    name: 'CraftInsure',
    logo: '🛡️',
    tagline: 'Transit insurance for high-value handcrafted items up to $5,000',
    badge: 'Insurance',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: ShieldCheck,
    cta: 'Get Covered',
    ctaHref: '/hub-partners/craftinsure',
  },
  {
    id: '4',
    name: 'HubExpress',
    logo: '⚡',
    tagline: '2-day hub-to-hub express relay for time-sensitive orders',
    badge: 'Express',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: Zap,
    cta: 'Book Now',
    ctaHref: '/hub-partners/hubexpress',
  },
];

export default function HubPartnerStrip() {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-[#d4af37] font-semibold">Hub Partners</span>
        </div>
      </div>

      {/* Partner cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {partners.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.id}
              href={p.ctaHref}
              className="group flex flex-col gap-2 p-3 bg-[#141414] border border-[#d4af37]/15 rounded-xl hover:border-[#d4af37]/40 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.logo}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                  <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <Icon size={14} className="ml-auto text-gray-600 group-hover:text-[#d4af37] transition-colors flex-shrink-0" />
              </div>
              <p className="text-gray-400 text-xs line-clamp-2">{p.tagline}</p>
              <span className="text-[#d4af37] text-xs font-medium group-hover:underline">{p.cta} →</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

