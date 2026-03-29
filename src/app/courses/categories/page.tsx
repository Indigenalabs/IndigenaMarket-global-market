'use client';

import { useState } from 'react';
import { 
  Search,
  BookOpen,
  Users,
  Star,
  ChevronRight,
  GraduationCap,
  Languages,
  Palette,
  Landmark,
  Leaf,
  Briefcase,
  Laptop
} from 'lucide-react';
import Link from 'next/link';
import CategoryFeatured from '@/app/components/marketplace/CategoryFeatured';
import { PILLAR3_CATEGORIES } from '../data/pillar3Catalog';

const iconByCategory = {
  traditional_arts: Palette,
  language_learning: Languages,
  cultural_knowledge: Landmark,
  contemporary_art_design: Palette,
  performing_arts: GraduationCap,
  business_entrepreneurship: Briefcase,
  curatorial_museum: Landmark,
  academic_university: GraduationCap,
  teacher_education: BookOpen,
  language_teacher_training: Languages,
  youth_family: Users,
  health_wellness: Leaf,
  land_environment: Leaf,
  digital_preservation: Laptop,
  cultural_tourism: Landmark,
  advocacy_organizing: Briefcase,
  sacred_ceremonial: Landmark,
  professional_development: Briefcase,
  online_workshops: Laptop,
  certificate_programs: GraduationCap
} as const;

const categories = PILLAR3_CATEGORIES.map((category, idx) => ({
  id: category.id,
  name: category.name,
  icon: iconByCategory[category.id as keyof typeof iconByCategory] || GraduationCap,
  description: category.description,
  courseCount: Math.max(8, category.topics.length * 3),
  studentCount: 3200 + idx * 420,
  color: category.color,
  image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=300&fit=crop'
}));

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#d4af37]/20 via-[#0a0a0a] to-[#DC143C]/10 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Browse by <span className="text-[#d4af37]">Category</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Explore our diverse collection of courses organized by topic. 
            Find the perfect learning path for your interests.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>

      {/* Featured Categories - Revenue Spot */}
      <main className="max-w-6xl mx-auto p-6 -mt-8">
        <CategoryFeatured categoryId="language_learning" categoryName="Language Learning Courses" />
        <CategoryFeatured categoryId="traditional_arts" categoryName="Traditional Art Courses" />
        <CategoryFeatured categoryId="business_entrepreneurship" categoryName="Business & Entrepreneurship" />

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/courses/search?category=${category.id}`}
              className="group bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/50 transition-all"
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                <div 
                  className="absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: category.color + '30' }}
                >
                  <category.icon size={24} style={{ color: category.color }} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {category.courseCount} courses
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {category.studentCount.toLocaleString()}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-[#d4af37] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
