'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, MessageCircle, Heart, Share2, Image as ImageIcon, Video, Mic, Send, 
  TrendingUp, Clock, Zap, Bookmark, Smile, Hash, Bell,
  Radio, Activity, Flame
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import StoriesBar from '@/app/components/community/StoriesBar';
import PromotedPost from '@/app/components/community/PromotedPost';
import EventsCalendar from '@/app/components/community/EventsCalendar';
import MentorshipHub from '@/app/components/community/MentorshipHub';
import CommunityChallenges from '@/app/components/community/CommunityChallenges';
import Leaderboard from '@/app/components/community/Leaderboard';
import CommunityPolls from '@/app/components/community/CommunityPolls';
import DirectMessaging from '@/app/components/community/DirectMessaging';
import FeaturedCarousel from '@/app/components/community/FeaturedCarousel';
import ReputationSystem from '@/app/components/community/ReputationSystem';
import DailyChallenges from '@/app/components/community/DailyChallenges';
import GroupsHub from '@/app/components/community/GroupsHub';
import TopContributors from '@/app/components/community/TopContributors';
import { fetchCommunityOverview } from '@/app/lib/communityApi';

// Mock community posts
const mockCommunityPosts = [
  {
    id: '1',
    author: {
      name: 'Maria Redfeather',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      verified: true,
      role: 'Artist'
    },
    content: 'Just finished this new beadwork piece. It represents the four directions and took over 40 hours to complete. So grateful for this community that appreciates traditional craftsmanship. 🙏',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=400&fit=crop',
    likes: 234,
    comments: 45,
    shares: 12,
    timestamp: '2 hours ago',
    tags: ['#Beadwork', '#Traditional', '#FourDirections']
  },
  {
    id: '2',
    author: {
      name: 'ThunderVoice',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      verified: true,
      role: 'Digital Artist'
    },
    content: 'Sharing my process for creating digital art that honors my Lakota heritage. The key is understanding the symbolism before putting pixel to canvas. What traditions inspire your work?',
    image: null,
    likes: 189,
    comments: 67,
    shares: 23,
    timestamp: '4 hours ago',
    tags: ['#DigitalArt', '#Lakota', '#Process']
  },
  {
    id: '3',
    author: {
      name: 'Elena Rivers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      verified: false,
      role: 'Cultural Guide'
    },
    content: 'Excited to announce our new cultural tourism workshop next month! We\'ll be teaching traditional plant medicine knowledge passed down through generations. Limited spots available.',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=400&fit=crop',
    likes: 312,
    comments: 89,
    shares: 45,
    timestamp: '6 hours ago',
    tags: ['#Workshop', '#PlantMedicine', '#CulturalTourism']
  }
];

// Active discussions
const mockActiveDiscussions = [
  { id: '1', title: 'Best practices for photographing Indigenous art', replies: 45, views: 1203, hot: true },
  { id: '2', title: 'How to price traditional beadwork?', replies: 38, views: 892, hot: true },
  { id: '3', title: 'XRPL wallet setup guide for beginners', replies: 67, views: 2341, hot: false },
  { id: '4', title: 'Cultural appropriation vs appreciation', replies: 156, views: 4502, hot: true }
];

// Community stats
const mockCommunityStats = {
  members: '12.5K',
  online: 456,
  posts: '89.2K',
  artists: '2.3K'
};

// Live activity feed
const mockLiveActivities = [
  { id: '1', user: 'Maria Redfeather', action: 'just listed', item: 'Sacred Beadwork #12', time: 'now' },
  { id: '2', user: 'ThunderVoice', action: 'sold', item: 'Digital Art Collection', time: '1m ago' },
  { id: '3', user: 'Elena Rivers', action: 'joined', item: 'the community', time: '2m ago' },
  { id: '4', user: 'James Eagle', action: 'commented on', item: 'Beadwork Workshop', time: '3m ago' },
];

// Trending hashtags
const mockTrendingHashtags = [
  { tag: '#IndigenousArt', posts: '2.4K' },
  { tag: '#Beadwork', posts: '1.8K' },
  { tag: '#NativeAmerican', posts: '3.2K' },
  { tag: '#DigitalArt', posts: '956' },
  { tag: '#Traditional', posts: '1.2K' },
];

export default function CommunityPage() {
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [activePillar, setActivePillar] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [commentedPosts, setCommentedPosts] = useState<Set<string>>(new Set());
  const [sharedPosts, setSharedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState(mockCommunityPosts);
  const [communityStats, setCommunityStats] = useState(mockCommunityStats);
  const [activeDiscussions, setActiveDiscussions] = useState(mockActiveDiscussions);
  const [trendingHashtags, setTrendingHashtags] = useState(mockTrendingHashtags);
  const [liveActivities] = useState(mockLiveActivities);
  const [usingMockFallback, setUsingMockFallback] = useState(true);
  const [loadingLive, setLoadingLive] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);
  const router = useRouter();
  
  const toggleBookmark = (id: string) => setBookmarkedPosts(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleFollow = (name: string) => setFollowedArtists(prev => { const s = new Set(prev); s.has(name) ? s.delete(name) : s.add(name); return s; });
  const handlePost = () => { if (!newPost.trim()) return; setPosts(prev => [{ id: String(Date.now()), author: { name: 'You', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', verified: false, role: 'Member' }, content: newPost, image: null, likes: 0, comments: 0, shares: 0, timestamp: 'Just now', tags: [] }, ...prev]); setNewPost(''); };

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const loadCommunity = async () => {
      setLoadingLive(true);
      try {
        const overview = await fetchCommunityOverview();
        if (!active) return;
        if (overview.posts.length > 0) setPosts(overview.posts as typeof mockCommunityPosts);
        setCommunityStats(overview.stats);
        if (overview.discussions.length > 0) setActiveDiscussions(overview.discussions);
        if (overview.hashtags.length > 0) setTrendingHashtags(overview.hashtags);
        setUsingMockFallback(overview.posts.length === 0);
      } catch {
        if (!active) return;
        setPosts(mockCommunityPosts);
        setCommunityStats(mockCommunityStats);
        setActiveDiscussions(mockActiveDiscussions);
        setTrendingHashtags(mockTrendingHashtags);
        setUsingMockFallback(true);
      } finally {
        if (active) setLoadingLive(false);
      }
    };
    void loadCommunity();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const requestedView = (params.get('view') || params.get('tab') || '').trim().toLowerCase();
    if (!requestedView) return;
    const targetByView: Record<string, string> = {
      feed: 'feed-section',
      discussions: 'discussions-section',
      events: 'events-section',
      mentorship: 'mentorship-section',
      challenges: 'challenges-section',
      groups: 'groups-section',
      leaderboard: 'leaderboard-section',
      polls: 'polls-section'
    };
    const targetId = targetByView[requestedView];
    if (!targetId) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(targetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  
  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof document === 'undefined') return;
    const targetByTab: Record<string, string> = {
      feed: 'feed-section',
      discussions: 'discussions-section',
      events: 'events-section',
      mentorship: 'mentorship-section'
    };
    const targetId = targetByTab[tabId];
    if (!targetId) return;
    setTimeout(() => {
      const el = document.getElementById(targetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };
  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <Sidebar 
        activePillar={activePillar} 
        onPillarChange={setActivePillar}
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 transition-all duration-300">
      {/* Live Activity Bar */}
      <div className="bg-gradient-to-r from-[#DC143C]/20 via-[#DC143C]/10 to-transparent border-b border-[#DC143C]/30 py-2 px-6">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Radio size={16} className="text-[#DC143C]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC143C] rounded-full animate-pulse" />
            </div>
            <span className="text-[#DC143C] text-sm font-medium">LIVE</span>
          </div>
          <div className="flex items-center gap-6">
            {liveActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-2 text-sm flex-shrink-0">
                <span className="text-[#d4af37] font-medium">{activity.user}</span>
                <span className="text-gray-400">{activity.action}</span>
                <span className="text-white">{activity.item}</span>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stories Bar - Social Media Style */}
        <StoriesBar />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
                <Users size={24} className="text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Community</h1>
                <p className="text-gray-400">
                  Connect with Indigenous artists and culture bearers {loadingLive ? '- syncing live data...' : usingMockFallback ? '- preview data' : '- live'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/trending" className="flex items-center gap-2 px-4 py-2 bg-[#DC143C]/10 border border-[#DC143C]/30 rounded-full text-[#DC143C] hover:bg-[#DC143C]/20 transition-all">
                <Flame size={16} />
                <span className="text-sm font-medium">Trending</span>
              </Link>
              <button
                onClick={() => router.push('/community?view=notifications', { scroll: false })}
                className="relative p-2 bg-[#141414] border border-[#d4af37]/20 rounded-full hover:border-[#d4af37]/50 transition-all">
                <Bell size={20} className="text-[#d4af37]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC143C] rounded-full text-white text-xs flex items-center justify-center">3</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Members', value: communityStats.members, icon: Users },
            { label: 'Online Now', value: communityStats.online, icon: Clock },
            { label: 'Total Posts', value: communityStats.posts, icon: MessageCircle },
            { label: 'Artists', value: communityStats.artists, icon: TrendingUp }
          ].map((stat) => (
            <div key={stat.label} className="bg-[#141414] rounded-xl p-4 border border-[#d4af37]/10">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon size={16} className="text-[#d4af37]" />
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
          {/* Create Post */}
          <div id="feed-section" className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-4 mb-6">
            <div className="flex gap-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your story, art, or question with the community..."
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors rounded-lg hover:bg-[#d4af37]/10">
                      <ImageIcon size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors rounded-lg hover:bg-[#d4af37]/10">
                      <Video size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors rounded-lg hover:bg-[#d4af37]/10">
                      <Mic size={18} />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-400 hover:text-[#d4af37] transition-colors rounded-lg hover:bg-[#d4af37]/10"
                      >
                        <Smile size={18} />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#141414] border border-[#d4af37]/20 rounded-lg shadow-xl">
                          <div className="grid grid-cols-8 gap-1">
                            {['😀', '😍', '🔥', '❤️', '🙏', '🎨', '✨', '🌟', '💫', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺', '🎨'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setNewPost(prev => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="p-2 hover:bg-[#d4af37]/10 rounded text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{280 - newPost.length} chars left</span>
                    <button 
                      onClick={handlePost}
                      disabled={!newPost.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {[
                { id: 'feed', label: 'Feed', icon: Activity },
                { id: 'discussions', label: 'Discussions', icon: MessageCircle },
                { id: 'events', label: 'Events', icon: Zap },
                { id: 'mentorship', label: 'Mentorship', icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#d4af37] text-black'
                        : 'bg-[#141414] text-gray-400 hover:text-white border border-[#d4af37]/20'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              456 online
            </div>
          </div>

          {/* Posts - Live Feed */}
          <div className="space-y-6">
            {/* Featured Content - Paid Ad in Feed */}
            <div className="bg-[#141414] rounded-xl border border-[#d4af37]/30 p-5 relative overflow-hidden">
              {/* Sponsored Label */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-[#d4af37]/20 rounded-full">
                <span className="text-[#d4af37] text-xs font-bold">SPONSORED</span>
              </div>
              
              <FeaturedCarousel />
            </div>

            {/* First Post */}
            {posts.slice(0, 1).map((post) => (
              <div key={post.id} className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{post.author.name}</span>
                      {post.author.verified && (
                        <div className="w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{post.author.role}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>

                {/* Image */}
                {post.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img src={post.image} alt="Post content" className="w-full max-h-80 object-cover" />
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[#d4af37] text-sm hover:underline cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        likedPosts.has(post.id) ? 'text-[#DC143C]' : 'text-gray-400 hover:text-[#DC143C]'
                      }`}
                    >
                      <Heart size={18} fill={likedPosts.has(post.id) ? '#DC143C' : 'none'} />
                      <span className="text-sm">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors"
                      onClick={() => setCommentedPosts(prev => { const s = new Set(prev); s.add(post.id); return s; })}
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button
                      onClick={() => setSharedPosts(prev => { const s = new Set(prev); s.has(post.id) ? s.delete(post.id) : s.add(post.id); return s; })}
                      className={`flex items-center gap-2 transition-colors ${sharedPosts.has(post.id) ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
                    >
                      <Share2 size={18} />
                      <span className="text-sm">{post.shares + (sharedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`transition-colors ${bookmarkedPosts.has(post.id) ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
                  >
                    <Bookmark size={18} fill={bookmarkedPosts.has(post.id) ? '#d4af37' : 'none'} />
                  </button>
                </div>
              </div>
            ))}

            {/* Promoted Post - Paid Ad in Feed */}
            <PromotedPost 
              post={{
                id: 'promo-1',
                sponsor: 'Heritage Arts Foundation',
                title: 'Master Artisan Workshop Series',
                content: 'Join our exclusive 4-week workshop series featuring master artisans from across Turtle Island. Learn traditional techniques passed down through generations. Limited spots available!',
                image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=400&fit=crop',
                cta: 'Register Now',
                ctaLink: '/courses',
                likes: 456,
                comments: 89,
                promotionDaysLeft: 5
              }}
            />

            {/* Second Post */}
            {posts.slice(1).map((post) => (
              <div key={post.id} className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{post.author.name}</span>
                      {post.author.verified && (
                        <div className="w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{post.author.role}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>

                {/* Image */}
                {post.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img src={post.image} alt="Post content" className="w-full max-h-80 object-cover" />
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[#d4af37] text-sm hover:underline cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        likedPosts.has(post.id) ? 'text-[#DC143C]' : 'text-gray-400 hover:text-[#DC143C]'
                      }`}
                    >
                      <Heart size={18} fill={likedPosts.has(post.id) ? '#DC143C' : 'none'} />
                      <span className="text-sm">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>
                    <button
                      onClick={() => setCommentedPosts(prev => { const s = new Set(prev); s.add(post.id); return s; })}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                      <MessageCircle size={18} />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button
                      onClick={() => setSharedPosts(prev => { const s = new Set(prev); s.has(post.id) ? s.delete(post.id) : s.add(post.id); return s; })}
                      className={`flex items-center gap-2 transition-colors ${sharedPosts.has(post.id) ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
                    >
                      <Share2 size={18} />
                      <span className="text-sm">{post.shares + (sharedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`transition-colors ${bookmarkedPosts.has(post.id) ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#d4af37]'}`}
                  >
                    <Bookmark size={18} fill={bookmarkedPosts.has(post.id) ? '#d4af37' : 'none'} />
                  </button>
                </div>
              </div>
            ))}

            {/* Load More */}
            <div className="text-center py-6">
              <button
                onClick={() => setLoadedAll(true)}
                className="px-8 py-3 bg-[#141414] border border-[#d4af37]/30 rounded-full text-[#d4af37] font-medium hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-all"
              >
                {loadedAll ? 'All posts loaded' : 'Load More Posts'}
              </button>
            </div>
          </div>

          {/* Community Challenges - After Live Feed */}
          <div id="challenges-section"><CommunityChallenges /></div>

          {/* Daily/Weekly Challenges */}
          <DailyChallenges />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Reputation System */}
          <ReputationSystem />

          {/* Groups Hub */}
          <div id="groups-section"><GroupsHub /></div>

          {/* Top Contributors - Sidebar Version */}
          <TopContributors />

          {/* Leaderboard */}
          <div id="leaderboard-section"><Leaderboard /></div>

          {/* Events Calendar */}
          <div id="events-section"><EventsCalendar /></div>

          {/* Mentorship Hub */}
          <div id="mentorship-section"><MentorshipHub /></div>

          {/* Community Polls */}
          <div id="polls-section"><CommunityPolls /></div>

          {/* Active Discussions */}
          <div id="discussions-section" className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-[#d4af37]" />
              Active Discussions
            </h3>
            <div className="space-y-3">
              {activeDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    {discussion.hot && (
                      <span className="px-2 py-0.5 bg-[#DC143C]/20 text-[#DC143C] text-xs rounded-full flex-shrink-0">
                        HOT
                      </span>
                    )}
                    <h4 className="text-white text-sm font-medium leading-tight">{discussion.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{discussion.replies} replies</span>
                    <span>{(discussion.views / 1000).toFixed(1)}K views</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/community"
              className="block w-full mt-4 py-2 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm text-center hover:bg-[#d4af37]/10 transition-all"
            >
              View All Discussions
            </Link>
          </div>

          {/* Trending Hashtags */}
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Hash size={18} className="text-[#d4af37]" />
              Trending Now
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map((hashtag) => (
                <button
                  key={hashtag.tag}
                  onClick={() => router.push(`/community?tag=${encodeURIComponent(hashtag.tag)}`, { scroll: false })}
                  className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#d4af37]/10 border border-transparent hover:border-[#d4af37]/30 rounded-full text-sm text-gray-400 hover:text-[#d4af37] transition-all"
                >
                  {hashtag.tag}
                  <span className="text-gray-600 ml-1">{hashtag.posts}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Artists */}
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4">Artists to Follow</h3>
            <div className="space-y-3">
              {[
                { name: 'DesertRose', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', specialty: 'Pottery' },
                { name: 'MountainEagle', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', specialty: 'Sculpture' },
                { name: 'RiverSong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', specialty: 'Weaving' }
              ].map((artist) => (
                <div key={artist.name} className="flex items-center gap-3">
                  <img src={artist.avatar} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{artist.name}</p>
                    <p className="text-gray-400 text-xs">{artist.specialty}</p>
                  </div>
                  <button
                    onClick={() => toggleFollow(artist.name)}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      followedArtists.has(artist.name)
                        ? 'bg-[#d4af37] text-black'
                        : 'bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-black'
                    }`}
                  >
                    {followedArtists.has(artist.name) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Messaging Widget */}
      <DirectMessaging />
    </div>
    </div>
    </div>
  );
}









