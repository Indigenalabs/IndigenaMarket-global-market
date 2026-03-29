'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ThumbsUp, 
  Reply, 
  CheckCircle,
  MoreVertical,
  Pin,
  Clock,
  User
} from 'lucide-react';
import Link from 'next/link';

interface ForumTopic {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    isInstructor: boolean;
  };
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isSolved: boolean;
  lastActivity: string;
  tags: string[];
}

const forumTopics: ForumTopic[] = [
  {
    id: '1',
    title: 'Best type of wool for beginners?',
    author: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', isInstructor: false },
    replies: 12,
    views: 156,
    likes: 8,
    isPinned: false,
    isSolved: true,
    lastActivity: '2 hours ago',
    tags: ['Materials', 'Beginners']
  },
  {
    id: '2',
    title: 'Welcome to the Navajo Weaving Masterclass Discussion',
    author: { name: 'Maria Begay', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', isInstructor: true },
    replies: 45,
    views: 892,
    likes: 67,
    isPinned: true,
    isSolved: false,
    lastActivity: '1 day ago',
    tags: ['Welcome', 'Announcements']
  },
  {
    id: '3',
    title: 'Trouble with tension on warp threads',
    author: { name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', isInstructor: false },
    replies: 8,
    views: 89,
    likes: 3,
    isPinned: false,
    isSolved: false,
    lastActivity: '3 hours ago',
    tags: ['Technique', 'Help']
  },
];

export default function CourseForumPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = String(params?.courseId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showNewTopic, setShowNewTopic] = useState(false);

  const filteredTopics = forumTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'solved' && topic.isSolved) ||
      (filter === 'unsolved' && !topic.isSolved) ||
      (filter === 'pinned' && topic.isPinned);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href={`/courses/${courseId}`} className="hover:text-[#d4af37]">Course</Link>
            <span>/</span>
            <span className="text-[#d4af37]">Discussion Forum</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Course Discussion</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-[#141414] border border-[#d4af37]/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#141414] border border-[#d4af37]/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">All Topics</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
              <option value="pinned">Pinned</option>
            </select>
          </div>
          <button
            onClick={() => setShowNewTopic(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
          >
            New Topic
          </button>
        </div>

        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 hover:border-[#d4af37]/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img src={topic.author.avatar} alt={topic.author.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {topic.isPinned && <Pin size={14} className="text-[#d4af37]" />}
                    {topic.isSolved && <CheckCircle size={14} className="text-green-500" />}
                    <h3 className="text-white font-medium hover:text-[#d4af37] cursor-pointer">
                      {topic.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                    <span className={topic.author.isInstructor ? 'text-[#d4af37]' : ''}>
                      {topic.author.name} {topic.author.isInstructor && '(Instructor)'}
                    </span>
                    <span>•</span>
                    <span>{topic.lastActivity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {topic.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    <span>{topic.replies}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={16} />
                    <span>{topic.likes}</span>
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
