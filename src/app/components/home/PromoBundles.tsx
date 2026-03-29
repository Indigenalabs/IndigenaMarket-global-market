'use client';

import { useRouter } from 'next/navigation';
import { Zap, Star, Crown, Check, Mail, Layout, TrendingUp } from 'lucide-react';
import {
  PlacementSectionHeader,
  placementPrimaryButtonClass,
  placementSecondaryButtonClass,
  placementStatusPillClass
} from '@/app/components/placements/PremiumPlacement';

const bundles = [
  {
    id: 'starter',
    name: 'Starter Promo',
    price: 14.99,
    period: 'month',
    savings: '20%',
    icon: <Zap size={24} />,
    color: 'blue',
    includes: ['Creator Tier membership', '1 Featured Listing (Digital Arts)', 'Basic analytics'],
    bestFor: 'New artists testing the platform'
  },
  {
    id: 'growing',
    name: 'Growing Artist',
    price: 29.99,
    period: 'month',
    savings: '25%',
    icon: <Star size={24} />,
    color: 'gold',
    highlighted: true,
    includes: ['Creator Tier membership', '2 Featured Listings', '1 Newsletter feature', 'Priority support', 'Advanced analytics'],
    bestFor: 'Artists building their audience'
  },
  {
    id: 'master',
    name: 'Master Artist',
    price: 99,
    period: 'month',
    savings: '30%',
    icon: <Crown size={24} />,
    color: 'purple',
    includes: ['Creator Tier membership', 'Hero Section placement', '4 Featured Listings', 'Monthly Newsletter feature', 'Dedicated account manager', 'Custom marketing support'],
    bestFor: 'Established artists maximizing reach'
  }
];

export default function PromoBundles() {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-b from-[#0a0a0a] to-[#141414] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mx-auto max-w-2xl">
            <PlacementSectionHeader
              icon={TrendingUp}
              title="Promotion Bundles"
              description="Membership and placement-booking bundles for creators who want a cleaner path into premium inventory."
              meta="Booking bundles"
            />
            <p className="mt-3 text-sm text-gray-400">Save up to 30% compared to buying placements separately.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                bundle.highlighted
                  ? 'border-2 border-[#d4af37] bg-gradient-to-b from-[#d4af37]/20 to-[#141414]'
                  : 'border border-[#d4af37]/10 bg-[#141414] hover:border-[#d4af37]/30'
              }`}
            >
              <div className="absolute -top-3 right-4 rounded-full bg-[#DC143C] px-3 py-1 text-xs font-bold text-white">
                Save {bundle.savings}
              </div>

              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
                  bundle.color === 'blue'
                    ? 'bg-blue-500/20 text-blue-400'
                    : bundle.color === 'gold'
                      ? 'bg-[#d4af37]/20 text-[#d4af37]'
                      : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                {bundle.icon}
              </div>

              <h3 className="mb-1 text-xl font-bold text-white">{bundle.name}</h3>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#d4af37]">${bundle.price}</span>
                <span className="text-gray-400">/{bundle.period}</span>
              </div>

              <p className="mb-4 text-sm italic text-gray-500">&ldquo;{bundle.bestFor}&rdquo;</p>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className={placementStatusPillClass}>Bundle booking lane</span>
                <span className={placementStatusPillClass}>Placement credits included</span>
              </div>

              <div className="mb-6">
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-gray-400">Includes</p>
                <ul className="space-y-2">
                  {bundle.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 flex-shrink-0 text-[#d4af37]" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/advertising?bundle=${bundle.id}`)}
                className={`w-full py-3 text-sm font-semibold ${bundle.highlighted ? placementPrimaryButtonClass : placementSecondaryButtonClass}`}
              >
                Choose {bundle.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 text-center md:grid-cols-3">
          <div className="p-4">
            <Layout className="mx-auto mb-2 h-8 w-8 text-[#d4af37]" />
            <p className="font-semibold text-white">Featured placement</p>
            <p className="text-sm text-gray-400">Get seen first</p>
          </div>
          <div className="p-4">
            <Mail className="mx-auto mb-2 h-8 w-8 text-[#d4af37]" />
            <p className="font-semibold text-white">Newsletter feature</p>
            <p className="text-sm text-gray-400">Reach your audience directly</p>
          </div>
          <div className="p-4">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-[#d4af37]" />
            <p className="font-semibold text-white">Hero visibility</p>
            <p className="text-sm text-gray-400">Run a premium launch week</p>
          </div>
        </div>
      </div>
    </section>
  );
}
