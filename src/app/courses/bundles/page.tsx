'use client';

import { useState } from 'react';
import {
  Package, Star, Clock, Users, ChevronRight, CheckCircle,
  Gift, TrendingDown, Award, Sparkles, ArrowRight, Heart,
  BookOpen, GraduationCap
} from 'lucide-react';
import Link from 'next/link';

interface Bundle {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  courses: {
    id: string;
    title: string;
    instructor: string;
    thumbnail: string;
    rating: number;
    duration: string;
    level: string;
  }[];
  totalValue: number;
  bundlePrice: number;
  studentCount: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  features: string[];
}

const bundles: Bundle[] = [
  {
    id: 'b1',
    title: 'Complete Weaving Mastery',
    subtitle: 'From beginner to master artisan',
    description: 'Master the sacred art of Navajo weaving with this comprehensive bundle. Includes foundational techniques, traditional patterns, natural dyes, and advanced projects taught by master weaver Maria Begay.',
    thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=450&fit=crop',
    courses: [
      { id: '1', title: 'Navajo Weaving Masterclass', instructor: 'Maria Begay', thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=170&fit=crop', rating: 4.9, duration: '18h 30m', level: 'All Levels' },
      { id: '5', title: 'Hopi Kachina Doll Making', instructor: 'Tawa Honani', thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=300&h=170&fit=crop', rating: 4.6, duration: '8h 30m', level: 'Intermediate' },
      { id: '6', title: 'Métis Sash Weaving', instructor: 'Gabriel Dumont', thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=170&fit=crop', rating: 4.8, duration: '6h 45m', level: 'Beginner' }
    ],
    totalValue: 607,
    bundlePrice: 349,
    studentCount: 1247,
    rating: 4.8,
    reviewCount: 342,
    badge: 'Bestseller',
    features: ['3 complete courses', '33+ hours of content', 'Certificate of completion', 'Lifetime access', 'Direct instructor support']
  },
  {
    id: 'b2',
    title: 'Sacred Ceramics Collection',
    subtitle: 'Ancient pottery techniques from three nations',
    description: 'Learn traditional pottery from Cherokee, Pueblo, and Navajo perspectives. This bundle covers hand-building, wheel throwing, natural glazing, and firing techniques passed down through generations.',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=450&fit=crop',
    courses: [
      { id: '2', title: 'Cherokee Pottery: Ancient Techniques', instructor: 'Chief Running Water', thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=170&fit=crop', rating: 4.8, duration: '12h 15m', level: 'Beginner' },
      { id: '9', title: 'Pueblo Pottery Traditions', instructor: 'Maria Martinez II', thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=170&fit=crop', rating: 4.9, duration: '14h 00m', level: 'Intermediate' },
      { id: '10', title: 'Navajo Pottery & Storytelling', instructor: 'Alice Cling', thumbnail: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=300&h=170&fit=crop', rating: 4.7, duration: '10h 30m', level: 'All Levels' }
    ],
    totalValue: 547,
    bundlePrice: 299,
    studentCount: 892,
    rating: 4.7,
    reviewCount: 218,
    features: ['3 complete courses', '36+ hours of content', 'Clay sourcing guide', 'Kiln firing techniques', 'Community access']
  },
  {
    id: 'b3',
    title: 'Indigenous Jewelry Master',
    subtitle: 'Beadwork, silverwork, and stone inlay',
    description: 'From intricate Lakota beadwork to Zuni silver and stone inlay, master the art of Indigenous jewelry making. Includes materials sourcing, traditional designs, and contemporary applications.',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=450&fit=crop',
    courses: [
      { id: '3', title: 'Lakota Beadwork Fundamentals', instructor: 'Winona Thunderbird', thumbnail: 'https://images.unsplash.com/photo-1609504173369-d7a237d76a9d?w=300&h=170&fit=crop', rating: 4.7, duration: '14h 00m', level: 'Beginner' },
      { id: '8', title: 'Zuni Jewelry: Silver & Stone', instructor: 'Atsidi Sani', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=170&fit=crop', rating: 4.7, duration: '20h 00m', level: 'Advanced' },
      { id: '11', title: 'Contemporary Indigenous Design', instructor: 'Various Artists', thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=170&fit=crop', rating: 4.6, duration: '8h 00m', level: 'Intermediate' }
    ],
    totalValue: 516,
    bundlePrice: 279,
    studentCount: 654,
    rating: 4.6,
    reviewCount: 156,
    badge: 'New',
    features: ['3 complete courses', '42+ hours of content', 'Tool recommendations', 'Supplier contacts', 'Portfolio review']
  },
  {
    id: 'b4',
    title: 'Complete Indigenous Arts Path',
    subtitle: 'The ultimate learning journey',
    description: 'Our most comprehensive bundle covering weaving, pottery, jewelry, carving, and basketry. Perfect for serious students who want to build a complete skill set in Indigenous traditional arts.',
    thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=450&fit=crop',
    courses: [
      { id: '1', title: 'Navajo Weaving Masterclass', instructor: 'Maria Begay', thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=170&fit=crop', rating: 4.9, duration: '18h 30m', level: 'All Levels' },
      { id: '2', title: 'Cherokee Pottery: Ancient Techniques', instructor: 'Chief Running Water', thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=170&fit=crop', rating: 4.8, duration: '12h 15m', level: 'Beginner' },
      { id: '3', title: 'Lakota Beadwork Fundamentals', instructor: 'Winona Thunderbird', thumbnail: 'https://images.unsplash.com/photo-1609504173369-d7a237d76a9d?w=300&h=170&fit=crop', rating: 4.7, duration: '14h 00m', level: 'Beginner' },
      { id: '4', title: 'Inuit Carving: Stone & Bone', instructor: 'Nanook Iqaluk', thumbnail: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&h=170&fit=crop', rating: 4.9, duration: '10h 45m', level: 'Advanced' },
      { id: '7', title: 'Pacific Northwest Basketry', instructor: 'Cedar Song', thumbnail: 'https://images.unsplash.com/photo-1595408076683-5d0c523c0381?w=300&h=170&fit=crop', rating: 4.9, duration: '15h 20m', level: 'All Levels' }
    ],
    totalValue: 1155,
    bundlePrice: 599,
    studentCount: 432,
    rating: 4.9,
    reviewCount: 89,
    badge: 'Premium',
    features: ['5 complete courses', '70+ hours of content', 'All certificates included', '1-on-1 mentorship session', 'Lifetime community access', 'Early access to new courses']
  }
];

function BundleCard({ bundle, featured = false }: { bundle: Bundle; featured?: boolean }) {
  const savings = bundle.totalValue - bundle.bundlePrice;
  const savingsPct = Math.round((savings / bundle.totalValue) * 100);

  if (featured) {
    return (
      <div className="bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-2xl border border-[#d4af37]/30 overflow-hidden hover:border-[#d4af37]/50 transition-all group">
        <div className="relative h-48">
          <img src={bundle.thumbnail} alt={bundle.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          {bundle.badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full ${
              bundle.badge === 'Premium' ? 'bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] text-black' :
              bundle.badge === 'Bestseller' ? 'bg-[#DC143C] text-white' :
              'bg-green-500 text-white'
            }`}>
              {bundle.badge}
            </span>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-2xl font-bold text-white mb-1">{bundle.title}</h3>
            <p className="text-[#d4af37] text-sm">{bundle.subtitle}</p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bundle.description}</p>

          {/* Courses Preview */}
          <div className="flex gap-2 mb-4">
            {bundle.courses.slice(0, 4).map((course, i) => (
              <img key={course.id} src={course.thumbnail} alt={course.title} className="w-16 h-10 object-cover rounded" />
            ))}
            {bundle.courses.length > 4 && (
              <div className="w-16 h-10 bg-[#0a0a0a] rounded flex items-center justify-center text-gray-500 text-xs">
                +{bundle.courses.length - 4}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {bundle.features.slice(0, 3).map((feature, i) => (
              <span key={i} className="px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded">{feature}</span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1"><Star size={14} className="text-[#d4af37]" />{bundle.rating}</span>
            <span className="flex items-center gap-1"><Users size={14} />{bundle.studentCount.toLocaleString()}</span>
            <span className="flex items-center gap-1"><BookOpen size={14} />{bundle.courses.length} courses</span>
          </div>

          {/* Pricing */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-[#d4af37]">{bundle.bundlePrice} INDI</span>
                <span className="text-gray-500 line-through">{bundle.totalValue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Save {savingsPct}%</span>
                <span className="text-gray-400">{savings} INDI off</span>
              </div>
            </div>
            <Link href={`/courses/bundles/${bundle.id}`} className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex items-center gap-2">
              Get Bundle <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/courses/bundles/${bundle.id}`} className="block bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/40 transition-all group">
      <div className="relative h-32">
        <img src={bundle.thumbnail} alt={bundle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
        {bundle.badge && (
          <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded ${
            bundle.badge === 'Premium' ? 'bg-[#d4af37] text-black' :
            bundle.badge === 'Bestseller' ? 'bg-[#DC143C] text-white' :
            'bg-green-500 text-white'
          }`}>
            {bundle.badge}
          </span>
        )}
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-lg font-bold text-white">{bundle.title}</h3>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{bundle.subtitle}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Star size={12} className="text-[#d4af37]" />{bundle.rating}</span>
          <span className="flex items-center gap-1"><Users size={12} />{bundle.studentCount.toLocaleString()}</span>
          <span>{bundle.courses.length} courses</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-[#d4af37]">{bundle.bundlePrice} INDI</span>
            <span className="text-gray-600 line-through text-sm ml-2">{bundle.totalValue}</span>
          </div>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Save {savingsPct}%</span>
        </div>
      </div>
    </Link>
  );
}

export default function BundlesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'bestsellers' | 'new'>('all');

  const filteredBundles = bundles.filter(b => {
    if (activeTab === 'bestsellers') return b.badge === 'Bestseller' || b.studentCount > 1000;
    if (activeTab === 'new') return b.badge === 'New';
    return true;
  });

  const featuredBundle = bundles.find(b => b.badge === 'Premium') || bundles[0];

  return (
    <>
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
              <Package size={22} className="text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Course Bundles</h1>
              <p className="text-gray-400 text-sm">Save more with curated learning paths</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-lg p-1">
            {[
              { id: 'all' as const, label: 'All Bundles' },
              { id: 'bestsellers' as const, label: 'Bestsellers' },
              { id: 'new' as const, label: 'New' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] border-b border-[#d4af37]/20 px-6 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-[#d4af37]" />
              <span className="text-[#d4af37] text-sm font-medium uppercase tracking-wider">Featured Bundle</span>
            </div>
            <BundleCard bundle={featuredBundle} featured />
          </div>
        </div>

        {/* All Bundles */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift size={20} className="text-[#d4af37]" /> All Bundles
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <TrendingDown size={16} className="text-green-400" />
              <span>Save up to 50% with bundles</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBundles.map(bundle => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>

          {/* Why Bundles */}
          <div className="mt-12 bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Why Choose a Bundle?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: TrendingDown, title: 'Save Money', desc: 'Get up to 50% off compared to buying courses individually' },
                { icon: Award, title: 'Complete Learning', desc: 'Structured curriculum takes you from beginner to expert' },
                { icon: Users, title: 'Community Access', desc: 'Join exclusive bundle student communities for networking' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon size={28} className="text-[#d4af37]" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Can&apos;t find what you&apos;re looking for?</p>
            <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-[#141414] border border-[#d4af37]/30 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/10 transition-colors">
              <GraduationCap size={18} /> Browse Individual Courses
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
