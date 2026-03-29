'use client';

import { Building2, ExternalLink, Zap } from 'lucide-react';

const partners = [
  {
    id: '1',
    name: 'Indigenous Business Network',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&h=80&fit=crop',
    description: 'Consulting & advisory services',
    services: 45,
    verified: true
  },
  {
    id: '2',
    name: 'First Nations Design Co-op',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop',
    description: 'Design & branding collective',
    services: 28,
    verified: true
  },
  {
    id: '3',
    name: 'Tribal Tech Solutions',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop',
    description: 'Technology services',
    services: 67,
    verified: true
  },
  {
    id: '4',
    name: 'Native Language Institute',
    logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=80&h=80&fit=crop',
    description: 'Translation & preservation',
    services: 34,
    verified: true
  }
];

export default function SkillHubPartners() {
  return (
    <div className="bg-[#141414] border border-[#d4af37]/20 rounded-2xl p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Zap size={10} className="text-[#d4af37]" />
            <span className="text-[#d4af37] text-xs font-medium">SKILL HUB PARTNERS • $150/wk</span>
          </div>
          <h2 className="text-white text-xl font-bold">Partner Organizations</h2>
          <p className="text-gray-400 text-sm">Verified Indigenous professional networks</p>
        </div>
        <a
          href="#"
          className="flex items-center gap-1 px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/20 transition-colors text-sm"
        >
          Become a Partner
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Partners grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-[#0f0f0f] border border-white/5 rounded-xl p-4 hover:border-[#d4af37]/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3 mb-3">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm group-hover:text-[#d4af37] transition-colors">
                  {partner.name}
                </h3>
                {partner.verified && (
                  <span className="flex items-center gap-1 text-[#d4af37] text-xs">
                    <Building2 size={10} />
                    Verified Organization
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-2">{partner.description}</p>
            <p className="text-gray-500 text-xs">{partner.services} services available</p>
          </div>
        ))}
      </div>
    </div>
  );
}
