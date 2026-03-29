'use client';

import { useState } from 'react';
import {
  Star, Users, BookOpen, Award, MapPin, Globe, Calendar,
  CheckCircle, Heart, MessageCircle, Share2, ChevronLeft,
  GraduationCap, Clock, TrendingUp, Flag
} from 'lucide-react';
import Link from 'next/link';

const instructor = {
  id: 'i1',
  name: 'Maria Begay',
  title: 'Master Weaver & Cultural Educator',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=400&fit=crop',
  bio: 'Third-generation Navajo weaver with over 30 years of experience preserving traditional weaving techniques. Featured in Smithsonian exhibitions and the Heard Museum. Maria has taught more than 2,000 students worldwide and is passionate about passing these sacred arts to future generations.',
  location: 'Window Rock, Arizona',
  website: 'mariabegayweaving.com',
  joinedDate: 'January 2024',
  isVerified: true,
  isFollowing: false,
  stats: {
    rating: 4.9,
    reviewCount: 892,
    students: 3456,
    courses: 4,
    totalHours: 45
  },
  expertise: ['Navajo Weaving', 'Textile Arts', 'Natural Dyes', 'Cultural Education', 'Pattern Design'],
  achievements: [
    { icon: Award, label: 'Top Rated Instructor', description: '4.9+ rating for 6 months' },
    { icon: Users, label: '3,000+ Students', description: 'Reached in first year' },
    { icon: Star, label: 'Featured Artist', description: 'Smithsonian exhibition' }
  ],
  courses: [
    { id: '1', title: 'Navajo Weaving Masterclass', thumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=225&fit=crop', rating: 4.9, reviewCount: 892, students: 2341, price: 249, duration: '18h 30m', level: 'All Levels', isBestseller: true },
    { id: '5', title: 'Natural Dyes from the Land', thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=225&fit=crop', rating: 4.8, reviewCount: 234, students: 567, price: 149, duration: '8h 15m', level: 'Intermediate' },
    { id: '9', title: 'Advanced Pattern Design', thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=225&fit=crop', rating: 4.9, reviewCount: 156, students: 389, price: 199, duration: '12h 00m', level: 'Advanced' },
    { id: '10', title: 'Teaching Weaving to Children', thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=225&fit=crop', rating: 4.7, reviewCount: 89, students: 159, price: 99, duration: '6h 30m', level: 'Beginner' }
  ],
  reviews: [
    { id: 'r1', user: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', rating: 5, date: '2 weeks ago', course: 'Navajo Weaving Masterclass', content: 'Maria is an incredible teacher. Her knowledge of traditional techniques combined with her patient teaching style made this course invaluable.' },
    { id: 'r2', user: 'James Redcloud', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', rating: 5, date: '1 month ago', course: 'Natural Dyes from the Land', content: 'The depth of cultural knowledge shared here is remarkable. I feel connected to generations of weavers through this course.' },
    { id: 'r3', user: 'Aiyana Running Deer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', rating: 5, date: '2 months ago', course: 'Navajo Weaving Masterclass', content: 'I have taken many online courses, but none compare to the quality and heart Maria puts into her teaching.' }
  ]
};

export default function InstructorProfilePage({ params }: { params: { instructorId: string } }) {
  const [isFollowing, setIsFollowing] = useState(instructor.isFollowing);
  const [activeTab, setActiveTab] = useState<'courses' | 'about' | 'reviews'>('courses');

  return (
    <>
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-3 flex-shrink-0">
        <Link href="/courses" className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] text-sm transition-colors">
          <ChevronLeft size={16} /> Back to Courses
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Cover & Profile */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-[#141414] to-[#0a0a0a] relative overflow-hidden">
            <img src={instructor.coverImage} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="max-w-6xl mx-auto px-6 -mt-16 relative">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={instructor.avatar}
                  alt={instructor.name}
                  className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] object-cover"
                />
                {instructor.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-black" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pb-4">
                <h1 className="text-3xl font-bold text-white mb-1">{instructor.name}</h1>
                <p className="text-[#d4af37] mb-2">{instructor.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><MapPin size={14} />{instructor.location}</span>
                  <span className="flex items-center gap-1"><Globe size={14} />{instructor.website}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} />Joined {instructor.joinedDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pb-4">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                    isFollowing
                      ? 'bg-[#141414] border border-[#d4af37]/30 text-gray-300 hover:border-[#d4af37]'
                      : 'bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black hover:shadow-lg hover:shadow-[#d4af37]/30'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow Instructor'}
                </button>
                <button className="p-2.5 bg-[#141414] border border-[#d4af37]/30 text-gray-400 rounded-xl hover:text-[#d4af37] hover:border-[#d4af37] transition-colors">
                  <MessageCircle size={20} />
                </button>
                <button className="p-2.5 bg-[#141414] border border-[#d4af37]/30 text-gray-400 rounded-xl hover:text-[#d4af37] hover:border-[#d4af37] transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-b border-[#d4af37]/20 bg-[#141414]/50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[#d4af37]" />
                <span className="text-white font-bold">{instructor.stats.rating}</span>
                <span className="text-gray-500 text-sm">({instructor.stats.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#d4af37]" />
                <span className="text-white font-bold">{instructor.stats.students.toLocaleString()}</span>
                <span className="text-gray-500 text-sm">students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#d4af37]" />
                <span className="text-white font-bold">{instructor.stats.courses}</span>
                <span className="text-gray-500 text-sm">courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#d4af37]" />
                <span className="text-white font-bold">{instructor.stats.totalHours}h</span>
                <span className="text-gray-500 text-sm">content</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Left Column */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="border-b border-[#d4af37]/20 mb-6">
                <div className="flex gap-6">
                  {[
                    { id: 'courses' as const, label: `Courses (${instructor.courses.length})` },
                    { id: 'about' as const, label: 'About' },
                    { id: 'reviews' as const, label: `Reviews (${instructor.stats.reviewCount})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id ? 'text-[#d4af37] border-[#d4af37]' : 'text-gray-400 border-transparent hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {instructor.courses.map(course => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="group bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/50 transition-all"
                    >
                      <div className="relative">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
                        {course.isBestseller && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#d4af37] text-black text-xs font-bold rounded">BESTSELLER</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-1 group-hover:text-[#d4af37] transition-colors">{course.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#d4af37] font-bold text-sm">{course.rating}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className={s <= Math.floor(course.rating) ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'} />)}
                          </div>
                          <span className="text-gray-500 text-xs">({course.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span>{course.duration}</span>
                          <span>·</span>
                          <span>{course.level}</span>
                          <span>·</span>
                          <span>{course.students.toLocaleString()} students</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/10">
                          <span className="text-lg font-bold text-[#d4af37]">{course.price} INDI</span>
                          <button className="p-1.5 text-gray-400 hover:text-[#DC143C] transition-colors">
                            <Heart size={16} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap size={18} className="text-[#d4af37]" /> About
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{instructor.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {instructor.expertise.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] rounded-lg text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Award size={18} className="text-[#d4af37]" /> Achievements
                    </h3>
                    <div className="space-y-3">
                      {instructor.achievements.map((ach, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#141414] rounded-lg border border-[#d4af37]/10">
                          <div className="w-10 h-10 bg-[#d4af37]/10 rounded-lg flex items-center justify-center">
                            <ach.icon size={18} className="text-[#d4af37]" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{ach.label}</p>
                            <p className="text-gray-500 text-xs">{ach.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {instructor.reviews.map(review => (
                    <div key={review.id} className="bg-[#141414] rounded-xl p-5 border border-[#d4af37]/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="text-white font-medium text-sm">{review.user}</p>
                            <p className="text-gray-500 text-xs">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= review.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'} />)}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Course: <span className="text-[#d4af37]">{review.course}</span></p>
                      <p className="text-gray-300 text-sm leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="w-72 flex-shrink-0 space-y-5">
              {/* Quick Stats */}
              <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
                <h3 className="text-white font-semibold mb-4">Instructor Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Response rate</span>
                    <span className="text-[#d4af37] font-semibold">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Response time</span>
                    <span className="text-white font-semibold">&lt; 4 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Completion rate</span>
                    <span className="text-[#d4af37] font-semibold">87%</span>
                  </div>
                </div>
              </div>

              {/* Trending */}
              <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#d4af37]" /> Trending
                </h3>
                <p className="text-gray-400 text-sm mb-3">This instructor is in the top 5% of all instructors on Indigena</p>
                <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] rounded-full" />
                </div>
              </div>

              {/* Report */}
              <button className="w-full flex items-center justify-center gap-2 p-3 text-gray-500 hover:text-gray-300 text-sm transition-colors">
                <Flag size={14} /> Report instructor
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
