'use client';

import { useState } from 'react';
import { Award, Users, Image as ImageIcon, TrendingUp, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import HomeMarketplaceModal, { type HomeMarketplaceItem } from './HomeMarketplaceModal';

const creator = {
  name: 'Maria Redfeather',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=400&fit=crop',
  specialty: 'Traditional Beadwork & Digital Art',
  bio: 'Maria is a Cree artist from Alberta, Canada, blending traditional Indigenous beadwork techniques with modern digital art. Her work has been featured in galleries across North America and celebrates the beauty of Indigenous culture while pushing artistic boundaries.',
  stats: {
    followers: 12500,
    artworks: 156,
    sold: 89,
    volume: 245.5
  },
  achievements: ['Top Seller 2025', 'Community Choice Award', 'Featured Artist'],
  featuredWorks: [
    { id: '1', name: 'Eagle Spirit', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop', price: 2.5 },
    { id: '2', name: 'Sacred Geometry', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=300&h=300&fit=crop', price: 1.8 },
    { id: '3', name: 'Four Directions', image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=300&h=300&fit=crop', price: 3.2 }
  ]
};

export default function CreatorOfTheMonth() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeWork, setActiveWork] = useState<HomeMarketplaceItem | null>(null);

  return (
    <section className="py-16 px-6 bg-[#141414]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
              <Award size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Creator of the Month</h2>
              <p className="text-gray-400 text-sm">Celebrating exceptional Indigenous artists</p>
            </div>
          </div>
          <Link 
            href="/artists"
            className="flex items-center gap-1 text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
          >
            All Artists
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Creator Card */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
          {/* Cover */}
          <div className="relative h-48 md:h-64">
            <img 
              src={creator.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
            
            {/* Creator Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-[#d4af37] rounded-full">
              <Star size={16} className="text-black" />
              <span className="text-black font-bold text-sm">Creator of the Month</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar & Info */}
              <div className="flex-shrink-0">
                <img 
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] object-cover"
                />
              </div>

              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-white mb-1">{creator.name}</h3>
                <p className="text-[#d4af37] mb-3">{creator.specialty}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-2xl">{creator.bio}</p>

                {/* Achievements */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {creator.achievements.map((achievement) => (
                    <span 
                      key={achievement}
                      className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs font-medium rounded-full"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-[#141414] rounded-xl">
                    <Users size={18} className="text-[#d4af37] mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{(creator.stats.followers / 1000).toFixed(1)}k</p>
                    <p className="text-gray-500 text-xs">Followers</p>
                  </div>
                  <div className="text-center p-3 bg-[#141414] rounded-xl">
                    <ImageIcon size={18} className="text-[#d4af37] mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{creator.stats.artworks}</p>
                    <p className="text-gray-500 text-xs">Artworks</p>
                  </div>
                  <div className="text-center p-3 bg-[#141414] rounded-xl">
                    <TrendingUp size={18} className="text-[#d4af37] mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{creator.stats.sold}</p>
                    <p className="text-gray-500 text-xs">Sold</p>
                  </div>
                  <div className="text-center p-3 bg-[#141414] rounded-xl">
                    <span className="text-[#d4af37] text-lg font-bold block mb-0.5">{creator.stats.volume} ETH</span>
                    <p className="text-gray-500 text-xs">Volume</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsFollowing((current) => !current)}
                  className="px-6 py-3 bg-[#d4af37] text-black font-semibold rounded-xl hover:bg-[#f4e4a6] transition-colors"
                >
                  {isFollowing ? 'Following Artist' : 'Follow Artist'}
                </button>
                <Link href="/artist/1" className="px-6 py-3 border border-[#d4af37]/30 text-[#d4af37] font-semibold rounded-xl hover:bg-[#d4af37]/10 transition-colors">
                  View Profile
                </Link>
              </div>
            </div>

            {/* Featured Works */}
            <div className="mt-8 pt-6 border-t border-[#d4af37]/10">
              <h4 className="text-white font-semibold mb-4">Featured Works</h4>
              <div className="grid grid-cols-3 gap-4">
                {creator.featuredWorks.map((work) => (
                  <button
                    type="button"
                    key={work.id}
                    onClick={() =>
                      setActiveWork({
                        id: work.id,
                        title: work.name,
                        creator: creator.name,
                        image: work.image,
                        price: work.price,
                        currency: 'ETH',
                        description: `${work.name} is one of ${creator.name}'s featured works this month.`,
                        detailHref: `/marketplace/item/${work.id}`,
                        artistHref: '/artist/1'
                      })
                    }
                    className="group text-left"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                      <img 
                        src={work.image}
                        alt={work.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white font-semibold">View</span>
                      </div>
                    </div>
                    <p className="text-white text-sm font-medium truncate">{work.name}</p>
                    <p className="text-[#d4af37] text-sm">{work.price} ETH</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <HomeMarketplaceModal item={activeWork} mode="details" isOpen={Boolean(activeWork)} onClose={() => setActiveWork(null)} />
    </section>
  );
}
