'use client';

import { Star, Package, ArrowRight, Sparkles, Percent, Clock, Crown } from 'lucide-react';
import Link from 'next/link';
import { BookOpen, Users, Check } from 'lucide-react';

interface BundlePromotionsProps {
  pillar?: string;
}

const promotedBundles = [
  {
    id: 'bundle-promo-1',
    title: 'Complete Indigenous Arts Mastery',
    subtitle: 'Ultimate Learning Bundle',
    description: 'Master weaving, pottery, beadwork, and leatherwork with certified master artisans.',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=400&fit=crop',
    courses: 12,
    totalLessons: 480,
    duration: '24 months access',
    students: 3421,
    rating: 4.9,
    reviews: 567,
    price: 1499,
    originalPrice: 2999,
    currency: 'INDI',
    savings: '50%',
    verification: 'Platinum',
    sponsor: 'Heritage Arts Foundation',
    features: [
      '12 comprehensive courses',
      'Certificate of Mastery',
      '1-on-1 mentorship sessions',
      'Lifetime community access',
      'Exclusive materials kit'
    ],
    badge: 'Best Seller',
    promotionDaysLeft: 10
  },
  {
    id: 'bundle-promo-2',
    title: 'Language Preservation Pro',
    subtitle: 'Multi-Language Bundle',
    description: 'Learn Navajo, Lakota, Cherokee, and MÄori with native speakers.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
    courses: 8,
    totalLessons: 320,
    duration: '18 months access',
    students: 2156,
    rating: 4.8,
    reviews: 389,
    price: 999,
    originalPrice: 1799,
    currency: 'INDI',
    savings: '44%',
    verification: 'Gold',
    sponsor: 'Tribal Education Initiative',
    features: [
      '8 language courses',
      'Native speaker instruction',
      'Conversation practice',
      'Cultural context modules',
      'Mobile app access'
    ],
    badge: 'Trending',
    promotionDaysLeft: 7
  },
  {
    id: 'bundle-promo-3',
    title: 'Indigenous Entrepreneurship Accelerator',
    subtitle: 'Business Success Bundle',
    description: 'Everything you need to launch and grow your Indigenous-owned business.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',
    courses: 6,
    totalLessons: 240,
    duration: '12 months access',
    students: 892,
    rating: 4.9,
    reviews: 234,
    price: 799,
    originalPrice: 1299,
    currency: 'INDI',
    savings: '38%',
    verification: 'Platinum',
    sponsor: 'Native Enterprise Alliance',
    features: [
      '6 business courses',
      'Mentorship program',
      'Funding connections',
      'Marketing toolkit',
      'Networking events'
    ],
    badge: 'Career Boost',
    promotionDaysLeft: 14
  }
];

export default function BundlePromotions({ pillar = 'courses' }: BundlePromotionsProps) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Package size={16} className="text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Featured Bundles
            </h3>
            <p className="text-xs text-gray-400">Curated learning paths with exclusive savings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] font-medium text-[#d4af37]/80">
            Sponsored bundle lane
          </span>
          <Link 
            href="/courses/bundles"
            className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
          >
            All Bundles
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Bundle Cards */}
      <div className="space-y-4">
        {promotedBundles.map((bundle) => (
          <div 
            key={bundle.id}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/40 hover:border-[#d4af37] transition-all hover:shadow-lg hover:shadow-[#d4af37]/20 relative"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="relative lg:w-80 flex-shrink-0 overflow-hidden">
                <img 
                  src={bundle.image}
                  alt={bundle.title}
                  className="w-full h-48 lg:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141414]/80 hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent lg:hidden" />

                <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/35 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
                    <Crown size={10} />
                    Featured bundle
                  </div>
                  <div className="rounded-full bg-[#0a0a0a]/80 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                    {bundle.promotionDaysLeft} days left
                  </div>
                </div>

                <div className="absolute left-3 top-12 flex flex-col gap-2">
                  <div className="px-2 py-1 bg-[#d4af37] text-black text-xs font-bold rounded flex items-center gap-1">
                    <Sparkles size={10} />
                    {bundle.badge}
                  </div>
                  <div className="px-2 py-1 bg-[#DC143C] text-white text-xs font-bold rounded flex items-center gap-1">
                    <Percent size={10} />
                    Save {bundle.savings}
                  </div>
                </div>

                {/* Verification */}
                <div className="absolute bottom-3 left-3 rounded-full bg-[#d4af37]/20 px-2.5 py-1 text-xs font-medium text-[#d4af37] backdrop-blur-sm border border-[#d4af37]/40">
                  {bundle.verification}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-5">
                {/* Sponsor */}
                <p className="text-xs text-[#d4af37]/70 mb-2">
                  Featured by {bundle.sponsor}
                </p>

                {/* Title & Subtitle */}
                <p className="text-sm text-[#d4af37] mb-1">{bundle.subtitle}</p>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                  {bundle.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{bundle.description}</p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Package size={14} />
                    {bundle.courses} courses
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {bundle.totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {bundle.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {bundle.students.toLocaleString()}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
                    <span className="text-white font-medium">{bundle.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({bundle.reviews} reviews)</span>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {bundle.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={14} className="text-[#d4af37]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-2xl font-bold text-[#d4af37]">{bundle.price} INDI</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">{bundle.originalPrice} INDI</span>
                        <span className="text-xs text-[#DC143C] font-medium">Save {bundle.savings}</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/courses/bundles/${bundle.id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                  >
                    Get Bundle
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Bundle CTA */}
      <div className="mt-4 p-4 bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#DC143C]/10 rounded-xl border border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#d4af37]/20 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-[#d4af37]" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Create Your Own Bundle</h4>
              <p className="text-gray-400 text-sm">Package your courses and increase your revenue</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/courses/bundles/create"
              className="px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37]/30 transition-colors"
            >
              Create Bundle
            </Link>
            <Link 
              href="/courses/promote?type=bundle"
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
            >
              Promote Bundle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

