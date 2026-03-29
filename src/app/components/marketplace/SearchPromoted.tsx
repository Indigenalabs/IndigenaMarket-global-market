'use client';

import { Star, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Clock, BookOpen, Users } from 'lucide-react';

interface SearchPromotedProps {
  query?: string;
}

const promotedSearchResults = [
  {
    id: 'search-promo-1',
    title: 'Complete Indigenous Arts Certification',
    instructor: 'Multiple Masters',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=340&fit=crop',
    category: 'arts',
    price: 999,
    originalPrice: 1499,
    currency: 'INDI',
    duration: '52 weeks',
    lessons: 200,
    students: 567,
    rating: 4.9,
    reviews: 89,
    level: 'All Levels',
    verification: 'Platinum',
    description: 'Comprehensive certification program covering weaving, pottery, beadwork, and more.',
    tags: ['Certification', 'Bundle', 'Career'],
    sponsor: 'Native Arts Institute',
    relevanceScore: 98,
    matchReason: 'Best match for your search'
  },
  {
    id: 'search-promo-2',
    title: 'Traditional Dyeing Techniques Masterclass',
    instructor: 'Elena Blackhorse',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=340&fit=crop',
    category: 'arts',
    price: 349,
    currency: 'INDI',
    duration: '6 weeks',
    lessons: 24,
    students: 1234,
    rating: 4.8,
    reviews: 156,
    level: 'Intermediate',
    verification: 'Gold',
    description: 'Learn natural dyeing from plant identification to finished textile.',
    tags: ['Dyeing', 'Textiles', 'Natural'],
    sponsor: 'Earth Colors Co-op',
    relevanceScore: 95,
    matchReason: 'Highly relevant'
  }
];

export default function SearchPromoted({ query = '' }: SearchPromotedProps) {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-black" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Promoted Results
            </h3>
            <p className="text-xs text-gray-400">
              {query ? `For "${query}"` : 'Sponsored matches'}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] font-medium text-[#d4af37]/80">
          Sponsored search lane
        </span>
      </div>

      {/* Promoted Results */}
      <div className="space-y-4">
        {promotedSearchResults.map((course, index) => (
          <div 
            key={course.id}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/30 hover:border-[#d4af37] transition-all hover:shadow-lg hover:shadow-[#d4af37]/10 relative"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="relative sm:w-56 flex-shrink-0 overflow-hidden">
                <img 
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-44 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141414]/50 hidden sm:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent sm:hidden" />

                <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-[#d4af37]/35 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
                  <Star size={10} className="text-[#f3d57c]" fill="currentColor" />
                  Promoted
                </div>

                <div className="absolute top-3 right-3 rounded-full bg-[#d4af37] px-2 py-1 text-xs font-bold text-black">
                  {course.relevanceScore}% match
                </div>

                {/* Verification Badge */}
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#0a0a0a]/80 backdrop-blur-sm rounded text-xs font-medium text-[#d4af37] border border-[#d4af37]/30">
                  {course.verification}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                {/* Match Reason */}
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={12} className="text-[#d4af37]" />
                  <span className="text-xs text-[#d4af37]">{course.matchReason}</span>
                </div>

                {/* Sponsor */}
                <p className="text-xs text-[#d4af37]/70 mb-2">
                  Sponsored by {course.sponsor}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="text-xs text-[#d4af37]/80">#{tag}</span>
                  ))}
                  <span className="text-xs px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] rounded">
                    {course.level}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src={course.instructorAvatar} 
                    alt={course.instructor}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-300">{course.instructor}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {course.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {course.students.toLocaleString()}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
                    <span className="text-white font-medium">{course.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({course.reviews} reviews)</span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#d4af37]">{course.price} INDI</span>
                    {course.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{course.originalPrice} INDI</span>
                    )}
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-1 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                  >
                    View Course
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


