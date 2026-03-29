'use client';

import { useState } from 'react';
import { GraduationCap, Search, Filter, Star, Clock, Users, ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  specialty: string;
  bio: string;
  rating: number;
  reviews: number;
  students: number;
  hourlyRate: number;
  availability: string;
  skills: string[];
  verified: boolean;
  isFeatured?: boolean;
}

const mentors: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Maria Begay',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=200&fit=crop',
    specialty: 'Navajo Weaving Master',
    bio: 'Third-generation master weaver with 40+ years experience. Teaching traditional techniques to preserve our heritage.',
    rating: 4.9,
    reviews: 127,
    students: 89,
    hourlyRate: 75,
    availability: 'Available',
    skills: ['Navajo Weaving', 'Textile Dyeing', 'Pattern Design', 'Cultural History'],
    verified: true,
    isFeatured: true
  },
  {
    id: 'mentor-2',
    name: 'ThunderVoice',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=200&fit=crop',
    specialty: 'Digital Art & Design',
    bio: 'Bridging traditional Indigenous art with modern digital techniques. 10+ years in graphic design and NFT creation.',
    rating: 4.8,
    reviews: 94,
    students: 156,
    hourlyRate: 60,
    availability: 'Limited',
    skills: ['Digital Art', 'NFT Creation', 'Graphic Design', 'Brand Identity'],
    verified: true
  },
  {
    id: 'mentor-3',
    name: 'Elena Rivers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=200&fit=crop',
    specialty: 'Cultural Tourism Guide',
    bio: 'Expert in Indigenous cultural tourism and sustainable community development. Helping artists build successful businesses.',
    rating: 4.9,
    reviews: 67,
    students: 45,
    hourlyRate: 85,
    availability: 'Available',
    skills: ['Cultural Tourism', 'Business Strategy', 'Community Building', 'Marketing'],
    verified: true
  }
];

export default function MentorshipHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');

  const allSkills = Array.from(new Set(mentors.flatMap(m => m.skills)));

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = selectedSkill === 'all' || mentor.skills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Mentorship Hub</h3>
            <p className="text-xs text-gray-400">Learn from verified masters</p>
          </div>
        </div>
        <Link 
          href="/community?view=mentorship"
          className="text-sm text-[#d4af37] hover:text-[#f4e4a6] transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
        >
          <option value="all">All Skills</option>
          {allSkills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      {/* Mentors Grid */}
      <div className="space-y-4">
        {filteredMentors.map((mentor) => (
          <div 
            key={mentor.id}
            className={`relative bg-[#0a0a0a] rounded-xl overflow-hidden border ${
              mentor.isFeatured ? 'border-[#d4af37]/40' : 'border-[#d4af37]/10'
            } hover:border-[#d4af37]/30 transition-all group`}
          >
            {/* Featured Badge */}
            {mentor.isFeatured && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-black text-xs font-bold rounded">
                <Sparkles size={10} />
                FEATURED
              </div>
            )}

            {/* Cover */}
            <div className="relative h-20 overflow-hidden">
              <img 
                src={mentor.coverImage}
                alt={mentor.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              {/* Avatar & Info */}
              <div className="relative -mt-8 mb-3 flex items-end justify-between">
                <div className="relative">
                  <img 
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#0a0a0a]"
                  />
                  {mentor.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#d4af37] rounded-full flex items-center justify-center">
                      <BadgeCheck size={12} className="text-black" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/20 rounded-lg">
                  <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
                  <span className="text-[#d4af37] text-sm font-bold">{mentor.rating}</span>
                </div>
              </div>

              {/* Name & Specialty */}
              <h4 className="text-white font-semibold">{mentor.name}</h4>
              <p className="text-[#d4af37] text-sm mb-2">{mentor.specialty}</p>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{mentor.bio}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {mentor.skills.slice(0, 3).map((skill) => (
                  <span 
                    key={skill}
                    className="text-xs px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {mentor.skills.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-[#141414] text-gray-400 rounded-full">
                    +{mentor.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {mentor.students} students
                </span>
                <span>{mentor.reviews} reviews</span>
                <span className={`flex items-center gap-1 ${
                  mentor.availability === 'Available' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  <Clock size={12} />
                  {mentor.availability}
                </span>
              </div>

              {/* Rate & CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/10">
                <div>
                  <span className="text-2xl font-bold text-[#d4af37]">{mentor.hourlyRate} INDI</span>
                  <span className="text-gray-400 text-sm">/hour</span>
                </div>
                <Link 
                  href={`/community?view=mentorship&mentor=${mentor.id}`}
                  className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                >
                  Book Session
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Become Mentor CTA */}
      <div className="mt-4 p-4 bg-gradient-to-r from-[#d4af37]/10 via-[#141414] to-[#DC143C]/10 rounded-xl border border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
              <GraduationCap size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-white font-medium">Become a Mentor</p>
              <p className="text-gray-400 text-sm">Share your knowledge and earn INDI</p>
            </div>
          </div>
          <Link 
            href="/community?view=mentorship&action=apply"
            className="px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37]/30 transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
