'use client';

import { Play, Quote, Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Story {
  id: string;
  type: 'testimonial' | 'heritage' | 'video';
  author: string;
  avatar: string;
  role: string;
  nation: string;
  content: string;
  image?: string;
  videoThumbnail?: string;
  likes: number;
  comments: number;
  featured: boolean;
}

const stories: Story[] = [
  {
    id: '1',
    type: 'testimonial',
    author: 'Maria Redfeather',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'Digital Artist',
    nation: 'Lakota Nation',
    content: 'Indigena Market has transformed how I share my art. For the first time, I can reach a global audience while maintaining control over my cultural stories. The ongoing royalties mean my family benefits from every resale.',
    likes: 234,
    comments: 18,
    featured: true
  },
  {
    id: '2',
    type: 'heritage',
    author: 'Eagle Rising',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'Cultural Educator',
    nation: 'Navajo Nation',
    content: 'Through this platform, we are preserving our oral traditions. Each NFT comes with the artist voice story - a piece of our living culture that will never be lost.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
    likes: 456,
    comments: 32,
    featured: false
  },
  {
    id: '3',
    type: 'video',
    author: 'Thunder Voice',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    role: 'Traditional Weaver',
    nation: 'Hopi Tribe',
    content: 'Watch how our traditional weaving techniques are being preserved and shared through digital art.',
    videoThumbnail: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=400&fit=crop',
    likes: 892,
    comments: 67,
    featured: true
  }
];

export default function CommunityStories() {
  const router = useRouter();
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleShare = async (story: Story) => {
    const shareUrl = `${window.location.origin}/community?view=stories&story=${story.id}`;
    if (navigator.share) {
      await navigator.share({
        title: `${story.author} on Indigena Market`,
        text: story.content,
        url: shareUrl
      }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(shareUrl).catch(() => undefined);
  };

  return (
    <section className="py-12 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 rounded-full border border-[#d4af37]/20 mb-4">
            <Users size={16} className="text-[#d4af37]" />
            <span className="text-[#d4af37] text-sm font-medium">Community Voices</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Stories from Our <span className="secondary-gradient">Community</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Hear from Indigenous artists and cultural guardians about how Indigena Market is preserving and sharing their heritage.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div 
              key={story.id}
              className={`group bg-[#141414] rounded-xl overflow-hidden border border-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all hover:shadow-xl hover:shadow-[#d4af37]/5 ${
                story.featured ? 'md:row-span-1' : ''
              }`}
            >
              {/* Video Thumbnail */}
              {story.type === 'video' && story.videoThumbnail && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={story.videoThumbnail}
                    alt={story.author}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#d4af37] flex items-center justify-center shadow-lg shadow-[#d4af37]/30 group-hover:scale-110 transition-transform">
                      <Play size={28} className="text-black ml-1" fill="black" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#DC143C] rounded text-white text-xs font-medium">
                    VIDEO
                  </div>
                </div>
              )}

              {/* Heritage Image */}
              {story.type === 'heritage' && story.image && (
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={story.image}
                    alt={story.author}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#d4af37] rounded text-black text-xs font-medium">
                    HERITAGE
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={story.avatar}
                    alt={story.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#d4af37]/30"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{story.author}</h4>
                    <p className="text-[#d4af37] text-sm">{story.role}</p>
                    <p className="text-gray-500 text-xs">{story.nation}</p>
                  </div>
                </div>

                {/* Quote/Testimonial */}
                {story.type === 'testimonial' && (
                  <div className="relative mb-4">
                    <Quote size={24} className="text-[#d4af37]/30 absolute -top-2 -left-1" />
                    <p className="text-gray-300 text-sm leading-relaxed pl-6">
                      {story.content}
                    </p>
                  </div>
                )}

                {/* Heritage Content */}
                {story.type === 'heritage' && (
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {story.content}
                  </p>
                )}

                {/* Video Content */}
                {story.type === 'video' && (
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {story.content}
                  </p>
                )}

                {/* Engagement */}
                <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/10">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleLike(story.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        likedStories.has(story.id) ? 'text-[#DC143C]' : 'text-gray-400 hover:text-[#DC143C]'
                      }`}
                    >
                      <Heart size={16} fill={likedStories.has(story.id) ? '#DC143C' : 'none'} />
                      <span className="text-sm">
                        {story.likes + (likedStories.has(story.id) ? 1 : 0)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/community?view=stories&story=${story.id}`)}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-[#d4af37] transition-colors"
                    >
                      <MessageCircle size={16} />
                      <span className="text-sm">{story.comments}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleShare(story)}
                    className="text-gray-400 hover:text-[#d4af37] transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => router.push('/community?view=stories&action=share')}
            className="px-8 py-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-[#d4af37] font-medium hover:bg-[#d4af37] hover:text-black transition-all"
          >
            Share Your Story
          </button>
        </div>
      </div>
    </section>
  );
}
