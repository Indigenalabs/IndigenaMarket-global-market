'use client';

import { Star, Award, Users, BookOpen, BadgeCheck, ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';

interface InstructorSpotlightProps {
  pillar?: string;
}

const featuredInstructors = [
  {
    id: 'instructor-1',
    name: 'Maria Begay',
    title: 'Master Navajo Weaver',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=300&fit=crop',
    bio: 'Third-generation master weaver with 40+ years of experience preserving traditional Navajo textile arts.',
    courses: 8,
    students: 12543,
    rating: 4.9,
    reviews: 892,
    verification: 'Platinum',
    badges: ['Master Artisan', 'Cultural Bearer', 'Top Instructor'],
    specialties: ['Navajo Weaving', 'Textile Dyeing', 'Pattern Design'],
    featuredCourse: {
      title: 'Advanced Navajo Weaving',
      price: 299,
      students: 2341
    },
    sponsor: 'Heritage Arts Foundation',
    promotionDaysLeft: 7
  },
  {
    id: 'instructor-2',
    name: 'Dr. Sarah Whitehorse',
    title: 'Lakota Language Scholar',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=300&fit=crop',
    bio: 'PhD in Linguistics, dedicated to preserving and teaching Lakota language to new generations.',
    courses: 5,
    students: 8921,
    rating: 4.8,
    reviews: 567,
    verification: 'Platinum',
    badges: ['PhD Verified', 'Language Keeper', 'Rising Star'],
    specialties: ['Lakota Language', 'Cultural Context', 'Oral History'],
    featuredCourse: {
      title: 'Lakota Language Fundamentals',
      price: 199,
      students: 1892
    },
    sponsor: 'Tribal Education Initiative',
    promotionDaysLeft: 14
  },
  {
    id: 'instructor-3',
    name: 'Michael Thunderbird',
    title: 'Indigenous Business Leader',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=300&fit=crop',
    bio: 'Founder of 3 successful Indigenous enterprises. MBA from Stanford, passionate about economic sovereignty.',
    courses: 6,
    students: 6789,
    rating: 4.9,
    reviews: 445,
    verification: 'Gold',
    badges: ['MBA Verified', 'Entrepreneur', 'Mentor'],
    specialties: ['Business Strategy', 'Entrepreneurship', 'Leadership'],
    featuredCourse: {
      title: 'Indigenous Entrepreneurship',
      price: 249,
      students: 445
    },
    sponsor: 'Native Enterprise Alliance',
    promotionDaysLeft: 5
  }
];

export default function InstructorSpotlight({ pillar = 'courses' }: InstructorSpotlightProps) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Crown size={16} className="text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Featured Instructors
            </h3>
            <p className="text-xs text-gray-400">Learn from verified masters and experts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-2.5 py-1 text-[11px] font-medium text-[#d4af37]/80">
            Sponsored instructor lane
          </span>
          <Link 
            href="/courses/instructor/spotlight"
            className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Instructor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {featuredInstructors.map((instructor) => (
          <div 
            key={instructor.id}
            className="group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/30 hover:border-[#d4af37] transition-all hover:shadow-lg hover:shadow-[#d4af37]/10 relative"
          >
            {/* Cover Image */}
            <div className="relative h-24 overflow-hidden">
              <img 
                src={instructor.coverImage}
                alt={instructor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
              
              <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full border border-[#d4af37]/35 bg-[#0b0b0b]/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d57c] backdrop-blur-sm">
                <Crown size={10} />
                Featured
              </div>

              <div className="absolute top-2 right-2 rounded-full bg-[#DC143C] px-2 py-0.5 text-xs font-medium text-white">
                {instructor.promotionDaysLeft} days
              </div>
            </div>

            {/* Avatar & Info */}
            <div className="px-4 pb-4">
              <div className="relative -mt-8 mb-3 flex items-end justify-between">
                <div className="relative">
                  <img 
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#141414]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center">
                    <BadgeCheck size={14} className="text-black" />
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/20 rounded-lg">
                  <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
                  <span className="text-[#d4af37] text-sm font-bold">{instructor.rating}</span>
                </div>
              </div>

              {/* Name & Title */}
              <h4 className="text-base font-semibold text-white mb-0.5">{instructor.name}</h4>
              <p className="text-xs text-[#d4af37] mb-2">{instructor.title}</p>

              {/* Sponsor */}
              <p className="text-xs text-gray-500 mb-3">
                Sponsored by {instructor.sponsor}
              </p>

              {/* Bio */}
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{instructor.bio}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {instructor.badges.map((badge) => (
                  <span 
                    key={badge}
                    className="text-xs px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 pb-3 border-b border-[#d4af37]/10">
                <span className="flex items-center gap-1">
                  <BookOpen size={12} />
                  {instructor.courses} courses
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {instructor.students.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Award size={12} />
                  {instructor.verification}
                </span>
              </div>

              {/* Featured Course */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Featured Course</p>
                <div className="bg-[#0a0a0a] rounded-lg p-2">
                  <p className="text-sm text-white font-medium line-clamp-1">{instructor.featuredCourse.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[#d4af37] text-sm font-bold">{instructor.featuredCourse.price} INDI</span>
                    <span className="text-xs text-gray-500">{instructor.featuredCourse.students.toLocaleString()} students</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link 
                href={`/courses/instructor/${instructor.id}`}
                className="flex items-center justify-center gap-1 w-full py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
              >
                View Profile
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

