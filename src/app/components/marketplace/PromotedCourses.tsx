'use client';

import { Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Clock, BookOpen, Users } from 'lucide-react';
import { PlacementSectionHeader, placementContextPillClass, placementPrimaryButtonClass } from '../placements/PremiumPlacement';

interface PromotedCoursesProps {
  pillar?: string;
}

const promotedCourses = [
  {
    id: 'promo-course-1',
    title: 'Advanced Navajo Weaving Techniques',
    instructor: 'Maria Begay',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=340&fit=crop',
    category: 'arts',
    price: 299,
    currency: 'INDI',
    duration: '8 weeks',
    lessons: 32,
    students: 2341,
    rating: 4.9,
    reviews: 156,
    level: 'Advanced',
    verification: 'Platinum',
    description: 'Master the intricate patterns and techniques of traditional Navajo weaving.',
    tags: ['Weaving', 'Advanced', 'Traditional'],
    sponsor: 'Heritage Arts Foundation',
    promotionDaysLeft: 5
  },
  {
    id: 'promo-course-2',
    title: 'Cherokee Language Immersion',
    instructor: 'Dr. Amanda Swimmer',
    instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=340&fit=crop',
    category: 'language',
    price: 399,
    currency: 'INDI',
    duration: '12 weeks',
    lessons: 48,
    students: 1876,
    rating: 4.8,
    reviews: 234,
    level: 'All Levels',
    verification: 'Gold',
    description: 'Complete immersion program for learning Cherokee language and culture.',
    tags: ['Language', 'Cherokee', 'Immersion'],
    sponsor: 'Tribal Education Initiative',
    promotionDaysLeft: 12
  },
  {
    id: 'promo-course-3',
    title: 'Indigenous Business Accelerator',
    instructor: 'Michael Thunderbird',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=340&fit=crop',
    category: 'business',
    price: 499,
    originalPrice: 699,
    currency: 'INDI',
    duration: '16 weeks',
    lessons: 64,
    students: 892,
    rating: 4.9,
    reviews: 89,
    level: 'Advanced',
    verification: 'Platinum',
    description: 'Launch and scale your Indigenous-owned business with expert mentorship.',
    tags: ['Business', 'Entrepreneurship', 'Mentorship'],
    sponsor: 'Native Enterprise Alliance',
    promotionDaysLeft: 3
  }
];

const verificationBadges = {
  Bronze: { color: '#CD7F32', label: 'Bronze' },
  Silver: { color: '#C0C0C0', label: 'Silver' },
  Gold: { color: '#FFD700', label: 'Gold' },
  Platinum: { color: '#E5E4E2', label: 'Platinum' }
};

export default function PromotedCourses({ pillar = 'courses' }: PromotedCoursesProps) {
  return (
    <div className="mb-8">
      <PlacementSectionHeader
        icon={Sparkles}
        title="Promoted Courses"
        meta="Sponsored course lane"
        right={<span className={placementContextPillClass}>Live in {pillar}</span>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotedCourses.map((course) => {
          const verification = verificationBadges[course.verification as keyof typeof verificationBadges];

          return (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-xl border border-[#d4af37]/40 bg-[#141414] transition-all hover:border-[#d4af37] hover:shadow-lg hover:shadow-[#d4af37]/20"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-70" />

                <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
                  <div className="inline-flex max-w-[70%] items-center gap-1.5 rounded-full border border-[#d4af37]/35 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
                    <Star size={10} fill="currentColor" />
                    Sponsored
                  </div>
                  <div className="rounded-full bg-[#7f1325]/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
                    {course.promotionDaysLeft} days left
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 rounded-full bg-[#0a0a0a]/80 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                  {course.level}
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex max-w-full items-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/8 px-2.5 py-1 text-[11px] text-[#d4af37]/80">
                    Sponsored by {course.sponsor}
                  </span>
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      backgroundColor: verification.color + '18',
                      borderColor: verification.color + '35',
                      color: verification.color
                    }}
                  >
                    {verification.label} verified
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h3 className="mb-2 line-clamp-2 text-base font-semibold text-white transition-colors group-hover:text-[#d4af37]">
                  {course.title}
                </h3>

                <p className="mb-3 line-clamp-2 text-sm text-gray-400">{course.description}</p>

                <div className="mb-3 flex items-center gap-2">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="text-xs text-gray-300">{course.instructor}</span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {course.lessons}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {course.students.toLocaleString()}
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-[#d4af37] text-[#d4af37]" />
                    <span className="text-sm font-medium text-white">{course.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({course.reviews} reviews)</span>
                </div>

                <div className="flex items-center justify-between border-t border-[#d4af37]/10 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#d4af37]">{course.price} INDI</span>
                    {course.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">{course.originalPrice} INDI</span>
                    )}
                  </div>
                  <Link
                    href={`/courses/${course.id}`}
                    className={placementPrimaryButtonClass}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

