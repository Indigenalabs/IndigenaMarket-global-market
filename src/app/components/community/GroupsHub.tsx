'use client';

import { useState } from 'react';
import { Users, Plus, Lock, Globe, ChevronRight, Search, Hash, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  privacy: 'public' | 'private';
  category: string;
  isMember: boolean;
  trending?: boolean;
  postsToday: number;
}

const groups: Group[] = [
  {
    id: 'group-1',
    name: 'Indigenous Artists Collective',
    description: 'A space for Indigenous artists to share work, get feedback, and collaborate',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
    members: 2341,
    privacy: 'public',
    category: 'Art',
    isMember: true,
    trending: true,
    postsToday: 45
  },
  {
    id: 'group-2',
    name: 'Traditional Beadwork Masters',
    description: 'Learn and share traditional beadwork techniques from various nations',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop',
    members: 892,
    privacy: 'public',
    category: 'Crafts',
    isMember: true,
    postsToday: 23
  },
  {
    id: 'group-3',
    name: 'Digital Art & Culture',
    description: 'Blending traditional Indigenous art with modern digital techniques',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop',
    members: 567,
    privacy: 'public',
    category: 'Digital',
    isMember: false,
    trending: true,
    postsToday: 34
  },
  {
    id: 'group-4',
    name: 'Language Keepers Circle',
    description: 'Private group for Indigenous language learners and teachers',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop',
    members: 234,
    privacy: 'private',
    category: 'Language',
    isMember: false,
    postsToday: 12
  }
];

const categories = ['All', 'Art', 'Crafts', 'Digital', 'Language', 'Music', 'Dance', 'Culture'];

export default function GroupsHub() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['group-1', 'group-2']);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredGroups = groups.filter(group => {
    const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myGroups = groups.filter(g => joinedGroups.includes(g.id));
  const recommendedGroups = groups.filter(g => !joinedGroups.includes(g.id));

  const toggleMembership = (groupId: string) => {
    setJoinedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
            <Users size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Groups</h3>
            <p className="text-gray-500 text-xs">{myGroups.length} joined</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#d4af37] text-black text-sm font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors"
          >
            <Plus size={16} />
            Create
          </button>
          <Link 
            href="/community?view=groups"
            className="text-[#d4af37] text-sm hover:underline flex items-center gap-1"
          >
            Explore
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Find groups..."
          className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && !searchQuery && (
        <div className="mb-4">
          <h4 className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Your Groups</h4>
          <div className="space-y-2">
            {myGroups.slice(0, 2).map((group) => (
              <Link 
                key={group.id}
                href={`/community?view=groups&group=${group.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#0a0a0a] transition-colors group"
              >
                <img 
                  src={group.image}
                  alt={group.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">{group.name}</span>
                    {group.privacy === 'private' && <Lock size={12} className="text-gray-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{group.members.toLocaleString()} members</span>
                    <span>•</span>
                    <span className="text-[#d4af37]">{group.postsToday} new today</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-[#d4af37] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Groups */}
      <div>
        <h4 className="text-gray-400 text-xs mb-2 uppercase tracking-wider">
          {searchQuery ? 'Search Results' : 'Recommended'}
        </h4>
        <div className="space-y-2">
          {recommendedGroups.slice(0, 3).map((group) => (
            <div 
              key={group.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-[#0a0a0a]"
            >
              <img 
                src={group.image}
                alt={group.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">{group.name}</span>
                  {group.trending && (
                    <span className="flex items-center gap-0.5 text-xs text-[#DC143C]">
                      <TrendingUp size={10} />
                      Hot
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{group.members.toLocaleString()} members</span>
                  {group.privacy === 'private' && (
                    <>
                      <span>•</span>
                      <Lock size={10} />
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleMembership(group.id)}
                className="px-3 py-1.5 bg-[#d4af37] text-black text-xs font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-[#d4af37]/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Globe size={14} className="text-[#d4af37]" />
              <span>1,234 groups</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <MessageCircle size={14} className="text-[#d4af37]" />
              <span>45K members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Group</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name..."
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this group about?"
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((cat) => (
                    <button
                      key={cat}
                      className="px-3 py-1.5 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-full text-xs text-gray-400 hover:border-[#d4af37]/50 hover:text-white transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Privacy</label>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center gap-2 p-3 bg-[#d4af37]/10 border border-[#d4af37] rounded-lg">
                    <Globe size={18} className="text-[#d4af37]" />
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">Public</p>
                      <p className="text-gray-500 text-xs">Anyone can join</p>
                    </div>
                  </button>
                  <button className="flex-1 flex items-center gap-2 p-3 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg hover:border-[#d4af37]/50 transition-colors">
                    <Lock size={18} className="text-gray-500" />
                    <div className="text-left">
                      <p className="text-white text-sm font-medium">Private</p>
                      <p className="text-gray-500 text-xs">Approval required</p>
                    </div>
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-full py-3 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
