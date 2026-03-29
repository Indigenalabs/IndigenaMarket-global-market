'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  MessageSquare, 
  Lock,
  Globe,
  ChevronRight,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  course: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  nextMeeting: string;
  topics: string[];
  avatar: string;
}

const studyGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'Navajo Weaving Circle',
    description: 'A supportive community for students learning traditional Navajo weaving techniques.',
    course: 'Navajo Weaving Masterclass',
    members: 12,
    maxMembers: 20,
    isPrivate: false,
    nextMeeting: 'Tomorrow, 3:00 PM',
    topics: ['Pattern Practice', 'Dye Techniques'],
    avatar: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Lakota Language Learners',
    description: 'Practice conversational Lakota with fellow students. All levels welcome!',
    course: 'Lakota Language Fundamentals',
    members: 28,
    maxMembers: 30,
    isPrivate: false,
    nextMeeting: 'Friday, 5:00 PM',
    topics: ['Conversation Practice', 'Vocabulary'],
    avatar: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Pottery Masters',
    description: 'Advanced discussion group for pottery techniques and glazing methods.',
    course: 'Traditional Pottery Techniques',
    members: 8,
    maxMembers: 15,
    isPrivate: true,
    nextMeeting: 'Saturday, 10:00 AM',
    topics: ['Glazing', 'Kiln Firing'],
    avatar: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop'
  },
];

export default function StudyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Study Groups</h1>
            <p className="text-gray-400 text-sm">Connect and learn together with peers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
          >
            <Plus size={18} />
            Create Group
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search study groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 hover:border-[#d4af37]/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img src={group.avatar} alt={group.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{group.name}</h3>
                    {group.isPrivate ? (
                      <Lock size={14} className="text-gray-400" />
                    ) : (
                      <Globe size={14} className="text-gray-400" />
                    )}
                  </div>
                  <p className="text-[#d4af37] text-sm mb-2">{group.course}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{group.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {group.topics.map((topic) => (
                      <span key={topic} className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#d4af37]/10">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {group.members}/{group.maxMembers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {group.nextMeeting}
                      </span>
                    </div>
                    <button className="flex items-center gap-1 text-[#d4af37] text-sm hover:underline">
                      Join <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
