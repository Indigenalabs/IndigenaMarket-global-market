'use client';

import { Star, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Clock, BookOpen, Users, Play } from 'lucide-react';

interface CategoryFeaturedProps {
  categoryId: string;
  categoryName: string;
}

const categoryFeaturedCourses: Record<string, Array<{
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  level: string;
  verification: string;
  description: string;
  sponsor: string;
  badge: string;
}>> = {
  'language': [
    {
      id: 'lang-featured-1',
      title: 'MÄori Language Certification Program',
      instructor: 'Prof. Hana TÅ«re',
      instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=340&fit=crop',
      price: 449,
      currency: 'INDI',
      duration: '16 weeks',
      lessons: 64,
      students: 3241,
      rating: 4.9,
      reviews: 312,
      level: 'All Levels',
      verification: 'Platinum',
      description: 'Comprehensive MÄori language certification with cultural immersion.',
      sponsor: 'Te WÄnanga',
      badge: 'Category Leader'
    },
    {
      id: 'lang-featured-2',
      title: 'Inuktitut for Beginners',
      instructor: 'Nunavut Cultural Center',
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=340&fit=crop',
      price: 199,
      originalPrice: 299,
      currency: 'INDI',
      duration: '8 weeks',
      lessons: 32,
      students: 1567,
      rating: 4.7,
      reviews: 189,
      level: 'Beginner',
      verification: 'Gold',
      description: 'Learn Inuktitut with native speakers and interactive lessons.',
      sponsor: 'Nunavut Gov',
      badge: 'Trending'
    }
  ],
  'arts': [
    {
      id: 'arts-featured-1',
      title: 'Master Beadwork Artist Program',
      instructor: 'Lena Crow',
      instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=340&fit=crop',
      price: 599,
      currency: 'INDI',
      duration: '20 weeks',
      lessons: 80,
      students: 2134,
      rating: 4.9,
      reviews: 445,
      level: 'Advanced',
      verification: 'Platinum',
      description: 'Professional beadwork certification with master artist mentorship.',
      sponsor: 'Native Arts Council',
      badge: 'Top Rated'
    }
  ],
  'business': [
    {
      id: 'biz-featured-1',
      title: 'Tribal Enterprise Management',
      instructor: 'Robert Whitefeather',
      instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=340&fit=crop',
      price: 799,
      currency: 'INDI',
      duration: '24 weeks',
      lessons: 96,
      students: 892,
      rating: 4.8,
      reviews: 156,
      level: 'Advanced',
      verification: 'Platinum',
      description: 'Leadership and management for tribal enterprises and organizations.',
      sponsor: 'NCAIED',
      badge: 'Career Boost'
    }
  ]
};

const defaultFeatured = categoryFeaturedCourses['language'];

export default function CategoryFeatured({ categoryId, categoryName }: CategoryFeaturedProps) {
  const featured = categoryFeaturedCourses[categoryId] || defaultFeatured;

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#DC143C] to-[#8B0000] rounded-lg flex items-center justify-center">
            <Crown size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Featured in {categoryName}
            </h3>
            <p className="text-xs text-gray-400">Premium placements by verified sponsors</p>
          </div>
        </div>
        <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 py-1 text-[11px] font-medium text-[#d4af37]/80">
          Sponsored category lane
        </span>
      </div>

      {/* Featured Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {featured.map((course) => (
          <div 
            key={course.id}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#DC143C]/30 hover:border-[#DC143C] transition-all hover:shadow-lg hover:shadow-[#DC143C]/10 relative"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="relative sm:w-48 flex-shrink-0 overflow-hidden">
                <img 
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141414]/50 hidden sm:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent sm:hidden" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/90 flex items-center justify-center">
                    <Play size={20} className="text-black ml-0.5" />
                  </div>
                </div>

                <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-[#DC143C]/35 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff8c9f] backdrop-blur-sm">
                  <Crown size={10} />
                  {course.badge}
                </div>

                <div className="absolute top-3 right-3 rounded-full bg-[#d4af37]/20 px-2.5 py-1 text-xs font-medium text-[#d4af37] backdrop-blur-sm border border-[#d4af37]/40">
                  {course.verification}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                {/* Sponsor */}
                <p className="text-xs text-[#DC143C]/70 mb-2">
                  Featured by {course.sponsor}
                </p>

                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src={course.instructorAvatar} 
                    alt={course.instructor}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs text-gray-300">{course.instructor}</span>
                  <span className="text-xs text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded">
                    {course.level}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {course.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {course.students.toLocaleString()}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
                    <span className="text-white text-sm font-medium">{course.rating}</span>
                  </div>
                  <span className="text-gray-500 text-xs">({course.reviews} reviews)</span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#d4af37]">{course.price} INDI</span>
                    {course.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">{course.originalPrice} INDI</span>
                    )}
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                  >
                    Enroll
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Promotion CTA */}
      <div className="mt-4 text-center">
        <Link 
          href={`/courses/promote?category=${categoryId}`}
          className="inline-flex items-center gap-2 text-sm text-[#d4af37] hover:text-[#f4e4a6] underline underline-offset-4"
        >
          Feature your {categoryName} course
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}


